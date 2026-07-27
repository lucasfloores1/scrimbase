import { registerAs } from "@nestjs/config";

export default registerAs("gemini", () => ({
  apiKey: process.env.GEMINI_API_KEY || "",
  model: process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash",
  timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS) || 25000,
  rawTtlDays: Number(process.env.LLM_RAW_TTL_DAYS) || 7,
}));