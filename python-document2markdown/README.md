# Document to Markdown Parser Service

专门用于将 PDF, Word, Excel 文档转换为 Markdown 的 Python 微服务。

## 目录结构
- `app/`: 核心业务逻辑
  - `main.py`: 服务入口 (FastAPI)
  - `services/`: 解析逻辑实现
  - `core/`: 基础配置
  - `utils/`: 通用工具类
- `tests/`: 单元测试

## 快速开始
1. 创建虚拟环境: `python -m venv venv`
2. 激活环境: `source venv/Scripts/activate` (Windows Git Bash)
3. 安装依赖: `pip install -r requirements.txt`
4. 运行服务: `uvicorn app.main:app --reload --port 8001`
