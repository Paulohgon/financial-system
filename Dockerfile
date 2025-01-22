# Use a imagem oficial do Node.js
FROM node:18

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie os arquivos do package.json e package-lock.json para instalar dependências
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante dos arquivos do projeto
COPY . .

# Exponha a porta que será usada pela aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:dev"]
