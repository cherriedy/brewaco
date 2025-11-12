import authRoutes from "#apps/protected/routes/auth.routes.js";
import protectedCategoryRoutes from "#apps/protected/routes/category.routes.js";
import protectedContactRoutes from "#apps/protected/routes/contact.routes.js";
import protectedOrderRoutes from "#apps/protected/routes/order.routes.js";
import protectedProductRoutes from "#apps/protected/routes/product.routes.js";
import protectedPromotionRoutes from "#apps/protected/routes/promotion.routes.js";
import { authenticationMiddleware } from "#common/middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "#common/middlewares/authorization.middleware.js";
import { deviceContextMiddleware } from "#common/middlewares/device-context.middleware.js";
import { internalErrorMiddleware } from "#common/middlewares/internal-error.middleware.js";
import docsRoutes from "#common/routes/docs.routes.js";
import { initI18n } from "#common/utils/i18n.js";
import logger from "#common/utils/logger.js";
import { initConnection } from "#config/database.js";
import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
const port = process.env.PROTECTED_PORT ?? "9002";
const allowedOrigins = [/^https?:\/\/admin\.domain\..*/];

// Initialize database and i18n
await initConnection();
await initI18n();

// Middlewares
app.use(express.json());
app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(morgan("dev"));
app.use(deviceContextMiddleware);

// API Documentation
app.use("/docs", docsRoutes);

// Public auth routes (no authentication required)
app.use("/auth", authRoutes);

// Authentication and Authorization middlewares for protected routes
app.use(authenticationMiddleware);
app.use(authorizationMiddleware);

// Protected routes
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Admin API");
});

app.use("/categories", protectedCategoryRoutes);
app.use("/products", protectedProductRoutes);
app.use("/contact", protectedContactRoutes);
app.use("/promotions", protectedPromotionRoutes);
app.use("/orders", protectedOrderRoutes);

// Error handling middleware - must be after all routes
app.use(internalErrorMiddleware);

app.listen(port, () => {
  logger.info(`Protected API (Brew&Co Admin) is listening on port ${port}`);
});

export default app;
