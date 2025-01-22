# Financial Management API

## **Descrição**
Esta é uma API desenvolvida com [NestJS](https://nestjs.com/) para gerenciamento financeiro, incluindo usuários, carteiras (wallets) e transações. A API utiliza autenticação JWT e possui controles de acesso baseados em papéis e ownership.

---

## **Pré-requisitos**
Certifique-se de ter as seguintes ferramentas instaladas:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Postman](https://www.postman.com/)

---

## **Instalação e Configuração**

### **1. Clonando o repositório**
```bash
git clone <url-do-repositorio>
cd <nome-do-repositorio>
```

### **2. Configuração do ambiente**
Certifique-se de que o arquivo `docker-compose.yml` e o `Dockerfile` estão configurados corretamente para sua máquina, importante ressaltar que as variaveis de ambiente do banco configuradas no docker são para ambiente de testes, em produção devem ser centralizadas no .ENV.

- **Banco de dados:**
  - Usuário: `user`
  - Senha: `password`
  - Database: `financial_system`
- **PgAdmin**: 
  - Email: `admin@admin.com`
  - Senha: `admin`
- **Token JWT**:
  - Configure um JWT_SECRET em seu .ENV (exemplo:E9miJfoSREu2c7ghUr7hSKlhXM8lpEmOJFlbMQaImvTp+lWtPIsDVL1JtYr1+UVD2l3FiXv4jCN1hl==)
### **3. Iniciando o ambiente**
Execute o seguinte comando para iniciar os containers do Docker:
```bash
docker-compose up --build
```

### **4. Acessando os serviços**
- **API NestJS**: Disponível em `http://localhost:3000`
- **PgAdmin**: Disponível em `http://localhost:5050`

> No PgAdmin, configure a conexão com o banco usando os dados fornecidos no `docker-compose.yml`.

---

## **Como Usar a API**

### **1. Configurando o Postman**
1. Abra o Postman e crie uma nova coleção.
2. Adicione um ambiente com a seguinte variável:
   - `{{baseUrl}}`: `http://localhost:3000`
3. Para cada rota, configure os headers necessários, como `Authorization` para endpoints protegidos.

---

### **2. Endpoints Principais**

#### **Autenticação**
- **Login**
  - **Endpoint**: `POST {{baseUrl}}/auth/login`
  - **Body**:
    ```json
    {
      "email": "email@example.com",
      "password": "password123"
    }
    ```
  - **Resposta**:
    ```json
    {
      "access_token": "JWT_TOKEN"
    }
    ```

#### **Usuários**
- **Criar Usuário**
  - **Endpoint**: `POST {{baseUrl}}/users`
  - **Body**:
    ```json
    {
      "email": "user@example.com",
      "name": "User Name",
      "password": "password123",
      "role": "user"
    }
    ```

- **Buscar Usuários (Admin)**
  - **Endpoint**: `GET {{baseUrl}}/users`
  - **Headers**:
    ```json
    {
      "Authorization": "Bearer JWT_TOKEN"
    }
    ```

#### **Carteiras (Wallets)**
- **Criar Carteira**
  - **Endpoint**: `POST {{baseUrl}}/wallets`
  - **Headers**:
    ```json
    {
      "Authorization": "Bearer JWT_TOKEN"
    }
    ```
  - **Body**:
    ```json
    {
      "name": "Wallet Name",
      "balance": 1000
    }
    ```

- **Atualizar Saldo**
  - **Endpoint**: `PATCH {{baseUrl}}/wallets/:walletId/balance`
  - **Headers**:
    ```json
    {
      "Authorization": "Bearer JWT_TOKEN"
    }
    ```
  - **Query Params**:
    - `amount`: Valor para incrementar ou decrementar.
  
- **Excluir Carteira**
  - **Endpoint**: `DELETE {{baseUrl}}/wallets/:walletId`
  - **Headers**:
    ```json
    {
      "Authorization": "Bearer JWT_TOKEN"
    }
    ```

#### **Transações**
- **Criar Transação**
  - **Endpoint**: `POST {{baseUrl}}/transactions`
  - **Headers**:
    ```json
    {
      "Authorization": "Bearer JWT_TOKEN"
    }
    ```
  - **Body**:
    ```json
    {
      "type": "income",
      "amount": 500,
      "category": "Salary",
      "sourceWalletId": 1
    }
    ```

- **Relatório de Transações**
  - **Endpoint**: `GET {{baseUrl}}/transactions/report`
  - **Headers**:
    ```json
    {
      "Authorization": "Bearer JWT_TOKEN"
    }
    ```
  - **Query Params**:
    - `startDate`: Data inicial no formato `YYYY-MM-DD`.
    - `endDate`: Data final no formato `YYYY-MM-DD`.
    - `walletId`: ID da carteira (opcional).
    - `category`: Categoria da transação (opcional).

---

## **Dicas**
- Use o token JWT obtido no login para acessar os endpoints protegidos. Adicione-o no header como:
  ```json
  {
    "Authorization": "Bearer JWT_TOKEN"
  }
  ```
- Teste as funcionalidades no Postman para garantir que tudo está configurado corretamente.

---

## **Tecnologias Utilizadas**
- **Backend**: NestJS
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT
- **Gerenciamento de Containers**: Docker e Docker Compose

---

## **Licença**
Este projeto está licenciado sob a licença MIT. Sinta-se à vontade para usar e modificar conforme necessário.
