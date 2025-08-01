# 🔐 Data Encryption System

A modern, secure web application for encrypting and decrypting CSV data using Fernet symmetric encryption. This system provides a beautiful, user-friendly interface to protect your sensitive data with enterprise-grade security.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)
![Cryptography](https://img.shields.io/badge/Cryptography-Fernet-red.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- 🔐 **Advanced Encryption**: Uses Fernet symmetric encryption for secure data protection
- 📊 **CSV Support**: Upload and process CSV files with ease
- 🎨 **Modern UI**: Beautiful, responsive web interface with animations
- 📱 **Mobile Friendly**: Works perfectly on all devices and screen sizes
- 🔄 **Real-time Status**: Live system status updates and progress indicators
- 📥 **File Downloads**: Download encrypted, decrypted, and key files
- 🚀 **Drag & Drop**: Intuitive file upload with visual feedback
- 🛡️ **Security First**: Comprehensive error handling and validation

## 🏗️ Project Structure

```
pythonProject4/
├── 📄 app.py                 # Flask web application (main server)
├── 🔐 encryptor.py           # Original encryption script
├── 🔓 decryptor.py           # Original decryption script
├── 📝 main.py               # PyCharm template file
├── 📋 requirements.txt      # Python dependencies
├── 📊 sensor_data.csv       # Sample sensor data
├── 📁 templates/
│   └── 🎨 index.html        # Main web interface
├── 📁 static/
│   ├── 🎨 css/
│   │   └── style.css        # Modern styling with animations
│   └── ⚡ js/
│       └── app.js           # Frontend functionality
├── 📁 uploads/              # Upload directory (auto-created)
├── 📄 .gitignore            # Git ignore rules
└── 📖 README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone or download the project files**
   ```bash
   git clone <repository-url>
   cd pythonProject4
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

## 📖 How to Use

### 1. 📤 Upload Data
- Drag and drop a CSV file onto the upload area, or click to browse
- The system will automatically preview your data in a beautiful table
- Supported format: CSV files with columns like `timestamp`, `device_id`, `temperature`, `humidity`, `pressure`

### 2. 🔐 Encrypt Data
- Click the green "Encrypt Data" button
- The system will generate a unique encryption key and encrypt your data
- Encrypted data will be saved as `encrypted_data.csv`
- The encryption key will be saved as `key.key`

### 3. 🔓 Decrypt Data
- Click the "Decrypt Data" button to restore your original data
- Decrypted data will be saved as `decrypted_data.csv`
- You can preview the decrypted data in the interface

### 4. 📥 Download Files
- Download encrypted data for secure storage
- Download decrypted data for analysis
- Download the encryption key for backup (keep it secure!)

## 🔌 API Endpoints

The web application provides the following REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Main web interface |
| `POST` | `/api/upload` | Upload CSV file |
| `POST` | `/api/encrypt` | Encrypt uploaded data |
| `POST` | `/api/decrypt` | Decrypt encrypted data |
| `GET` | `/api/download/<file_type>` | Download files (encrypted/decrypted/key) |
| `GET` | `/api/status` | Get system status |

## 🛡️ Security Features

- **🔐 Symmetric Encryption**: Uses Fernet algorithm for secure encryption
- **🔑 Key Management**: Automatic key generation and secure storage
- **📁 File Validation**: Only accepts CSV files for security
- **⚠️ Error Handling**: Comprehensive error handling and user feedback
- **🔒 Data Protection**: Encrypted data is completely unreadable without the key

## 🔧 Technical Details

### Encryption Process
1. **Key Generation**: Creates a unique Fernet key
2. **Column Encryption**: Encrypts specific columns (temperature, humidity, pressure)
3. **Data Preservation**: Maintains original data structure
4. **Secure Storage**: Saves encrypted data and key separately

### Decryption Process
1. **Key Loading**: Retrieves the stored encryption key
2. **Column Decryption**: Decrypts the specified columns
3. **Data Restoration**: Returns original data format
4. **Preview**: Provides data preview in the interface

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **Flask** | 3.0.0 | Web framework for the backend |
| **Flask-CORS** | 4.0.0 | Cross-origin resource sharing support |
| **Cryptography** | 45.0.5 | Advanced encryption library |
| **Pandas** | 2025.2 | Data manipulation and CSV processing |
| **Werkzeug** | 3.0.1 | File upload utilities |

## 🌐 Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change the port in app.py
   app.run(debug=True, port=5001)
   ```

2. **File upload fails**
   - Ensure the file is a valid CSV format
   - Check file size (should be reasonable)
   - Verify file permissions

3. **Encryption/Decryption fails**
   - Ensure you have the required files (sensor_data.csv, key.key, encrypted_data.csv)
   - Check that the CSV has the expected columns
   - Verify all dependencies are installed

### Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No file part" | No file selected | Select a CSV file to upload |
| "Invalid file type" | Wrong file format | Use only CSV files |
| "No data file found" | Missing data | Upload a CSV file before encrypting |
| "No encryption key found" | Missing key | Encrypt data before decrypting |

## 🤝 Contributing

We welcome contributions! Here are some ways you can help:

- 🐛 **Report bugs** by creating an issue
- 💡 **Suggest features** for future improvements
- 🔧 **Submit pull requests** with code improvements
- 📚 **Improve documentation**

### Development Ideas
- Add support for more file formats (JSON, XML, etc.)
- Implement additional encryption algorithms
- Add user authentication and authorization
- Create a database backend for data persistence
- Add data visualization features
- Implement batch processing for multiple files

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation**: Check this README file
- 🐛 **Issues**: Create an issue in the project repository
- 💬 **Questions**: Use the discussion section

## 🙏 Acknowledgments

- Built with [Flask](https://flask.palletsprojects.com/)
- Encryption powered by [Cryptography](https://cryptography.io/)
- Data processing with [Pandas](https://pandas.pydata.org/)
- Beautiful UI with modern CSS and JavaScript

---

**Made with ❤️ for secure data management** 