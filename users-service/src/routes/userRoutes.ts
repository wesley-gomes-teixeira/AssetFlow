export {};
const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

// Public Auth Routes
router.post("/auth/register", userController.registerUser);
router.post("/auth/login", userController.loginUser);

// Users CRUD Routes
router.get("/users", userController.getUsers);
router.post("/users", userController.createUser);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

// User Relations
router.get("/users/:id/tickets", userController.getUserTickets);
router.get("/users/:id/assets", userController.getUserAssets);

// Internal Routes
router.post("/internal/users/:id/unassign-assets", userController.unassignAssetsFromUser);
router.get("/internal/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "users-service" });
});

module.exports = router;
