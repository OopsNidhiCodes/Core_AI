#!/usr/bin/env python3
"""
CoreAI Backend - Simple startup script
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    print(f"""
    ╔══════════════════════════════════════════════╗
    ║        CoreAI Backend API Server            ║
    ╠══════════════════════════════════════════════╣
    ║  Server: http://{host}:{port}              ║
    ║  Docs:   http://{host}:{port}/docs         ║
    ║  Health: http://{host}:{port}/health       ║
    ╚══════════════════════════════════════════════╝
    """)
    
    # Run the server
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )