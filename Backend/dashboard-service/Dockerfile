FROM eclipse-temurin:17
#port listené par le projet
EXPOSE 8088
ADD target/dashboard-service-0.0.1-SNAPSHOT.jar dashboard-service.jar
ENTRYPOINT ["java", "-jar", "dashboard-service.jar"]
