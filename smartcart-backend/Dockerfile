
FROM maven:3.9.9-eclipse-temurin-17

WORKDIR /app

COPY pom.xml .

COPY . .

RUN mvn -B clean package -DskipTests

EXPOSE 8080

CMD ["sh", "-c", "java -jar target/*.jar"]
