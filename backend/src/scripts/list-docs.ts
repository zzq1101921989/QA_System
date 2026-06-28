import dotenv from "dotenv";
import { ChromaClient } from "chromadb";
import { CHROMA_COLLECTION_NAME, CHROMA_URL } from '../core/chroma.client';

dotenv.config();

async function main() {
  console.log(`正在连接到 Chroma 服务: ${CHROMA_URL} ...`);
  
  try {
    const client = new ChromaClient({ path: CHROMA_URL });
    
    // 获取或检查集合
    const collection = await client.getCollection({
      name: CHROMA_COLLECTION_NAME,
    });

    const count = await collection.count();

    console.log(`\n================================`);
    console.log(`🚀 向量库状态报告 (原生查询)`);
    console.log(`================================`);
    console.log(`📍 集合名称: ${CHROMA_COLLECTION_NAME}`);
    console.log(`📊 总分块数: ${count}`);

    if (count > 0) {
      // 获取最近的 5 条记录
      const response = await collection.get({
        limit: 5,
        include: ["metadatas", "documents"] as any
      });

      console.log(`\n🔍 数据预览 (最新 ${response.ids.length} 条):`);
      response.ids.forEach((id, i) => {
        console.log(`\n[ID]: ${id}`);
        console.log(`[来源]: ${response.metadatas?.[i]?.source || '未知'}`);
        console.log(`[内容摘要]: ${response.documents?.[i]?.replace(/\n/g, ' ').substring(0, 100)}...`);
        console.log(`--------------------------------`);
      });
    } else {
      console.log(`\n💡 库内目前没有数据，请先上传文档。`);
    }
  } catch (err: any) {
    if (err.message.includes("does not exist")) {
      console.log(`\n❌ 集合 "${CHROMA_COLLECTION_NAME}" 尚不存在，说明还没上传过任何文档。`);
    } else {
      console.error("\n❌ 查询失败:", err.message);
    }
  }
}

main();
