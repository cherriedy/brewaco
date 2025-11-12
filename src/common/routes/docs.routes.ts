import swaggerSpec from "#config/openapi.swagger.js";
import { Request, Response, Router } from "express";
import swaggerUi from "swagger-ui-express";

const router = Router();

router.use("/", swaggerUi.serve);

router.get(
  "/",
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Brew&Co",
    swaggerOptions: {
      displayRequestDuration: true,
      filter: true,
      persistAuthorization: true,
      tryItOutEnabled: true,
    },
  }),
);

// Serve raw OpenAPI JSON
router.get("/openapi.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

export default router;
