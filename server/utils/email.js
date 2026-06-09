const nodemailer = require("nodemailer");

const getTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn("Email not sent: SMTP configuration is missing.");
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    return false;
  }

  const from = process.env.EMAIL_FROM || "Yatri <no-reply@yatri.com>";

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
};

const sendBookingConfirmation = async ({ email, booking }) => {
  if (!email) {
    return false;
  }

  const seatsText = booking.selectedSeats && booking.selectedSeats.length
    ? booking.selectedSeats.join(", ")
    : "Cab booking (no seat selection)";

  const subject = `Yatri Booking Confirmed – ${booking.bookingId}`;
  const text = `Hello ${booking.userName},\n\n` +
    `Your booking is confirmed with the following details:\n` +
    `Booking ID: ${booking.bookingId}\n` +
    `Route: ${booking.source} → ${booking.destination}\n` +
    `Date: ${booking.date}\n` +
    `Seats: ${seatsText}\n` +
    `Total Paid: Rs. ${booking.totalPrice}\n\n` +
    `Thank you for booking with Yatri!\n` +
    `Safe travels.\n`;

  const html = `
    <div style="font-family: sans-serif; color: #333;">
      <h2>Yatri Booking Confirmed</h2>
      <p>Hello ${booking.userName},</p>
      <p>Your booking is confirmed with the following details:</p>
      <ul>
        <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
        <li><strong>Route:</strong> ${booking.source} → ${booking.destination}</li>
        <li><strong>Date:</strong> ${booking.date}</li>
        <li><strong>Seats:</strong> ${seatsText}</li>
        <li><strong>Total Paid:</strong> Rs. ${booking.totalPrice}</li>
      </ul>
      <p>Thank you for booking with <strong>Yatri</strong>!</p>
      <p>Safe travels.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

module.exports = { sendBookingConfirmation };
