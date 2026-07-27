package com.gabriel.suprimentos;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CategoriaRepository categoriaRepository;

    public DataSeeder(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Verifica se a tabela de categorias está vazia
        if (categoriaRepository.count() == 0) {
            System.out.println("🌱 Banco vazio detectado. Criando Categoria Padrão...");

            Categoria geral = new Categoria();
            // O ID 1 será gerado automaticamente pelo banco na primeira inserção
            geral.setNome("Geral");
            // Se sua classe Categoria tiver descrição, descomente a linha abaixo:
            // geral.setDescricao("Categoria padrão para produtos diversos");

            categoriaRepository.save(geral);
            
            System.out.println("✅ Categoria 'Geral' criada com sucesso!");
        } else {
            System.out.println("👌 Categorias já existem. Nenhuma ação necessária.");
        }
    }
}