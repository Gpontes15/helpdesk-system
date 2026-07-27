import { registerUser, deleteUser, updateUser } from "@/actions/user-actions"
import { getCurrentUser } from "@/actions/auth-actions"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Await nos params (Padrão Next.js 15)
  const params = await searchParams;

  const user = await getCurrentUser()
  if (user?.role !== 'ADMIN') redirect('/')

  // 1. BUSCAR AS LOJAS NO BANCO
  const stores = await prisma.store.findMany({
    orderBy: { name: 'asc' }
  })

  // 2. BUSCAR USUÁRIOS
  const allUsers = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    include: { store: true } 
  })

  // LÓGICA DE EDIÇÃO
  const editId = params?.edit as string
  const userToEdit = editId ? allUsers.find(u => u.id === editId) : null

  // Mensagens
  const showSuccessCreate = params?.success === 'created'
  const showSuccessUpdate = params?.success === 'updated'
  const userExists = params?.error === 'username_exists' // Mudou de email_exists
  const selfDeleteError = params?.error === 'self_delete'
  const historyError = params?.error === 'has_history'

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Gerenciar Equipe</h1>

        {/* MENSAGENS DE ALERTA */}
        {showSuccessCreate && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded border border-green-200 font-bold">
            ✅ Usuário criado com sucesso!
          </div>
        )}
        {showSuccessUpdate && (
          <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded border border-blue-200 font-bold">
            🔄 Dados atualizados com sucesso!
          </div>
        )}
        {selfDeleteError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-200 font-bold">
            ⛔ Você não pode excluir seu próprio usuário.
          </div>
        )}
        {historyError && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded border border-yellow-200">
            ⚠️ Não é possível excluir usuários com histórico de chamados.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LISTA DE USUÁRIOS --- */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 bg-slate-800 text-white font-bold flex justify-between">
                <span>Usuários Cadastrados ({allUsers.length})</span>
                {userToEdit && (
                   <Link href="/admin/usuarios" className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30">
                     + Voltar para Cadastro
                   </Link>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3">Nome</th>
                      <th className="px-6 py-3">Loja / Setor</th>
                      <th className="px-6 py-3">Acesso</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => (
                      <tr key={u.id} className={`border-b hover:bg-gray-50 ${userToEdit?.id === u.id ? 'bg-blue-50' : 'bg-white'}`}>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {u.name}
                          <br/>
                          {/* CORREÇÃO AQUI: u.username em vez de u.email */}
                          <span className="text-xs text-gray-400 font-normal">User: {u.username}</span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-bold text-gray-800 block">
                                {u.store?.name || "Sem Loja"}
                            </span>
                            <span className="text-xs text-gray-500">
                                {u.department || "Sem setor"}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.role === 'ADMIN' ? (
                            <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded">ADMIN</span>
                          ) : (
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">USER</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                          <Link 
                            href={`/admin/usuarios?edit=${u.id}`}
                            className="text-blue-600 hover:text-blue-900 font-bold hover:underline"
                          >
                            ✏️ Editar
                          </Link>

                          <form action={deleteUser}>
                            <input type="hidden" name="userId" value={u.id} />
                            <button 
                              type="submit" 
                              className="text-red-500 hover:text-red-700 font-bold hover:underline disabled:opacity-30 ml-2"
                              disabled={u.id === user.id} 
                              title="Excluir"
                            >
                              🗑️
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* --- FORMULÁRIO (CADASTRO OU EDIÇÃO) --- */}
          <div className="h-fit sticky top-4">
            <div className={`bg-white rounded-lg shadow p-6 border-t-4 ${userToEdit ? 'border-blue-500' : 'border-slate-800'}`}>
              
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  {userToEdit ? '✏️ Editar Usuário' : '+ Novo Cadastro'}
                </h2>
                {userToEdit && (
                  <Link href="/admin/usuarios" className="text-xs text-red-500 hover:underline">
                    Cancelar
                  </Link>
                )}
              </div>

              {userExists && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-xs font-bold">
                  ❌ Usuário já existe.
                </div>
              )}

              <form action={userToEdit ? updateUser : registerUser} className="space-y-4">
                
                {userToEdit && <input type="hidden" name="userId" value={userToEdit.id} />}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Nome</label>
                  <input 
                    name="name" 
                    required 
                    defaultValue={userToEdit?.name}
                    className="w-full border p-2 rounded text-black text-sm" 
                    placeholder="Nome completo" 
                  />
                </div>

                {/* CAMPO DE USERNAME (Substituindo Email) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Usuário (Login)</label>
                  <input 
                    name="username" 
                    type="text" 
                    required 
                    defaultValue={userToEdit?.username}
                    className="w-full border p-2 rounded text-black text-sm" 
                    placeholder="ex: maria.caixa" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    {userToEdit ? 'Nova Senha (Opcional)' : 'Senha'}
                  </label>
                  <input 
                    name="password" 
                    type="password" 
                    required={!userToEdit} 
                    className="w-full border p-2 rounded text-black text-sm" 
                    placeholder={userToEdit ? "Deixe em branco para manter a atual" : "******"} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Loja Pertencente</label>
                  <select 
                    name="storeId" 
                    defaultValue={userToEdit?.storeId || ""} 
                    className="w-full border p-2 rounded text-sm bg-white text-black" 
                    required
                  >
                    <option value="" disabled>Selecione a Loja...</option>
                    {stores.map(store => (
                        <option key={store.id} value={store.id}>
                            {store.name} - {store.code}
                        </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Setor</label>
                  <select 
                    name="department" 
                    defaultValue={userToEdit?.department || ""}
                    className="w-full border p-2 rounded text-black bg-white text-sm"
                  >
                    <option value="Frente de loja">Frente de loja</option>
                    <option value="Açougue">Açougue</option>
                    <option value="Padaria">Padaria</option>
                    <option value="Estoque">Estoque</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Tecnologia">Tecnologia (TI)</option>
                    <option value="RH">RH</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Gerência">Gerência</option>
                    <option value="CPD">CPD</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Permissão</label>
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="role" 
                        value="USER" 
                        defaultChecked={!userToEdit || userToEdit.role === 'USER'} 
                      />
                      <span className="text-gray-800">Comum</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="role" 
                        value="ADMIN" 
                        defaultChecked={userToEdit?.role === 'ADMIN'} 
                      />
                      <span className="text-red-600 font-bold">Admin (TI)</span>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={`w-full text-white p-2 rounded font-bold transition mt-4 ${userToEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-900'}`}
                >
                  {userToEdit ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}