from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException
from .services.pdf_parser import parse_pdf_to_markdown
from .services.word_parser import parse_word_to_markdown
from .services.excel_parser import parse_excel_to_markdown


@asynccontextmanager
async def lifespan(app: FastAPI):
    # TODO: 恢复 hybrid 时取消注释即可
    # global _hybrid_process
    # _hybrid_process = subprocess.Popen(
    #     ['opendataloader-pdf-hybrid', '--port', '5002'],
    #     stdout=subprocess.PIPE,
    #     stderr=subprocess.PIPE,
    # )
    # print('[Parser] Hybrid 后端已启动 (port 5002)')
    yield
    # if _hybrid_process:
    #     _hybrid_process.terminate()


app = FastAPI(
    title='Document to Markdown Parser',
    description='专门用于 RAG 系统的文档解析微服务',
    version='1.0.0',
    lifespan=lifespan,
)


@app.get('/health')
async def health_check():
    """健康检查接口"""
    return {'status': 'ok', 'service': 'parser-service'}


@app.post('/parse/pdf')
async def parse_pdf(file: UploadFile = File(...)):
    """处理 PDF 转 Markdown（opendataloader-pdf hybrid）"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail='只支持 PDF 文件')

    content = await file.read()
    return await parse_pdf_to_markdown(content, file.filename)


@app.post('/parse/word')
async def parse_word(file: UploadFile = File(...)):
    """处理 Word 转 Markdown"""
    if not file.filename.lower().endswith(('.doc', '.docx')):
        raise HTTPException(status_code=400, detail='只支持 Word 文件')

    content = await file.read()
    return await parse_word_to_markdown(content, file.filename)


@app.post('/parse/excel')
async def parse_excel(file: UploadFile = File(...)):
    """处理 Excel 转 Markdown"""
    if not file.filename.lower().endswith(('.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail='只支持 Excel 文件')

    content = await file.read()
    return await parse_excel_to_markdown(content, file.filename)
