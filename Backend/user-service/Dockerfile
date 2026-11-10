FROM eclipse-temurin:17
#port listené par le projet
EXPOSE 8081
ADD target/user-service-0.0.1-SNAPSHOT.jar user-service.jar
ENTRYPOINT ["java", "-jar", "user-service.jar"]
