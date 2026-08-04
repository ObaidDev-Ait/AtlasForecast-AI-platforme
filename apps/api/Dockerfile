FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev", "--workspace=api"]
