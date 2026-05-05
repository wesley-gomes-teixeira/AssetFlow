export {};
const assetRoutes = require("../routes/assetRoutes");

function registerRoutes(app): void {
  app.use("/api/v1", assetRoutes);
}

module.exports = registerRoutes;
