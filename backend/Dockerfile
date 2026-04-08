# ── Stage 1: Base image ──────────────────────────────────
# We start from an official Node.js 18 image based on Debian slim.
# Better compatibility with Prisma engines.
FROM node:18-slim

# ── Set working directory ────────────────────────────────
# This is the folder inside the container where our app will live.
# All commands after this run from /app
WORKDIR /app

# ── Copy dependency files first ──────────────────────────
# We copy package.json before copying the rest of the code.
# Why? Docker caches each step. If package.json hasn't changed,
# Docker skips the npm install step — making builds much faster.
COPY package*.json ./
COPY prisma ./prisma/

# ── Install dependencies ─────────────────────────────────
RUN apt-get update && apt-get install -y libssl3 && rm -rf /var/lib/apt/lists/*
RUN npm install

# ── Generate Prisma client ───────────────────────────────
# Prisma generates a database client based on your schema.
# It must be generated inside the container too.
ENV PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x"
RUN npx prisma generate

# ── Copy the rest of the app code ───────────────────────
COPY . .
# Remove .env files to avoid loading production/development configs in container
RUN rm -f .env*

# ── Expose the port ──────────────────────────────────────
# This tells Docker "this container listens on port 3001".
# It doesn't open it to the world — docker-compose handles that.
EXPOSE 3001

# ── Start the app ────────────────────────────────────────
CMD ["node", "src/index.cjs"]
