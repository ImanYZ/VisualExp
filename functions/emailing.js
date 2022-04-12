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

const getFullnameURI = (firstname, lastname) => {
  return (firstname + "+" + lastname)
    .replace(" ", "+")
    .replace(".", "")
    .replace("__", " ")
    .replace("/", " ");
};

const emailOpened = async (fullname) => {
  const contactRef = db.collection("contacts").doc(fullname);
  await contactRef.update({
    openedEmail: admin.firestore.Timestamp.fromDate(new Date()),
  });
};

exports.loadImage = (req, res) => {
  let fullname = req.params.contactId.replace("+", " ");
  emailOpened(fullname);

  const file = storage
    .bucket("visualexp-a7d2c.appspot.com")
    .file("output-onlinepngtools (4).png");
  let readStream = file.createReadStream();

  res.setHeader("content-type", "image/png");
  readStream.pipe(res);
};

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
  <div dir="ltr" class="gmail_signature"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><span style="color: rgb(136, 136, 136); font-size: 12.8px; --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">--</span></div><div dir="ltr"><span style="color: rgb(136, 136, 136); font-size: 12.8px; --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">Iman YeckehZaare</span><div><span style="color: rgb(136, 136, 136); font-size: 12.8px; --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">Ph.D. Candidate</span></div><div><span><font color="#888888" data-darkreader-inline-color="" style="--darkreader-inline-color:#7d756b;"><span style="font-size: 12.8px;">University of Michigan School of Information</span></font></span></div><div><font color="#888888" data-darkreader-inline-color="" style="--darkreader-inline-color:#7d756b;"><span style="font-size: 12.8px;">Outstanding Graduate Student Instructor of the Year 2018-2019</span></font><span><br></span></div><div><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color=""><a href="https://1cademy.us/Home" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=12lQOGIsvgO45QTD4qlLxQ7_Y7NrHnbGx&amp;revid=0B8-wWhGFpGYCNzd4VFl6cTdxSUF2RnRkeS9RVGp0dUNqaENnPQ"></a>&nbsp;<a href="https://www.si.umich.edu/people/iman-yeckehzaare" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1x2fU9wvobcqM30Od779MVmeBQxWVXGfF&amp;revid=0B8-wWhGFpGYCckNhZUlHK250Tit3TGdVdlArajRGdlBsblFzPQ"></a><img src="https://docs.google.com/uc?export=download&amp;id=1ud7zHiXzQC6VFyViSG7MUuqKb4t8Y75U&amp;revid=0B8-wWhGFpGYCSjM3WjVja2YzWGVPY1dKaSt0Y2tRM095VENnPQ"><img src="https://docs.google.com/uc?export=download&amp;id=1-G9ZAlwduWfEyrDzXWTZU1uuiuljMcWP&amp;revid=0B8-wWhGFpGYCS3dRMXl2U3Q0WTRsZE05SmMrSGtZWFRicENjPQ">&nbsp;</span><a href="https://scholar.google.com/citations?user=zP9tLycAAAAJ" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=17-AQ6C9AoqN0pAqN3_4W07c8-ehTjZx-&amp;revid=0B8-wWhGFpGYCWHVhR1BjcnZraDNYMVdlRFcySytnRjkzOE9ZPQ" style="color: rgb(125, 117, 107); font-size: 12.8px; --darkreader-inline-color:#7f776d;" data-darkreader-inline-color=""></a>&nbsp;<a href="https://dl.acm.org/profile/99659352229" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1wFUjKEJK1FwS3jkePqy0tVO6_vrJsEI0&amp;revid=0B8-wWhGFpGYCblkvNUJsSkVkQnVjTmtUMmtUaEljSWJkMFJvPQ" style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color=""></a><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp;<a href="https://en.wikipedia.org/wiki/User:I.yeckehzaare" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1E3DUxcWTrTw_tk357XSgzBGd6CgcyEOL&amp;revid=0B8-wWhGFpGYCR1ZmQ0YvaFg0NE9Nc2dTemhtemRMU00vWm9JPQ"></a></span><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp;<a href="https://www.youtube.com/channel/UCKBqMjvnUrxOhfbH1F1VIdQ/playlists" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=17NADDvDZVvuHni-xM6Ej_IbBS9MHBZa-&amp;revid=0B8-wWhGFpGYCUkllWEtyTTMvL3IwcUp5cE1BRE16cnphSHJzPQ"></a>&nbsp;<a href="https://twitter.com/Iman1Web" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1oqkF7mgDHoJ94GwkFG5qnikhbnJi6CCh&amp;revid=0B8-wWhGFpGYCQzI0d2ppWDlIZGp6czRsc2RLK1lwZUljWkNrPQ"></a></span><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp;<a href="https://www.linkedin.com/in/oneweb/" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1GorrsSKJS4xCSlqhlu2o4_xnAqms_Ncc&amp;revid=0B8-wWhGFpGYCQzdVN0RsUWtpb2s5TEpmVmFBZFVDT3hiOXc0PQ"></a><a href="https://www.ifit.com/profile/5fab18836a996c03ad43af64" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1Iy3PATWUwaZ-hinGScGA5xxYT8maVHL0&amp;revid=0B8-wWhGFpGYCeUtBS2pSbFgzak1RQnpydXZHcUtaaEtnWkhFPQ"></a></span></div></div></div></div></div></div></div></div></div></div></div>
  <a href="https://www.si.umich.edu/people/iman-yeckehzaare" target="_blank">
  <img src="https://us-central1-visualexp-a7d2c.cloudfunctions.net/api/loadImage/${
    getFullnameURI(firstname, lastname) + "/" + generateUID()
  }">
  </a>
  &nbsp; &nbsp;&nbsp;<a href="https://stackoverflow.com/users/2521204/1man" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1tSnswSYHWxRGGh-u54uNxPWKWqqHhvdM&amp;revid=0B8-wWhGFpGYCdlRmU2xPVkxjTS9HWU9lbHJGdC92OGgxeTFzPQ"></a>&nbsp;&nbsp;<a href="https://github.com/ImanYZ" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1ftgv8rj-ihFuA4ZE5mf9faXeNvz-F3vQ&amp;revid=0B8-wWhGFpGYCRVFGYjFDNGZRYnhMQ1dLU1lkNGZwT283UnFnPQ"></a>&nbsp;</span><a href="https://scholar.google.com/citations?user=zP9tLycAAAAJ" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=17-AQ6C9AoqN0pAqN3_4W07c8-ehTjZx-&amp;revid=0B8-wWhGFpGYCWHVhR1BjcnZraDNYMVdlRFcySytnRjkzOE9ZPQ" style="color: rgb(125, 117, 107); font-size: 12.8px; --darkreader-inline-color:#7f776d;" data-darkreader-inline-color=""></a>&nbsp;<span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp; </span><a href="https://dl.acm.org/profile/99659352229" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1wFUjKEJK1FwS3jkePqy0tVO6_vrJsEI0&amp;revid=0B8-wWhGFpGYCblkvNUJsSkVkQnVjTmtUMmtUaEljSWJkMFJvPQ" style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color=""></a><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp; &nbsp;<a href="https://en.wikipedia.org/wiki/User:I.yeckehzaare" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1E3DUxcWTrTw_tk357XSgzBGd6CgcyEOL&amp;revid=0B8-wWhGFpGYCR1ZmQ0YvaFg0NE9Nc2dTemhtemRMU00vWm9JPQ"></a></span><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp; &nbsp;<a href="https://twitter.com/Iman1Web" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1oqkF7mgDHoJ94GwkFG5qnikhbnJi6CCh&amp;revid=0B8-wWhGFpGYCQzI0d2ppWDlIZGp6czRsc2RLK1lwZUljWkNrPQ"></a>&nbsp;</span><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp; <a href="https://www.linkedin.com/in/oneweb/" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1GorrsSKJS4xCSlqhlu2o4_xnAqms_Ncc&amp;revid=0B8-wWhGFpGYCQzdVN0RsUWtpb2s5TEpmVmFBZFVDT3hiOXc0PQ"></a></span></div></div></div></div></div></div></div></div></div></div></div></div>
  `,
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
  Cryptoeconomics: "Cryptoeconomics",
  Deep_Learning: "Deep Learning",
  Liaison_Librarians: "Liaison Librarians",
};

exports.inviteInstructors = async (req, res) => {
  try {
    let waitTime = 0;
    const instructorDocs = await db.collection("instructors").get();
    for (let instructorDoc of instructorDocs.docs) {
      const instructorData = instructorDoc.data();
      if (
        instructorData.upVotes - instructorData.downVotes >= 3 &&
        (!instructorData.reminders || instructorData.reminders < 4) &&
        !instructorData.yes &&
        !instructorData.no &&
        !instructorData.doNot &&
        !instructorData.introduced &&
        instructorData.major in communityTitles
      ) {
        let instructorConditionsDocs = await db
          .collection("instructorConditions")
          .get();
        instructorConditionsDocs = instructorConditionsDocs.docs;
        let minCondNum = instructorConditionsDocs[0].data().num;
        let minCondition = instructorConditionsDocs[0].id;
        for (let instructorConditionDoc of instructorConditionsDocs) {
          let instructorConditionData = instructorConditionDoc.data();
          if (instructorConditionData.num < minCondNum) {
            minCondNum = instructorConditionData.num;
            minCondition = instructorConditionDoc.id;
          }
        }
        setTimeout(async () => {
          console.log({
            email: instructorData.email,
            firstname: instructorData.firstname,
            lastname: instructorData.lastname,
            major: instructorData.major,
            condition: minCondition,
          });

          const instructorConditionRef = db
            .collection("instructorConditions")
            .doc(minCondition);
          await instructorConditionRef.update({
            num: admin.firestore.FieldValue.increment(1),
          });

          const instructorRef = db
            .collection("instructors")
            .doc(instructorDoc.id);
          await instructorRef.update({
            condition: minCondition,
            emailedAt: admin.firestore.Timestamp.fromDate(new Date()),
            reminders: admin.firestore.FieldValue.increment(1),
          });
        }, waitTime);
        waitTime += 1000 * (1 + Math.floor(Math.random() * 3));
        if (waitTime > 4000) {
          break;
        }
        // const mailOptions = {
        //   from: "onecademy@umich.edu",
        //   to: email,
        //   subject:
        //     (from1Cademy ? "[1Cademy] " : "") +
        //     "Learn Which Knowledge Visualization Method is Better For You by Participating in our Experiment!",
        //   html:
        //     `<p>Hi ${capitalizeFirstLetter(firstname)},</p>
        //   <p></p>
        //   ${
        //     from1Cademy
        //       ? "<p>Our UX research team at 1Cademy needs"
        //       : "<p>We are a group of UX researchers at the University of Michigan, School of Information.</p><p>We need"
        //   }
        //   <p> your help with participating in our experiment to learn how to better design knowledge visualization to improve reading comprehension and learning. The experiment will be in three sessions:</p>
        //   <ol>
        //   <li>
        //   1<sup>st</sup> session for an hour
        //   </li>
        //   <li>
        //   2<sup>nd</sup> session, 3 days later, for 30 minutes
        //   </li>
        //   <li>
        //   3<sup>rd</sup> session, 1 week later, for 30 minutes
        //   </li>
        //   <ol>
        //   <p>Please fill out your availability in our scheduling website: <a href="https://visualexp1.web.app/schedule" target="_blank">https://visualexp1.web.app/schedule</a></p>
        //   <p></p>
        //   <p>Best regards,</p>
        //   ` + signatureHTML,
        // };
        // return transporter.sendMail(mailOptions, (error, data) => {
        //   if (error) {
        //     console.log({ error });
        //     return res.status(500).json({ error });
        //   }
        //   return res.status(200).json({ done: true });
        // });
      }
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

const hoursToDaysHoursStr = (hoursLeft) => {
  const days = 0;
  hoursLeft = Math.floor(hoursLeft);
  if (hoursLeft < 1) {
    return "less than an hour";
  }
  if (hoursLeft === 1) {
    return "an hour";
  }
  if (hoursLeft >= 24) {
    days = Math.floor(hoursLeft / 24);
    hours = hoursLeft % 24;
    return days + " days and " + hoursLeft + " hours";
  }
  return hoursLeft + " hours";
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
  httpReq
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
        true
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
  declined
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
      reschEventNotificationEmail(
        email,
        firstname,
        from1Cademy,
        courseName,
        hoursLeft,
        true,
        true
      );
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
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
