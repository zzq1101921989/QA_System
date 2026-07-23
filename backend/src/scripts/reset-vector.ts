import dotenv from "dotenv";
import { ChromaClient } from "chromadb";
import { CHROMA_COLLECTION_NAME, CHROMA_URL } from '../core/chroma.client';

dotenv.config();

/**
 * 清空 ChromaDB 向量库脚本
 * 该脚本会直接删除指定的 Collection，实现完全重置
 */
async function main() {
  console.log(`\n🚀 准备重置向量库...`);
  console.log(`📍 Chroma 地址: ${CHROMA_URL}`);
  console.log(`📍 目标集合: ${CHROMA_COLLECTION_NAME}`);

  try {
    const client = new ChromaClient({ path: CHROMA_URL });
    
    // 1. 检查集合是否存在
    let exists = false;
    try {
      await client.getCollection({ name: CHROMA_COLLECTION_NAME });
      exists = true;
    } catch (err: any) {
      // 这里的错误通常表示集合不存在
      if (err.message?.includes("does not exist")) {
        console.log(`\nℹ️  集合 "${CHROMA_COLLECTION_NAME}" 当前不存在，无需执行删除。`);
      } else {
        throw err;
      }
    }

    // 2. 执行删除
    if (exists) {
      console.log(`\n⚠️  正在删除集合 "${CHROMA_COLLECTION_NAME}"...`);
      await client.deleteCollection({ name: CHROMA_COLLECTION_NAME });
      console.log(`\n✨ 成功：向量库集合已清空。`);
    }

    console.log(`\n💡 提示：`);
    console.log(`- 该操作仅删除了向量数据（ChromaDB）。`);
    console.log(`- 数据库（SQLite/Prisma）中的文档记录依然存在，如需完全重置，请手动清理数据库或同步更新状态。`);
    console.log(`- 系统在下次上传文档时会自动重新创建该集合。`);

  } catch (err: any) {
    console.error(`\n❌ 重置失败:`, err.message || err);
    process.exit(1);
  }
}

main();
