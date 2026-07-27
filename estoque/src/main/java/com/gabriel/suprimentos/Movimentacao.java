package com.gabriel.suprimentos;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "movimentacoes")
public class Movimentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo; // "ENTRADA" ou "SAIDA"

    private Integer quantidade;

    private LocalDateTime dataHora; // A data exata do evento

    private String observacao; // Ex: "Enviado para Loja 02"

    @ManyToOne // Muitas movimentações pertencem a um produto
    @JoinColumn(name = "produto_id")
    private Produto produto;
}