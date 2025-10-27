import { preferencesMiddleware } from "#middlewares/preferences.middleware.js";
import authRoutes from "#routes/auth.routes.js";
import { initI18n } from "#utils/i18n.js";
import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { initConnection } from "#config/database.js";
import logger from "#utils/logger.js";
import { authenticationMiddleware } from "#middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "#middlewares/authorization.middleware.js";
import { publicRoute } from "#middlewares/public-route.middleware.js";
import { internalErrorMiddleware } from "#middlewares/internal-error.middleware.js";

const app = express();
const port = process.env.PORT ?? "9001";
const allowedOrigins = [/^https?:\/\/api\.domain\..*/];

await initConnection(); // Establish database connection
await initI18n(); // Initialize i18next before starting the server

app.use(express.json());
app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(morgan("dev"));

app.use(preferencesMiddleware);

// Public routes - must be defined BEFORE auth middlewares
app.get("/", publicRoute, (req: Request, res: Response) => {
  res.send("Welcome to the API");
});
app.use("/auth", publicRoute, authRoutes);

// Protected routes - apply auth middlewares globally for all routes defined AFTER this point
app.use(authenticationMiddleware);
app.use(authorizationMiddleware);

app.use(internalErrorMiddleware); // Must be after all routes

app.listen(port, () => {
  logger.info(`Brew&Co is listening on port ${port}`);
});
