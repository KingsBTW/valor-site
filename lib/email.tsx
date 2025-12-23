import { createClient } from "@supabase/supabase-js"
import nodemailer from "nodemailer"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPurchaseConfirmationEmail({
  customerEmail,
  orderNumber,
  productName,
  variantName,
  licenseKey,
  expiresAt,
  amount,
}: {
  customerEmail: string
  orderNumber: string
  productName: string
  variantName: string
  licenseKey: string
  expiresAt: string | null
  amount: number
}) {
  try {
    const expiryText = expiresAt
      ? `Expires: ${new Date(expiresAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`
      : "Lifetime Access"

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
                    <p style="margin: 20px 0 0 0; color: #999; font-size: 14px;">${expiryText}</p>
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
                        <td align="right" style="color: #e5e5e5; font-size: 14px; font-weight: bold;">${orderNumber}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #333;">
                        <td style="color: #999; font-size: 14px;">Product:</td>
                        <td align="right" style="color: #e5e5e5; font-size: 14px; font-weight: bold;">${productName}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #333;">
                        <td style="color: #999; font-size: 14px;">Duration:</td>
                        <td align="right" style="color: #e5e5e5; font-size: 14px; font-weight: bold;">${variantName}</td>
                      </tr>
                      <tr>
                        <td style="color: #999; font-size: 14px;">Amount Paid:</td>
                        <td align="right" style="color: #10b981; font-size: 14px; font-weight: bold;">$${(amount / 100).toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Next Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px 0; color: #ff783c; font-size: 20px;">Next Steps</h2>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 12px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="40" valign="top">
                                <div style="width: 30px; height: 30px; background-color: #ff783c; color: #fff; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold;">1</div>
                              </td>
                              <td style="color: #e5e5e5; font-size: 14px; line-height: 1.6;">Join our Discord server using the button above</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="40" valign="top">
                                <div style="width: 30px; height: 30px; background-color: #ff783c; color: #fff; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold;">2</div>
                              </td>
                              <td style="color: #e5e5e5; font-size: 14px; line-height: 1.6;">Open a ticket with your order number: ${orderNumber}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="40" valign="top">
                                <div style="width: 30px; height: 30px; background-color: #ff783c; color: #fff; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold;">3</div>
                              </td>
                              <td style="color: #e5e5e5; font-size: 14px; line-height: 1.6;">Our team will provide your license key within minutes</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="40" valign="top">
                                <div style="width: 30px; height: 30px; background-color: #ff783c; color: #fff; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold;">4</div>
                              </td>
                              <td style="color: #e5e5e5; font-size: 14px; line-height: 1.6;">Download the loader and activate your product</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Discord Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://discord.gg/valorcheats" style="display: inline-block; background-color: #ff783c; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">Open Discord Ticket Now</a>
                  </td>
                </tr>
              </table>
              
              <!-- Help Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 20px; background-color: #1a1a1a; border-radius: 8px;">
                    <p style="margin: 0 0 10px 0; color: #e5e5e5; font-size: 14px; font-weight: bold;">Important: Save Your Order Number</p>
                    <p style="margin: 0; color: #999; font-size: 14px; line-height: 1.6;">Your order number is <strong style="color: #ff783c;">${orderNumber}</strong>. You'll need this when opening a ticket in Discord to receive your license key.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px 20px; border-top: 2px solid #333;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">&copy; ${new Date().getFullYear()} Valor. All rights reserved.</p>
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

    // Send email via SMTP if configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: `"Valor" <${process.env.SMTP_USER}>`,
          to: customerEmail,
          subject: `Your Valor License Key - Order #${orderNumber}`,
          html: emailHtml,
        })
        console.log("[Email] ✅ Email sent successfully to:", customerEmail)
      } catch (smtpError) {
        console.error("[Email] SMTP error:", smtpError)
      }
    } else {
      console.log("[Email] ⚠️ SMTP not configured, email not sent")
    }

    // Store email in Supabase
    const { error: dbError } = await supabase.from("emails_sent").insert({
      to_email: customerEmail,
      subject: `Your Valor License Key - Order #${orderNumber}`,
      html_content: emailHtml,
      sent_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error("[Email] Error logging email to database:", dbError)
    }

    console.log("[Email] Order:", orderNumber)
    console.log("[Email] License Key:", licenseKey)
    
    return { success: true, message: "Email sent successfully" }
  } catch (error) {
    console.error("[Email] Error:", error)
    return { success: false, error }
  }
}

