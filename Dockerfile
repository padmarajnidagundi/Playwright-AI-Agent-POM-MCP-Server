FROM mcr.microsoft.com/playwright:v1.35.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "test"]