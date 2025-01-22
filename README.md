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
2. Para cada rota, configure os headers necessários, como `Authorization` para endpoints protegidos.

---

### **2. Endpoints Principais**

#### **Autenticação**
- **Login**
  - **Endpoint**: `POST http://localhost:3000/auth/login`
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
  - **Endpoint**: `POST http://localhost:3000/users`
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
  - **Endpoint**: `GET http://localhost:3000/users`
  - **Headers**:
    ```json
    {
      "Authorization": "Bearer JWT_TOKEN"
    }
    ```

### **Endpoints de Carteiras (Wallets)**

#### **1. Criar Carteira**
- **Descrição**: Cria uma nova carteira para o usuário autenticado.
- **Endpoint**: `POST http://localhost:3000/wallets`
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
- **Resposta**:
  ```json
  {
    "id": 1,
    "name": "Wallet Name",
    "balance": 1000,
    "userId": 1,
    "createdAt": "2025-01-22T10:00:00Z",
    "updatedAt": "2025-01-22T10:00:00Z"
  }
  ```

---

#### **2. Buscar Todas as Carteiras**
- **Descrição**: Retorna todas as carteiras pertencentes ao usuário autenticado.
- **Endpoint**: `GET http://localhost:3000/wallets`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer JWT_TOKEN"
  }
  ```
- **Resposta**:
  ```json
  [
    {
      "id": 1,
      "name": "Main Wallet",
      "balance": 1000,
      "createdAt": "2025-01-22T10:00:00Z",
      "updatedAt": "2025-01-22T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Savings Wallet",
      "balance": 5000,
      "createdAt": "2025-01-22T12:00:00Z",
      "updatedAt": "2025-01-22T12:00:00Z"
    }
  ]
  ```

---

#### **3. Buscar Carteira por ID**
- **Descrição**: Retorna os detalhes de uma carteira específica do usuário autenticado.
- **Endpoint**: `GET http://localhost:3000/wallets/:walletId`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer JWT_TOKEN"
  }
  ```
- **Parâmetros**:
  - `walletId`: ID da carteira.
- **Resposta**:
  ```json
  {
    "id": 1,
    "name": "Main Wallet",
    "balance": 1000,
    "createdAt": "2025-01-22T10:00:00Z",
    "updatedAt": "2025-01-22T10:00:00Z"
  }
  ```

---

#### **4. Atualizar Carteira**
- **Descrição**: Atualiza as informações de uma carteira específica (nome ou saldo).
- **Endpoint**: `PATCH http://localhost:3000/wallets/:walletId`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer JWT_TOKEN"
  }
  ```
- **Parâmetros**:
  - `walletId`: ID da carteira.
- **Body**:
  ```json
  {
    "name": "Updated Wallet Name",
    "balance": 1200
  }
  ```
- **Resposta**:
  ```json
  {
    "id": 1,
    "name": "Updated Wallet Name",
    "balance": 1200,
    "createdAt": "2025-01-22T10:00:00Z",
    "updatedAt": "2025-01-22T12:00:00Z"
  }
  ```

---

#### **5. Atualizar Saldo da Carteira**
- **Descrição**: Incrementa ou decrementa o saldo de uma carteira específica.
- **Endpoint**: `PATCH http://localhost:3000/wallets/:walletId/balance`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer JWT_TOKEN"
  }
  ```
- **Parâmetros**:
  - `walletId`: ID da carteira.
  - Query Params:
    - `amount`: Valor a ser incrementado ou decrementado (positivo para adicionar, negativo para subtrair).
- **Exemplo de URL**:
  ```
  PATCH local/wallets/1/balance?amount=200
  ```
- **Resposta**:
  ```json
  {
    "id": 1,
    "name": "Main Wallet",
    "balance": 1200,
    "createdAt": "2025-01-22T10:00:00Z",
    "updatedAt": "2025-01-22T12:00:00Z"
  }
  ```

---

#### **6. Excluir Carteira**
- **Descrição**: Remove uma carteira específica do usuário autenticado.
- **Endpoint**: `DELETE local/wallets/:walletId`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer JWT_TOKEN"
  }
  ```
- **Parâmetros**:
  - `walletId`: ID da carteira.
- **Resposta**:
 -  Código de status `200 OK` se a carteira for deletada com sucesso.

#### **Transações**
- **Criar Transação**
  - **Endpoint**: `POST local/transactions`
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

#### **Deletar Transação**
- **Endpoint**: `DELETE local/transactions/:transactionId`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer JWT_TOKEN"
  }
  ```
- **Parâmetros**:
  - `transactionId`: ID da transação que será cancelada.
- **Resposta**:
  - Código de status `200 OK` se a transação for cancelada com sucesso.
  - Exemplo de resposta:
    ```json
    {
      "message": "Transaction canceled successfully"
    }
    ```

#### **Buscar Todas as Transações**
- **Endpoint**: `GET local/transactions`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer JWT_TOKEN"
  }
  ```
- **Query Params (Opcional)**:
  - `startDate`: Data inicial no formato `YYYY-MM-DD`.
  - `endDate`: Data final no formato `YYYY-MM-DD`.
  - `walletId`: ID da carteira para filtrar as transações.
- **Resposta**:
  ```json
  [
    {
      "id": 1,
      "type": "income",
      "amount": 500,
      "category": "Salary",
      "walletId": 1,
      "createdAt": "2025-01-21T10:00:00Z"
    },
    {
      "id": 2,
      "type": "expense",
      "amount": 200,
      "category": "Groceries",
      "walletId": 1,
      "createdAt": "2025-01-20T15:00:00Z"
    }
  ]
  ```

#### **Buscar Transação por ID**
- **Endpoint**: `GET local/transactions/find/:transactionId`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer JWT_TOKEN"
  }
  ```
- **Parâmetros**:
  - `transactionId`: ID da transação que será buscada.
- **Resposta**:
  ```json
  {
    "id": 1,
    "type": "income",
    "amount": 500,
    "category": "Salary",
    "walletId": 1,
    "createdAt": "2025-01-21T10:00:00Z"
  }
  ```
- **Relatório de Transações**
  - **Endpoint**: `GET local/transactions/report`
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
