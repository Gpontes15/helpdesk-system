package com.gabriel.suprimentos;

import jakarta.persistence.*;
import lombok.Data;

@Data // O Lombok cria os Getters, Setters e toString sozinho!
@Entity // Diz pro Spring que isso é uma tabela no banco
@Table(name = "categorias")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome; // Ex: Toners, Periféricos, Cabos
}