# ── Stage 1: BUILD stage ─────────────────────────────────
# We use Node to install dependencies and build the React app.
# This produces static files (HTML, CSS, JS) in a /dist folder.
FROM node:18-alpine AS builder

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# ── Stage 2: SERVE stage ─────────────────────────────────
# Now we throw away Node entirely and use Nginx — a lightweight
# web server — to serve the static files from Stage 1.
# Why? The final image has NO Node, NO source code, NO node_modules.
# It's tiny, fast, and has a much smaller attack surface.
FROM nginx:alpine

# Copy the built files from Stage 1 into Nginx's web folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx config (we'll create this next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
