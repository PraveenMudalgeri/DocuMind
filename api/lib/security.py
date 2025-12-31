from cryptography.fernet import Fernet
import base64
import hashlib
from lib.config import settings
from typing import Optional

class SecurityService:
    def __init__(self):
        # Derive a 32-byte key from the JWT_SECRET_KEY for Fernet
        # Fernet requires a 32-byte url-safe base64-encoded key
        key_material = settings.jwt_secret_key.encode()
        # Use SHA256 to get 32 bytes
        key_hash = hashlib.sha256(key_material).digest()
        # URL-safe base64 encode
        self.key = base64.urlsafe_b64encode(key_hash)
        self.cipher = Fernet(self.key)

    def encrypt_value(self, value: str) -> str:
        """Encrypt a string value."""
        if not value:
            return ""
        return self.cipher.encrypt(value.encode()).decode()

    def decrypt_value(self, encrypted_value: str) -> Optional[str]:
        """decrypt a string value."""
        if not encrypted_value:
            return None
        try:
            return self.cipher.decrypt(encrypted_value.encode()).decode()
        except Exception:
            return None

security_service = SecurityService()
