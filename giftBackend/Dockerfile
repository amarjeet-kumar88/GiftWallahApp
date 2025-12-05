FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# compiled code + deps
COPY dist ./dist
COPY node_modules ./node_modules

# 🔹 Swagger ke liye source files bhi chahiye:
COPY src ./src

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/server.js"]