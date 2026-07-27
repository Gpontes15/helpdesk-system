'use client'
import { useState } from 'react'

export function HistoricoModal({ produtoId }: { produtoId: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [historico, setHistorico] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function abrir() {
    setIsOpen(true)
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8080/produtos/${produtoId}/historico`, {
        headers: {
          'X-API-Token': process.env.NEXT_PUBLIC_API_ESTOQUE_TOKEN as string
        }
      })
      const data = await res.json()
      // Ordena do mais recente para o mais antigo
      setHistorico(data.reverse())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  return (
    <>
      <button onClick={abrir} className="text-xs text-blue-500 hover:underline mt-2 block text-center w-full">
        Ver Histórico 🕒
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Histórico de Movimentações</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 font-bold">X</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {loading ? <p className="text-center text-gray-500">Carregando...</p> : historico.length === 0 ? <p className="text-center text-gray-400">Sem movimentações.</p> : null}
              
              {historico.map((mov: any) => (
                <div key={mov.id} className="border-b pb-2 flex justify-between items-center text-sm">
                  <div>
                    <span className={`font-bold ${mov.tipo === 'ENTRADA' ? 'text-blue-600' : 'text-red-600'}`}>
                      {mov.tipo === 'ENTRADA' ? '+' : '-'}{mov.quantidade}
                    </span>
                    <span className="text-gray-600 ml-2">{mov.observacao}</span>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {new Date(mov.dataHora).toLocaleDateString('pt-BR')} {new Date(mov.dataHora).toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}