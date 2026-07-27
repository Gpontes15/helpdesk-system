package com.gabriel.suprimentos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Aqui acontece a mágica do Spring Data JPA
// Você estende JpaRepository<Entidade, TipoDoId>
@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    // Só de deixar vazio assim, ele já cria métodos como:
    // .save(), .findAll(), .delete(), etc.
}