const express = require("express");
const registerRoutes = require("./routes");
import type { NextFunction, RequestLike, ResponseLike } from "./types";

const app = express();

app.use(express.json());

// CORS Middleware
app.use((req: RequestLike, res: ResponseLike, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

// Root endpoint
app.get("/", (_req, res) => {
  res.status(200).json({
    service: "assetflow-monolith",
    message: "AssetFlow - Aplicacao Monolitica em Execucao"
  });
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Register all routes
registerRoutes(app);

// 404 Handler
app.use((_req: RequestLike, res: ResponseLike) => {
  res.status(404).json({
    message: "Rota nao encontrada."
  });
});

// Error Handler
app.use((err: any, _req: RequestLike, res: ResponseLike, _next: NextFunction) => {
  console.error("Erro nao tratado:", err);
  res.status(err.status || 500).json({
    message: err.message || "Erro interno do servidor.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

module.exports = app;
