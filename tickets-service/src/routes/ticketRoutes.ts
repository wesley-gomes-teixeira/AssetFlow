export {};
const express = require("express");
const ticketController = require("../controllers/ticketController");

const router = express.Router();

// Tickets CRUD Routes
router.get("/tickets", ticketController.getTickets);
router.post("/tickets", ticketController.createTicket);
router.get("/tickets/:id", ticketController.getTicketById);
router.put("/tickets/:id", ticketController.updateTicket);
router.delete("/tickets/:id", ticketController.deleteTicket);

// Ticket Status Endpoints
router.patch("/tickets/:id/status", ticketController.updateTicketStatus);
router.patch("/tickets/:id/assign", ticketController.assignTicket);

// Internal Routes
router.post("/internal/assets/:assetId/mark-without-asset", ticketController.markTicketsWithoutAsset);
router.get("/internal/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "tickets-service" });
});

module.exports = router;
