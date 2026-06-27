import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddings } from "./llm.client";
import dotenv from "dotenv";

dotenv.config();

export const CHROMA_COLLECTION_NAME = "qa_knowledge_base";
export const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";

/**
 * 获取或初始化 Chroma 向量数据库实例
 * @returns {Promise<Chroma>}
 */
export const getChromaInstance = async () => {
  return new Chroma(embeddings, {
    collectionName: CHROMA_COLLECTION_NAME,
    url: CHROMA_URL,
  });
};
