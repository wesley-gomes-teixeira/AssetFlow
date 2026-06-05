const app = require("./app");
const { initializeDatabase } = require("./config/db");

const PORT = process.env.PORT || 10000;

async function startServer() {
  try {
    console.log("Inicializando banco de dados...");
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`✓ AssetFlow Monolito rodando em http://localhost:${PORT}`);
      console.log(`✓ Endpoints disponíveis:`);
      console.log(`  - GET  /health`);
      console.log(`  - POST /auth/register`);
      console.log(`  - POST /auth/login`);
      console.log(`  - GET  /users`);
      console.log(`  - POST /users`);
      console.log(`  - GET  /assets`);
      console.log(`  - POST /assets`);
      console.log(`  - GET  /tickets`);
      console.log(`  - POST /tickets`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM recebido, encerrando gracefully...");
      server.close(() => {
        console.log("Servidor encerrado");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT recebido, encerrando gracefully...");
      server.close(() => {
        console.log("Servidor encerrado");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();
