import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Aapki Details
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "muhammadhelal228@gmail.com"
SENDER_PASSWORD = "upmv xedm hiwq oxod"  # Aapka App Password
RECEIVER_EMAIL = "muhammadhelal228@gmail.com" # Test ke liye khud ko bhejein

def send_test_email():
    try:
        # Email Content Setup
        message = MIMEMultipart()
        message["From"] = SENDER_EMAIL
        message["To"] = RECEIVER_EMAIL
        message["Subject"] = "Python SMTP Test Success! 🚀"
        
        body = "Hello! Agar aapko ye mail mila hai, toh aapka App Password sahi hai."
        message.attach(MIMEText(body, "plain"))

        # Connection Setup
        print("Connecting to server...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls() # Secure connection
        
        print("Logging in...")
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        print("Sending email...")
        server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, message.as_string())
        
        server.quit()
        print("✅ Email successfully sent!")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    send_test_email()