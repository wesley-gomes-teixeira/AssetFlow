export {};
const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const assetController = require("../controllers/assetController");
const ticketController = require("../controllers/ticketController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/authorizationMiddleware");
const {
  validateAssetPayload,
  validateTicketPayload,
  ensureUserDeleteAllowed,
  ensureAssetDeleteAllowed
} = require("../middlewares/businessRulesMiddleware");

function registerRoutes(app: any) {
  // ============ Auth Routes ============
  app.post("/auth/register", authController.register);
  app.post("/auth/login", authController.login);

  // ============ Users Routes ============
  app.get("/users", authenticateToken, authorizeRoles("admin", "analyst", "user"), userController.getUsers);
  app.post("/users", authenticateToken, authorizeRoles("admin"), userController.createUser);
  app.get("/users/:id", authenticateToken, authorizeRoles("admin", "analyst", "user"), userController.getUserById);
  app.put("/users/:id", authenticateToken, authorizeRoles("admin"), userController.updateUser);
  app.delete(
    "/users/:id",
    authenticateToken,
    authorizeRoles("admin"),
    ensureUserDeleteAllowed,
    userController.deleteUser
  );

  // ============ Assets Routes ============
  app.get("/assets", authenticateToken, authorizeRoles("admin", "analyst", "user"), assetController.getAssets);
  app.post(
    "/assets",
    authenticateToken,
    authorizeRoles("admin", "analyst"),
    validateAssetPayload,
    assetController.createAsset
  );
  app.get("/assets/:id", authenticateToken, authorizeRoles("admin", "analyst", "user"), assetController.getAssetById);
  app.put(
    "/assets/:id",
    authenticateToken,
    authorizeRoles("admin", "analyst"),
    validateAssetPayload,
    assetController.updateAsset
  );
  app.delete(
    "/assets/:id",
    authenticateToken,
    authorizeRoles("admin", "analyst"),
    ensureAssetDeleteAllowed,
    assetController.deleteAsset
  );

  // ============ Tickets Routes ============
  app.get("/tickets", authenticateToken, authorizeRoles("admin", "analyst", "user"), ticketController.getTickets);
  app.post(
    "/tickets",
    authenticateToken,
    authorizeRoles("admin", "analyst", "user"),
    validateTicketPayload,
    ticketController.createTicket
  );
  app.get("/tickets/:id", authenticateToken, authorizeRoles("admin", "analyst", "user"), ticketController.getTicketById);
  app.put(
    "/tickets/:id",
    authenticateToken,
    authorizeRoles("admin", "analyst"),
    validateTicketPayload,
    ticketController.updateTicket
  );
  app.delete("/tickets/:id", authenticateToken, authorizeRoles("admin", "analyst"), ticketController.deleteTicket);
  app.patch(
    "/tickets/:id/status",
    authenticateToken,
    authorizeRoles("admin", "analyst"),
    ticketController.updateTicketStatus
  );
}

module.exports = registerRoutes;
