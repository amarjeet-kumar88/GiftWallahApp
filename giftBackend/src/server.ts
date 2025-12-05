import app from "./app";
import { ENV } from "./config/env";
import { connectDB } from "./config/db";
import { logger } from "./config/logger";

const startServer = async () => {
  try {
    await connectDB();

    const port = ENV.PORT;
    app.listen(port, () => {
      logger.info(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
