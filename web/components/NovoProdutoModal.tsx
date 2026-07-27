'use client'

import { useState } from 'react'

// --- A CORREÇÃO ESTÁ NESTA INTERFACE ---
// Sem isso, o TypeScript bloqueia o build dizendo que onSucesso não existe.
interface NovoProdutoModalProps {
  onSucesso: () => Promise<void>;
}

export function NovoProdutoModal({ onSucesso }: NovoProdutoModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const produto = {
      nome: formData.get('nome'),
      quantidade: Number(formData.get('quantidade')),
      estoqueMinimo: Number(formData.get('estoqueMinimo')),
      categoria: { id: 1 }
    }

    try {
      const res = await fetch('http://localhost:8080/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': process.env.NEXT_PUBLIC_API_ESTOQUE_TOKEN as string
        },
        body: JSON.stringify(produto)
      })

      if (res.ok) {
        setIsOpen(false)
        await onSucesso() // Agora o TS sabe que isso existe!
      } else {
        alert('Erro ao criar produto')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
      >
        + Novo Produto
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 relative">
            <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition"
            >
                ✕
            </button>
            <h2 className="text-lg font-bold mb-5 text-slate-900">Cadastrar Produto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nome</label>
                <input name="nome" required className="w-full border border-slate-300 p-2.5 rounded-lg text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition placeholder:text-slate-400" placeholder="Ex: Teclado USB" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Qtd Inicial</label>
                   <input name="quantidade" type="number" required className="w-full border border-slate-300 p-2.5 rounded-lg text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Estoque Mínimo</label>
                   <input name="estoqueMinimo" type="number" required className="w-full border border-slate-300 p-2.5 rounded-lg text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-500 font-medium text-sm hover:text-slate-700 transition">Cancelar</button>
                <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/25 disabled:opacity-50" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}