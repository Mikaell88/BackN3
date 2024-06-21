const express = require("express");
const router = express.Router();
const customersController = require("../controllers/customersController");

router.route("/").get(customersController.getCustomers).post(customersController.insertCustomer);

router
  .route("/:id")
  .get(customersController.getCustomerById)
  .delete(customersController.deleteCustomerById)
  .put(customersController.editCustomerById);
  
module.exports = router;
