'use client'
import { useState } from 'react'

interface MovimentarProps {
  produtoId: number
  nomeProduto: string 
  tipo: 'USAR' | 'REPOR'
  onSucesso: () => void
}

export function MovimentarModal({ produtoId, nomeProduto, tipo, onSucesso }: MovimentarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [qtd, setQtd] = useState(1)
  const [obs, setObs] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleConfirmar() {
    // Bloqueia cliques duplos
    if (loading) return;
    
    setLoading(true)
    try {
      const endpoint = tipo === 'USAR' ? 'consumir' : 'repor'
      
      // MUDANÇA CRÍTICA: Forçamos o uso do ID exato deste card
      const urlBase = `http://localhost:8080/produtos/${produtoId}/${endpoint}`
      const params = new URLSearchParams({
        quantidade: qtd.toString()
      })
      
      if (tipo === 'USAR') {
        params.append('observacao', obs || 'Uso interno de TI')
      }

      const res = await fetch(`${urlBase}?${params.toString()}`, { 
        method: 'PATCH',
        // Evita cache de rede para garantir que o saldo atualize
        cache: 'no-store',
        headers: {
          'X-API-Token': process.env.NEXT_PUBLIC_API_ESTOQUE_TOKEN as string
        }
      })
      
      if (res.ok) {
        setIsOpen(false)
        setQtd(1)
        setObs('')
        onSucesso() // Recarrega a lista principal
      } else {
        const erro = await res.text()
        alert(`Erro do Servidor: ${erro}`)
      }
    } catch (error) {
      alert('Erro ao conectar com o Java. Verifique se o terminal está aberto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className={`flex-1 py-2 rounded text-xs font-black uppercase tracking-tighter transition-all active:scale-95 ${
          tipo === 'USAR' 
            ? 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700' 
            : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'
        }`}
      >
        {tipo === 'USAR' ? '📉 Usar' : '📈 Repor'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl border border-slate-100">
            <div className="mb-4">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                {tipo === 'USAR' ? '🚀 Registrar Saída' : '📦 Registrar Entrada'}
              </h3>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">
                Item: {nomeProduto} (ID: {produtoId})
              </p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                  Quantidade a movimentar
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={qtd} 
                  onChange={e => setQtd(Math.max(1, Number(e.target.value)))}
                  className="w-full border-2 border-slate-100 p-3 rounded-lg text-slate-900 text-2xl font-black focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" 
                />
              </div>

              {tipo === 'USAR' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                    Destino do material
                  </label>
                  <input 
                    type="text" 
                    value={obs}
                    onChange={e => setObs(e.target.value)}
                    placeholder="Ex: Loja 03, Frente de Caixa..."
                    className="w-full border-2 border-slate-100 p-3 rounded-lg text-slate-900 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-50">
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="flex-1 px-4 py-3 text-slate-400 text-xs font-black uppercase hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmar}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 text-white rounded-lg font-black text-xs uppercase shadow-lg shadow-blue-500/20 active:translate-y-0.5 transition-all ${
                    tipo === 'USAR' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {loading ? 'Processando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}