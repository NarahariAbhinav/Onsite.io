import { app } from "./app.js";
import { ENV } from "./config/env.js";
import { prisma } from "./config/db.js";

async function main() {
  try {
    // Verify database connectivity
    await prisma.$connect();
    console.log("✅ Successfully connected to PostgreSQL database.");

    app.listen(ENV.PORT, () => {
      console.log(`🚀 SiteFlow Backend running on port http://localhost:${ENV.PORT}`);
      console.log(`📖 API root: http://localhost:${ENV.PORT}/api/v1`);
      console.log(`🩺 Health check: http://localhost:${ENV.PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start SiteFlow server:", error);
    process.exit(1);
  }
}

main();
