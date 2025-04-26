const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth.middleware.js");

router.get("/users", authenticateToken, authorizeRoles("admin"), userController.getAllUsers);
router.put("/users/:id", authenticateToken, authorizeRoles("admin"), userController.updateUser);
router.post("/users", authenticateToken, authorizeRoles("admin"), userController.createUser);
router.delete("/users/:id", authenticateToken, authorizeRoles("admin"), userController.deactivateUser);
router.get("/profile", authenticateToken, userController.getProfile);

module.exports = router;
