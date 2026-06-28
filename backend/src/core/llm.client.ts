import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config();

// 单例模式导出 LLM 和 Embeddings 实例
export const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini", // 推荐用于生成的模型
  temperature: 0,           // 保证回答的一致性与严谨性
});


export const embeddingsLLM = new OpenAIEmbeddings({
  modelName: "text-embedding-v4",
  apiKey: process.env.DASHSCOPE_API_KEY,
  configuration: {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
});
