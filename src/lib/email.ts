import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || 'bookings@travelstoreturkey.com';
const FROM_NAME = process.env.FROM_NAME || 'TravelStore Turkey';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@travelstoreturkey.com';

interface BookingEmailData {
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: string;
  pickupDate: Date;
  pickupTime: string;
  pickupLocation: string;
  dropoffLocation?: string;
  passengers: number;
  totalPrice: number;
  currency: string;
  specialRequests?: string;
  tourName?: string;
}

// Format currency
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('is-IS', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Get booking type label
function getBookingTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    TAXI: 'Taxi Service',
    AIRPORT_TRANSFER: 'Airport Transfer',
    PRIVATE_TOUR: 'Private Tour',
    CUSTOM_TOUR: 'Custom Tour',
  };
  return labels[type] || type;
}

// Customer booking confirmation email
export async function sendBookingConfirmation(booking: BookingEmailData): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #facc15; margin: 0; font-size: 24px;">TravelStore Turkey</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0;">Booking Confirmation</p>
      </div>

      <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
        <p style="font-size: 18px; margin-bottom: 20px;">Dear <strong>${booking.customerName}</strong>,</p>

        <p>Thank you for booking with TravelStore Turkey! Your reservation has been confirmed.</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #facc15;">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 18px;">Booking Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Booking Number:</td>
              <td style="padding: 8px 0; font-weight: bold;">${booking.bookingNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Service:</td>
              <td style="padding: 8px 0;">${getBookingTypeLabel(booking.type)}${booking.tourName ? ` - ${booking.tourName}` : ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Date:</td>
              <td style="padding: 8px 0;">${formatDate(booking.pickupDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Pickup Time:</td>
              <td style="padding: 8px 0;">${booking.pickupTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Pickup Location:</td>
              <td style="padding: 8px 0;">${booking.pickupLocation}</td>
            </tr>
            ${booking.dropoffLocation ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Drop-off Location:</td>
              <td style="padding: 8px 0;">${booking.dropoffLocation}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Passengers:</td>
              <td style="padding: 8px 0;">${booking.passengers}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 12px 0 8px; color: #64748b; font-size: 16px;">Total Amount:</td>
              <td style="padding: 12px 0 8px; font-weight: bold; font-size: 18px; color: #16a34a;">${booking.type === 'TAXI' ? 'Metered Rate' : formatCurrency(booking.totalPrice, booking.currency)}</td>
            </tr>
          </table>
        </div>

        ${booking.specialRequests ? `
        <div style="background: #fefce8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #854d0e;">Special Requests:</strong>
          <p style="margin: 5px 0 0 0; color: #713f12;">${booking.specialRequests}</p>
        </div>
        ` : ''}

        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">What's Next?</h3>
          <ul style="color: #15803d; margin: 0; padding-left: 20px;">
            <li>Your driver will arrive at the pickup location at the scheduled time</li>
            <li>Look for a vehicle with "TravelStore Turkey" signage</li>
            <li>Your driver will contact you if there are any changes</li>
          </ul>
        </div>

        <p style="margin-top: 30px;">If you have any questions or need to modify your booking, please contact us:</p>
        <p style="margin: 5px 0;">
          <strong>Phone:</strong> +90 530 123 45 67<br>
          <strong>Email:</strong> info@travelstoreturkey.com
        </p>

        <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
          We look forward to providing you with an amazing Turkey experience!
        </p>
      </div>

      <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">
          TravelStore Turkey | Istanbul, Turkey<br>
          <a href="https://travelstoreturkey.com" style="color: #facc15;">www.travelstoreturkey.com</a>
        </p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: booking.customerEmail,
    subject: `Booking Confirmation - ${booking.bookingNumber}`,
    html,
  });
}

// Admin notification email
export async function sendAdminBookingNotification(booking: BookingEmailData): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Booking Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #facc15; margin: 0; font-size: 20px;">New Booking Received</h1>
      </div>

      <div style="background: #f8fafc; padding: 25px; border: 1px solid #e2e8f0;">
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #facc15;">
          <h2 style="margin-top: 0; font-size: 16px; color: #1e293b;">Booking #${booking.bookingNumber}</h2>

          <h3 style="color: #64748b; font-size: 14px; margin-bottom: 5px;">Customer Details</h3>
          <p style="margin: 0 0 15px 0;">
            <strong>${booking.customerName}</strong><br>
            ${booking.customerEmail}<br>
            ${booking.customerPhone}
          </p>

          <h3 style="color: #64748b; font-size: 14px; margin-bottom: 5px;">Service Details</h3>
          <p style="margin: 0 0 15px 0;">
            <strong>${getBookingTypeLabel(booking.type)}</strong>${booking.tourName ? ` - ${booking.tourName}` : ''}<br>
            Date: ${formatDate(booking.pickupDate)} at ${booking.pickupTime}<br>
            Pickup: ${booking.pickupLocation}<br>
            ${booking.dropoffLocation ? `Drop-off: ${booking.dropoffLocation}<br>` : ''}
            Passengers: ${booking.passengers}
          </p>

          ${booking.specialRequests ? `
          <h3 style="color: #64748b; font-size: 14px; margin-bottom: 5px;">Special Requests</h3>
          <p style="margin: 0 0 15px 0; background: #fefce8; padding: 10px; border-radius: 4px;">${booking.specialRequests}</p>
          ` : ''}

          <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 15px;">
            <strong style="font-size: 18px; color: #16a34a;">${booking.type === 'TAXI' ? 'Metered Rate' : formatCurrency(booking.totalPrice, booking.currency)}</strong>
          </div>
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings" style="display: inline-block; background: #facc15; color: #1e293b; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View in Admin Panel
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `New Booking: ${booking.bookingNumber} - ${booking.customerName}`,
    html,
  });
}

