from flask import Flask, request, jsonify, render_template, redirect, send_from_directory, make_response, session
import sqlite3
from flask_cors import CORS
import os
from werkzeug.security import generate_password_hash, check_password_hash 
import secrets  
import base64
import hashlib

app = Flask(__name__)
CORS(app, supports_credentials=True) 
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

app.secret_key = secrets.token_hex(32)  

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def init_db():
    conn = sqlite3.connect('app.db', check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL") 
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS users 
                     (id INTEGER PRIMARY KEY, 
                      username TEXT UNIQUE, 
                      password TEXT, 
                      profile_pic TEXT,
                      name TEXT)''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS sessions
                     (session_id TEXT PRIMARY KEY,
                      user_id INTEGER,
                      expires_at DATETIME,
                      FOREIGN KEY(user_id) REFERENCES users(id))''')
    
    conn.commit()
    conn.close()

def verify_session_cookie():
    session_id = request.cookies.get('session_id')
    if not session_id:
        return None
    
    conn = sqlite3.connect('app.db', check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > datetime('now')", (session_id,))
    result = cursor.fetchone()
    conn.close()
    
    return result[0] if result else None

def create_session(user_id, response):
    session_id = secrets.token_hex(32)
    expires_at = "datetime('now', '+1 day')" 
    
    conn = sqlite3.connect('app.db', check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)", 
                  (session_id, user_id, expires_at))
    conn.commit()
    conn.close()
    
    response.set_cookie(
        'session_id',
        value=session_id,
        httponly=True,
        secure=True,  
        samesite='Lax', 
        max_age=86400  
    )

    return response

def clear_session(response):
    session_id = request.cookies.get('session_id')
    if session_id:
        conn = sqlite3.connect('app.db', check_same_thread=False)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
        conn.commit()
        conn.close()
    
    response.delete_cookie('session_id')
    return response

@app.route('/')
def home():
    return render_template('index.html')

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    pepper = os.urandom(8)
    key = os.urandom(1)[0]
    password = password.encode('utf-8')
    password = bytes([(b ^ salt[i % len(salt)]) for i, b in enumerate(password)])
    password = base64.b64encode(password)
    password = bytes([((b << 3) & 0xFF) | (b >> 5) for b in password])
    password = bytes([b ^ pepper[i % len(pepper)] for i, b in enumerate(password)])
    password = password[::-1]
    hashlib.sha256(password).digest()
    password = password[::-1]
    password = bytes([b ^ pepper[i % len(pepper)] for i, b in enumerate(password)]) 
    password = bytes([((b >> 3) & 0x1F) | (b << 5 & 0xFF) for b in password])
    password = base64.b64decode(password)
    password = bytes([(b ^ salt[i % len(salt)]) for i, b in enumerate(password)])
    password = password.decode('utf-8')
    return password

@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    password = request.form['password']
    
    hashed_password = hash_password(password)
    
    conn = sqlite3.connect('app.db', check_same_thread=False)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    if user:
        return jsonify({"message": "User already exists"}), 400

    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_password))
    conn.commit()

    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()

    if user:
        response = redirect('/dashboard')
        return create_session(user[0], response)
    else:
        return jsonify({"message": "User registration failed"}), 400

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    
    conn = sqlite3.connect('app.db', check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM users WHERE username = '{username}' and password = '{password}'")
    user = cursor.fetchone()
    conn.close()
    
    if user:
        response = redirect('/dashboard') if user[1] != "admin" else redirect('/admin')
        return create_session(user[0], response)
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route('/logout', methods=['POST'])
def logout():
    response = jsonify({"message": "Logged out successfully"})
    return clear_session(response)

@app.route('/admin', methods=['GET'])
def admin():
    user_id = verify_session_cookie()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    conn = sqlite3.connect('app.db', check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user and user[1] == "admin":
        return jsonify({"id": user[0], "username": user[1]}), 200
    else:
        return jsonify({"message": "Unauthorized"}), 403

@app.route('/dashboard/<id>', methods=['GET'])
def dashboard(id):
    user_id = verify_session_cookie()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    conn = sqlite3.connect('app.db', check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify({"id": user[0], "username": user[1], "name": user[4]}), 200
    else:
        return jsonify({"message": "User not found"}), 404

@app.route('/dashboard', methods=['GET'])
def dashboard_no_id():
    user_id = verify_session_cookie()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    conn = sqlite3.connect('app.db', check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify({"id": user[0], "username": user[1], "name": user[4]}), 200
    else:
        return jsonify({"message": "User not found"}), 404

@app.route('/profile/<id>', methods=['GET'])
def profile(id):
    # Check session first
    user_id = verify_session_cookie()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    conn = sqlite3.connect('app.db', check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify({"id": user[0], "username": user[1], "profile_pic": user[3]}), 200
    else:
        return jsonify({"message": "User not found"}), 404

@app.route('/profile', methods=['POST'])
def edit_profile():
    user_id = verify_session_cookie()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    id = request.form['id']
    
    if int(id) != user_id:
        return jsonify({"message": "Unauthorized"}), 403
        
    new_name = request.form.get('name', None)
    new_password = request.form.get('new_password', None)
    picture = request.files.get('picture', None)
    picture_filename = None

    if picture:
        picture_filename = picture.filename
        picture.save(os.path.join(app.config['UPLOAD_FOLDER'], picture_filename))

    conn = sqlite3.connect('app.db', check_same_thread=False)
    cursor = conn.cursor()
    if new_name:
        cursor.execute("UPDATE users SET name = ? WHERE id = ?", (new_name, id))
    if new_password:
        hashed_password = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password = ? WHERE id = ?", (hashed_password, id))
    if picture_filename:
        cursor.execute("UPDATE users SET profile_pic = ? WHERE id = ?", (picture_filename, id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Profile updated successfully"}), 200

@app.route('/collect', methods=['POST'])
def collect():
    data = request.get_json()
    print("Exfiltrated data:", data)
    return "Data received", 200

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    init_db()
    app.run(debug=True)