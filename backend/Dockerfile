# ── Stage 1: Build ────────────────────────────────────────────────────────────

# Base image for the build stage: official Maven image bundled with Eclipse Temurin JDK 17.
# This gives us both the Java compiler and Maven in one image.
# Only used during build — it does NOT end up in the final image.
FROM maven:3.9-eclipse-temurin-17 AS build

# Set the working directory inside the container for all subsequent commands.
WORKDIR /app

# Copy only the Maven project descriptor first.
# Docker builds in layers: if pom.xml hasn't changed, the next RUN step is
# served from cache and dependencies are not re-downloaded on every build.
COPY pom.xml .

# Download all dependencies declared in pom.xml into the local Maven cache.
# -B = batch mode (no interactive prompts, cleaner CI output).
RUN mvn dependency:go-offline -B

# Now copy the source code. This is a separate COPY so that the dependency
# download layer above stays cached even when source files change.
COPY src ./src

# Compile the project and package it into a single executable JAR.
# -DskipTests = don't run unit tests during the Docker build.
RUN mvn package -DskipTests -B

# ── Stage 2: Run ──────────────────────────────────────────────────────────────

# Fresh base image for the runtime stage: Eclipse Temurin JRE (not JDK).
# JRE = Java Runtime only — no compiler, no Maven, significantly smaller image.
# Using the standard Debian-based variant instead of Alpine because the Alpine
# variant of Temurin 17 does not publish an ARM64 image — which is required for
# both Apple Silicon (local dev) and the Raspberry Pi (production).
FROM eclipse-temurin:17-jre

# Working directory for the running application.
WORKDIR /app

# Copy only the built JAR from stage 1. Everything else (source, Maven cache,
# build tools) is left behind — it never makes it into this image.
COPY --from=build /app/target/*.jar app.jar

# Document that the application listens on port 8080.
# Does not actually publish the port — that's done in docker-compose.yml.
EXPOSE 8080

# Command to run when the container starts.
ENTRYPOINT ["java", "-jar", "app.jar"]
