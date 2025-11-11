import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Optimized Prisma configuration with connection pooling
const prisma = new PrismaClient({
	log:
		process.env.NODE_ENV === "development"
			? ["error", "warn"] // Removed 'query' for better performance
			: ["error"],
	datasources: {
		db: {
			url: process.env.DATABASE_URL,
		},
	},
});

// Graceful shutdown
process.on("beforeExit", async () => {
	await prisma.$disconnect();
});

export { prisma };
export default prisma;
