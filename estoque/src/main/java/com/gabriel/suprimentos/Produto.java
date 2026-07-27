package com.gabriel.suprimentos;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome; // Ex: Toner HP 85A

    private Integer quantidade; // Estoque atual (Ex: 10)

    private Integer estoqueMinimo; // Para o sistema avisar quando comprar (Ex: 2)

    // AQUI ESTÁ O RELACIONAMENTO
    @ManyToOne // Vários produtos -> Uma categoria
    @JoinColumn(name = "categoria_id") // Cria uma coluna 'categoria_id' na tabela produtos
    private Categoria categoria;
}