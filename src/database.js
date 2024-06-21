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
                  ID INT IDENTITY(1,1) PRIMARY KEY,
                  Nome NVARCHAR(150) NOT NULL,
                  Email NVARCHAR(150)
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
                  ID INT IDENTITY(1,1) PRIMARY KEY,
                  Nome NVARCHAR(150) NOT NULL,
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
                    ID INT IDENTITY(1,1) PRIMARY KEY,
                    ClienteID INT NOT NULL,
                    DentistaID INT NOT NULL,
                    DataEHora DATETIME NOT NULL,
                    FOREIGN KEY (ClienteID) REFERENCES Clientes(ID),
                    FOREIGN KEY (DentistaID) REFERENCES Dentistas(ID)
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
                    @ClienteID INT,
                    @DentistaID INT,
                    @DataEHora DATETIME
                AS
                BEGIN
                    -- Check if there''s a conflicting appointment
                    IF EXISTS (
                        SELECT 1
                        FROM Consultas
                        WHERE DentistaID = @DentistaID
                          AND ABS(DATEDIFF(MINUTE, DataEHora, @DataEHora)) < 60
                    )
                    BEGIN
                        -- Conflict found, raise an error
                        RAISERROR(''Another consultation is already scheduled within an hour for this dentist.'', 16, 1);
                        RETURN;
                    END

                    -- No conflict, proceed with the insertion
                    INSERT INTO Consultas (ClienteID, DentistaID, DataEHora)
                    VALUES (@ClienteID, @DentistaID, @DataEHora);
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
