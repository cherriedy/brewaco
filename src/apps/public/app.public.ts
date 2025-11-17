import authRoutes from "#apps/public/routes/auth.routes.js";
import publicCartRoutes from "#apps/public/routes/cart.routes.js";
import publicCategoryRoutes from "#apps/public/routes/category.routes.js";
import publicContactRoutes from "#apps/public/routes/contact.routes.js";
import publicOrderRoutes from "#apps/public/routes/order.routes.js";
import publicPaymentRoutes from "#apps/public/routes/payment.routes.js";
import publicProductRoutes from "#apps/public/routes/product.routes.js";
import publicPromotionRoutes from "#apps/public/routes/promotion.routes.js";
import publicReviewRoutes from "#apps/public/routes/review.routes.js";
import publicUserRoutes from "#apps/public/routes/user.routes.js";
import publicReviewsByProductRoutes from "#apps/public/routes/reviews-by-product.js";
import publicPaymentCallbackRoutes from "#apps/public/routes/payment-callback.routes.js";
import { authenticationMiddleware } from "#common/middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "#common/middlewares/authorization.middleware.js";
import { deviceContextMiddleware } from "#common/middlewares/device-context.middleware.js";
import { internalErrorMiddleware } from "#common/middlewares/internal-error.middleware.js";
import { publicRoute } from "#common/middlewares/public-route.middleware.js";
import docsRoutes from "#common/routes/docs.routes.js";
import { initI18n } from "#common/utils/i18n.js";
import logger from "#common/utils/logger.js";
import { initConnection } from "#config/database.js";
import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
const port = process.env.PUBLIC_PORT ?? "9001";
const allowedOrigins = ["http://localhost:3000"];

// Initialize database and i18n
await initConnection();
await initI18n();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(morgan("dev"));
app.use(deviceContextMiddleware);

// API Documentation
app.use("/docs", publicRoute, docsRoutes);

// Public routes
app.get("/", publicRoute, (req: Request, res: Response) => {
  res.send("Welcome to the Public API");
});

app.use("/auth", publicRoute, authRoutes);
app.use("/categories", publicRoute, publicCategoryRoutes);
app.use("/products", publicRoute, publicProductRoutes);
app.use("/contact", publicRoute, publicContactRoutes);
app.use("/promotions", publicRoute, publicPromotionRoutes);
app.use("/payment-callback", publicPaymentCallbackRoutes);
app.use("/reviews-by-product", publicReviewsByProductRoutes);

app.use(authenticationMiddleware);
app.use(authorizationMiddleware);

// Protected routes
app.use("/users", publicUserRoutes);
app.use("/cart", publicCartRoutes);
app.use("/payment", publicPaymentRoutes);
app.use("/orders", publicOrderRoutes);
app.use("/reviews", publicReviewRoutes);

// Error handling middleware - must be after all routes
app.use(internalErrorMiddleware);

app.listen(port, () => {
  logger.info(`Public API (Brew&Co) is listening on port ${port}`);
});

export default app;
