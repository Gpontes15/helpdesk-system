import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../../../lib/db"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    // Agora o cérebro recebe a memória da conversa!
    const { historico, mensagem } = await request.json();

    // 1. Busca os chamados
    const chamados = await prisma.ticket.findMany({
      include: { store: true },
      orderBy: { createdAt: 'desc' },
      take: 150 
    });

    const usuarios = await prisma.user.findMany({
      select: { id: true, name: true, username: true, role: true, department: true, store: { select: { name: true } } }
    });

    // 2. Mapeia e TRADUZ os dados para a IA não se perder
    const contextoChamados = chamados.map(t => {
      // Tradutor interno
      const statusTraduzido = t.status === 'OPEN' ? 'ABERTO' : 
                              t.status === 'IN_PROGRESS' ? 'EM ANÁLISE' : 'FECHADO';

      return `[Chamado #${t.id}]
      Loja: ${t.store?.name || 'Sem Loja'}
      Status: ${statusTraduzido}
      Urgência: ${t.priority}
      Título: ${t.title}
      Descrição: ${t.description || 'Sem descrição'}
      Solução da TI: ${t.tiResponse || t.solution || 'Ainda sem solução'}
      -------------------`;
    }).join('\n');

    const contextoUsuarios = usuarios.map(u => 
      `[Usuário] Nome: ${u.name} | Cargo: ${u.role} | Setor: ${u.department} | Loja: ${u.store?.name || 'Geral'}`
    ).join('\n');

    // 3. Formata a memória da conversa
    const historicoTexto = historico && historico.length > 0 
      ? historico.map((m: any) => `${m.role === 'user' ? 'Usuário' : 'IA'}: ${m.content}`).join('\n')
      : "Nenhuma conversa anterior.";

    // 4. O Prompt Supremo
    const prompt = `
      Você é o Assistente Virtual Oficial do Helpdesk de TI.
      
      REGRAS DE FORMATAÇÃO E COMPORTAMENTO (OBRIGATÓRIO):
      1. Assuma que QUALQUER pergunta se refere ao ambiente do Helpdesk e da empresa.
      2. NUNCA use formatação Markdown. NÃO use asteriscos (**) para negrito. Escreva em texto 100% limpo. Se precisar destacar algo, use LETRAS MAIÚSCULAS. Se precisar fazer lista, use apenas hífens (-).
      3. Seja direto. Pareça um colega de TI conversando, não um robô corporativo.
      4. INTELIGÊNCIA DE AGRUPAMENTO: Ignore acentos, espaços extras e maiúsculas/minúsculas ao analisar nomes ou setores (trate "INVENTÁRIO" e "INVENTARIO" como a mesma coisa).
      5. EXATIDÃO MATEMÁTICA (CRÍTICO): Quando o usuário perguntar sobre quantidades, totais ou números, NUNCA use palavras como "aproximadamente", "cerca de" ou "mais de". Você DEVE contar linha por linha os chamados fornecidos abaixo e entregar o NÚMERO EXATO.
      
      --- MEMÓRIA DA CONVERSA ---
      ${historicoTexto}
      
      --- DADOS COMPLETOS DO SISTEMA ---
      
      CHAMADOS RECENTES:
      ${contextoChamados || "Nenhum chamado registrado."}
      
      USUÁRIOS:
      ${contextoUsuarios || "Nenhum usuário registrado."}
      
      -------------------------------
      Nova Pergunta do usuário: "${mensagem}"
      Sua Resposta Direta (sem asteriscos):
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    
    return NextResponse.json({ resposta: result.response.text() });

  } catch (error) {
    console.error("Erro na IA:", error);
    return NextResponse.json({ error: "Erro ao processar a pergunta." }, { status: 500 });
  }
}