# Build Stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/dashboard-service-1.0.0.jar app.jar
EXPOSE 8088
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]
