const { execSQLQuery } = require("./../database");
const sql = require("mssql");

const customersController = {
  async getCustomers(req, res) {
    try {
      const result = await execSQLQuery("SELECT * FROM Clientes", []);
      return res.status(200).json(result.recordset);
    } catch (error) {
      return res.status(400).send(error.message);
    }
  },

  async insertCustomer(req, res) {
    try {
      const name = req.body.name;
      const email = req.body.email;
      if (!name || !email) {
        throw new Error("Nome e email são campos obrigatórios.");
      }
      const result = await execSQLQuery("INSERT INTO Clientes(Nome, Email) VALUES(@Nome, @Email)", [
        { name: "Nome", type: sql.NVarChar, value: name },
        { name: "Email", type: sql.NVarChar, value: email },
      ]);
      return res.status(200).json(result.recordset);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },

  async getCustomerById(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!id) {
        throw new Error("ID inválido.");
      }
      const result = await execSQLQuery("SELECT * FROM Clientes WHERE ID=@id", [
        { name: "id", type: sql.Int, value: id },
      ]);
      return res.status(200).json(result.recordset);
    } catch (error) {
      return res.status(400).json(error.message);
    }
  },

  async deleteCustomerById(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!id) {
        throw new Error("ID inválido.");
      }
      const result = await execSQLQuery("DELETE FROM Clientes WHERE ID=@id", [
        { name: "id", type: sql.Int, value: id },
      ]);
      return res.status(200).json(result.recordset);
    } catch (error) {
      return res.status(400).send(error.message);
    }
  },

  async editCustomerById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const name = req.body.name;
      const email = req.body.email; // Corrigido aqui
      if (!id || !name || !email) {
        throw new Error("ID, nome e email são campos obrigatórios.");
      }
      const result = await execSQLQuery("UPDATE Clientes SET Nome=@name, Email=@email WHERE ID=@id", [
        { name: "id", type: sql.Int, value: id },
        { name: "name", type: sql.NVarChar, value: name },
        { name: "email", type: sql.NVarChar, value: email },
      ]);
      return res.status(200).json(result.recordset);
    } catch (error) {
      return res.status(400).send(error.message);
    }
  },
};

module.exports = customersController;
