# ── Stage 1: Build ────────────────────────────────────────────────────────────

# Base image for the build stage: official Node.js 20 on Alpine Linux.
# We need Node here to run the TypeScript compiler and Vite bundler.
# Like the backend build stage, this image does NOT end up in the final output.
FROM node:20-alpine AS build

# Set the working directory inside the container for all subsequent commands.
WORKDIR /app

# Copy only package.json (not package-lock.json) for the dependency install step.
# The layer-caching benefit still applies: if package.json hasn't changed,
# Docker reuses the cached layer and skips the install entirely.
#
# We intentionally omit package-lock.json here because Vite 8 uses rolldown,
# a Rust-based bundler with platform-specific native binaries distributed as
# optional npm packages (e.g. @rolldown/binding-linux-arm64-musl). The lock
# file is generated on macOS and records the darwin binary; if it is present
# inside the container, npm honours those resolutions and the linux/musl binary
# is never downloaded — causing the build to fail. Without the lock file, npm
# resolves optional dependencies fresh for the current OS.
COPY package.json ./
RUN npm install

# Copy the rest of the source code now that dependencies are installed.
COPY . .

# Run the production build: compiles TypeScript then bundles everything with Vite.
# Output lands in /app/dist as optimised static files (HTML, JS, CSS).
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────

# Fresh base image for the runtime stage: official Nginx on Alpine Linux.
# Nginx is a high-performance web server — it will serve the static files
# produced by stage 1. Node.js is not present here at all.
FROM nginx:alpine

# Copy the compiled static files from stage 1 into Nginx's default web root.
# Only the contents of dist/ cross the stage boundary — no source, no node_modules.
COPY --from=build /app/dist /usr/share/nginx/html

# Replace Nginx's default config with ours.
# Our config handles two things: SPA routing fallback and /api proxy to backend.
# (See frontend/nginx.conf for details.)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Document that Nginx listens on port 80.
# The actual port binding to the host is declared in docker-compose.yml.
EXPOSE 80
