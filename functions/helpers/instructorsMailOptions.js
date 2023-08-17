const { generateUID, capitalizeFirstLetter } = require("../utils");
const { ImanSignatureHTML } = require("../emailSignature");

exports.instMailOptions = (email, topic, prefix, lastname, instructorId, introducedBy, random) => {
  let emailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `Request to Interview for NSF I-Corps Program to Improve Teaching and Learning in  ${topic}`,
    html:
      `
          <p>Hello ${prefix + ". " + capitalizeFirstLetter(lastname)},</p>` +
      (introducedBy ? `<p>Dr. ${introducedBy.fullname} has introduced you to me.</p>` : ``) +
      `<p>My name is Iman YeckehZaare, a PhD candidate at the University of Michigan, School of Information. I’m part of an NSF I-Corps program where we are investigating difficulties that instructors experience in college education. I’d highly appreciate it if you could give me 1 hour of your time to interview you about your experience and challenges as an instructor this past academic year.</p>
            <p>To schedule an appointment, please click the first link or directly reply to this email.</p>
            <ul>
              <li><a href="https://1cademy.us/ScheduleInstructorSurvey/${
                // These are all sending requests to the client side.
                instructorId
              }" target="_blank">Yes, let's schedule.</a></li>
              <li><a href="https://1cademy.us/notInterestedFaculty/${
                // These are all sending requests to the client side.
                instructorId
              }" target="_blank"> No, do not contact me again.</a></li>
              <li><a href="https://1cademy.us/interestedFacultyLater/${
                // These are all sending requests to the client side.
                instructorId
              }" target="_blank">Not at this point, contact me in a few weeks.</a></li>
            </ul>
            <p></p>
            <p>Best regards,</p>
            ${ImanSignatureHTML}
            <img src="https://1cademy.us/api/loadImage/professor/${
              // For tracking when they open their email.
              // Note that the email clients that cache emails like those on iPad or Outlook open the content
              // of the emails without the user's knowlege, so those would be false positives for us.
              instructorId + "/" + generateUID()
            }"
            data-os="https://drive.google.com/uc?id=1H4mlCx7BCxIvewNtUwz5GmdVcLnqIr8L&amp;export=download"
            width="420" height="37"><br></div></div></div>`
  };
  if (random === 0 && !introducedBy) {
    emailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: `Offering our AI-Driven Services to Optimize Teaching  ${topic}`,
      html: `
            <p>Hello ${prefix + ". " + capitalizeFirstLetter(lastname)},</p>
              <p>We are a research team and the University of Michigan, School of Information, and are committed to developing learning technologies that save your time and improve your students’ learning outcomes and satisfaction. We have developed 1Cademy.com, an online platform for collaborative learning. Over the past two years, <a href="https://1cademy.com">1Cademy.com</a> has garnered participation from 1,720 students, representing 210 institutions in online research communities.</p>
              <p>We would appreciate the opportunity to schedule an hour-long interview at your earliest convenience to receive your feedback on the tools we have developed for students and instructors. We would like to know if you would consider our tools an asset for your students and yourself, and how they could be improved. Your valuable insights will empower us to tailor 1Cademy to your unique needs, thereby enhancing teaching efficacy and creating a more optimized learning environment.</p>
              <p>Also, we would like to collaborate with you to provide your courses with 1Cademy AI Assistant. You can learn about some of its functionalities in the following videos:</p>
              <ul>
              <li><a href="https://youtu.be/Z8aVR459Kks" rel="nofollow">1Cademy Assistant - Question Answering</a></li>
              <li><a href="https://youtu.be/kU6ppO_WLC0" rel="nofollow">1Cademy Assistant - Practice Tool</a></li>
              <li><a href="https://youtu.be/uj8fqLV-S1M" rel="nofollow">1Cademy AI-Assisted Grading Conceptual & Essay Questions/a></li>
              <li><a href="https://youtu.be/E2ClCIX9g0g" rel="nofollow">1Cademy Auto-graded Assignments and Exams</a></li>
              <li><a href="https://youtu.be/9vWGSEBf8WQ" rel="nofollow">1Cademy Instructor and Student Dashboards</a></li>
              </ul>
              
              <p>To schedule an appointment, please click the first link or directly reply to this email.</p>
              <ul>
                <li><a href="https://1cademy.us/ScheduleInstructorSurvey/${
                  // These are all sending requests to the client side.
                  instructorId
                }" target="_blank">Yes, let's schedule.</a></li>
                <li><a href="https://1cademy.us/notInterestedFaculty/${
                  // These are all sending requests to the client side.
                  instructorId
                }" target="_blank"> No, do not contact me again.</a></li>
                <li><a href="https://1cademy.us/interestedFacultyLater/${
                  // These are all sending requests to the client side.
                  instructorId
                }" target="_blank">Not at this point, contact me in a few weeks.</a></li>
              </ul>
              <p></p>
              <p>Best regards,</p>
              ${ImanSignatureHTML}
              <img src="https://1cademy.us/api/loadImage/professor/${
                // For tracking when they open their email.
                // Note that the email clients that cache emails like those on iPad or Outlook open the content
                // of the emails without the user's knowlege, so those would be false positives for us.
                instructorId + "/" + generateUID()
              }"
              data-os="https://drive.google.com/uc?id=1H4mlCx7BCxIvewNtUwz5GmdVcLnqIr8L&amp;export=download"
              width="420" height="37"><br></div></div></div>`
    };
  }
  return emailOptions;
};
