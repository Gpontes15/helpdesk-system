import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/actions/auth-actions"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const user = await getCurrentUser()
  // Proteção: Apenas Admin acessa
  if (user?.role !== 'ADMIN') redirect('/')

  // --- 1. DADOS DE VOLUME (Últimos 7 dias) ---
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const ticketsLast7Days = await prisma.ticket.count({
    where: { createdAt: { gte: sevenDaysAgo } }
  })
  
  const totalOpen = await prisma.ticket.count({
    where: { status: { not: 'CLOSED' } }
  })

  // --- 2. RANKING DE TÉCNICOS (Apenas TI + Chamados Fechados) ---
  const techUsers = await prisma.user.findMany({
    where: { 
      department: 'Tecnologia' 
    },
    select: {
      name: true,
      _count: {
        select: { 
          closedTickets: { where: { status: 'CLOSED' } } 
        }
      }
    },
    orderBy: {
      closedTickets: { _count: 'desc' }
    },
    take: 5
  })

  const techRankingData = techUsers.map(tech => ({
    name: tech.name,
    count: tech._count.closedTickets
  }))

  // --- 3. RANKING DE SETORES (Qual setor abre mais) ---
  // Mantendo sua lógica original de buscar todos e contar no JS (se tiver muitos chamados, ideal é usar groupBy no futuro)
  const allTicketsWithAuthors = await prisma.ticket.findMany({
    select: { author: { select: { department: true } } }
  })

  const deptCounts: Record<string, number> = {}
  allTicketsWithAuthors.forEach((t) => {
    const dept = t.author?.department || "Sem Setor"
    deptCounts[dept] = (deptCounts[dept] || 0) + 1
  })

  const deptRanking = Object.entries(deptCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // --- 4. RANKING DE LOJAS (NOVO) ---
  // Usando groupBy do Prisma para ser mais rápido
  const ticketsByStore = await prisma.ticket.groupBy({
    by: ['storeId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  })

  // Precisamos buscar os nomes das lojas, pois o groupBy só devolve o ID
  const allStores = await prisma.store.findMany()

  const storeRanking = ticketsByStore.map(t => {
    const store = allStores.find(s => s.id === t.storeId)
    return {
      name: store?.name || "Loja Desconhecida",
      count: t._count.id
    }
  })

  const topStore = storeRanking[0]

  // --- 5. PROBLEMAS POR PALAVRA-CHAVE ---
  const keywords = [
    'impressora', 'caixa', 'balança', 'carga', 'internet', 
    'wifi', 'rms', 'syspdv', 'teclado', 'mouse', 'computador', 'pc', 'monitor', 'etiqueta'
  ]

  const recentTickets = await prisma.ticket.findMany({
    select: { title: true, description: true },
    orderBy: { createdAt: 'desc' },
    take: 500 
  })

  const keywordCounts: Record<string, number> = {}
  keywords.forEach(k => keywordCounts[k] = 0)

  recentTickets.forEach(t => {
    const fullText = (t.title + " " + t.description).toLowerCase()
    keywords.forEach(word => {
      if (fullText.includes(word)) {
        keywordCounts[word]++
      }
    })
  })

  const problemRanking = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">📊 Relatórios de TI</h1>
            <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-bold">
                Admin Mode
            </span>
        </div>

        {/* CARDS DE DESTAQUE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-600 text-white p-6 rounded-lg shadow">
            <h3 className="text-blue-100 text-sm font-bold uppercase">Novos (7 dias)</h3>
            <p className="text-4xl font-bold">{ticketsLast7Days}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Fila Pendente</h3>
            <p className="text-4xl font-bold text-yellow-600">{totalOpen}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Top Técnico (TI)</h3>
            <p className="text-xl font-bold text-purple-700 truncate">
              {techRankingData[0]?.name || "-"}
            </p>
            <p className="text-xs mt-2 text-gray-400">
              {techRankingData[0]?.count || 0} resolvidos
            </p>
          </div>
           
          {/* CARD NOVO: LOJA CRÍTICA */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-600">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Loja + Crítica</h3>
            <p className="text-xl font-bold text-red-700 truncate">
              {topStore?.name || "-"}
            </p>
            <p className="text-xs mt-2 text-gray-400">
              {topStore?.count || 0} chamados
            </p>
          </div>
        </div>

        {/* --- ÁREA DE RANKINGS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. TÉCNICOS */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">🏆 Produtividade TI</h2>
            <ul className="space-y-3">
              {techRankingData.map((tech, index) => (
                <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-700 text-sm">{tech.name}</span>
                  </div>
                  <span className="font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded text-xs">
                    {tech.count}
                  </span>
                </li>
              ))}
              {techRankingData.length === 0 && <p className="text-gray-400 text-xs text-center">Sem dados.</p>}
            </ul>
          </div>

          {/* 2. LOJAS (NOVO) */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">🏪 Lojas com Problemas</h2>
            <ul className="space-y-3">
              {storeRanking.map((store, index) => (
                <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-700 text-sm truncate max-w-[120px]" title={store.name}>{store.name}</span>
                  </div>
                  <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded text-xs">
                    {store.count}
                  </span>
                </li>
              ))}
              {storeRanking.length === 0 && <p className="text-gray-400 text-xs text-center">Sem chamados.</p>}
            </ul>
          </div>

          {/* 3. SETORES */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">📂 Setores (Geral)</h2>
            <ul className="space-y-3">
              {deptRanking.map(([deptName, count], index) => (
                <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-100 text-gray-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-700 text-sm">{deptName}</span>
                  </div>
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* --- TOP PROBLEMAS --- */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">⚠️ Top Problemas (Palavras-Chave)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {problemRanking.map(([keyword, count], index) => (
              <div key={index} className="flex flex-col items-center justify-center p-3 border rounded hover:shadow-md transition bg-gray-50 text-center">
                <span className="font-bold text-gray-700 capitalize text-sm mb-2">{keyword}</span>
                <span className="font-bold text-white bg-slate-600 px-3 py-1 rounded-full text-xs">
                  {count}
                </span>
              </div>
            ))}
            {problemRanking.length === 0 && (
              <p className="col-span-full text-center text-gray-400 py-4">
                Nenhuma palavra-chave identificada recentemente.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}