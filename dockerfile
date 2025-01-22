# Use a imagem oficial do Node.js
FROM node:18

# Instala o NestJS CLI globalmente
RUN npm install -g @nestjs/cli

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos do package.json e package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie os arquivos do projeto
COPY . .

# Exponha a porta 3000
EXPOSE 3000

# Comando para iniciar a aplicação com hot reload
CMD ["npm", "run", "start:dev"]
