import pandas as pd
from cryptography.fernet import Fernet

# === File Paths ===
data_path = "sensor_data.csv"
key_path = "key.key"
encrypted_path = "encrypted_data.csv"

# === Generate & Save Key ===
key = Fernet.generate_key()
with open(key_path, "wb") as f:
    f.write(key)

cipher = Fernet(key)

# === Load Original Data ===
df = pd.read_csv(data_path)

# === Encrypt Function ===
def encrypt_value(val):
    return cipher.encrypt(str(val).encode()).decode()

# === Encrypt Selected Columns ===
df["temperature"] = df["temperature"].apply(encrypt_value)
df["humidity"] = df["humidity"].apply(encrypt_value)
df["pressure"] = df["pressure"].apply(encrypt_value)

# === Save Encrypted Data ===
df.to_csv(encrypted_path, index=False)
print("Encryption complete. Encrypted data saved to:", encrypted_path)
