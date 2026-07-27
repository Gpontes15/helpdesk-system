import { getIronSession, SessionOptions } from "iron-session"
import { cookies } from "next/headers"

// O que fica guardado dentro do cookie (criptografado e assinado)
export interface SessionData {
  userId?: string
}

// Opções base do cookie (sem o maxAge, que é decidido no login)
const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string, // a "chave mestra" que assina o cookie
  cookieName: "helpdesk_session",
  cookieOptions: {
    ...baseCookieOptions,
    maxAge: 60 * 60 * 24 * 7, // padrão: 7 dias
  },
}

// Sessão padrão (7 dias) — usada em getCurrentUser e logout
export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

// Sessão para o LOGIN, com validade dependendo do "Lembrar de mim"
// lembrar = true  -> cookie dura 7 dias (persiste ao fechar o navegador)
// lembrar = false -> cookie de sessão (apagado ao fechar o navegador)
export async function getSessionForLogin(lembrar: boolean) {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, {
    ...sessionOptions,
    cookieOptions: {
      ...baseCookieOptions,
      maxAge: lembrar ? 60 * 60 * 24 * 7 : undefined,
    },
  })
}