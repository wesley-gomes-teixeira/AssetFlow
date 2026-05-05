export {};
const userRoutes = require("../routes/userRoutes");

function registerRoutes(app): void {
  app.use("/api/v1", userRoutes);
}

module.exports = registerRoutes;
