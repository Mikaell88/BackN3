const express = require("express");
const router = express.Router();
const dentistsController = require("../controllers/dentistsController");

router.route("/").get(dentistsController.getDentists).post(dentistsController.insertDentist);

router
  .route("/:id")
  .get(dentistsController.getDentistById)
  .delete(dentistsController.deleteDentistById)
  .put(dentistsController.editDentistById);

module.exports = router;
