package com.gabriel.suprimentos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    // O Spring é inteligente. Se você escrever o método assim, ele cria o SQL sozinho:
    // Pesquisar produtos pelo ID da categoria
    // java.util.List<Produto> findByCategoriaId(Long categoriaId);
}