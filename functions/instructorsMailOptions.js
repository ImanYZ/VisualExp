const { generateUID, capitalizeFirstLetter } = require("./utils");
const { ImanSignatureHTML } = require("./emailSignature");

exports.instMailOptions = (email, topic, prefix, lastname, instructorId, introducedBy, random) => {
  let emailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `Request to Interview for NSF I-Corps Program to Improve Teaching and Learning in  ${topic}`,
    html:
      `
          <p>Hello ${prefix + ". " + capitalizeFirstLetter(lastname)},</p>` +
      (introducedBy ? `<p>Dr. ${introducedBy.fullname} has introduced you to me.</p>` : ``) +
      `<p>My name is Iman YeckehZaare, a PhD candidate at the University of Michigan, School of Information.I’m part of an NSF I-Corps  program where we are investigating difficulties that instructors experience in college education.I’d highly appreciate it if you could give me  1 hour of your time to interview you about your experience and challenges as an instructor this past academic year.</p>
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
      subject: `Collaborate with an NSF I-Corps Research Team to Optimize Teaching and Learning  ${topic}`,
      html: `
            <p>Hello ${prefix + ". " + capitalizeFirstLetter(lastname)},</p>
              <p>We are a research group at the University of Michigan, School of Information, in an NSF Regional program that is committed to developing learning technologies. Our goal is to help instructors who teach large courses that primarily rely on exams for student assessment. We can help by saving your time and improving your student learning outcomes and satisfaction. We have developed <a href="https://1cademy.com">1Cademy.com</a>, an online platform for collaborative learning. Over the past two years, 1Cademy has garnered participation from 1,612 students, representing 194 institutions.</p>
              <p>To learn about your specific challenges, needs, and objectives in depth, we would highly appreciate the opportunity to schedule an hour-long interview at your earliest convenience.Your valuable insights will empower us to tailor 1Cademy to your unique needs, thereby enhancing your teaching efficacy and creating a more impactful learning environment.</p>
              <p>We would like to collaborate with you to provide your courses with 1Cademy Assistant.You can learn about some of its functionalities in the following videos:</p>
              <ul>
              <li><a href="https://youtu.be/Z8aVR459Kks" rel="nofollow">1Cademy Assistant - Question Answering</a></li>
              <li><a href="https://youtu.be/kU6ppO_WLC0" rel="nofollow">1Cademy Assistant - Practice Tool</a></li>
              <li><a href="https://youtu.be/Un6s1rtfZVA" rel="nofollow">1Cademy Assistant - Voice-based Practice</a></li>
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
