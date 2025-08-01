# hasher.py
import hashlib

def hash_sha256(text: str) -> str:
    """Returns SHA-256 hash of the input text."""
    return hashlib.sha256(text.encode()).hexdigest()

def verify_password(input_password: str, stored_hash: str) -> bool:
    """Checks if the input password's hash matches the stored hash."""
    return hash_sha256(input_password) == stored_hash
