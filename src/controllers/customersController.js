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
        throw new Error("name e email são campos obrigatórios.");
      }
      await execSQLQuery("INSERT INTO Clientes(name, email) VALUES(@name, @email)", [
        { name: "name", type: sql.NVarChar, value: name },
        { name: "email", type: sql.NVarChar, value: email },
      ]);
      return res.status(200).json("registro inserido com sucesso");
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },

  async getCustomerById(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!id) {
        throw new Error("id inválido.");
      }
      const result = await execSQLQuery("SELECT * FROM Clientes WHERE id=@id", [
        { name: "id", type: sql.Int, value: id },
      ]);
      if (!result.recordset[0]) throw new Error("registro não encontrado");
      return res.status(200).json(result.recordset[0]);
    } catch (error) {
      return res.status(400).json(error.message);
    }
  },

  async deleteCustomerById(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!id) {
        throw new Error("id inválido.");
      }
      await execSQLQuery("DELETE FROM Clientes WHERE id=@id", [{ name: "id", type: sql.Int, value: id }]);
      return res.status(200).json("registro deletado com sucesso");
    } catch (error) {
      return res.status(400).send(error.message);
    }
  },

  async editCustomerById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const name = req.body.name;
      const email = req.body.email; // Corrigido aqui
      if (name) {
        await execSQLQuery("UPDATE Clientes SET name=@name WHERE id=@id", [
          { name: "id", type: sql.Int, value: id },
          { name: "name", type: sql.NVarChar, value: name },
        ]);
      }
      if (email) {
        await execSQLQuery("UPDATE Clientes SET email=@email WHERE id=@id", [
          { name: "id", type: sql.Int, value: id },
          { name: "email", type: sql.NVarChar, value: email },
        ]);
      }
      return res.status(200).json("registro alterado com sucesso");
    } catch (error) {
      return res.status(400).send(error.message);
    }
  },
};

module.exports = customersController;
