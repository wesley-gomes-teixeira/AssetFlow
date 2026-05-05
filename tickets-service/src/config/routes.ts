export {};
const ticketRoutes = require("../routes/ticketRoutes");

function registerRoutes(app): void {
  app.use("/api/v1", ticketRoutes);
}

module.exports = registerRoutes;
