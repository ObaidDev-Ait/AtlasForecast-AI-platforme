FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--workspace=frontend", "--", "--host", "0.0.0.0"]
