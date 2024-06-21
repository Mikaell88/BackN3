const sql = require("mssql");

let db = {};

async function connectDatabase(config) {
  sql
    .connect(config)
    .then(async (conn) => {
      console.log("Connected to SQL Server");
      db["conn"] = conn;
      await createDatabase();
      await createTableClientesIfNotExists();
      await createTableDentistIfNotExists();
      await createTableConsultasIfNotExists();
      await createStoredProcedureIfNotExists();
    })
    .catch((err) => console.log("Erro na conexão: " + err));
}

async function createTableClientesIfNotExists() {
  const tableExistsQuery = `
          IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Clientes')
          BEGIN
              CREATE TABLE Clientes (
                  id INT IDENTITY(1,1) PRIMARY KEY,
                  name NVARCHAR(150) NOT NULL,
                  email NVARCHAR(150) NOT NULL UNIQUE,
              );
          END
      `;
  try {
    await db.conn.request().query(tableExistsQuery);
    console.log('Tabela "Clientes" garantida no banco de dados');
  } catch (err) {
    console.error('Erro ao garantir a tabela "Clientes": ' + err);
  }
}

async function createTableDentistIfNotExists() {
  const tableExistsQuery = `
          IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Dentistas')
          BEGIN
              CREATE TABLE Dentistas (
                  id INT IDENTITY(1,1) PRIMARY KEY,
                  cro INT NOT NULL UNIQUE,
                  name NVARCHAR(150) NOT NULL,
              );
          END
      `;
  try {
    await db.conn.request().query(tableExistsQuery);
    console.log('Tabela "Dentistas" garantida no banco de dados');
  } catch (err) {
    console.error('Erro ao garantir a tabela "Dentistas": ' + err);
  }
}

async function createTableConsultasIfNotExists() {
  const tableExistsQuery = `
          IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Consultas')
            BEGIN
                CREATE TABLE Consultas (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    clienteId INT NOT NULL,
                    dentistaId INT NOT NULL,
                    dateTime DATETIME NOT NULL,
                    FOREIGN KEY (clienteId) REFERENCES clientes(id),
                    FOREIGN KEY (dentistaId) REFERENCES dentistas(id)
                );
            END
      `;
  try {
    await db.conn.request().query(tableExistsQuery);
    console.log('Tabela "Consultas" garantida no banco de dados');
  } catch (err) {
    console.error('Erro ao garantir a tabela "Consultas": ' + err);
  }
}

async function createStoredProcedureIfNotExists() {
  const tableExistsQuery = `
          IF NOT EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_InsertConsulta')
            BEGIN
                EXEC('
                CREATE PROCEDURE sp_InsertConsulta
                    @clienteId INT,
                    @dentistaId INT,
                    @dateTime DATETIME
                AS
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM Consultas
                        WHERE dentistaId = @dentistaId
                          AND ABS(DATEDIFF(MINUTE, dateTime, @dateTime)) < 60
                    )
                    BEGIN
                        RAISERROR(''Já existe uma consulta para este dentista neste periodo.'', 16, 1);
                        RETURN;
                    END

                    INSERT INTO Consultas (clienteId, dentistaId, dateTime)
                    VALUES (@ClienteId, @dentistaId, @dateTime);
                END
                ')
            END
      `;
  try {
    await db.conn.request().query(tableExistsQuery);
    console.log("Stored procedure garantida no banco de dados");
  } catch (err) {
    console.error('Erro ao garantir Stored procedure ": ' + err);
  }
}

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

async function execSQLQuery(sqlQry, params) {
  const request = db.conn.request();
  if (params) {
    for (const param of params) {
      request.input(param.name, param.type, param.value);
    }
  }
  return request.query(sqlQry).catch((err) => {
    throw new Error("Erro ao executar a consulta SQL: " + err);
  });
}


Object.assign(db, {
  connectDatabase,
});

module.exports = {
  db,
  execSQLQuery,
};
