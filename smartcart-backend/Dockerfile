FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw

RUN ./mvnw clean package -DskipTests

RUN echo "===== APPLICATION PROPERTIES INSIDE DOCKER BUILD =====" && cat target/classes/application.properties

EXPOSE 8080

CMD ["sh", "-c", "java -jar target/*.jar"]