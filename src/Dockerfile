# Frontend üçün Dockerfile
FROM node:18

WORKDIR /app

COPY . /app

RUN npm install && npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]
