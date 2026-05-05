export {};
const express = require("express");
const assetController = require("../controllers/assetController");

const router = express.Router();

// Assets CRUD Routes
router.get("/assets", assetController.getAssets);
router.post("/assets", assetController.createAsset);
router.get("/assets/:id", assetController.getAssetById);
router.put("/assets/:id", assetController.updateAsset);
router.delete("/assets/:id", assetController.deleteAsset);

// Asset Relations
router.get("/assets/:id/tickets", assetController.getAssetTickets);

// Internal Routes
router.post("/internal/users/:userId/unassign-assets", assetController.unassignAssetsFromUser);
router.get("/internal/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "assets-service" });
});

module.exports = router;
