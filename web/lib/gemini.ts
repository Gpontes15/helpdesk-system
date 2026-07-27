import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function gerarRelatorioIA() {
  // 1. Busca os chamados do banco (incluindo a loja)
  const chamados = await prisma.ticket.findMany({
    include: { store: true },
    orderBy: { createdAt: 'desc' },
    take: 50 // Analisa os últimos 50
  });

  // 2. Formata os dados para a IA entender
  const dadosParaIA = chamados.map(t => ({
    titulo: t.title,
    descricao: t.description,
    loja: t.store.name,
    status: t.status,
    urgencia: t.priority,
    data: t.createdAt
  }));

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Você é o Analista de TI.
    Abaixo estão os últimos chamados do sistema de Helpdesk:
    ${JSON.stringify(dadosParaIA)}

    Sua tarefa é:
    1. Resumir quais são os problemas mais frequentes (Ex: impressoras na Loja 02).
    2. Listar quais chamados CRÍTICOS precisam de atenção imediata.
    3. Dar uma sugestão técnica para o estagiário Gabriel resolver o problema recorrente.
    
    Responda em formato de relatório profissional para a gerência.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}