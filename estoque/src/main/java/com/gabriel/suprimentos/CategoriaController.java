package com.gabriel.suprimentos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Diz que essa classe responde a requisições REST (JSON)
@RequestMapping("/categorias") // Todas as rotas aqui começam com /categorias
public class CategoriaController {

    @Autowired // Injeção de Dependência: O Spring "entrega" o repository pronto pra usar
    private CategoriaRepository repository;

    // Rota GET: Listar tudo (http://10.200.103.12:8080/categorias)
    @GetMapping
    public List<Categoria> listar() {
        return repository.findAll();
    }

    // Rota POST: Criar nova (http://10.200.103.12:8080/categorias)
    @PostMapping
    public Categoria criar(@RequestBody Categoria categoria) {
        return repository.save(categoria);
    }
}