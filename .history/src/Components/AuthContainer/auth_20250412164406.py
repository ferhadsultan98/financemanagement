from flask import Flask, request, jsonify
from firebase_admin import credentials, initialize_app, firestore
import smtplib
import random
import string
from email.message import EmailMessage
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app)  # Allow CORS for React frontend

# Initialize Firebase Admin SDK
cred = credentials.Certificate("path/to/your-firebase-adminsdk.json")  # Replace with your Firebase credentials
initialize_app(cred)
db = firestore.client()

# Generate random password
def generate_password(length=12):
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choice(characters) for _ in range(length))

# Generate OTP
def generate_otp():
    return str(random.randint(100000, 999999))

# Email sender with custom sender name and HTML template
def send_email(receiver_email, subject, content, html_content):
    sender_email = 'sultanovv988@gmail.com'
    sender_password = 'rbcm tobi aenj untr'  # Use your Gmail App Password
    sender_name = 'Farhad Sultan'

    msg = EmailMessage()
    msg.set_content(content)
    msg.add_alternative(html_content, subtype='html')
    msg['Subject'] = subject
    msg['From'] = f'"{sender_name}" <{sender_email}>'
    msg['To'] = receiver_email

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        return True
    except Exception as e:
        print("Email sending error:", e)
        return False

# Send new password email
def send_password_email(receiver_email, new_password):
    subject = 'Yeni Şifrəniz'
    content = (
        f"Hörmətli istifadəçi,\n\n"
        f"Sizin yeni şifrəniz: {new_password}\n\n"
        f"Bu şifrə ilə hesabınıza daxil ola bilərsiniz. "
        f"Təhlükəsizliyiniz üçün şifrənizi dəyişdirməyi tövsiyə edirik.\n\n"
        f"Əgər bu tələbi siz etməmisinizsə, dərhal bizimlə əlaqə saxlayın.\n\n"
        f"Təşəkkürlər,\n{sender_name}"
    )
    html_content = f"""
    <html>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #e0eafc, #cfdef3); margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: linear-gradient(to right, #007bff, #00ddeb);"></div>
            <h2 style="color: #2c3e50; text-align: center; font-size: 28px; margin-bottom: 20px; letter-spacing: 1px;">Yeni Şifrəniz</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">Hörmətli istifadəçi,</p>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">Sizin yeni şifrəniz:</p>
            <p style="text-align: center; font-size: 32px; font-weight: bold; color: #007bff; margin: 25px 0; background: #f1f8ff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,123,255,0.1);">
                {new_password}
            </p>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">Bu şifrə ilə hesabınıza daxil ola bilərsiniz. Təhlükəsizliyiniz üçün şifrənizi dəyişdirməyi tövsiyə edirik.</p>
            <p style="color: #e74c3c; font-size: 14px; font-style: italic; margin-top: 15px;">Əgər bu tələbi siz etməmisinizsə, dərhal bizimlə əlaqə saxlayın.</p>
            <p style="color: #7f8c8d; text-align: center; margin-top: 30px; font-size: 15px;">Təşəkkürlər,<br><strong style="color: #2c3e50;">{sender_name}</strong></p>
            <div style="margin-top: 20px; text-align: center;">
                <span style="display: inline-block; width: 50px; height: 2px; background: linear-gradient(to right, #007bff, #00ddeb);"></span>
            </div>
        </div>
    </body>
    </html>
    """
    return send_email(receiver_email, subject, content, html_content)

