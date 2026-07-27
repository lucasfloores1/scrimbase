import { Inject, Injectable, ServiceUnavailableException, type LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { GoogleGenAI } from "@google/genai";

export type VisionExtractResult = {
  provider: "gemini";
  model: string;
  rawText: string;
};

@Injectable()
export class LlmVisionService {
    private readonly ai: GoogleGenAI;

    constructor(
        private readonly config: ConfigService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    ) {
        const apiKey = this.config.get<string>("gemini.apiKey");
        if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
        this.ai = new GoogleGenAI({ apiKey });
    }

    async extractScrimFromScreenshot(args: {
        image: Buffer;
        mimeType: string;
        prompt: string;
        teamId: string;
        userId: string;
    }): Promise<VisionExtractResult> {
        const model = this.config.get<string>("gemini.model") || "gemini-2.5-flash";
        const timeoutMs = this.config.get<number>("gemini.timeoutMs") ?? 25000;

        const imageBase64 = args.image.toString("base64");

        // JSON Schema
        const responseSchema = {
            type: "OBJECT",
            properties: {
                teamRounds: { type: "INTEGER" },
                enemyRounds: { type: "INTEGER" },
                teamStats: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                    displayName: { type: "STRING" },
                    agent: { type: "STRING" },
                    kills: { type: "INTEGER" },
                    deaths: { type: "INTEGER" },
                    assists: { type: "INTEGER" },
                    acs: { type: "INTEGER" },
                    },
                    required: ["displayName", "agent", "kills", "deaths", "assists", "acs"],
                },
                },
                enemyStats: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                    displayName: { type: "STRING" },
                    agent: { type: "STRING" },
                    kills: { type: "INTEGER" },
                    deaths: { type: "INTEGER" },
                    assists: { type: "INTEGER" },
                    acs: { type: "INTEGER" },
                    },
                    required: ["displayName", "agent", "kills", "deaths", "assists", "acs"],
                },
                },
            },
            required: ["teamRounds", "enemyRounds", "teamStats", "enemyStats"],
        } as const;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const res = await this.ai.models.generateContent({
                model,
                contents: [
                {
                    role: "user",
                    parts: [
                    { text: args.prompt },
                    {
                        inlineData: {
                        mimeType: args.mimeType,
                        data: imageBase64,
                        },
                    },
                    ],
                },
                ],
                config: {
                abortSignal: controller.signal,
                responseMimeType: "application/json",
                responseSchema,
                },
            });

            const rawText = this.extractTextFromGeminiResponse(res);
            return { provider: "gemini", model, rawText };
            }catch (err: any) {
                this.logger.error(`Gemini vision error: ${err?.message}`, err?.stack, "LlmVisionService");
                throw new ServiceUnavailableException("Gemini vision request failed");
            } finally {
            clearTimeout(timeout);
        }
    }

    private extractTextFromGeminiResponse(res: any): string {
        const text1 = res?.candidates?.[0]?.content?.parts
            ?.map((p: any) => p?.text)
            ?.filter(Boolean)
            ?.join("\n");

        if (text1 && typeof text1 === "string") return text1;

        const text2 = res?.response?.candidates?.[0]?.content?.parts
            ?.map((p: any) => p?.text)
            ?.filter(Boolean)
            ?.join("\n");

        if (text2 && typeof text2 === "string") return text2;

        return JSON.stringify(res);
    }
}