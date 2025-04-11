from flask import Flask, request, jsonify, render_template, redirect, send_from_directory
import sqlite3
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)
CORS(app, origins=["http://localhost:3001"])

# Set up file upload directory
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Database setup (in-memory SQLite for simplicity)
def init_db():
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    # cursor.execute('''DROP TABLE users''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, profile_pic TEXT)''')
    conn.commit()
    conn.close()

@app.route('/')
def home():
    return render_template('index.html')

# Vulnerable registration endpoint
@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    password = request.form['password']  # No hashing or validation
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    if user:
        return jsonify({"message": "User already exists"}), 400

    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
    conn.commit()

    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()

    if user:
        return redirect('/dashboard/' + str(user[0]))  # Redirect to profile page on successful register
    else:
        return jsonify({"message": "User registration failed"}), 400

# Vulnerable login endpoint
@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'")
    user = cursor.fetchone()
    conn.close()
    
    if user:
        if (user[1] == "admin"):
            return redirect('/admin')
        else:
            return redirect('/dashboard/' + str(user[0]))  # Redirect to profile page on successful login
    else:
        return jsonify({"message": "Invalid credentials"}), 401
    
# Vulnerable login endpoint
@app.route('/admin', methods=['GET'])
def admin():
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", ("admin",))
    user = cursor.fetchone()
    conn.close()
    print(user)
    if user:
        return jsonify({"id": user[0], "username": user[1]}), 200
    else:
        return jsonify({"message": "User not found"}), 404

# Vulnerable profile endpoint (IDOR)
@app.route('/dashboard/<id>', methods=['GET'])
def dashboard(id):
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (id,))
    user = cursor.fetchone()
    conn.close()
    print(user)
    if user:
        return jsonify({"id": user[0], "username": user[1]}), 200
    else:
        return jsonify({"message": "User not found"}), 404

# Vulnerable profile endpoint (IDOR)
@app.route('/profile/<id>', methods=['GET'])
def profile(id):
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (id,))
    user = cursor.fetchone()
    conn.close()
    print(user)
    if user:
        return jsonify({"id": user[0], "username": user[1], "profile_pic": user[3]}), 200
    else:
        return jsonify({"message": "User not found"}), 404

# Vulnerable edit profile endpoint: uploading a picture and changing password
@app.route('/profile', methods=['POST'])
def edit_profile():
    id = request.form['id']  # For demo purposes, user ID comes as form data
    new_password = request.form.get('new_password', None)  # If provided, change password
    picture = request.files.get('picture', None)
    picture_filename = None

    print(id, new_password, picture)

    # Vulnerability: No strict validation on file type if you purposefully allow any file
    if picture:
        picture_filename = picture.filename
        picture.save(os.path.join(app.config['UPLOAD_FOLDER'], picture_filename))

    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    if new_password:
        # Update password vulnerably: no hashing
        cursor.execute("UPDATE users SET password = ? WHERE id = ?", (new_password, id))
    if picture_filename:
        # Save filename in profile_pic field
        cursor.execute("UPDATE users SET profile_pic = ? WHERE id = ?", (picture_filename, id))
    conn.commit()
    conn.close()

    return jsonify({"message": "Profile updated successfully"}), 200

@app.route('/collect', methods=['POST'])
def collect():
    data = request.get_json()
    print("Exfiltrated data:", data)
    return "Data received", 200

# Serve files from the uploads folder
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    init_db()  # Initialize the database when starting the app
    app.run(debug=True)
