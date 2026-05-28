const nodemailer = require('nodemailer');

// We use Ethereal as a testing SMTP service since real credentials aren't provided.
// Ethereal automatically catches emails so we can test without spamming real addresses.
const sendEmail = async ({ to, subject, body }) => {
  try {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    const info = await transporter.sendMail({
      from: '"RH Assistant" <noreply@rh-assistant.com>', // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: body, // plain text body
    });

    console.log('--------------------------------------------------');
    console.log(`Email Sent!`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    console.log('--------------------------------------------------');

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

exports.sendRejectionEmail = async (candidateEmail, candidateName, jobTitle) => {
  const subject = `Update regarding your application for ${jobTitle}`;
  const body = `Dear ${candidateName},\n\nThank you for applying for the ${jobTitle} position. Unfortunately, we will not be moving forward with your application at this time.\n\nBest regards,\nHR Team`;
  await sendEmail({ to: candidateEmail, subject, body });
};

exports.sendInterviewInvite = async (candidateEmail, candidateName, jobTitle, dateStr) => {
  const subject = `Interview Invitation: ${jobTitle}`;
  const body = `Dear ${candidateName},\n\nWe are pleased to invite you to an interview for the ${jobTitle} position on ${dateStr}.\n\nPlease let us know if this time works for you.\n\nBest regards,\nHR Team`;
  await sendEmail({ to: candidateEmail, subject, body });
};
