import { memoryStorage } from "multer";

export const scrimParseMulterOptions = {
  storage: memoryStorage(),
};