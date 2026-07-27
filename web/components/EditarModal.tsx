'use client'
import { useState } from 'react'

interface EditarProps {
  produto: any
  onSucesso: () => void
}

export function EditarModal({ produto, onSucesso }: EditarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [nome, setNome] = useState(produto.nome)
  const [minimo, setMinimo] = useState(produto.estoqueMinimo)

  async function handleSalvar() {
    await fetch(`http://localhost:8080/produtos/${produto.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': process.env.NEXT_PUBLIC_API_ESTOQUE_TOKEN as string
      },
      body: JSON.stringify({ nome, estoqueMinimo: minimo })
    })
    setIsOpen(false)
    onSucesso()
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-gray-400 hover:text-blue-600 p-1">
        ✏️
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Editar Produto</h3>
            <div className="space-y-3">
              <input value={nome} onChange={e => setNome(e.target.value)} className="w-full border p-2 rounded text-black" placeholder="Nome" />
              <div className='flex gap-2 items-center'>
                 <label className='text-gray-600 text-sm'>Mínimo:</label>
                 <input type="number" value={minimo} onChange={e => setMinimo(e.target.value)} className="w-20 border p-2 rounded text-black" />
              </div>
              <button onClick={handleSalvar} className="w-full bg-blue-600 text-white py-2 rounded font-bold mt-2">Salvar</button>
              <button onClick={() => setIsOpen(false)} className="w-full text-gray-400 py-1 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}