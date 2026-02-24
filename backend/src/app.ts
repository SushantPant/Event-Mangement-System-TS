import dotenv from "dotenv";
import express, {
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
import path from "path";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const swaggerFile = path.join(__dirname, "../dist/swagger.json");
const swaggerDoc = fs.existsSync(swaggerFile)
  ? JSON.parse(fs.readFileSync(swaggerFile, "utf8"))
  : null;
if (swaggerDoc) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} else {
  app.get("/api/docs", (_req, res) =>
    res.status(404).json({ message: "Swagger documentation not found" }),
  );
}

const apiRouter = express.Router();
app.use("/api", apiRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});
app.use((err: any, _req: ExRequest, res: ExResponse, next: NextFunction) => {
  if (err instanceof Error && (err as any).status) {
    res.status((err as any).status).json({
      success: false,
      message: err.message || "Validation error",
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
