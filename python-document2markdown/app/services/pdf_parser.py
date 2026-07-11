import json
import os
import tempfile
import opendataloader_pdf


async def parse_pdf_to_markdown(content: bytes, filename: str) -> dict:
    """
    使用 OpenDataLoader PDF 将 PDF 二进制流转换为 Markdown。

    解析策略（自动降级）：
      1. hybrid='docling-fast' — 复杂页面（表格/公式/扫描件）交给 AI 后端处理
      2. 纯本地模式 — hybrid 后端不可用时自动回退，0.831 精度仍远超 markitdown(0.589)

    注意：opendataloader-pdf 是 Java 引擎（需 JDK 11+），
          只接受文件路径，不支持内存流，因此需要临时落盘。
    """
    pdf_path = None

    try:
        # ── Step 1: 内存 bytes → 临时文件 ──────────────────
        # opendataloader-pdf 底层调用 JVM 子进程，只能传文件路径
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
            tmp.write(content)
            pdf_path = tmp.name

        # ── Step 2: 解析 → 写入临时输出目录 ──────────────────
        # openDataLoader 输出格式：output_dir/{文件名}.md
        with tempfile.TemporaryDirectory() as output_dir:
            try:
                # TODO: 恢复 hybrid 时取消注释
                # opendataloader_pdf.convert(
                #     input_path=[pdf_path],
                #     output_dir=output_dir,
                #     format='markdown',
                #     hybrid='docling-fast',
                # )
                raise RuntimeError('hybrid disabled')
            except Exception:
                opendataloader_pdf.convert(
                    input_path=[pdf_path],
                    output_dir=output_dir,
                    format=['json', 'markdown'],
                )

            # ── Step 3: 读取解析结果 ──────────────────────────
            basename = os.path.splitext(os.path.basename(pdf_path))[0]
            md_path = os.path.join(output_dir, f'{basename}.md')
            json_path = os.path.join(output_dir, f'{basename}.json')

            markdown = ''
            elements = []

            if os.path.exists(md_path):
                with open(md_path, 'r', encoding='utf-8') as f:
                    markdown = f.read()

            if os.path.exists(json_path):
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    elements = data.get('kids', [])

        return {
            'filename': filename,
            'content_type': 'pdf',
            'markdown': markdown,
            'elements': elements,
            'metadata': {
                'size': len(content),
                'source': filename,
                'page_count': len(set(e.get('page number', 0) for e in elements)) if elements else 0,
            },
        }

    except Exception as e:
        return {
            'filename': filename,
            'content_type': 'pdf',
            'markdown': f'PDF 解析失败: {str(e)}',
            'error': True,
        }

    finally:
        if pdf_path and os.path.exists(pdf_path):
            os.unlink(pdf_path)
