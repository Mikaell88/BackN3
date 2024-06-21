const express = require("express");
const app = express();
const port = 3000;
const { db } = require("./database");

app.use(express.json());

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

db.connectDatabase(config);

// Middleware para permitir solicitações CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Define o cabeçalho Access-Control-Allow-Origin para permitir solicitações de qualquer origem
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Define os métodos permitidos
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Define os cabeçalhos permitidos
  next();
});

app.get("/test-connection", (req, res) => {
  db.conn
    .connect()
    .then(() => res.json({ message: "Connection successful" }))
    .catch((err) => {
      console.error("Erro ao testar a conexão: " + err);
      res.status(500).json({ message: "Falha na conexão", error: err });
    });
});

app.use("/customers", require("./routes/customers"));
app.use("/dentists", require("./routes/dentists"));

app.listen(port, () => {
  console.log("App listening on port: " + port);
});
