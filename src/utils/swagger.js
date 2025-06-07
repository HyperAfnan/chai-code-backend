import swaggerJsDoc from "swagger-jsdoc";
import ENV from "../config/env.js"

const PORT = ENV.PORT || 5000;

const swaggerOptions = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Chai code backend docs",
			version: "1.0.0",
			description: "API Documentation for your Express backend",
			contact: { name: "Mohammad Afnan" },
		},
		servers: [
			{
				url: `http://localhost:${PORT}/api/v1`,
				description: "Development server",
			},
			{
				url: "https://chai-code-backend.onrender.com/api/v1",
				description: "Production server",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
	},
	apis: ["./src/components/**/*.routes.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerDocs };
