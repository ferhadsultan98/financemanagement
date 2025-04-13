import os
import json
from flask import Flask, request, jsonify, send_from_directory
from firebase_admin import credentials, initialize_app, firestore
import smtplib
import random
from email.message import EmailMessage
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app)

SENDER_NAME = 'Finance'

# Firebase yapılandırması
try:
    firebase_config_jsonを使い果たした。続きは以下の通りです：

```python
    firebase_config_json = os.getenv("FIREBASE_CONFIG")
    if not firebase_config_json:
        raise ValueError("FIREBASE_CONFIG environment variable not set")
    
    firebase_config = json.loads(firebase_config_json)
    cred = credentials.Certificate(firebase_config)
    initialize_app(cred)
    print("Firebase initialized successfully")
except Exception as e:
    print(f"Firebase initialization error: {str(e)}")
    raise e

db = firestore.client()

def generate_otp():
    return str(random.randint(100000, 999999))

def send_email(receiver_email, subject, content, html_content):
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")

    if not sender_email or not sender_password:
        print("Email credentials not set in environment variables")
        return False

    msg = EmailMessage()
    msg.set_content(content)
    msg.add_alternative(html_content, subtype='html')
    msg['Subject'] = subject
    msg['From'] = f'"{SENDER_NAME}" <{sender_email}>'
    msg['To'] = receiver_email

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        return True
    except Exception as e:
        print("Email sending error:", e)
        return False

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Finance Management API çalışıyor! Endpoint\'leri kullanmak için /send-otp, /verify-otp, /send-password veya /send-welcome yollarını deneyin.'}), 200

@app.route('/favicon.ico')
def favicon():
    return '', 204

@app.route('/send-password', methods=['POST'])
def send_password():
    data = request.get_json()
    username = data.get('username')
    new_password = data.get('newPassword')

    if not username or not new_password:
        return jsonify({'error': 'İstifadəçi adı və yeni şifrə tələb olunur'}), 400

    try:
        credential_ref = db.collection('credentials').document(username)
        credential_doc = credential_ref.get()
        if not credential_doc.exists:
            return jsonify({'error': 'İstifadəçi tapılmadı'}), 404

        email = credential_doc.to_dict().get('email')
        if not email:
            return jsonify({'error': 'Bu istifadəçi üçün e-poçt tapılmadı'}), 404

        content = (
            f"Hörmətli istifadəçi,\n\n"
            f"Sizin yeni şifrəniz aşağıda göstərilmişdir:\n\n"
            f"Yeni Şifrə: {new_password}\n\n"
            f"Bu şifrə ilə hesabınıza daxil ola bilərsiniz. Şifrənizi təhlükəsiz saxlamağınızı və heç kimsə ilə paylaşmamağınızı tövsiyə edirik.\n"
            f"Maliyyə dünyasında uğurlu addımlar atmağınız üçün buradayıq!\n\n"
            f"Təşəkkürlər,\n{SENDER_NAME} Komandası"
        )
        html_content = f"""
        <html>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #e0eafc, #cfdef3); margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                <h2 style="color: #2c3e50; text-align: center; font-size: 28px; margin-bottom: 20px;">Yeni Şifrəniz</h2>
                <p style="color: #7f8c8d; font-size: 16px;">Hörmətli istifadəçi,</p>
                <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">Sizin üçün yeni şifrə təyin edilmişdir. Aşağıdakı şifrə ilə hesabınıza daxil ola bilərsiniz:</p>
                <p style="text-align: center; font-size: 32px; font-weight: bold; color: #007bff; margin: 25px 0; background: #f1f8ff; padding: 15px; border-radius: 8px;">
                    {new_password}
                </p>
                <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">Təhlükəsizlik üçün şifrənizi heç kimsə ilə paylaşmayın və müntəzəm olaraq dəyişdirin.</p>
                <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">Maliyyə hədəflərinizə çatmaq üçün {SENDER_NAME} olaraq sizinləyik!</p>
                <p style="color: #7f8c8d; text-align: center; margin-top: 30px; font-size: 15px;">Hörmətlə,<br><strong>{SENDER_NAME} Komandası</strong></p>
            </div>
        </body>
        </html>
        """
        if send_email(email, 'Yeni Şifrəniz', content, html_content):
            return jsonify({'message': 'Yeni şifrə uğurla göndərildi'}), 200
        else:
            return jsonify({'error': 'Şifrə göndərilə bilmədi'}), 500
    except Exception as e:
        print("Send password error:", e)
        return jsonify({'error': 'Server xətası'}), 500

@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')

    if not all([username, email]):
        return jsonify({'error': 'İstifadəçi adı və e-poçt tələb olunur'}), 400

    try:
        print(f"Generating OTP for username: {username}, email: {email}")
        otp = generate_otp()
        print(f"Generated OTP: {otp}")

        print("Attempting to write OTP to Firestore...")
        otp_ref = db.collection('otps').document(username)
        otp_ref.set({
            'otp': otp,
            'email': email,
            'created_at': datetime.datetime.utcnow(),
            'expires_at': datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        })
        print("OTP successfully written to Firestore")

        content = (
            f"Hörmətli istifadəçi,\n\n"
            f"Sizin bir dəfəlik doğrulama kodunuz (OTP) aşağıda göstərilmişdir:\n\n"
            f"OTP Kod: {otp}\n\n"
            f"Bu kodu qeydiyyatınızı tamamlamaq üçün istifadə edin. Kod 10 dəqiqə ərzində etibarlıdır.\n"
            f"Təhlükəsizlik üçün bu kodu heç kimsə ilə paylaşmayın.\n"
            f"{SENDER_NAME} ailəsinə qoşulmağınıza çox şadıq!\n\n"
            f"Təşəkkürlər,\n{SENDER_NAME} Komandası"
        )
        html_content = f"""
        <html>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #e0eafc, #cfdef3); margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                <h2 style="color: #2c3e50; text-align: center; font-size: 28px; margin-bottom: 20px;">Doğrulama Kodunuz</h2>
                <p style="color: #7f8c8d; font-size: 16px;">Hörmətli istifadəçi,</p>
                <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">Qeydiyyatınızı tamamlamaq üçün aşağıdakı bir dəfəlik doğrulama kod