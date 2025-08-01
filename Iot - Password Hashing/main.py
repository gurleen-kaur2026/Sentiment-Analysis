# main.py
from hasher import hash_sha256, verify_password

def main():
    print("1. Hash a message")
    print("2. Store and verify a password")
    choice = input("Choose an option (1/2): ")

    if choice == "1":
        message = input("Enter message to hash: ")
        hashed = hash_sha256(message)
        print(f"\n✅ SHA-256 Hash: {hashed}")

    elif choice == "2":
        password = input("Set your password: ")
        stored_hash = hash_sha256(password)

        print("\nPassword saved securely (only hashed).")
        print(f"Stored Hash: {stored_hash}\n")

        verify = input("Re-enter password to verify: ")
        if verify_password(verify, stored_hash):
            print("✅ Password matched!")
        else:
            print("❌ Incorrect password.")

    else:
        print("Invalid choice.")

if __name__ == "__main__":
    main()
