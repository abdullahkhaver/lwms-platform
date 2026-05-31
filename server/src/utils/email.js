// Email utility for sending notifications
// This is a placeholder - integrate with your email service (Nodemailer, SendGrid, etc.)

export const sendComplaintEmail = async (complaint) => {
  try {
    // TODO: Integrate with email service
    // Example with Nodemailer:
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.LWMS_ADMIN_EMAIL,
      subject: `New Complaint Submitted - ID: ${complaint.trackingId}`,
      html: `
        <h2>New Waste Management Complaint</h2>
        <p><strong>Tracking ID:</strong> ${complaint.trackingId}</p>
        <p><strong>Name:</strong> ${complaint.name}</p>
        <p><strong>Phone:</strong> ${complaint.phone}</p>
        <p><strong>Address:</strong> ${complaint.address}</p>
        <p><strong>Description:</strong> ${complaint.description}</p>
        <p><strong>Status:</strong> ${complaint.status}</p>
        <p><strong>Submitted:</strong> ${new Date(complaint.createdAt).toLocaleString()}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    */

    console.log(`Complaint email would be sent for tracking ID: ${complaint.trackingId}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendStatusUpdateEmail = async (complaint, userEmail) => {
  try {
    // TODO: Integrate with email service
    console.log(
      `Status update email would be sent to ${userEmail} for tracking ID: ${complaint.trackingId}`
    );
    return true;
  } catch (error) {
    console.error("Error sending status update email:", error);
    throw error;
  }
};
