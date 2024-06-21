const express = require("express");
const router = express.Router();
const appointmentsController = require("../controllers/appointmentsController");

router.route("/").get(appointmentsController.getAppointments).post(appointmentsController.insertAppointment);

// router
//   .route("/:id")
//   .get(appointmentsController.getAppointmentById)
//   .delete(appointmentsController.deleteAppointmentById)
//   .put(appointmentsController.editAppointmentById);

module.exports = router;
