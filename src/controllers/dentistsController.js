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
      const cro = req.body.cro;
      if (!name || !cro) {
        throw new Error("name e cro são campos obrigatórios.");
      }
      await execSQLQuery("INSERT INTO Dentistas(name, cro) VALUES(@name, @cro)", [
        { name: "name", type: sql.NVarChar, value: name },
        { name: "cro", type: sql.Int, value: cro },
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
        throw new Error("id inválido.");
      }
      const result = await execSQLQuery("SELECT * FROM Dentistas WHERE id=@id", [
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
        throw new Error("id inválido.");
      }
      await execSQLQuery("DELETE FROM Dentistas WHERE id=@id", [{ name: "id", type: sql.Int, value: id }]);
      return res.status(200).json("registro deletado com sucesso");
    } catch (error) {
      return res.status(400).send(error.message);
    }
  },

  async editDentistById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const name = req.body.name;
      const cro = req.body.cro;
      if (!id) {
        throw new Error("id inválido.");
      }
      if (name) {
        await execSQLQuery("UPDATE Dentistas SET name=@name WHERE id=@id", [
          { name: "id", type: sql.Int, value: id },
          { name: "name", type: sql.NVarChar, value: name },
        ]);
      }
      if (cro) {
        await execSQLQuery("UPDATE Dentistas SET cro=@cro WHERE id=@id", [
          { name: "id", type: sql.Int, value: id },
          { name: "cro", type: sql.NVarChar, value: cro },
        ]);
      }
      return res.status(200).json("registro alterado com sucesso");
    } catch (error) {
      return res.status(400).send(error.message);
    }
  },
};

module.exports = dentistsController;
