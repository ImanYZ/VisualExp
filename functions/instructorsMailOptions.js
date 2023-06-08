const { generateUID, capitalizeFirstLetter } = require("./utils");
const { signatureHTML } = require("./emailSignature");

exports.instMailOptions = (email, topic, prefix, lastname, instructorId, random) => {
  if (random === 0) {
    return {
      from: process.env.EMAIL,
      to: email,
      subject: `Partner with an NSF I-Corps Research Team to Optimize Teaching and Learning  ${topic}`,
      html: `
            <p>Hello ${prefix + ". " + capitalizeFirstLetter(lastname)},</p>
              <p>We are a research group at the University of Michigan, School of Information, in an NSF I-Corps program that is committed to developing learning and research technologies. Our goal is to help instructors like you by saving your time and improving your student learning outcomes and satisfaction. We have developed <a href="https://1cademy.com">1Cademy.com, </a>, an online platform for collaborative learning and studying. Over the past two years, 1Cademy has garnered participation from 1,612 students, representing 194 institutions.
              </p>
              <p>To learn about your specific challenges, needs, and objectives in depth, we would highly appreciate the opportunity to schedule a 30-minute interview at your earliest convenience. Your valuable insights will empower us to tailor 1Cademy to your unique needs, thereby enhancing your teaching efficacy and creating a more impactful learning environment.</p>
              <p>We would like to partner with you to provide your courses with 1Cademy Assistant. You can learn about some of its functionalities in the following videos:</p>
              <ul>
              <li><a href="https://youtu.be/Z8aVR459Kks" rel="nofollow">Introducing 1Cademy Assistant - Question Answering</a></li>
              <li><a href="https://youtu.be/kU6ppO_WLC0" rel="nofollow">Introducing 1Cademy Assistant - Practice Tool</a></li>
              <li><a href="https://youtu.be/Un6s1rtfZVA" rel="nofollow">Introducing 1Cademy Assistant - Voice-based Practice</a></li>
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
              ${signatureHTML}
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
  return {
    from: process.env.EMAIL,
    to: email,
    subject: `Request to Interview for NSF I-Corps Program to Improve Teaching and Learning in  ${topic}`,
    html: `
          <p>Hello ${prefix + ". " + capitalizeFirstLetter(lastname)},</p>
            <p>My name is Iman YeckehZaare, a PhD candidate at the University of Michigan, School of Information.I’m part of an NSF I-Corps  program where we are investigating difficulties that instructors experience in college education. I’d highly appreciate it if you could give me 30 minutes of your time to interview you about your experience and challenges as an instructor this past academic year.</p>
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
            <p>--</p>

            <p>Iman YeckehZaare </p>
            <p>Ph.D. Candidate</p>
            <p>University of Michigan School of Information</p>
            <p>Outstanding Graduate Student Instructor of the Year 2018-2019</p>
            <p>NSF I-Corps Program Member</p>
            <img src="https://1cademy.us/api/loadImage/professor/${
              // For tracking when they open their email.
              // Note that the email clients that cache emails like those on iPad or Outlook open the content
              // of the emails without the user's knowlege, so those would be false positives for us.
              instructorId + "/" + generateUID()
            }"
            data-os="https://drive.google.com/uc?id=1H4mlCx7BCxIvewNtUwz5GmdVcLnqIr8L&amp;export=download"
            width="420" height="37"><br></div></div></div>`
  };
};