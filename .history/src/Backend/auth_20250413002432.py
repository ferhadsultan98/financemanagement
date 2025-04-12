from flask import Flask, request, jsonify
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
cred = credentials.Certificate("src/Backend/finance.json")
initialize_app(cred)
db = firestore.client()

def generate_otp():
    return str(random.randint(100000, 999999))

def send_email(receiver_email, subject, content, html_content):
    sender_email = 'sultanovv988@gmail.com'
    sender_password = 'rbcm tobi aenj untr'

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
                <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">Qeydiyyatınızı tamamlamaq üçün aşağıdakı bir dəfəlik doğrulama kodunu (OTP) istifadə edin:</p>
                <p style="text-align: center; font-size: 32px; font-weight: bold; color: #007bff; margin: 25px 0; background: #f1f8ff; padding: 15px; border-radius: 8px;">
                    {otp}
                </p>
                <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">Bu kod 10 dəqiqə ərzində etibarlıdır. Təhlükəsizlik üçün kodu heç kimsə ilə paylaşmayın.</p>
                <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">{SENDER_NAME} ailəsinə xoş gəlmisiniz! Maliyyə həyatınızı asanlaşdırmaq üçün buradayıq.</p>
                <p style="color: #7f8c8d; text-align: center; margin-top: 30px; font-size: 15px;">Hörmətlə,<br><strong>{SENDER_NAME} Komandası</strong></p>
            </div>
        </body>
        </html>
        """
        if send_email(email, 'Qeydiyyat Doğrulama Kodu', content, html_content):
            return jsonify({'message': 'OTP uğurla göndərildi'}), 200
        else:
            return jsonify({'error': 'OTP göndərilə bilmədi'}), 500
    except Exception as e:
        print("Send OTP error:", e)
        return jsonify({'error': 'Server xətası'}), 500

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    username = data.get('username')
    otp = data.get('otp')

    if not all([username, otp]):
        return jsonify({'error': 'İstifadəçi adı və OTP tələb olunur'}), 400

    try:
        otp_ref = db.collection('otps').document(username)
        otp_doc = otp_ref.get()
        if not otp_doc.exists:
            return jsonify({'error': 'Bu istifadəçi üçün OTP tapılmadı'}), 404

        otp_data = otp_doc.to_dict()
        stored_otp = otp_data.get('otp')
        expires_at = otp_data.get('expires_at')
        email = otp_data.get('email')

        # Firestore Timestamp zaten bir datetime türevi, sadece tzinfo'yu kaldır
        expires_at_naive = expires_at.replace(tzinfo=None)
        current_time = datetime.datetime.utcnow()

        # Zaman karşılaştırması
        if expires_at_naive < current_time:
            otp_ref.delete()
            return jsonify({'error': 'OTP-ın vaxtı bitmişdir'}), 400

        if otp != stored_otp:
            return jsonify({'error': 'Yanlış OTP'}), 400

        # OTP doğrulandı, kaydı sil
        otp_ref.delete()
        return jsonify({
            'message': 'OTP uğurla doğrulandı',
            'email': email
        }), 200

    except Exception as e:
        print(f"Verify OTP error: {str(e)}")
        return jsonify({'error': f'Server xətası: {str(e)}'}), 500

@app.route('/send-welcome', methods=['POST'])
def send_welcome():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({'error': 'İstifadəçi adı, e-poçt və şifrə tələb olunur'}), 400

    try:
        content = (
            f"Hörmətli {username},\n\n"
            f"{SENDER_NAME} ailəsinə xoş gəlmisiniz!\n\n"
            f"Sizin qeydiyyatınız uğurla tamamlandı. Artıq maliyyə dünyasında yeni imkanlar kəşf etməyə hazırsınız!\n\n"
            f"Hesab məlumatlarınız:\n"
            f"İstifadəçi adı: {username}\n"
            f"Şifrə: {password}\n\n"
            f"Bu məlumatları təhlükəsiz saxlayın və heç kimsə ilə paylaşmayın.\n"
            f"Bizimlə maliyyə həyatınızı daha rahat və uğurlu idarə edəcəksiniz. Hər hansı bir sualınız olarsa, dəstək komandamız sizinlədir!\n\n"
            f"Uğurlar arzulayırıq!\n"
            f"Təşəkkürlər,\n{SENDER_NAME} Komandası"
        )
        html_content = f"""
        <html>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #e0eafc, #cfdef3); margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                <h2 style="color: #2c3e50; text-align: center; font-size: 28px; margin-bottom: 20px;">{SENDER_NAME}-ə Xoş Gəlmisiniz!</h2>
                <p style="color: #7f8c8d; font-size: 16px;">Hörmətli {username},</p>
                <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">Sizi {SENDER_NAME} ailəsində görməkdən böyük məmnunluq duyuruq! Qeydiyyatınız uğurla tamamlandı və indi maliyyə dünyasında yeni imkanlar kəşf etməyə hazırsınız.</p>
                <div style="background: #f1f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #2c3e50; font-size: 16px; margin: 0;"><strong>Hesab Məlumatlarınız:</strong></p>
                    <p style="color: #007bff; font-size: 18px; margin: 10px 0;">İstifadəçi adı: {username}</p>
                    <p style="color: #007bff; font-size: 18px; margin: 10px 0;">Şifrə: {password}</p>
                </div>
                <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">Təhlükəsizlik üçün bu məlumatları heç kimsə ilə paylaşmayın. Maliyyə həyatınızı daha effektiv idarə etmək üçün {SENDER_NAME} platforması sizinlədir!</p>
                <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">Hər hansı bir sualınız olarsa, dəstək komandamız hər zaman sizin üçün buradadır.</p>
                <p style="color: #7f8c8d; text-align: center; margin-top: 30px; font-size: 15px;">Uğurlar və maliyyə azadlığı arzulayırıq!<br><strong>{SENDER_NAME} Komandası</strong></p>
            </div>
        </body>
        </html>
        """
        if send_email(email, f'{SENDER_NAME}-ə Xoş Gəlmisiniz!', content, html_content):
            return jsonify({'message': 'Xoş gəldin e-poçtu uğurla göndərildi'}), 200
        else:
            return jsonify({'error': 'Xoş gəldin e-poçtu göndərilə bilmədi'}), 500
    except Exception as e:
        print("Send welcome error:", e)
        return jsonify({'error': 'Server xətası'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)