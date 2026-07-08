# Dockerfile untuk backend Rak Buku Tracker
# Taruh file ini di dalam folder backend/ (sejajar dengan package.json)

FROM node:20-bullseye-slim

# Install build tools untuk compile better-sqlite3 (native module)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json dulu supaya layer caching lebih efisien
COPY package*.json ./
RUN npm install --production

# Copy semua source code backend
COPY . .

# Pastikan folder data ada (buat SQLite db)
RUN mkdir -p data

EXPOSE 3000

CMD ["node", "src/server.js"]
