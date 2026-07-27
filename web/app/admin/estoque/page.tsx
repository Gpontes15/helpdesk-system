'use client'

import { useState, useEffect } from "react"
import { NovoProdutoModal } from "@/components/NovoProdutoModal"
import { MovimentarModal } from "@/components/MovimentarModal"
import { EditarModal } from "@/components/EditarModal"
import { HistoricoModal } from "@/components/HistoricoModal"
import { ExcluirProduto } from "@/components/ExcluirProduto"

interface ProdutoJava {
  id: number
  nome: string
  quantidade: number
  estoqueMinimo: number
  categoria: { id: number; nome: string }
}

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<ProdutoJava[]>([])
  const [loading, setLoading] = useState(true)

  async function carregarDados() {
    try {
      // Adicionamos um timestamp na URL para impedir que o navegador use Cache antigo
      const timestamp = new Date().getTime()
      const res = await fetch(`http://localhost:8080/produtos?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'X-API-Token': process.env.NEXT_PUBLIC_API_ESTOQUE_TOKEN as string
        }
      })

      if (!res.ok) throw new Error()

      const data = await res.json()

      // 🔥 A CORREÇÃO MÁGICA ESTÁ AQUI 🔥
      // Ordenamos a lista pelo ID. O menor ID sempre fica em cima.
      // Isso impede que os itens fiquem "dançando" na tela.
      const listaOrdenada = data.sort((a: ProdutoJava, b: ProdutoJava) => a.id - b.id)

      setProdutos([...listaOrdenada])
    } catch (err) {
      console.error("Erro ao carregar dados:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregarDados() }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📦 Controle de Estoque</h1>
            <p className="text-sm text-gray-500 font-medium">TI & Suprimentos</p>
          </div>
          <NovoProdutoModal onSucesso={carregarDados} />
        </div>

        {loading ? (
          <div className="text-center py-20">
             <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
             <p className="text-gray-500 font-bold">Atualizando inventário...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtos.map((prod) => (
                <div
                  key={prod.id}
                  className={`bg-white p-6 rounded-xl shadow-sm border-l-8 relative group hover:shadow-lg transition-all duration-200 ${
                    prod.quantidade <= prod.estoqueMinimo ? 'border-red-500 bg-red-50/10' : 'border-green-500'
                  }`}
                >
                  {/* Botões de Edição/Exclusão (Topo Direito) */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <div className="bg-white rounded-full shadow p-1 flex gap-1">
                        <EditarModal produto={prod} onSucesso={carregarDados} />
                        <div className="w-px bg-gray-200 mx-1"></div>
                        <ExcluirProduto id={prod.id} nome={prod.nome} onSucesso={carregarDados} />
                    </div>
                  </div>

                  <div className="mb-6 pr-12">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">
                      COD: {prod.id}
                    </span>
                    <h3 className="font-extrabold text-xl text-gray-800 leading-tight break-words" title={prod.nome}>
                      {prod.nome}
                    </h3>
                    <span className="inline-block mt-2 text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase">
                      {prod.categoria?.nome || "Geral"}
                    </span>
                  </div>

                  <div className="flex justify-between items-end py-4 border-t border-b border-gray-100 my-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Mínimo</p>
                        <p className="font-bold text-gray-700">{prod.estoqueMinimo} un.</p>
                    </div>
                    <div className="text-right">
                        <span className={`block text-5xl font-black leading-none ${prod.quantidade <= prod.estoqueMinimo ? 'text-red-600' : 'text-gray-800'}`}>
                          {prod.quantidade}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Disponível</span>
                    </div>
                  </div>

                  {prod.quantidade <= prod.estoqueMinimo && (
                    <div className="mb-4 bg-red-100 text-red-800 text-xs py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 animate-pulse">
                      🚨 ESTOQUE CRÍTICO
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                     <MovimentarModal
                        produtoId={prod.id}
                        nomeProduto={prod.nome}
                        tipo="USAR"
                        onSucesso={carregarDados}
                      />
                     <MovimentarModal
                        produtoId={prod.id}
                        nomeProduto={prod.nome}
                        tipo="REPOR"
                        onSucesso={carregarDados}
                      />
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-50 text-center">
                    <HistoricoModal produtoId={prod.id} />
                  </div>
                </div>
              ))}
          </div>
        )}

        {!loading && produtos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
             <div className="text-6xl mb-4">📦</div>
             <p className="text-gray-500 font-bold text-lg">Seu estoque está vazio</p>
             <p className="text-gray-400 text-sm mb-6">Cadastre o primeiro item para começar</p>
          </div>
        )}
      </div>
    </div>
  )
}