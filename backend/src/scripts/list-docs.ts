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
      // 获取记录进行详细展示
      const response = await collection.get({
        limit: 20, // 如果想看所有数据，可以把 limit 参数注释掉，或者改大一点
        include: ["metadatas", "documents", "embeddings"] as any,
        where: { documentId: "hhainqrpr" }
      });

      console.log(`\n🔍 详细 Chunk 预览 (展示 ${response.ids.length} 条):`);
      response.ids.forEach((id, i) => {
        console.log(`\n👇 ================= Chunk [${i + 1}] ================= 👇`);
        console.log(`[ID]: ${id}`);
        console.log(`\n[Metadata (元数据)]:`);
        console.log(JSON.stringify(response.metadatas?.[i], null, 2));
        console.log(`\n[Document (文本内容)]:`);
        console.log(response.documents?.[i]);
        
        const embedding = response.embeddings?.[i] as number[] | undefined;
        if (embedding) {
          console.log(`\n[Embedding (向量坐标 - ${embedding.length} 维)]:`);
          console.log(`[${embedding.slice(0, 5).join(', ')}, ... ]`);
        }

        console.log(`👆 ================================================ 👆`);
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
