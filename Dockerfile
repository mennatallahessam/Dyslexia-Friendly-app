FROM node:20-alpine

WORKDIR /app

# Copy root and subpackage package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm run postinstall

# Copy remaining source files
COPY . .

# Build frontend static bundle
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
