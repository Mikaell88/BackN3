const sql = require("mssql");

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
    const checkDbQuery = `SELECT database_id FROM sys.databases WHERE name = 'N3'`;

    const result = await conn.request().query(checkDbQuery);

    if (result.recordset.length === 0) {
      const createDbQuery = `CREATE DATABASE N3`;
      await conn.request().query(createDbQuery);
      console.log("Database N3 created successfully");
    } else {
      console.log("Database N3 already exists");
    }
  } catch (err) {
    console.error("Error checking/creating database:", err);
  }
}

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

module.exports = {
  createDatabase,
  createTableIfNotExists,
  execSQLQuery,
};
