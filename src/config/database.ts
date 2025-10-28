import mongoose from "mongoose";

import logger from "../common/utils/logger.js";
import { MissingEnvVarError } from "../errors/missing-env-var.error.js";

export const initConnection = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new MissingEnvVarError("MONGODB_URI");

    await mongoose.connect(uri, {
      autoCreate: false,
      autoIndex: false,
      bufferCommands: false,
    });

    logger.info("Connected to MongoDB successfully");
  } catch (error: unknown) {
    logger.error("There was an error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if connection fails
  }
};
