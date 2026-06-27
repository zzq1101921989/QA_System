import io
from markitdown import MarkItDown

async def parse_excel_to_markdown(content: bytes, filename: str) -> dict:
    """
    将 Excel 二进制内容转换为 Markdown 格式
    """
    try:
        md = MarkItDown()
        file_stream = io.BytesIO(content)
        result = md.convert(file_stream)

        return {
            "filename": filename,
            "content_type": "excel",
            "markdown": result.text_content,
            "metadata": {
                "size": len(content),
                "source": "markitdown"
            }
        }
    except Exception as e:
        return {
            "filename": filename,
            "content_type": "excel",
            "markdown": f"Excel 解析失败: {str(e)}",
            "error": True
        }
