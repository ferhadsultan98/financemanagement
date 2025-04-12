from flask import Flask, request, jsonify
from firebase_admin import credentials, initialize_app, firestore
import smtplib
import random
from email.message import EmailMessage
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("src/ComponentsAuthContainer/config/finance.json")  # Replace with your Firebase credentials
initialize_app(cred)
db = firestore.client()

# Generate OTP
def generate_otp():
    return str(random.randint(100000, 999999))

# Email sender
def send_email(receiver_email, subject, content, html_content):
    sender_email = 'sultanovv988@gmail.com'
    sender_password = 'rbcm tobi aenj untr'  # Your Gmail App Password
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

@app.route('/send-password', methods=['POST'])
def send_password():
    data = request.get_json()
    username = data.get('username')
    new_password = data.get('newPassword')

    if not username or not new_password:
        return jsonify({'error': 'Username and new password are required'}), 400

    try:
        user_ref = db.collection('users').document(username)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404

        email = user_doc.to_dict().get('profile', {}).get('email')
        if not email:
            return jsonify({'error': 'Email not found for this user'}), 404

        content = (
            f"Hörmətli istifadəçi,\n\n"
            f"Sizin yeni şifrəniz: {new_password}\n\n"
            f"Bu şifrə ilə hesabınıza daxil ola bilərsiniz.\n"
            f"Təşəkkürlər,\n{sender_name}"
        )
        html_content = f"""
        <html>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #e0eafc, #cfdef3); margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                <h2 style="color: #2c3e50; text-align: center; font-size: 28px; margin-bottom: 20px;">Yeni Şifrəniz</h2>
                <p style="color: #7f8c8d; font-size: 16px;">Hörmətli istifadəçi,</p>
                <p style="text-align: center; font-size: 32px; font-weight: bold; color: #007bff; margin: 25px 0; background: #f1f8ff; padding: 15px; border-radius: 8px;">
                    {new_password}
                </p>
                <p style="color: #7f8c8d; font-size: 16px;">Bu şifrə ilə hesabınıza daxil ola bilərsiniz.</p>
                <p style="color: #7f8c8d; text-align: center; margin-top: 30px; font-size: 15px;">Təşəkkürlər,<br><strong>{sender_name}</strong></p>
            </div>
        </body>
        </html>
        """
        if send_email(email, 'Yeni Şifrəniz', content, html_content):
            return jsonify({'message': 'New password sent successfully'}), 200
        else:
            return jsonify({'error': 'Failed to send password'}), 500
    except Exception as e:
        print("Send password error:", e)
        return jsonify({'error': 'Server error'}), 500

@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json();
    username = data.get('username')
    email = data.get('email')

    if not all([username, email]):
        return jsonify({'error': 'Username and email are required'}), 400

    try:
        otp = generate_otp()
        otp_ref = db.collection('otps').document(username)
        otp_ref.set({
            'otp': otp,
            'email': email,
            'created_at': datetime.datetime.utcnow(),
            'expires_at': datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        })

        content = (
            f"Hörmətli istifadəçi,\n\n"
            f"Sizin OTP kodunuz: {otp}\n\n"
            f"Bu kodu qeydiyyatınızı tamamlamaq üçün istifadə edin.\n"
            f"Təşəkkürlər,\n{sender_name}"
        )
        html_content = f"""
        <html>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #e0eafc, #cfdef3); margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                <h2 style="color: #2c3e50; text-align: center; font-size: 28px; margin-bottom: 20px;">OTP Doğrulama Kodu</h2>
                <p style="color: #7f8c8d; font-size: 16px;">Hörmətli istifadəçi,</p>
                <p style="text-align: center; font-size: 32px; font-weight: bold; color: #007bff; margin: 25px 0; background: #f1f8ff; padding: 15px; border-radius: 8px;">
                    {otp}
                </p>
                <p style="color: #7f8c8d; font-size: 16px;">Bu kodu qeydiyyatınızı tamamlamaq üçün istifadə edin.</p>
                <p style="color: #7f8c8d; text-align: center; margin-top: 30px; font-size: 15px;">Təşəkkürlər,<br><strong>{sender_name}</strong></p>
            </div>
        </body>
        </html>
        """
        if send_email(email, 'Qeydiyyat OTP Kodu', content, html_content):
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

        otp_ref.delete()
        return jsonify({'message': 'OTP verified successfully'}), 200
    except Exception as e:
        print("Verify OTP error:", e)
        return jsonify({'error': 'Server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)