'use client'

import { useState } from "react"
import { createTicket } from "@/actions/ticket-actions"

type Store = {
  id: string
  name: string
}

const slaInfo = {
  LOW: "Até 48 horas (Dúvidas simples)",
  MEDIUM: "Até 24 horas (Computador lento)",
  HIGH: "Até 8 horas (Impressora parada)",
  CRITICAL: "Até 2 horas (Loja parada/Sem venda)",
}

export function TicketForm({ stores }: { stores: Store[] }) {
  const [priority, setPriority] = useState("LOW")
  const [loading, setLoading] = useState(false)
  
  // NOVO: Estado para "escutar" o que o usuário digita na descrição
  const [description, setDescription] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      await createTicket(formData)
    } catch (error: any) {
      if (error?.message !== 'NEXT_REDIRECT') {
        alert(error.message || "Erro ao salvar chamado.")
      }
    } finally {
      setLoading(false)
    }
  }

  // A nossa regra de negócio do arquivo de actions (> 5)
  const isDescriptionValid = description.length > 5

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Título</label>
        <input 
          name="title" 
          required 
          className="mt-1 block w-full border border-gray-300 p-2 rounded text-black outline-none focus:border-blue-500" 
          placeholder="Ex: Erro no Caixa" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Loja</label>
        <select name="storeId" className="mt-1 block w-full border border-gray-300 p-2 rounded text-black outline-none focus:border-blue-500">
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <label className="block text-sm font-medium text-gray-700">Qual a Urgência?</label>
        <select 
          name="priority" 
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="mt-1 block w-full border border-gray-300 p-2 rounded text-black bg-white outline-none focus:border-blue-500"
        >
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
          <option value="CRITICAL">Crítica</option>
        </select>
        
        <p className="text-sm text-blue-800 mt-2 font-medium">
          ⏱ Previsão de atendimento: <br/>
          <span className="font-bold">{slaInfo[priority as keyof typeof slaInfo]}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea 
          name="description" 
          required 
          value={description}
          onChange={(e) => setDescription(e.target.value)} // Atualiza as letras em tempo real
          className="mt-1 block w-full border border-gray-300 p-2 rounded text-black outline-none focus:border-blue-500" 
          rows={3}
          placeholder="Detalhe o problema ao máximo..."
        ></textarea>
        
        {/* NOVO: O contador visual dinâmico */}
        <div className="mt-1 flex justify-end">
          <span className={`text-xs font-bold transition-colors ${isDescriptionValid ? 'text-green-600' : 'text-red-500'}`}>
            {isDescriptionValid 
              ? '✅ Tamanho excelente!' 
              : `Mínimo de 6 caracteres (Digitado: ${description.length})`}
          </span>
        </div>
      </div>

      {/* NOVO: O botão agora analisa se a descrição é válida antes de liberar o clique */}
      <button 
        type="submit" 
        disabled={loading || !isDescriptionValid} 
        className={`w-full text-white p-2 rounded font-bold transition ${
          (loading || !isDescriptionValid) 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Salvando Chamado...' : 'Salvar Chamado'}
      </button>
    </form>
  )
}