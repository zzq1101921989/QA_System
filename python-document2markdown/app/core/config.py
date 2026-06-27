import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Document Parser Service"
    PROJECT_VERSION: str = "1.0.0"
    
    # 运行端口
    PORT: int = int(os.getenv("PORT", 8200))
    
    # 日志级别
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")
    
    # 文件大小限制 (50MB)
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024

settings = Settings()
