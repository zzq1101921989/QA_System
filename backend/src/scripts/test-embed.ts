import { embeddingsLLM } from "./core/llm.client";

async function main() {
  console.log("正在测试 OpenAI Embedding 连接...\n");

  const result = await embeddingsLLM.embedQuery("Hello, this is a test.");

  console.log(`状态: ✅ 连接正常`);
  console.log(`向量维度: ${result.length}`);
  console.log(`前 5 个值: [${result.slice(0, 5).map(v => v.toFixed(4)).join(", ")}]`);
  console.log(`后 5 个值: [${result.slice(-5).map(v => v.toFixed(4)).join(", ")}]`);
}

main().catch((err) => {
  console.error(`❌ 连接失败:`, err.message);
  process.exit(1);
});
