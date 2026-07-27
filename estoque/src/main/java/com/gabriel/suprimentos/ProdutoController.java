package com.gabriel.suprimentos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    @Autowired
    private MovimentacaoRepository movimentacaoRepository;

    @Autowired
    private ProdutoService service; // O Service é quem manda aqui

    @GetMapping
    public List<Produto> listar() {
        return service.listarTodos();
    }

    @PostMapping
    public Produto criar(@RequestBody Produto produto) {
        return service.criar(produto);
    }

    // PATCH /produtos/1/consumir
    @PatchMapping("/{id}/consumir")
    public ResponseEntity<?> consumir(
            @PathVariable Long id, 
            @RequestParam Integer quantidade,
            @RequestParam(defaultValue = "Saída de estoque") String observacao
    ) {
        try {
            Produto atualizado = service.consumir(id, quantidade, observacao);
            return ResponseEntity.ok(atualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /produtos/1
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(@PathVariable Long id, @RequestBody Produto produto) {
        return ResponseEntity.ok(service.atualizar(id, produto));
    }

    // PATCH /produtos/1/repor
    @PatchMapping("/{id}/repor")
    public Produto repor(@PathVariable Long id, @RequestParam Integer quantidade) {
        return service.repor(id, quantidade);
    }

    // GET /produtos/1/historico
    @GetMapping("/{id}/historico")
    public List<Movimentacao> listarHistorico(@PathVariable Long id) {
        return movimentacaoRepository.findByProdutoId(id);
    }       

    // DELETE /produtos/1
    // AQUI ESTAVA A CONFUSÃO: O Controller só chama o Service!
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id); // Chamamos o método poderoso do Service que apaga tudo
        return ResponseEntity.noContent().build();
    }
}