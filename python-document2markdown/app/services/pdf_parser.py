import io
from markitdown import MarkItDown

async def parse_pdf_to_markdown(content: bytes, filename: str) -> dict:
    """
    将 PDF 二进制内容转换为 Markdown 格式
    """
    try:
        md = MarkItDown()
        # 将 bytes 包装成 BytesIO 对象 (BinaryIO)
        file_stream = io.BytesIO(content)
        result = md.convert(file_stream)

        return {
            "filename": filename,
            "content_type": "pdf",
            "markdown": result.text_content,
            "metadata": {
                "size": len(content),
                "source": "markitdown"
            }
        }
    except Exception as e:
        return {
            "filename": filename,
            "content_type": "pdf",
            "markdown": f"PDF 解析失败: {str(e)}",
            "error": True
        }
