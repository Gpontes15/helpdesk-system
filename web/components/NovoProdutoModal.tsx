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
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold transition"
      >
        + Novo Produto
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative">
            <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
                ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Cadastrar Produto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">Nome</label>
                <input name="nome" required className="w-full border p-2 rounded text-black outline-none focus:border-blue-500" placeholder="Ex: Teclado USB" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase">Qtd Inicial</label>
                   <input name="quantidade" type="number" required className="w-full border p-2 rounded text-black outline-none focus:border-blue-500" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase">Estoque Mínimo</label>
                   <input name="estoqueMinimo" type="number" required className="w-full border p-2 rounded text-black outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 font-medium">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700" disabled={loading}>
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