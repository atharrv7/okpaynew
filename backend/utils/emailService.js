const nodemailer = require('nodemailer');

// Reuse transporter so we don't recreate it every time
let transporter = null;
let senderEmail = process.env.EMAIL_USER;

const getTransporter = async () => {
    if (transporter) return transporter;

    const { EMAIL_USER, EMAIL_APP_PASSWORD } = process.env;
    
    if (!EMAIL_USER || !EMAIL_APP_PASSWORD) {
        console.warn("Mail credentials are not configured in .env. Falling back to Ethereal test account.");
        try {
            const testAccount = await nodemailer.createTestAccount();
            senderEmail = testAccount.user;
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, 
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            return transporter;
        } catch (error) {
            console.error("Error creating ethereal account:", error);
            return null;
        }
    }

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_APP_PASSWORD,
        },
    });

    return transporter;
};

const sendMoneyRequestEmail = async ({ receiverEmail, amount, note, senderName }) => {
    const mailTransporter = await getTransporter();
    
    if (!mailTransporter) {
        throw new Error("Mail is not configured on the server, and fallback failed.");
    }

    const mailOptions = {
        from: `"OKPAY Send Request" <${senderEmail}>`,
        to: receiverEmail,
        subject: `${senderName} is requesting ₹${amount} on OKPAY`,
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f5f7; padding: 20px;">
                <div style="max-w: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <h2 style="color: #020817; margin-bottom: 20px;">Payment Request</h2>
                    <p style="color: #333; font-size: 16px;">Hello,</p>
                    <p style="color: #333; font-size: 16px;"><strong>${senderName}</strong> has requested a payment from you.</p>
                    
                    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <span style="display: block; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Amount Requested</span>
                        <span style="display: block; color: #06b6d4; font-size: 36px; font-weight: bold; margin-top: 5px;">₹${amount}</span>
                    </div>
                    
                    ${note ? `<p style="color: #64748b; font-size: 14px; font-style: italic;"><strong>Note:</strong> "${note}"</p>` : ''}
                    
                    <p style="color: #333; font-size: 16px; margin-top: 30px;">Please open your OKPAY app to fulfill this request.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated request from OKPAY.</p>
                </div>
            </div>
        `
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
};

module.exports = {
    sendMoneyRequestEmail
};
