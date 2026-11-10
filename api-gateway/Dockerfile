# ---------- Etape 1 : compilation du jar avec Maven ----------
FROM maven:3.9.11-eclipse-temurin-17 AS build
WORKDIR /build
# Les dependances ne sont retelechargees que si pom.xml change (cache Docker)
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q package -DskipTests

# ---------- Etape 2 : image d'execution (Java seulement, plus legere) ----------
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/target/api-gateway-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
