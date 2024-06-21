const { execSQLQuery } = require("./../database");
const sql = require("mssql");

const appointmentsController = {
  async getAppointments(req, res) {
    try {
      const result = await execSQLQuery("SELECT * FROM Consultas", []);
      return res.status(200).json(result.recordset);
    } catch (error) {
      return res.status(400).send(error.message);
    }
  },

  async insertAppointment(req, res) {
    try {
      const dentistId = req.body.dentistId;
      const customerId = req.body.customerId;
      const dateTime = req.body.dateTime;
      const resultDentist = await execSQLQuery("SELECT * FROM Dentistas WHERE id=@id", [
        { name: "id", type: sql.Int, value: dentistId },
      ]);
      const resultCustomer = await execSQLQuery("SELECT * FROM Clientes WHERE id=@id", [
        { name: "id", type: sql.Int, value: customerId },
      ]);
      if (!resultCustomer.recordset[0]) {
        throw new Error("cliente não encontrado");
      }
      if (!resultDentist.recordset[0]) {
        throw new Error("dentista não encontrado");
      }
      await execSQLQuery("EXEC sp_InsertConsulta @clienteId, @dentistaId, @dateTime", [
        { name: "clienteId", type: sql.Int, value: customerId },
        { name: "dentistaId", type: sql.Int, value: dentistId },
        { name: "dateTime", type: sql.DateTime, value: dateTime },
      ]);
      return res.status(200).json("registro inserido com sucesso");
    } catch (error) {
      return res.status(500).send(error.message);
    }
  },

  async deleteAppointmentById(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!id) {
        throw new Error("id inválido.");
      }
      await execSQLQuery("DELETE FROM Consultas WHERE id=@id", [{ name: "id", type: sql.Int, value: id }]);
      return res.status(200).json("registro deletado com sucesso");
    } catch (error) {
      return res.status(400).send(error.message);
    }
  },
};

module.exports = appointmentsController;
