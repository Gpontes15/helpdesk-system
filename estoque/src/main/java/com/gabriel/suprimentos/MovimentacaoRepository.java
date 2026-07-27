package com.gabriel.suprimentos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {
    // Aqui você pode criar métodos futuros como:
    // List<Movimentacao> findByProdutoId(Long id);

    // O Spring lê "findByProdutoId" e sabe exatamente o que fazer
    // Ele busca pelo campo "produto", pegando o "id" dele.
    List<Movimentacao> findByProdutoId(Long produtoId);
}