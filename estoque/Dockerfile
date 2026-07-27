# ETAPA 1: Build (Usa imagem com Maven para compilar)
# Usamos uma imagem Maven que já vem com o Java 17 (Eclipse Temurin)
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
# Baixa dependências
RUN mvn dependency:go-offline
COPY src ./src
# Compila o projeto
RUN mvn clean package -DskipTests

# ETAPA 2: Run (Usa imagem leve só com Java para rodar)
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
# Pega o arquivo .jar gerado na etapa 'build' acima
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]