// Payment confirmation email
export async function sendPaymentConfirmation(booking: BookingEmailData): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
        <h1 style="color: white; margin: 0; font-size: 24px;">Payment Successful</h1>
      </div>

      <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
        <p style="font-size: 18px; margin-bottom: 20px;">Dear <strong>${booking.customerName}</strong>,</p>

        <p>Your payment has been successfully processed. Your booking is now confirmed!</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Booking Number:</td>
              <td style="padding: 8px 0; font-weight: bold;">${booking.bookingNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Amount Paid:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #16a34a;">${formatCurrency(booking.totalPrice, booking.currency)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Service Date:</td>
              <td style="padding: 8px 0;">${formatDate(booking.pickupDate)}</td>
            </tr>
          </table>
        </div>

        <p style="color: #64748b; font-size: 14px;">
          A separate booking confirmation email has been sent with all the details of your reservation.
        </p>

        <p style="margin-top: 30px;">
          Thank you for choosing TravelStore Turkey!
        </p>
      </div>

      <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">
          TravelStore Turkey | Istanbul, Turkey
        </p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: booking.customerEmail,
    subject: `Payment Confirmed - ${booking.bookingNumber}`,
    html,
  });
}

// Generic send email utility
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
}

// Password reset email
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #facc15; margin: 0; font-size: 24px;">TravelStore Turkey</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0;">Password Reset Request</p>
      </div>
      <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
        <p>You requested a password reset for your admin account. Click the button below to reset your password.</p>
        <p>This link expires in <strong>1 hour</strong>. If you did not request a password reset, ignore this email.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #facc15; color: #1e293b; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px;">Or copy this link: <a href="${resetUrl}" style="color: #3b82f6;">${resetUrl}</a></p>
      </div>
      <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">TravelStore Turkey | Istanbul, Turkey</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: 'Password Reset - TravelStore Turkey Admin',
    html,
  });
}

// Reply to a customer message
export async function sendMessageReply(
  to: string,
  subject: string,
  replyBody: string,
  originalMessage: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #facc15; margin: 0; font-size: 24px;">TravelStore Turkey</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0;">Reply to your inquiry</p>
      </div>
      <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
        <div style="white-space: pre-wrap; font-size: 15px; color: #1e293b; margin-bottom: 30px;">${replyBody}</div>
        <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
          <p style="font-size: 13px; color: #64748b; margin-bottom: 10px;">--- Original message ---</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 13px; color: #475569; white-space: pre-wrap;">${originalMessage}</div>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
          Need further assistance? Contact us at <a href="mailto:info@travelstoreturkey.com" style="color: #3b82f6;">info@travelstoreturkey.com</a> or call +90 530 123 45 67.
        </p>
      </div>
      <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">TravelStore Turkey | Istanbul, Turkey</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
}

// Export a test function
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email connection failed:', error);
    return false;
  }
}
