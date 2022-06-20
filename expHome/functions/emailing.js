const { admin, db, storage, batchUpdate, commitBatch } = require("./admin");

const nodemailer = require("nodemailer");

const { deleteEvent } = require("./GoogleCalendar");

const {
  getFullname,
  generateUID,
  nextWeek,
  capitalizeFirstLetter,
} = require("./utils");

const { signatureHTML } = require("./emailSignature");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILPASS,
  },
});

// To personalize the email tracking links, we need to inclue the fullname as a part of the URL.
// Also, we're using fullname as id in some Firestore collections.
// For these purposes, we need to escape some characters.
const getFullnameURI = (firstname, lastname) => {
  return (firstname + "+" + lastname)
    .replace(" ", "+") // For URI
    .replace(".", "") // For Firestore
    .replace("__", " ") // For Firestore
    .replace("/", " "); // For Firestore
};

// Return the UMSI logo as a response stream.
const loadUmichLogo = (res) => {
  const file = storage
    .bucket("visualexp-a7d2c.appspot.com")
    .file("UMSI_Logo.png");
  let readStream = file.createReadStream();

  res.setHeader("content-type", "image/png");
  readStream.pipe(res);
};

// When an individual opens their email, we should log it in contacts collection.
const emailOpenedIndividual = async (fullname) => {
  const contactRef = db.collection("contacts").doc(fullname);
  await contactRef.update({
    openedEmail: admin.firestore.Timestamp.fromDate(new Date()),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
  });
};

// When an individual opens their email, we should:
// 1) Log it in contacts collection
// 2) Return the UMSI logo as a response stream.
exports.loadImageIndividual = (req, res) => {
  let fullname = req.params.contactId.replace("+", " ");
  emailOpenedIndividual(fullname);
  loadUmichLogo(res);
};

// When an instructor opens their email, we should log it in instructors collection.
const emailOpenedInstructor = async (instructorId) => {
  const contactRef = db.collection("instructors").doc(instructorId);
  await contactRef.update({
    openedEmail: admin.firestore.Timestamp.fromDate(new Date()),
    updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
  });
};

// When an instructor opens their email, we should:
// 1) Log it in instructors collection
// 2) Return the UMSI logo as a response stream.
exports.loadImageProfessor = (req, res) => {
  emailOpenedInstructor(req.params.instructorId);
  loadUmichLogo(res);
};

