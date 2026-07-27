package com.gabriel.suprimentos;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro unico que resolve CORS e autenticacao por token.
 * 1. Adiciona os cabecalhos de CORS em toda resposta.
 * 2. Libera o preflight (OPTIONS) sem exigir token.
 * 3. Para as demais requisicoes, exige o header X-API-Token valido.
 */
@Component
@Order(1)
public class ApiTokenFilter extends OncePerRequestFilter {

    // Origem permitida (o front). Em producao, troque pelo dominio real.
    private static final String ALLOWED_ORIGIN = "http://localhost:3001";

    // Lê o token esperado da variável de ambiente API_ESTOQUE_TOKEN
    private final String expectedToken = System.getenv("API_ESTOQUE_TOKEN");

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // --- 1. CORS: adiciona os cabecalhos em TODA resposta ---
        response.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Token, Pragma, Cache-Control");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age", "3600");

        // --- 2. Libera o preflight (OPTIONS) sem exigir token ---
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // --- 3. Autenticacao por token ---
        // Se nao ha token configurado no servidor, bloqueia tudo (fail-safe)
        if (expectedToken == null || expectedToken.isBlank()) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Servidor sem token configurado.");
            return;
        }

        String providedToken = request.getHeader("X-API-Token");

        if (expectedToken.equals(providedToken)) {
            filterChain.doFilter(request, response); // token OK -> segue
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.getWriter().write("Token invalido ou ausente.");
        }
    }
}