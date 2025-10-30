import authRoutes from "#apps/public/routes/auth.routes.js";
import publicCartRoutes from "#apps/public/routes/cart.routes.js";
import publicCategoryRoutes from "#apps/public/routes/category.routes.js";
import publicContactRoutes from "#apps/public/routes/contact.routes.js";
import publicProductRoutes from "#apps/public/routes/product.routes.js";
import { authenticationMiddleware } from "#common/middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "#common/middlewares/authorization.middleware.js";
import { deviceContextMiddleware } from "#common/middlewares/device-context.middleware.js";
import { internalErrorMiddleware } from "#common/middlewares/internal-error.middleware.js";
import { publicRoute } from "#common/middlewares/public-route.middleware.js";
import { Product } from "#common/models/product.model.js";
import {
  onProductUpsert,
  productMeiliService,
} from "#common/services/search/product-meili.service.js";
import { initI18n } from "#common/utils/i18n.js";
import logger from "#common/utils/logger.js";
import { initConnection } from "#config/database.js";
import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

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
app.use("/contact", publicRoute, publicContactRoutes);

app.use(authenticationMiddleware);
app.use(authorizationMiddleware);

// Protected routes
app.use("/cart", publicCartRoutes);

// Error handling middleware - must be after all routes
app.use(internalErrorMiddleware);

app.listen(port, () => {
  logger.info(`Public API (Brew&Co) is listening on port ${port}`);
});

export default app;
