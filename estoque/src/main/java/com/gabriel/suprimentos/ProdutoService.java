package com.gabriel.suprimentos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository repository;

    @Autowired
    private MovimentacaoRepository movimentacaoRepository;

    public List<Produto> listarTodos() {
        return repository.findAll();
    }

    public Produto criar(Produto produto) {
        return repository.save(produto);
    }

    @Transactional
    public Produto consumir(Long id, Integer quantidade, String observacao) {
        Produto produto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado!"));

        int novoEstoque = produto.getQuantidade() - quantidade;
        if (novoEstoque < 0) {
            throw new IllegalArgumentException("Estoque insuficiente!");
        }

        produto.setQuantidade(novoEstoque);
        Produto produtoSalvo = repository.save(produto);

        Movimentacao mov = new Movimentacao();
        mov.setProduto(produtoSalvo);
        mov.setQuantidade(quantidade);
        mov.setTipo("SAIDA");
        mov.setDataHora(java.time.LocalDateTime.now());
        mov.setObservacao(observacao);
        
        movimentacaoRepository.save(mov);
        return produtoSalvo;
    }

    @Transactional
    public Produto repor(Long id, Integer quantidade) {
        Produto produto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado!"));

        produto.setQuantidade(produto.getQuantidade() + quantidade);
        Produto produtoSalvo = repository.save(produto);

        Movimentacao mov = new Movimentacao();
        mov.setProduto(produtoSalvo);
        mov.setQuantidade(quantidade);
        mov.setTipo("ENTRADA");
        mov.setDataHora(java.time.LocalDateTime.now());
        mov.setObservacao("Reposição de Estoque");

        movimentacaoRepository.save(mov);
        return produtoSalvo;
    }

    public Produto atualizar(Long id, Produto dadosNovos) {
        Produto produto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado!"));
        
        produto.setNome(dadosNovos.getNome());
        produto.setEstoqueMinimo(dadosNovos.getEstoqueMinimo());
        
        return repository.save(produto);
    }

    // --- A MÁGICA ESTÁ AQUI ---
    @Transactional 
    public void excluir(Long id) {
        // 1. LIMPA O HISTÓRICO PRIMEIRO (O que faltava no seu código)
        List<Movimentacao> historico = movimentacaoRepository.findByProdutoId(id);
        if (historico != null && !historico.isEmpty()) {
            movimentacaoRepository.deleteAll(historico);
        }
        
        // 2. AGORA APAGA O PRODUTO
        repository.deleteById(id);
    }
}