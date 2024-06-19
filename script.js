const sql = require("mssql");
const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const config = {
  server: "localhost",
  port: 1433,
  user: "sa",
  password: "cesusc2024",
  trustServerCertificate: true,
  options: {
    cryptoCredentialsDetails: {
      minVersion: "TLSv1",
      trustServerCertificate: true,
    },
  },
};

async function createTableIfNotExists(conn) {
  const request = new sql.Request(conn);
  const tableExistsQuery = `
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Clientes')
        BEGIN
            CREATE TABLE Clientes (
                ID INT PRIMARY KEY,
                Nome NVARCHAR(150) NOT NULL,
                Email NVARCHAR(150)
            );
        END
    `;
  try {
    await request.query(tableExistsQuery);
    console.log('Tabela "Clientes" garantida no banco de dados');
  } catch (err) {
    console.error('Erro ao garantir a tabela "Clientes": ' + err);
  }
}

async function createDatabase(conn) {
  try {
    // SQL query to create a new database
    const createDbQuery = `CREATE DATABASE N3`;

    // Execute the query
    await conn.request().query(createDbQuery);
    console.log("Database N3 created successfully");
  } catch (err) {
    console.error("Error creating database:", err);
  }
}

sql
  .connect(config)
  .then(async (conn) => {
    console.log("Connected to SQL Server");
    await createDatabase(conn);
    await createTableIfNotExists(conn);
    global.conn = conn;
  })
  .catch((err) => console.log("Erro na conexão: " + err));

function execSQLQuery(sqlQry, params, res) {
  const request = global.conn.request();
  for (const param of params) {
    request.input(param.name, param.type, param.value);
  }
  request
    .query(sqlQry)
    .then((result) => res.json(result.recordset))
    .catch((err) => {
      console.error("Erro ao executar a consulta SQL: " + err);
      res.status(500).json({ error: "Erro interno do servidor ao executar a consulta SQL." });
    });
}

// Middleware para permitir solicitações CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Define o cabeçalho Access-Control-Allow-Origin para permitir solicitações de qualquer origem
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Define os métodos permitidos
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Define os cabeçalhos permitidos
  next();
});

app.get("/test-connection", (req, res) => {
  global.conn
    .connect()
    .then(() => res.json({ message: "Connection successful" }))
    .catch((err) => {
      console.error("Erro ao testar a conexão: " + err);
      res.status(500).json({ message: "Falha na conexão", error: err });
    });
});

app.get("/customers", (req, res) => {
  execSQLQuery("SELECT * FROM Clientes", [], res);
});

app.post("/customers", (req, res) => {
  const id = parseInt(req.body.id);
  const name = req.body.name;
  const email = req.body.email;
  if (!id || !name || !email) {
    return res.status(400).json({ error: "ID, nome e email são campos obrigatórios." });
  }
  execSQLQuery(
    "INSERT INTO Clientes(ID, Nome, Email) VALUES(@ID, @Nome, @Email)",
    [
      { name: "ID", type: sql.Int, value: id },
      { name: "Nome", type: sql.NVarChar, value: name },
      { name: "Email", type: sql.NVarChar, value: email },
    ],
    res
  );
});

app.get("/customers/:ID", (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "ID inválido." });
  }
  execSQLQuery("SELECT * FROM Clientes WHERE ID=@id", [{ name: "id", type: sql.Int, value: id }], res);
});

app.delete("/customers/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "ID inválido." });
  }
  execSQLQuery("DELETE FROM Clientes WHERE ID=@id", [{ name: "id", type: sql.Int, value: id }], res);
});

app.put("/customers/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const name = req.body.name;
  const email = req.body.email; // Corrigido aqui
  if (!id || !name || !email) {
    return res.status(400).json({ error: "ID, nome e email são campos obrigatórios." });
  }
  execSQLQuery(
    "UPDATE Clientes SET Nome=@name, Email=@email WHERE ID=@id",
    [
      { name: "id", type: sql.Int, value: id },
      { name: "name", type: sql.NVarChar, value: name },
      { name: "mail", type: sql.NVarChar, value: email },
    ],
    res
  );
});

app.listen(port, () => {
  console.log("Example app listening on port: " + port);
});
