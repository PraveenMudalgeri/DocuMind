import threading
import logging

logger = logging.getLogger(__name__)

class UsageTracker:
    _instance = None
    _lock = threading.Lock()
    _count = 0

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(UsageTracker, cls).__new__(cls)
        return cls._instance

    def increment(self):
        with self._lock:
            self._count += 1
            print(f"\n[API STATS] Total Gemini API Calls so far: {self._count}\n")
            logger.info(f"Gemini API Call Increment. Total: {self._count}")

    def get_count(self):
        with self._lock:
            return self._count

usage_tracker = UsageTracker()
