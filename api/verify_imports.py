import sys
import os

print("Verifying imports...")

# Ensure we are in the api directory
if not os.path.exists("main.py"):
    print("❌ Please run this script from the 'api' directory.")
    sys.exit(1)

try:
    print("Importing main...")
    import main
    print("✅ main imported")

    print("Importing rag_controller...")
    from controller import rag_controller
    print("✅ rag_controller imported")

    print("Importing query_controller...")
    from controller import query_controller
    print("✅ query_controller imported")

    print("Importing auth_controller...")
    from controller import auth_controller
    print("✅ auth_controller imported")

    print("Importing speech_controller...")
    from controller import speech_controller
    print("✅ speech_controller imported")

    print("Importing rag_service...")
    from service.rag import rag_service
    import service.rag.rag_service
    print("✅ rag_service imported")
    
    print("Importing database_service...")
    from service.infrastructure import database_service
    print("✅ database_service imported")

    print("Importing sql_analysis_service...")
    from service.features import sql_analysis_service
    print("✅ sql_analysis_service imported")

    print("ALL IMPORTS SUCCESSFUL")

except Exception as e:
    print(f"❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
