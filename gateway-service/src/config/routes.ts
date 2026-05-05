export {};
const userRoutes = require("../routes/userRoutes");
const assetRoutes = require("../routes/assetRoutes");
const ticketRoutes = require("../routes/ticketRoutes");
const authRoutes = require("../routes/authRoutes");
const { authenticateToken } = require("../middlewares/authMiddleware");

function registerRoutes(app): void {
  // Public auth routes - no version prefix
  app.use("/", authRoutes);
  
  // Health check - no auth required
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "gateway" });
  });
  
  // Protected API v1 routes
  app.use("/api/v1", authenticateToken);
  app.use("/api/v1", userRoutes);
  app.use("/api/v1", assetRoutes);
  app.use("/api/v1", ticketRoutes);
}

module.exports = registerRoutes;
