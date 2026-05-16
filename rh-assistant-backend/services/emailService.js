// This is a stub service for sending automated emails.
// In a real app, you would use Nodemailer, SendGrid, or trigger another n8n webhook.

const sendEmail = async ({ to, subject, body }) => {
  console.log('--------------------------------------------------');
  console.log(`Sending Email to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: \n${body}`);
  console.log('--------------------------------------------------');
  
  // TODO: Implement actual email sending logic here (e.g., Nodemailer)
  return true;
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
