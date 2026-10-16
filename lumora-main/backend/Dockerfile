FROM maven:3.9-eclipse-temurin-21-alpine@sha256:308cba8b638ed7e4658cea3f8399066219466211c805f6d5728c3c9c7614661b AS build
WORKDIR /workspace
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -q package -DskipTests

FROM eclipse-temurin:21-jre-alpine@sha256:51ab5e3302e7141ce665ca3ea85e8b5cd648eafbc3c0c90dd79d6537684e4555
RUN apk add --no-cache curl && addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build /workspace/target/lumora-backend-0.1.0-SNAPSHOT.jar ./app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
