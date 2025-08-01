import pandas as pd
from cryptography.fernet import Fernet

# === File Paths ===
key_path = "key.key"
encrypted_path = "encrypted_data.csv"
decrypted_path = "decrypted_data.csv"

# === Load Key ===
with open(key_path, "rb") as f:
    key = f.read()

cipher = Fernet(key)

# === Load Encrypted Data ===
df = pd.read_csv(encrypted_path)

# === Decrypt Function ===
def decrypt_value(val):
    return cipher.decrypt(val.encode()).decode()

# === Decrypt Selected Columns ===
df["temperature"] = df["temperature"].apply(decrypt_value)
df["humidity"] = df["humidity"].apply(decrypt_value)
df["pressure"] = df["pressure"].apply(decrypt_value)

# === Save Decrypted Data ===
df.to_csv(decrypted_path, index=False)
print("Decryption complete. Data saved to:", decrypted_path)
