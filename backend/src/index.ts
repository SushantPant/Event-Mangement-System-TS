import app from "./app";
import db from "./db/db";

const PORT = process.env.PORT || 5500;
const start = async () => {
  try {
    await db.raw("SELECT 1");
    console.log("Database connection successful");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(
        `Swagger docs is running at http://localhost:${PORT}/api/docs`,
      );
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};
start();
