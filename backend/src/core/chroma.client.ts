import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddingsLLM } from "./llm.client";
import dotenv from "dotenv";

dotenv.config();

export const CHROMA_COLLECTION_NAME = "chroma";
export const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:1101";

let instance: Chroma | null = null;

/**
 * 获取 Chroma 向量数据库单例
 * 确保全局只有一个连接实例，避免重复创建导致的资源浪费和初始化问题
 */
export const getChromaInstance = async () => {
  if (!instance) {
    instance = new Chroma(embeddingsLLM, {
      collectionName: CHROMA_COLLECTION_NAME,
      url: CHROMA_URL,
    });
    
    // 强制触发一次内部初始化，确保 collection 准备就绪
    await instance.ensureCollection();
  }
  return instance;
};
