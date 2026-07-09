# ── Stage 1: Build ────────────────────────────────────────────────────────────

# Base image for the build stage: official Node.js 20 on Alpine Linux.
# We need Node here to run the TypeScript compiler and Vite bundler.
# Like the backend build stage, this image does NOT end up in the final output.
FROM node:20-alpine AS build

# Set the working directory inside the container for all subsequent commands.
WORKDIR /app

# Copy only the package descriptor files first.
# Same layer-caching strategy as the backend: if these files haven't changed,
# Docker skips the npm install on the next build — saves significant time.
COPY package*.json ./

# Install exact dependency versions from package-lock.json.
# 'ci' (clean install) is preferred over 'install' in automated environments:
# it's faster, stricter, and fails if package-lock.json is out of sync.
RUN npm ci

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
