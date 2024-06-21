// dentistsController.js

const { execSQLQuery } = require("./../database");
const sql = require("mssql");

const dentistsController = {
  async getDentists(req, res) {
    try {
      const result = await execSQLQuery("SELECT * FROM Dentistas", []);
      return res.status(200).json(result.recordset);
    } catch (error) {
      return res.status(400).send(error.message);
    }
  },

  async insertDentist(req, res) {
    try {
      const name = req.body.name;
      if (!name) {
        throw new Error("Nome é um campo obrigatório.");
      }
      await execSQLQuery("INSERT INTO Dentistas(Nome) VALUES(@Nome)", [
        { name: "Nome", type: sql.NVarChar, value: name },
      ]);
      return res.status(200).json("registro inserido com sucesso");
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },

  async getDentistById(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!id) {
        throw new Error("ID inválido.");
      }
      const result = await execSQLQuery("SELECT * FROM Dentistas WHERE ID=@id", [
        { name: "id", type: sql.Int, value: id },
      ]);
      if (!result.recordset[0]) throw new Error("registro não encontrado");
      return res.status(200).json(result.recordset[0]);
    } catch (error) {
      return res.status(400).json(error.message);
    }
  },

  async deleteDentistById(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!id) {
        throw new Error("ID inválido.");
      }
      await execSQLQuery("DELETE FROM Dentistas WHERE ID=@id", [{ name: "id", type: sql.Int, value: id }]);
      return res.status(200).json("registro deletado com sucesso");
    } catch (error) {
      return res.status(400).send(error.message);
    }
  },

  async editDentistById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const name = req.body.name;
      if (!id || !name) {
        throw new Error("ID e nome são campos obrigatórios.");
      }
      await execSQLQuery("UPDATE Dentistas SET Nome=@name WHERE ID=@id", [
        { name: "id", type: sql.Int, value: id },
        { name: "name", type: sql.NVarChar, value: name },
      ]);
      return res.status(200).json("registro alterado com sucesso");
    } catch (error) {
      return res.status(400).send(error.message);
    }
  },
};

module.exports = dentistsController;
