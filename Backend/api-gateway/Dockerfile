FROM eclipse-temurin:17
#port listené par le projet
EXPOSE 8080
ADD target/gateway-0.0.1-SNAPSHOT.jar gateway.jar
ENTRYPOINT ["java", "-jar", "gateway.jar"]
