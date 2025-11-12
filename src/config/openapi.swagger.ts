import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  // Scan route files for JSDoc comments
  apis: ["./src/apps/public/routes/*.ts", "./src/apps/protected/routes/*.ts"],
  definition: {
    components: {
      securitySchemes: {
        bearerAuth: {
          bearerFormat: "JWT",
          description: "Enter your JWT token",
          scheme: "bearer",
          type: "http",
        },
      },
    },
    info: {
      description: "REST API documentation for Brew&Co e-commerce platform.",
      title: "Brew&Co API",
      version: "1.0.0",
      // contact: {
      //   name: "Support",
      //   email: "support@brewandco.com",
      // },
    },
    openapi: "3.0.0",
    servers: [
      {
        description: "Development server (Public API)",
        url: `http://localhost:${process.env.PUBLIC_PORT ?? "9001"}`,
      },
      {
        description: "Development server (Admin API)",
        url: `http://localhost:${process.env.PROTECTED_PORT ?? "9002"}`,
      },
      {
        description: "Production server",
        url: "https://api.brewandco.com",
      },
    ],
    tags: [
      { description: "User authentication endpoints", name: "Authentication" },
      { description: "Product management endpoints", name: "Products" },
      { description: "Order management endpoints", name: "Orders" },
      { description: "Shopping cart endpoints", name: "Cart" },
      { description: "Category management endpoints", name: "Categories" },
      { description: "Promotion management endpoints", name: "Promotions" },
      { description: "Contact form endpoints", name: "Contact" },
    ],
  },
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
