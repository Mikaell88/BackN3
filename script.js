const express = require("express");
const app = express();
const port = 3000;
const { execSQLQuery, db } = require("./database");

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

db.connectDatabase(config);

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
  console.log("App listening on port: " + port);
});
