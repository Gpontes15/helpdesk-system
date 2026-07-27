'use client'

import { useState } from "react"

type Mensagem = {
  role: 'user' | 'ai'
  content: string
}

export default function ChatIAPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [input, setInput] = useState("")
  const [carregando, setCarregando] = useState(false)

  async function enviarMensagem(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const novaMensagemUsuario: Mensagem = { role: 'user', content: input }
    setMensagens(prev => [...prev, novaMensagemUsuario])
    setInput("")
    setCarregando(true)

    try {
      // Chama a nossa API enviando o histórico da conversa e a mensagem atual
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          historico: mensagens, 
          mensagem: novaMensagemUsuario.content 
        })
      })

      const data = await response.json()

      if (data.resposta) {
        setMensagens(prev => [...prev, { role: 'ai', content: data.resposta }])
      } else {
        throw new Error("Resposta vazia")
      }
    } catch (error) {
      setMensagens(prev => [...prev, { role: 'ai', content: '❌ Ocorreu um erro ao conectar com o cérebro da IA.' }])
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col h-[85vh]">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          🤖 Assistente IA do Helpdesk
        </h1>
        <p className="text-sm text-blue-100">Pergunte qualquer coisa sobre a fila de chamados atual.</p>
      </div>

      {/* Caixa de Mensagens */}
      <div className="flex-1 bg-gray-50 border-x border-gray-200 p-4 overflow-y-auto flex flex-col gap-4">
        {mensagens.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            Nenhuma mensagem ainda. Experimente perguntar: "Qual a loja com mais chamados críticos?"
          </div>
        )}
        
        {mensagens.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
            }`}>
              {/* O whitespace-pre-wrap permite que as quebras de linha da IA funcionem na tela */}
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          </div>
        ))}

        {carregando && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-500 p-3 rounded-lg rounded-bl-none shadow-sm animate-pulse text-sm">
              Analisando chamados...
            </div>
          </div>
        )}
      </div>

      {/* Input de Digitação */}
      <form onSubmit={enviarMensagem} className="bg-white border border-gray-200 p-4 rounded-b-lg shadow-sm flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex: Quais chamados estão abertos?"
          disabled={carregando}
          className="flex-1 p-2 border border-gray-300 rounded outline-none focus:border-blue-500 text-black"
        />
        <button 
          type="submit" 
          disabled={carregando || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold transition-colors disabled:bg-gray-400"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}