// Deprecated
// This function was used to invite 1Cademy interns to paricipate in our experiments.
// The basic algoritm is very similar to inviteInstructors, but instead of the
// instructors collection, it reads from contacts.
exports.sendPersonalInvitations = async (req, res) => {
  try {
    const contactDocs = await db.collection("contacts").get();
    let contactIdx = 0;
    let contactDoc;
    const emailInterval = setInterval(async () => {
      if (contactIdx < contactDocs.docs.length) {
        contactDoc = contactDocs.docs[contactIdx];
        contactIdx += 1;
        const {
          firstname,
          lastname,
          email,
          from1Cademy,
          emailSent,
          openedEmail,
          reminders,
        } = contactDoc.data();
        console.log({ firstname, lastname, emailSent, openedEmail, reminders });
        if (!emailSent || (!openedEmail && (!reminders || reminders < 3))) {
          const fullname = getFullname(firstname, lastname);
          const userDoc = await db.collection("users").doc(fullname).get();
          if (!userDoc.exists) {
            console.log({ firstname, lastname, from1Cademy });
            const mailOptions = {
              from: process.env.EMAIL,
              to: email,
              subject: from1Cademy
                ? "Help Improve 1Cademy by Participating in Our UX Research Study!"
                : "Learn Which Knowledge Visualization Method is Better For You by Participating in Our UX Experiment!",
              html: `<p>Hi ${capitalizeFirstLetter(firstname)},</p>
                <p></p>
                ${
                  from1Cademy
                    ? "<p>We need your help with improving the design of 1Cademy by participating in our UX research online experiment. I'd appreciate it if you let me know your first availability ASAP so that I can match you with one of our UX researchers to schedule the sessions. "
                    : "<p>We are a group of UX researchers at the University of Michigan, School of Information.</p><p>We need your help with participating in our experiment to learn how to better design knowledge visualization to improve reading comprehension and learning. "
                }
                The experiment will be in three sessions:</p>
                <ul>
                <li>
                1<sup>st</sup> session for an hour
                </li>
                <li>
                2<sup>nd</sup> session, 3 days later, for 30 minutes
                </li>
                <li>
                3<sup>rd</sup> session, 1 week later, for 30 minutes
                </li>
                </ul>
                <p>Please create an account and fill out your availability in <a href="https://visualexp1.web.app" target="_blank">our scheduling website</a>.</p>
                ${
                  from1Cademy
                    ? "<p>Also, please turn on your notifications on Microsoft Teams to better collaborate with the community.</p>"
                    : ""
                }
                <p></p>
                <p>Best regards,</p>
                <br>-- <br><div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature"><div dir="ltr"><div><span style="font-family:Arial,Helvetica,sans-serif;font-style:normal;font-weight:normal;letter-spacing:normal;text-align:start;text-indent:0px;text-transform:none;white-space:normal;word-spacing:0px;text-decoration:none;color:rgb(102,102,102)"><img src="https://ci3.googleusercontent.com/mail-sig/AIorK4w7H_RAY7i2tZlCbQFzUtOTVBnQeAR7ux4pYFodxivEpW9gcO9n3PRiYVBWSYjiTNpx5Kaw9C4" data-os="https://drive.google.com/uc?id=1WH0cEF5s8kMl8BnIDEWBI2wdgr0Ea01O&amp;export=download" width="87" height="96"></span> Collaboratively Learn, Research, Summarize, Visualize, and Evaluate</div><div><b><a href="https://youtu.be/-dQOuGeu0IQ" target="_blank">Liaison Librarians</a> </b>- Ben Brown, Grace Ramstad, Sarah Licht, Viktoria Roshchin<br></div><a href="https://youtu.be/B6q-LYXvNCg" target="_blank"><b>UX Research in Cognitive Psychology of Learning</b></a> - Iman YeckehZaare<br><div><b><a href="https://youtu.be/ImoaKx7uoII" target="_blank">Social/Political Psychology</a></b> - Alex Nikolaidis Konstas, Talia Gillespie</div><div><div><b><a href="https://youtu.be/tmW31AEJRYg" target="_blank">Organization/Educational Psychology</a> - </b>Desiree Mayrie Comer<b><br></b></div><a href="https://youtu.be/B6q-LYXvNCg" target="_blank"><b></b></a><b></b></div><div><a href="https://youtu.be/gJUMN4vIxN4" target="_blank"><b>Health Psychology</b></a> - Jolie Safier Smith, Madeline Paige Jacoby<b><br></b></div><div><a href="https://youtu.be/J0y0tZzzuQ0" target="_blank"><b>Machine Learning (Deep learning) </b></a>- Ge Zhang, Xinrong Yao<br></div><div><b><a href="https://youtu.be/Mj45B59k4fo" target="_blank">Neuroscience Research</a></b> - Amrit Das Pradhan<b></b></div><div><b><a href="https://youtu.be/K5R17uFWINo" target="_blank">Clinical Psychology</a></b> - Victoria Mulligan</div><div><div><a href="https://youtu.be/Xaa1JnTHtSY" target="_blank"><b>Positive Psychology</b></a> - Noor Jassim</div></div><div><a href="https://youtu.be/otW11GyQ4dY" target="_blank"><b>Disability Studies</b></a> - Rishabh Verma<br></div><b><a href="https://youtu.be/K5R17uFWINo" target="_blank"></a></b><b>R&amp;D</b> - Iman YeckehZaare<br><div><a href="https://www.youtube.com/channel/UCKBqMjvnUrxOhfbH1F1VIdQ/playlists" target="_blank">YouTube Channel</a></div><div>
                <img src="https://1cademy.us/api/loadImage/individual/${
                  getFullnameURI(firstname, lastname) + "/" + generateUID()
                }"
                width="420" height="37"><br></div></div></div>`,
            };
            transporter.sendMail(mailOptions, async (error, data) => {
              if (error) {
                console.log({ error });
                return res.status(500).json({ error });
              } else {
                const contactRef = db.collection("contacts").doc(contactDoc.id);
                if (!reminders) {
                  await contactRef.update({
                    emailSent: admin.firestore.Timestamp.fromDate(new Date()),
                    reminders: 0,
                  });
                } else {
                  await contactRef.update({
                    emailSent: admin.firestore.Timestamp.fromDate(new Date()),
                    reminders: reminders + 1,
                  });
                }
              }
            });
          }
        }
      } else {
        clearInterval(emailInterval);
      }
    }, Math.random() * 10000);
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
  return res.status(200).json({ done: true });
};

// Every time we make changes to the major communities, we should modify this object.
// This is the only dictionary in the backend that maps community id and titles.
const communityTitles = {
  Cognitive_Psychology: "UX Research in Cognitive Psychology of Learning",
  Educational_Organizational_Psychology:
    "Educational/Organizational Psychology",
  Clinical_Psychology: "Clinical Psychology",
  Mindfulness: "Mindfulness",
  Health_Psychology: "Health Psychology",
  Neuroscience: "Neuroscience",
  Disability_Studies: "Disability Studies",
  Social_Political_Psychology: "Social/Political Psychology",
  // Cryptoeconomics: "Cryptoeconomics",
  Deep_Learning: "Deep Learning",
  Liaison_Librarians: "Liaison Librarians",
};

// This should be called by a pubsub scheduler every 25 hours.
// It reads all the documents from the instructors collection.
// For each of them that meet the criteria, randomizes them into one of
// our experimental conditions and sends them personalized invitation
// and reminder emails.
// The algorithm is explained at emailing.drawio
exports.inviteInstructors = async (req, res) => {
  try {
    // We don't want to send many emails at once, because it may drive Gmail crazy.
    // waitTime keeps increasing for every email that should be sent and in a setTimeout
    // postpones sending the next email until the next waitTime.
    let waitTime = 0;
    const instructorDocs = await db.collection("instructors").get();
    for (let instructorDoc of instructorDocs.docs) {
      const instructorData = instructorDoc.data();
      if (
        // Only those instructors whose information is verified by at least 3 other researchers.
        instructorData.upVotes - instructorData.downVotes >= 3 &&
        // We have not sent them any emails or less than 4 reminders
        (!instructorData.reminders || instructorData.reminders < 4) &&
        // Their next reminder is not scheduled yet, or it should have been sent before now.
        (!instructorData.nextReminder ||
          instructorData.nextReminder.toDate().getTime() <
            new Date().getTime()) &&
        // They have not already clicked any of the options in their email.
        !instructorData.yes &&
        !instructorData.no &&
        !instructorData.introduced &&
        // There exists a community corresponding to the one wechose for them.
        instructorData.major in communityTitles
      ) {
        let minCondition,
          minCondNum = -1;
        if (instructorData.condition) {
          minCondition = instructorData.condition;
        } else {
          // To assign an experimental condition to this instructor, we have to find
          // the condition that is assigned to the fewest number of instructors so far.
          let instructorConditionsDocs = await db
            .collection("instructorConditions")
            .get();
          instructorConditionsDocs = instructorConditionsDocs.docs;
          minCondNum = instructorConditionsDocs[0].data().num;
          minCondition = instructorConditionsDocs[0].id;
          for (let instructorConditionDoc of instructorConditionsDocs) {
            let instructorConditionData = instructorConditionDoc.data();
            if (instructorConditionData.num < minCondNum) {
              minCondNum = instructorConditionData.num;
              minCondition = instructorConditionDoc.id;
            }
          }
        }
        // We don't want to send many emails at once, because it may drive Gmail crazy.
        // WaitTime keeps increasing for every email that should be sent and in a setTimeout
        // postpones sending the next email until the next waitTime.
        setTimeout(async () => {
          const mailOptions = {
            from: process.env.EMAIL,
            to: instructorData.email,
            subject: `Inviting Your Students to ${
              minCondition === "contribute"
                ? "Contribute to"
                : minCondition === "learn"
                ? "Learn Collaboratively at"
                : "Present Your Research at"
            } Our Multi-School ${
              communityTitles[instructorData.major]
            } Community`,
            html: `<p>Hello ${
              instructorData.prefix +
              ". " +
              capitalizeFirstLetter(instructorData.firstname) +
              " " +
              capitalizeFirstLetter(instructorData.lastname)
            },</p>
              <p></p>
              <p>We are inviting your students to join and <strong>${
                minCondition === "contribute"
                  ? "contribute to"
                  : minCondition === "learn"
                  ? "learn collaboratively at"
                  : "present your research at"
              }</strong> our multi-school <a href="https://1cademy.us/community/${
              instructorData.major
            }" target="_blank">${
              communityTitles[instructorData.major]
            } community</a>. Several large communities of student researchers from different schools in the US are 
            remotely collaborating through our <a href="https://1cademy.us/home" target="_blank">1Cademy</a> platform
            at the University of Michigan School of Information. 
            You can find more information about our communities and the application process at https://1cademy.us/home</p>
              <p></p>
              <p>Please choose one of the following options regarding your preference:</p>
              <ul>
                <li><a href="https://1cademy.us/interestedFaculty/${
                  // These are all sending requests to the client side.
                  instructorData.major
                }/${minCondition}/${
              instructorDoc.id
            }" target="_blank">Yes, I'd like to invite my students.</a></li>
                <li><a href="https://1cademy.us/interestedFacultyLater/${
                  // These are all sending requests to the client side.
                  instructorDoc.id
                }" target="_blank">Not at this point, contact me in a few weeks.</a></li>
                <li><a href="https://1cademy.us/notInterestedFaculty/${
                  // These are all sending requests to the client side.
                  instructorDoc.id
                }" target="_blank">No, do not contact me again.</a></li>
              </ul>
              <p>Reply to this email if you have any questions or concerns.</p>
              <p>Please let us know if you are interested in assigning course/internship credits for your students. We can 
              provide you with detailed assessment of their activities on 1Cademy.</p>
              <p></p>
              <p>Best regards,</p>
              <br>-- <br><div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature"><div dir="ltr"><div><span style="font-family:Arial,Helvetica,sans-serif;font-style:normal;font-weight:normal;letter-spacing:normal;text-align:start;text-indent:0px;text-transform:none;white-space:normal;word-spacing:0px;text-decoration:none;color:rgb(102,102,102)"><img src="https://ci3.googleusercontent.com/mail-sig/AIorK4w7H_RAY7i2tZlCbQFzUtOTVBnQeAR7ux4pYFodxivEpW9gcO9n3PRiYVBWSYjiTNpx5Kaw9C4" data-os="https://drive.google.com/uc?id=1WH0cEF5s8kMl8BnIDEWBI2wdgr0Ea01O&amp;export=download" width="87" height="96"></span> Collaboratively Learn, Research, Summarize, Visualize, and Evaluate</div><div><b><a href="https://youtu.be/-dQOuGeu0IQ" target="_blank">Liaison Librarians</a> </b>- Ben Brown, Grace Ramstad, Sarah Licht, Viktoria Roshchin<br></div><a href="https://youtu.be/B6q-LYXvNCg" target="_blank"><b>UX Research in Cognitive Psychology of Learning</b></a> - Iman YeckehZaare<br><div><b><a href="https://youtu.be/ImoaKx7uoII" target="_blank">Social/Political Psychology</a></b> - Alex Nikolaidis Konstas, Talia Gillespie</div><div><div><b><a href="https://youtu.be/tmW31AEJRYg" target="_blank">Organization/Educational Psychology</a> - </b>Desiree Mayrie Comer<b><br></b></div><a href="https://youtu.be/B6q-LYXvNCg" target="_blank"><b></b></a><b></b></div><div><a href="https://youtu.be/gJUMN4vIxN4" target="_blank"><b>Health Psychology</b></a> - Jolie Safier Smith, Madeline Paige Jacoby<b><br></b></div><div><a href="https://youtu.be/J0y0tZzzuQ0" target="_blank"><b>Machine Learning (Deep learning) </b></a>- Ge Zhang, Xinrong Yao<br></div><div><b><a href="https://youtu.be/Mj45B59k4fo" target="_blank">Neuroscience Research</a></b> - Amrit Das Pradhan<b></b></div><div><b><a href="https://youtu.be/K5R17uFWINo" target="_blank">Clinical Psychology</a></b> - Victoria Mulligan</div><div><div><a href="https://youtu.be/Xaa1JnTHtSY" target="_blank"><b>Positive Psychology</b></a> - Noor Jassim</div></div><div><a href="https://youtu.be/otW11GyQ4dY" target="_blank"><b>Disability Studies</b></a> - Rishabh Verma<br></div><b><a href="https://youtu.be/K5R17uFWINo" target="_blank"></a></b><b>R&amp;D</b> - Iman YeckehZaare<br><div><a href="https://www.youtube.com/channel/UCKBqMjvnUrxOhfbH1F1VIdQ/playlists" target="_blank">YouTube Channel</a></div><div>
              <img src="https://1cademy.us/api/loadImage/professor/${
                // For tracking when they open their email.
                // Note that the email clients that cache emails like those on iPad or Outlook open the content
                // of the emails without the user's knowlege, so those would be false positives for us.
                instructorDoc.id + "/" + generateUID()
              }"
              width="420" height="37"><br></div></div></div>`,
          };
          transporter.sendMail(mailOptions, async (error, data) => {
            if (error) {
              console.log({ error });
              return res.status(500).json({ error });
            } else {
              // minCondNum === -1 signals that we had previously assigned a condition to
              // the instructor and we do not need to assign any experimental conditions again.
              if (minCondNum !== -1) {
                // If the email is successfully sent:
                // 1) Update the num value in the corresponding instructorConditions document;
                const instructorConditionRef = db
                  .collection("instructorConditions")
                  .doc(minCondition);
                await instructorConditionRef.update({
                  num: admin.firestore.FieldValue.increment(1),
                });
              }
              // 2) Update the corresponding instructor document.
              const instructorRef = db
                .collection("instructors")
                .doc(instructorDoc.id);
              await instructorRef.update({
                condition: minCondition,
                emailedAt: admin.firestore.Timestamp.fromDate(new Date()),
                reminders: admin.firestore.FieldValue.increment(1),
                // The next reminder should be sent one week later.
                nextReminder: admin.firestore.Timestamp.fromDate(nextWeek()),
                updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
              });
            }
          });
        }, waitTime);
        // Increase waitTime by a random integer between 1 to 4 seconds.
        waitTime += 1000 * (1 + Math.floor(Math.random() * 3));
      }
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

// Logs that the instructor clicked Yes in their email.
// We should not do this directly in the front-end because in Firebase.rules we have defined:
// allow write: if request.auth != null
// && request.resource.data.fullname == request.auth.token.name;
exports.instructorYes = async (req, res) => {
  try {
    // This is a post request and we should retrieve the data from req.body
    if ("id" in req.body && req.body.id) {
      const instructorId = req.body.id;
      const instructorDoc = db.collection("instructors").doc(instructorId);
      await instructorDoc.update({
        yes: true,
        no: false,
        later: false,
        updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
      });
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

// Logs that the instructor clicked No in their email.
// We should not do this directly in the front-end because in Firebase.rules we have defined:
// allow write: if request.auth != null
// && request.resource.data.fullname == request.auth.token.name;
exports.instructorNo = async (req, res) => {
  try {
    // This is a post request and we should retrieve the data from req.body
    if ("id" in req.body && req.body.id) {
      const instructorId = req.body.id;
      const instructorDoc = db.collection("instructors").doc(instructorId);
      await instructorDoc.update({
        no: true,
        yes: false,
        later: false,
        updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
      });
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

// Logs the instructor's preferred date for their reminder email.
// We should not do this directly in the front-end because in Firebase.rules we have defined:
// allow write: if request.auth != null
// && request.resource.data.fullname == request.auth.token.name;
exports.instructorLater = async (req, res) => {
  try {
    // This is a post request and we should retrieve the data from req.body
    if ("id" in req.body && req.body.id) {
      const instructorId = req.body.id;
      const instructorDoc = db.collection("instructors").doc(instructorId);

      // In addition to setting later = true, we should also set yes = true so that if
      // they previously declined and then changed their mind, we still send them a reminder
      // email one week later, or at the reminder date that they spedcified.

      // If reminder exists, its value would be the date that the instructor wants to
      // receive a reminder email.
      if ("reminder" in req.body) {
        const reminder = new Date(req.body.reminder);
        await instructorDoc.update({
          later: true,
          no: false,
          yes: false,
          reminder: admin.firestore.Timestamp.fromDate(reminder),
          updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
        });
      } else {
        // If reminder does not exist, we should still log that the instructor
        // clicked the remind me later link in their email.
        await instructorDoc.update({
          later: true,
          no: false,
          yes: false,
          updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
        });
      }
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

// Convert hoursLeft to days and hours left writen in English for the
// reminder email subject lines.
const hoursToDaysHoursStr = (hoursLeft) => {
  let days = 0;
  hoursLeft = Math.floor(hoursLeft);
  if (hoursLeft < 1) {
    return "less than an hour";
  }
  if (hoursLeft === 1) {
    return "an hour";
  }
  if (hoursLeft >= 24) {
    days = Math.floor(hoursLeft / 24);
    hoursLeft = hoursLeft % 24;
    return (
      (days > 1 ? days : "a") +
      " day" +
      (days > 1 ? "s" : "") +
      (hoursLeft > 0
        ? " and " +
          (hoursLeft > 1 ? hoursLeft : "an") +
          " hour" +
          (hoursLeft > 1 ? "s" : "")
        : "")
    );
  }
  return (
    (hoursLeft > 1 ? hoursLeft : "an") + " hour" + (hoursLeft > 1 ? "s" : "")
  );
};

const eventNotificationEmail = async (
  email,
  firstname,
  from1Cademy,
  courseName,
  hoursLeft,
  weAreWaiting,
  hangoutLink,
  order,
  httpReq,
  declined
) => {
  try {
    hoursLeft = hoursToDaysHoursStr(hoursLeft);
    const mailOptions = {
      from: "onecademy@umich.edu",
      to: email,
      subject:
        "[1Cademy] " +
        // (courseName ? "[" + courseName + "] " : "") +
        (weAreWaiting
          ? "We Are Waiting for You in the UX Research Experiment Session!"
          : declined
          ? "You Have Declined Your " +
            order +
            " Session of the UX Research Experiment Which Will Begin in " +
            hoursLeft +
            "!"
          : "Your UX Research Experiment Session Will Begin in " +
            hoursLeft +
            "!"),
      html:
        `<p>Hi ${capitalizeFirstLetter(firstname)},</p>
      <p></p>
      ${
        weAreWaiting
          ? "<p>Our UX researchers have been waiting for you in the UX research experiment session. " +
            "Please join the session at <a href=" +
            hangoutLink +
            " target='_blank'>this link</a>.</p><p>" +
            "You can also reply to this email to reschedule this session for you." +
            (["2nd", "3rd"].includes(order)
              ? " However, it does need to be today; otherwise, we must exclude your data from this study and terminate your application."
              : "")
          : declined
          ? "<p>This is an auto-generated email to inform you that you have declined your " +
            order +
            " session of the UX research experiment which will begin in " +
            hoursLeft +
            "!</p>" +
            `<p>Please respond to this email with only one of the following options to proceed with:</p>
          <ul>
            <li>Withdraw your application</li>
            <li>Reschedule your session for another time on the same day to be able to continue with your application</li>
          </ul>
          <p>Note that because this is a 30-minute, ${order} session, our experiment protocol does not allow us to move it to another day. We can only reschedule it on the same day.</p>
          <p>Please reply to this email if you have any questions or concerns.</p>`
          : "<p>This is an auto-generated email to inform you that your UX research experiment session will begin in " +
            hoursLeft +
            "," +
            " but you've not accepted our invitation on Google Calendar yet!</p>" +
            '<p>Please open the Google Calendar invitation email, scroll all the way down to find the options to respond to the Calendar invite, and click "Yes."</p>' +
            "<p>Note that accepting/declining the invitation through Outlook does not work. You should only accept/reject the invitation through the Yes/No links at the bottom of the Google Calendar invitation email."
      }
      </p>
      <p></p>
      <p>Best regards,</p>
      ` + signatureHTML,
    };
    return transporter.sendMail(mailOptions, (error, data) => {
      if (error) {
        console.log({ error });
        if (httpReq) {
          return res.status(500).json({ error });
        }
      }
      if (httpReq) {
        return res.status(200).json({ done: true });
      }
    });
  } catch (err) {
    console.log({ err });
    if (httpReq) {
      return res.status(500).json({ err });
    }
  }
};
exports.eventNotificationEmail = eventNotificationEmail;

// Sends a reminder email to a researcher that they have not accepted
// or even declined the Google Calendar invitation and asks them to
// accept it or ask someone else to take it.
exports.researcherEventNotificationEmail = async (
  email,
  fullname,
  participant,
  hoursLeft,
  order,
  declined
) => {
  try {
    hoursLeft = hoursToDaysHoursStr(hoursLeft);
    const mailOptions = {
      from: "onecademy@umich.edu",
      to: [email, "oneweb@umich.edu"],
      subject:
        "[1Cademy] " +
        (declined
          ? "You've Declined Your " +
            order +
            " Session with " +
            participant +
            " Which Will Begin in " +
            hoursLeft +
            "!"
          : "Please Accept Your " +
            order +
            " Session with " +
            participant +
            " Which Will Begin in " +
            hoursLeft +
            "!"),
      html:
        `<p>Hi ${fullname},</p>
      <p></p>
      ${
        declined
          ? "<p>This is an auto-generated email to inform you that you have declined your " +
            order +
            " session with " +
            participant +
            " which will begin in " +
            hoursLeft +
            "!</p>" +
            `<p>This session was scheduled based on your specified availability.</p>
            <p>Please never mark your Google Calendar invitations as decline/tentative.</p>
            <p>Instead, send an announcement to our Microsoft Teams research channel to look for another researcher to take the session on your behalf.</p>
            <p>Keep in mind that we are the one who invited the participant and we are not supposed to decline our own invitations.</p>
            <p>Let me know if you have any questions or concerns.</p>`
          : "<p>This is an auto-generated email to inform you that your UX research experiment session with " +
            participant +
            " will begin in " +
            hoursLeft +
            "," +
            " but you've not accepted the Google Calendar invitation yet!</p>" +
            "<p>Please accept it ASAP; otherwise, the participant may get demotivated and not attend the session."
      }
      </p>
      <p></p>
      <p>Best regards,</p>
      ` + signatureHTML,
    };
    return transporter.sendMail(mailOptions, (error, data) => {
      if (error) {
        console.log({ error });
        if (httpReq) {
          return res.status(500).json({ error });
        }
      }
      if (httpReq) {
        return res.status(200).json({ done: true });
      }
    });
  } catch (err) {
    console.log({ err });
    if (httpReq) {
      return res.status(500).json({ err });
    }
  }
};

exports.notAttendedEmail = async (
  email,
  firstname,
  from1Cademy,
  courseName,
  order
) => {
  try {
    const mailOptions = {
      from: "onecademy@umich.edu",
      to: email,
      subject:
        "[1Cademy] " +
        // (courseName ? "[" + courseName + "] " : "") +
        "You Missed the " +
        order +
        " UX Research Experiment Session Today!",
      html:
        `<p>Hi ${capitalizeFirstLetter(firstname)},</p>
        <p></p>
        <p>This is an auto-generated email to inform you that you missed your ${order} UX research experiment session!</p>
        <p>Please respond to this email with only one of the following options to proceed with:</p>
        <ul>
          <li>Withdraw your application</li>
          <li>Reschedule your session for another time TODAY to be able to continue with your application</li>
        </ul>
        <p>Note that because this is a 30-minute, ${order} session, our experiment protocol does not allow us to move it to another day. We can only reschedule it on the same day.</p>
        <p>Please reply to this email if you have any questions or concerns.</p>
<p></p>
<p>Best regards,</p>
` + signatureHTML,
    };
    return transporter.sendMail(mailOptions, (error, data) => {
      if (error) {
        console.log({ error });
        if (httpReq) {
          return res.status(500).json({ error });
        }
      }
      if (httpReq) {
        return res.status(200).json({ done: true });
      }
    });
  } catch (err) {
    console.log({ err });
    if (httpReq) {
      return res.status(500).json({ err });
    }
  }
};

exports.sendEventNotificationEmail = (req, res) => {
  try {
    if ("email" in req.body && "firstname" in req.body) {
      const email = req.body.email;
      const firstname = req.body.firstname;
      let from1Cademy = false;
      if ("from1Cademy" in req.body) {
        from1Cademy = req.body.from1Cademy;
      }
      let courseName = "";
      if ("courseName" in req.body) {
        courseName = req.body.courseName;
      }
      let hoursLeft = 0;
      if ("hoursLeft" in req.body) {
        hoursLeft = req.body.hoursLeft;
      }
      let weAreWaiting = false;
      if ("weAreWaiting" in req.body) {
        weAreWaiting = req.body.weAreWaiting;
      }
      let hangoutLink = "";
      if ("hangoutLink" in req.body) {
        hangoutLink = req.body.hangoutLink;
      }
      let order = "1st";
      if ("order" in req.body) {
        order = req.body.order;
      }
      eventNotificationEmail(
        email,
        firstname,
        from1Cademy,
        courseName,
        hoursLeft,
        weAreWaiting,
        hangoutLink,
        order,
        true,
        false
      );
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

const reschEventNotificationEmail = async (
  email,
  firstname,
  from1Cademy,
  courseName,
  hoursLeft,
  httpReq,
  declined,
  res
) => {
  try {
    hoursLeft = hoursToDaysHoursStr(hoursLeft);
    const scheduleDocs = await db
      .collection("schedule")
      .where("email", "==", email)
      .get();
    for (let scheduleDoc of scheduleDocs.docs) {
      const scheduleData = scheduleDoc.data();
      if (scheduleData.id) {
        await deleteEvent(scheduleData.id);
        const scheduleRef = db.collection("schedule").doc(scheduleDoc.id);
        await scheduleRef.update({
          id: admin.firestore.FieldValue.delete(),
          order: admin.firestore.FieldValue.delete(),
        });
      }
    }
    const mailOptions = {
      from: "onecademy@umich.edu",
      to: email,
      subject:
        "[1Cademy] " +
        // (courseName ? "[" + courseName + "] " : "") +
        ("You " +
          (declined ? "declined our invitation to" : "missed") +
          " the UX Research Experiment Session" +
          (declined ? " that will begin in " + hoursLeft : "") +
          "!"),
      html:
        `<p>Hi ${capitalizeFirstLetter(firstname)},</p>
<p></p>
${
  "<p>You " +
  (declined ? "declined our invitation to" : "missed") +
  " the UX Research Experiment Session" +
  (declined ? " that will begin in " + hoursLeft : "") +
  "!</p><p>We deleted this session and the following sessions for you.</p>" +
  "<p>Please reschedule your experiment sessions on <a href='https://visualexp1.web.app/' target='_blank'>our research website</a> ASAP.</p>" +
  "<p>Please reply to this email if you have any questions or experience any difficulties scheduling your sessions."
}
</p>
<p></p>
<p>Best regards,</p>
` + signatureHTML,
    };
    return transporter.sendMail(mailOptions, (error, data) => {
      if (error) {
        console.log({ error });
        if (httpReq) {
          return res.status(500).json({ error });
        }
      }
      if (httpReq) {
        return res.status(200).json({ done: true });
      }
    });
  } catch (err) {
    console.log({ err });
    if (httpReq) {
      return res.status(500).json({ err });
    }
  }
};
exports.reschEventNotificationEmail = reschEventNotificationEmail;

exports.rescheduleEventNotificationEmail = (req, res) => {
  if ("email" in req.body && "firstname" in req.body) {
    const email = req.body.email;
    const firstname = req.body.firstname;
    let from1Cademy = false;
    if ("from1Cademy" in req.body) {
      from1Cademy = req.body.from1Cademy;
    }
    let courseName = "";
    if ("courseName" in req.body) {
      courseName = req.body.courseName;
    }
    let hoursLeft = 0;
    if ("hoursLeft" in req.body) {
      hoursLeft = req.body.hoursLeft;
    }
    reschEventNotificationEmail(
      email,
      firstname,
      from1Cademy,
      courseName,
      hoursLeft,
      true,
      true,
      res
    );
  }
};

exports.emailCommunityLeader = async (
  email,
  firstname,
  communiId,
  applicants
) => {
  try {
    const mailOptions = {
      from: "onecademy@umich.edu",
      to: email,
      subject: `[1Cademy] You Have ${applicants.length} Complete Applications to Review in ${communiId}`,
      html:
        `<p>Hi ${capitalizeFirstLetter(firstname)},</p>
        <p></p>
        <p>This is an auto-generated email to inform you that you have ${
          applicants.length
        } complete applications to review in your ${communiId} community:</p>
        <ul>
        ${applicants
          .map((applicant) => {
            return `<li>${applicant}</li>`;
          })
          .join("")}
        </ul>
        <p>Please review these applications ASAP at
          <a href="https://1cademy.us/CommunityApplications" target='_blank'>this link</a>.</p>
        <p></p>
        <h3>Notes:</h3>
        <ul>
          <li>When sending emails to your applicants, please include your community name in the 
          subject line of the emails so that Gmail correctly labels their replies to your community.</li>
          <li>To signal Iman to invite your new interns to Microsoft Teams, first ask your new interns
          to complete the 1Cademy tutorial. You can check whether they completed it in the same table
          under the column "Completed Tutorial."</li>
          <li>If you reject any applicant, please let them know that they can still apply to other 
          1Cademy communities.</li>
        </ul>
        <p></p>
        <p>Best regards,</p>
        ` + signatureHTML,
    };
    return transporter.sendMail(mailOptions, async (error, data) => {
      if (error) {
        console.log({ error });
      }
    });
  } catch (err) {
    console.log({ err });
  }
};

exports.emailImanToInviteApplicants = async (needInvite) => {
  try {
    const mailOptions = {
      from: "onecademy@umich.edu",
      to: "oneweb@umich.edu",
      subject: `[1Cademy] You Have ${needInvite.length} Confirmed Applications to Invite to Microsoft Teams!`,
      html:
        `<p>Hi Iman,</p>
        <p></p>
        <p>This is an auto-generated email to inform you that you have ${
          needInvite.length
        } Confirmed applications to Invite to Microsoft Teams:</p>
        <ul>
        ${needInvite
          .map((application) => {
            return `<li>${application.communiId}, ${application.applicant}</li>`;
          })
          .join("")}
        </ul>
        <p>You can find these applications at
          <a href="https://1cademy.us/CommunityApplications" target='_blank'>this link</a>.</p>
        <p></p>
        <p>Best regards,</p>
        ` + signatureHTML,
    };
    return transporter.sendMail(mailOptions, async (error, data) => {
      if (error) {
        console.log({ error });
      }
    });
  } catch (err) {
    console.log({ err });
  }
};

exports.emailApplicationStatus = async (
  email,
  firstname,
  fullname,
  reminders,
  subject,
  content,
  hyperlink
) => {
  try {
    const nWeek = nextWeek();
    const mailOptions = {
      from: "onecademy@umich.edu",
      to: email,
      subject,
      html:
        `<p>Hi ${capitalizeFirstLetter(firstname)},</p>
<p></p>
<p>This is an auto-generated email to inform you that you have ${content}.</p>
<p>You can continue your 1Cademy application using 
   <a href="${hyperlink}" target='_blank'>this link</a>.</p>
<p>We'll send you a reminder about your application process on ${nWeek.toLocaleDateString()}. If you'd like to change the reminder date, click 
   <a href="https://1cademy.us/ReminderDate" target='_blank'>this link</a>.</p>
<p>If you prefer NOT to continue your 1Cademy application, click 
   <a href="https://1cademy.us/withdraw" target='_blank'>this link</a>.</p>
<p>Please reply to this email if you have any questions or concerns.</p>
<p></p>
<p>Best regards,</p>
` + signatureHTML,
    };
    return transporter.sendMail(mailOptions, async (error, data) => {
      if (error) {
        console.log({ error });
      }
      const userRef = db.collection("users").doc(fullname);
      const userDoc = await userRef.get();
      await userRef.update({
        reminders: reminders + 1,
        reminder: admin.firestore.Timestamp.fromDate(nWeek),
      });
    });
  } catch (err) {
    console.log({ err });
  }
};

exports.remindResearcherToSpecifyAvailability = (email, fullname, days) => {
  try {
    const mailOptions = {
      from: "onecademy@umich.edu",
      to: email,
      subject:
        "[1Cademy] Please Specify Your Availability to Run Experiment Sessions!",
      html:
        `<p>Hi ${fullname},</p>
        <p></p>
        <p>This is an auto-generated email to remind you that you have not specified your availability for the next 16 days.</p>
        <p>We need to specify as much of our availability as possible, so that we get more participants who schedule only for the sessions that they can really attend.</p>
        <p>Please open <a href="https://1cademy.us/Activities/Experiments" target='_blank'>our experiments scheduling page</a> and specify your availability in the next ${days} days.</p>
        <p></p>
        <p>Best regards,</p>
        ` + signatureHTML,
    };
    return transporter.sendMail(mailOptions, async (error, data) => {
      if (error) {
        console.log({ error });
      }
    });
  } catch (err) {
    console.log({ err });
  }
};
