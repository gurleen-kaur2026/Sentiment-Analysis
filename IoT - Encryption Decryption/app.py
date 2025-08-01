from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import os
import subprocess
import tempfile
import shutil
from werkzeug.utils import secure_filename
import pandas as pd

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Copy to sensor_data.csv for compatibility with existing scripts
        shutil.copy(filepath, 'sensor_data.csv')
        
        # Read and return preview of the data
        try:
            df = pd.read_csv(filepath)
            preview = df.head(5).to_dict('records')
            return jsonify({
                'message': 'File uploaded successfully',
                'filename': filename,
                'preview': preview,
                'total_rows': len(df)
            })
        except Exception as e:
            return jsonify({'error': f'Error reading file: {str(e)}'}), 400
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/encrypt', methods=['POST'])
def encrypt_data():
    try:
        # Check if sensor_data.csv exists
        if not os.path.exists('sensor_data.csv'):
            return jsonify({'error': 'No data file found. Please upload a CSV file first.'}), 400
        
        # Run the encryptor script
        result = subprocess.run(['python', 'encryptor.py'], 
                              capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            return jsonify({
                'message': 'Encryption completed successfully',
                'output': result.stdout
            })
        else:
            return jsonify({
                'error': 'Encryption failed',
                'output': result.stderr
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Encryption timed out'}), 500
    except Exception as e:
        return jsonify({'error': f'Encryption error: {str(e)}'}), 500

@app.route('/api/decrypt', methods=['POST'])
def decrypt_data():
    try:
        # Check if required files exist
        if not os.path.exists('key.key'):
            return jsonify({'error': 'No encryption key found. Please encrypt data first.'}), 400
        if not os.path.exists('encrypted_data.csv'):
            return jsonify({'error': 'No encrypted data found. Please encrypt data first.'}), 400
        
        # Run the decryptor script
        result = subprocess.run(['python', 'decryptor.py'], 
                              capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            # Read and return preview of decrypted data
            df = pd.read_csv('decrypted_data.csv')
            preview = df.head(5).to_dict('records')
            
            return jsonify({
                'message': 'Decryption completed successfully',
                'output': result.stdout,
                'preview': preview,
                'total_rows': len(df)
            })
        else:
            return jsonify({
                'error': 'Decryption failed',
                'output': result.stderr
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Decryption timed out'}), 500
    except Exception as e:
        return jsonify({'error': f'Decryption error: {str(e)}'}), 500

@app.route('/api/download/<file_type>')
def download_file(file_type):
    file_mapping = {
        'encrypted': 'encrypted_data.csv',
        'decrypted': 'decrypted_data.csv',
        'key': 'key.key'
    }
    
    if file_type not in file_mapping:
        return jsonify({'error': 'Invalid file type'}), 400
    
    file_path = file_mapping[file_type]
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    
    return send_file(file_path, as_attachment=True)

@app.route('/api/status')
def get_status():
    status = {
        'sensor_data_exists': os.path.exists('sensor_data.csv'),
        'key_exists': os.path.exists('key.key'),
        'encrypted_exists': os.path.exists('encrypted_data.csv'),
        'decrypted_exists': os.path.exists('decrypted_data.csv')
    }
    return jsonify(status)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000) 