import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "#apps/public/routes/auth.routes.js";
import publicCategoryRoutes from "#apps/public/routes/category.routes.js";
import publicProductRoutes from "#apps/public/routes/product.routes.js";
import { deviceContextMiddleware } from "#common/middlewares/device-context.middleware.js";
import { publicRoute } from "#common/middlewares/public-route.middleware.js";
import { internalErrorMiddleware } from "#common/middlewares/internal-error.middleware.js";
import { initI18n } from "#common/utils/i18n.js";
import { initConnection } from "#config/database.js";
import logger from "#common/utils/logger.js";

const app = express();
const port = process.env.PUBLIC_PORT ?? "9001";
const allowedOrigins = [/^https?:\/\/api\.domain\..*/];

// Initialize database and i18n
await initConnection();
await initI18n();

// Middlewares
app.use(express.json());
app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(morgan("dev"));
app.use(deviceContextMiddleware);

// Public routes
app.get("/", publicRoute, (req: Request, res: Response) => {
  res.send("Welcome to the Public API");
});

app.use("/auth", publicRoute, authRoutes);
app.use("/categories", publicRoute, publicCategoryRoutes);
app.use("/products", publicRoute, publicProductRoutes);

// Error handling middleware - must be after all routes
app.use(internalErrorMiddleware);

app.listen(port, () => {
  logger.info(`Public API (Brew&Co) is listening on port ${port}`);
});

export default app;