# Send OTP email
def send_otp_email(receiver_email, otp_code):
    subject = 'Qeydiyyat OTP Kodu'
    content = (
        f"Hörmətli istifadəçi,\n\n"
        f"Sizin bir dəfəlik OTP kodunuz: {otp_code}\n\n"
        f"Bu kodu qeydiyyatınızı tamamlamaq üçün istifadə edin. "
        f"Təhlükəsizliyiniz üçün bu kodu heç kimlə paylaşmayın.\n\n"
        f"Əgər bu tələbi siz etməmisinizsə, bu mesajı diqqətə almayın.\n\n"
        f"Təşəkkürlər,\n{sender_name}"
    )
    html_content = f"""
    <html>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #e0eafc, #cfdef3); margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: linear-gradient(to right, #007bff, #00ddeb);"></div>
            <h2 style="color: #2c3e50; text-align: center; font-size: 28px; margin-bottom: 20px; letter-spacing: 1px;">OTP Doğrulama Kodu</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">Hörmətli istifadəçi,</p>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">Sizin bir dəfəlik OTP kodunuz:</p>
            <p style="text-align: center; font-size: 32px; font-weight: bold; color: #007bff; margin: 25px 0; background: #f1f8ff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,123,255,0.1);">
                {otp_code}
            </p>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">Bu kodu qeydiyyatınızı tamamlamaq üçün istifadə edin. Təhlükəsizliyiniz üçün bu kodu heç kimlə paylaşmayın.</p>
            <p style="color: #e74c3c; font-size: 14px; font-style: italic; margin-top: 15px;">Əgər bu tələbi siz etməmisinizsə, bu mesajı diqqətə almayın.</p>
            <p style="color: #7f8c8d; text-align: center; margin-top: 30px; font-size: 15px;">Təşəkkürlər,<br><strong style="color: #2c3e50;">{sender_name}</strong></p>
            <div style="margin-top: 20px; text-align: center;">
                <span style="display: inline-block; width: 50px; height: 2px; background: linear-gradient(to right, #007bff, #00ddeb);"></span>
            </div>
        </div>
    </body>
    </html>
    """
    return send_email(receiver_email, subject, content, html_content)

@app.route('/send-password', methods=['POST'])
def send_password():
    data = request.get_json()
    username = data.get('username')

    if not username:
        return jsonify({'error': 'Username is required'}), 400

    try:
        # Check if user exists and get email
        user_ref = db.collection('users').document(username)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404

        email = user_doc.to_dict().get('profile', {}).get('email')
        if not email:
            return jsonify({'error': 'Email not found for this user'}), 404

        # Generate new password
        new_password = generate_password()

        # Update password in Firebase credentials
        credentials_ref = db.collection('credentials').where('username', '==', username).limit(1)
        credentials_docs = credentials_ref.stream()
        for doc in credentials_docs:
            doc.reference.update({'password': new_password})

        # Send new password via email
        if send_password_email(email, new_password):
            return jsonify({'message': 'New password sent successfully'}), 200
        else:
            return jsonify({'error': 'Failed to send password'}), 500
    except Exception as e:
        print("Send password error:", e)
        return jsonify({'error': 'Server error'}), 500

@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')

    if not all([username, email]):
        return jsonify({'error': 'Username and email are required'}), 400

    try:
        # Generate OTP and store in Firestore
        otp = generate_otp()
        otp_ref = db.collection('otps').document(username)
        otp_ref.set({
            'otp': otp,
            'email': email,
            'created_at': datetime.datetime.utcnow(),
            'expires_at': datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        })

        # Send OTP via email
        if send_otp_email(email, otp):
            return jsonify({'message': 'OTP sent successfully'}), 200
        else:
            return jsonify({'error': 'Failed to send OTP'}), 500
    except Exception as e:
        print("Send OTP error:", e)
        return jsonify({'error': 'Server error'}), 500

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    username = data.get('username')
    otp = data.get('otp')

    if not all([username, otp]):
        return jsonify({'error': 'Username and OTP are required'}), 400

    try:
        # Check OTP in Firestore
        otp_ref = db.collection('otps').document(username)
        otp_doc = otp_ref.get()
        if not otp_doc.exists:
            return jsonify({'error': 'No OTP found for this user'}), 404

        otp_data = otp_doc.to_dict()
        stored_otp = otp_data.get('otp')
        expires_at = otp_data.get('expires_at')

        if expires_at.to_pydatetime() < datetime.datetime.utcnow():
            otp_ref.delete()
            return jsonify({'error': 'OTP has expired'}), 400

        if otp != stored_otp:
            return jsonify({'error': 'Invalid OTP'}), 400

        # OTP is valid, delete it
        otp_ref.delete()
        return jsonify({'message': 'OTP verified successfully'}), 200
    except Exception as e:
        print("Verify OTP error:", e)
        return jsonify({'error': 'Server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)