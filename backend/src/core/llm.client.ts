import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config();

const DASHSCOPE_BASE_URL = process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// 单例模式导出 LLM 和 Embeddings 实例
export const llm = new ChatOpenAI({
  modelName: "qwen-plus",
  temperature: 0,
  apiKey: process.env.DASHSCOPE_API_KEY,
  configuration: {
    baseURL: DASHSCOPE_BASE_URL,
  },
});


export const embeddingsLLM = new OpenAIEmbeddings({
  modelName: "text-embedding-v4",
  apiKey: process.env.DASHSCOPE_API_KEY,
  configuration: {
    baseURL: DASHSCOPE_BASE_URL,
  },
});
