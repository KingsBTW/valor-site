// Test email sending
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "lukahockey21@gmail.com",
    pass: "lhhgksdalodzmtyt",
  },
})

async function testEmail() {
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Valor License Key</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #0a0a0a;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 30px 0; border-bottom: 2px solid #ff783c;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ff783c;">VALOR</h1>
              <p style="margin: 10px 0 0 0; color: #999; font-size: 16px;">Your Order is Complete!</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #e5e5e5; font-size: 16px; line-height: 1.5;">Hello,</p>
              <p style="margin: 0 0 30px 0; color: #e5e5e5; font-size: 16px; line-height: 1.5;">Thank you for your purchase! Your license key is ready to use.</p>
              
              <!-- License Key Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 2px solid #ff783c; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 30px 20px;">
                    <p style="margin: 0 0 15px 0; color: #999; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">GET YOUR LICENSE KEY</p>
                    <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; color: #ff783c; line-height: 1.6;">Open a ticket in our Discord server to receive your license key</p>
                    <a href="https://discord.gg/valorcheats" style="display: inline-block; background-color: #ff783c; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; margin-top: 10px;">Open Discord Ticket</a>
                    <p style="margin: 20px 0 0 0; color: #999; font-size: 14px;">Lifetime Access</p>
                  </td>
                </tr>
              </table>
              
              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px 0; color: #ff783c; font-size: 20px;">Order Details</h2>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr style="border-bottom: 1px solid #333;">
                        <td style="color: #999; font-size: 14px;">Order Number:</td>
                        <td align="right" style="color: #e5e5e5; font-size: 14px; font-weight: bold;">TEST-12345</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #333;">
                        <td style="color: #999; font-size: 14px;">Product:</td>
                        <td align="right" style="color: #e5e5e5; font-size: 14px; font-weight: bold;">Fortnite Private</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #333;">
                        <td style="color: #999; font-size: 14px;">Duration:</td>
                        <td align="right" style="color: #e5e5e5; font-size: 14px; font-weight: bold;">Lifetime</td>
                      </tr>
                      <tr>
                        <td style="color: #999; font-size: 14px;">Amount Paid:</td>
                        <td align="right" style="color: #10b981; font-size: 14px; font-weight: bold;">$149.99</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px 20px; border-top: 2px solid #333;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">&copy; 2024 Valor. All rights reserved.</p>
              <p style="margin: 0; color: #666; font-size: 14px;">
                <a href="https://valor.com" style="color: #ff783c; text-decoration: none;">Visit Website</a> | 
                <a href="https://discord.gg/valorcheats" style="color: #ff783c; text-decoration: none;">Discord</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    await transporter.sendMail({
      from: '"Valor" <lukahockey21@gmail.com>',
      to: "lukahockey21@gmail.com", // Send to yourself
      subject: "TEST - Your Valor License Key - Order #TEST-12345",
      html: emailHtml,
    })
    console.log("✅ Test email sent! Check lukahockey21@gmail.com")
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

testEmail()
