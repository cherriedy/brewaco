import { preferencesMiddleware } from "#middlewares/preferences.middleware.js";
import authRoutes from "#routes/auth.routes.js";
import { initI18n } from "#utils/i18n.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { initConnection } from "#config/database.js";
import logger from "#utils/logger.js";

const app = express();

await initConnection(); // Establish database connection

app.use(express.json());
const allowedOrigins = [/^https?:\/\/api\.domain\..*/];
app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(morgan("dev"));
app.use(preferencesMiddleware);

const port = process.env.PORT ?? "9001";

await initI18n(); // Initialize i18next before starting the server

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

app.use("/auth", authRoutes);

app.listen(port, () => {
  logger.info(`Brew&Co is listening on port ${port}`);
});
