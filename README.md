# API Node.js N3

API de consultório dentista para cadastrar clientes, dentistas e consultas.

## Pré-requisitos

- Node.js (v14.17.0 ou superior)
- npm (v6.14.13 ou superior)
- Banco de Dados (SQL Server)

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/Mikaell88/BackN3.git
   ```

2. Acesse a pasta raiz:

   ```bash
   cd BackN3
   ```

3. Instale as dependências

   ```bash
   npm i
   ```

## Configuração IMPORTANTE!

Você precisa estar com SQL Server rodando, ir no arquivo src/app.js e editar o objeto config alterando a senha "password" para a sua senha cadastrada no SQL Server. No caso da maioria "cesusc2024".

```javascript
const config = {
  server: "localhost",
  port: 1433,
  user: "sa",
  password: "SqlServer2019!",
  trustServerCertificate: true,
  options: {
    cryptoCredentialsDetails: {
      minVersion: "TLSv1",
      trustServerCertificate: true,
    },
  },
};
```

Se por acaso você já tem um banco de dados chamado "N3" rodando não irá funcionar. Neste caso, ou altere o nome do banco de dados que será criado no arquivo src/database.js na propriedade const `createDbQuery = CREATE DATABASE N3;` alterando `N3` para o nome desejado:

```javascript
async function createDatabase() {
  try {
    const checkDbQuery = `SELECT database_id FROM sys.databases WHERE name = 'N3'`;

    const result = await db.conn.request().query(checkDbQuery);

    if (result.recordset.length === 0) {
      const createDbQuery = `CREATE DATABASE N3`;
      await execSQLQuery(createDbQuery);
      console.log("Database N3 created successfully");
    } else {
      console.log("Database N3 already exists");
    }
  } catch (err) {
    console.error("Error checking/creating database:", err);
  }
}
```

## Uso

Para a rodar a api:

1. Inicie o servidor:

```bash
   npm run start
```

Rodando com sucesso, deve logar no console:
```bash
App listening on port: 3001
Connected to SQL Server
Database N3 created successfully
Tabela "Clientes" garantida no banco de dados
Tabela "Dentistas" garantida no banco de dados
Tabela "Consultas" garantida no banco de dados
Stored procedure garantida no banco de dados 
```
2. Acesse a API em `http://localhost:3001`

## Documentação:

Toda documentação de acesso e retorno das rotas está no link:

https://app.swaggerhub.com/apis/giordanocassini/customer-api/1.0.0#/
