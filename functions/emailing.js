const { admin, db, storage, batchUpdate, commitBatch } = require("./admin");

const nodemailer = require("nodemailer");

const { getFullname, generateUID } = require("./utils");

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
        const { firstname, lastname, email, from1Cademy, emailSent } =
          contactDoc.data();
        console.log({ firstname, lastname, emailSent });
        if (!emailSent) {
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
              html: `<p>Hi ${firstname},</p>
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
  <p>Please create an account and fill out your availability in <a href="https://visualexp1.web.app">our scheduling website</a>.</p>
  ${
    from1Cademy
      ? "<p>Also, please turn on your notifications on Microsoft Teams to better collaborate with the community.</p>"
      : ""
  }
  <p></p>
  <p>Best regards,</p>
  <p>1Cademy UX Research Team</p>
  <div><div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature" data-lt-sig="1"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><span style="color: rgb(136, 136, 136); font-size: 12.8px; --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">--</span></div><div dir="ltr"><span style="color: rgb(136, 136, 136); font-size: 12.8px; --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">Iman YeckehZaare</span><div><span style="color: rgb(136, 136, 136); font-size: 12.8px; --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">Ph.D. Candidate</span></div><div><span><font color="#888888" data-darkreader-inline-color="" style="--darkreader-inline-color:#7d756b;"><span style="font-size:12.8px">University of Michigan School of Information</span></font></span></div><div><font color="#888888" data-darkreader-inline-color="" style="--darkreader-inline-color:#7d756b;"><span style="font-size:12.8px">Outstanding Graduate Student Instructor of the Year 2018-2019</span></font><span><br></span></div><div><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">
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
                await contactRef.update({
                  emailSent: admin.firestore.Timestamp.fromDate(new Date()),
                });
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

exports.sendInvitationEmail = async (req, res) => {
  try {
    if ("email" in req.body && "firstname" in req.body) {
      const email = req.body.email;
      const firstname = req.body.firstname;
      let from1Cademy = false;
      if ("from1Cademy" in req.body) {
        from1Cademy = req.body.from1Cademy;
      }
      const mailOptions = {
        from: "onecademy@umich.edu",
        to: email,
        subject:
          (from1Cademy ? "[1Cademy] " : "") +
          "Learn Which Knowledge Visualization Method is Better For You by Participating in our Experiment!",
        html: `<p>Hi ${firstname},</p>
<p></p>
${
  from1Cademy
    ? "<p>Our UX research team at 1Cademy needs"
    : "<p>We are a group of UX researchers at the University of Michigan, School of Information.</p><p>We need"
}
<p> your help with participating in our experiment to learn how to better design knowledge visualization to improve reading comprehension and learning. The experiment will be in three sessions:</p>
<ol>
<li>
1<sup>st</sup> session for an hour
</li>
<li>
2<sup>nd</sup> session, 3 days later, for 30 minutes
</li>
<li>
3<sup>rd</sup> session, 1 week later, for 30 minutes
</li>
<ol>
<p>Please fill out your availability in our scheduling website: <a href="https://visualexp1.web.app/schedule">https://visualexp1.web.app/schedule</a></p>
<p></p>
<p>Best regards,</p>
<p>1Cademy UX Research Team</p>
<div><div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature" data-lt-sig="1"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><span style="color: rgb(136, 136, 136); font-size: 12.8px; --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">--</span></div><div dir="ltr"><span style="color: rgb(136, 136, 136); font-size: 12.8px; --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">Iman YeckehZaare</span><div><span style="color: rgb(136, 136, 136); font-size: 12.8px; --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">Ph.D. Candidate</span></div><div><span><font color="#888888" data-darkreader-inline-color="" style="--darkreader-inline-color:#7d756b;"><span style="font-size:12.8px">University of Michigan School of Information</span></font></span></div><div><font color="#888888" data-darkreader-inline-color="" style="--darkreader-inline-color:#7d756b;"><span style="font-size:12.8px">Outstanding Graduate Student Instructor of the Year 2018-2019</span></font><span><br></span></div><div><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color=""><a href="https://www.si.umich.edu/people/iman-yeckehzaare" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1x2fU9wvobcqM30Od779MVmeBQxWVXGfF&amp;revid=0B8-wWhGFpGYCckNhZUlHK250Tit3TGdVdlArajRGdlBsblFzPQ"></a>&nbsp; &nbsp;&nbsp;<a href="https://stackoverflow.com/users/2521204/1man" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1tSnswSYHWxRGGh-u54uNxPWKWqqHhvdM&amp;revid=0B8-wWhGFpGYCdlRmU2xPVkxjTS9HWU9lbHJGdC92OGgxeTFzPQ"></a>&nbsp;&nbsp;<a href="https://github.com/ImanYZ" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1ftgv8rj-ihFuA4ZE5mf9faXeNvz-F3vQ&amp;revid=0B8-wWhGFpGYCRVFGYjFDNGZRYnhMQ1dLU1lkNGZwT283UnFnPQ"></a>&nbsp;</span><a href="https://scholar.google.com/citations?user=zP9tLycAAAAJ" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=17-AQ6C9AoqN0pAqN3_4W07c8-ehTjZx-&amp;revid=0B8-wWhGFpGYCWHVhR1BjcnZraDNYMVdlRFcySytnRjkzOE9ZPQ" style="color: rgb(125, 117, 107); font-size: 12.8px; --darkreader-inline-color:#7f776d;" data-darkreader-inline-color=""></a>&nbsp;<span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp; </span><a href="https://dl.acm.org/profile/99659352229" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1wFUjKEJK1FwS3jkePqy0tVO6_vrJsEI0&amp;revid=0B8-wWhGFpGYCblkvNUJsSkVkQnVjTmtUMmtUaEljSWJkMFJvPQ" style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color=""></a><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp; &nbsp;<a href="https://en.wikipedia.org/wiki/User:I.yeckehzaare" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1E3DUxcWTrTw_tk357XSgzBGd6CgcyEOL&amp;revid=0B8-wWhGFpGYCR1ZmQ0YvaFg0NE9Nc2dTemhtemRMU00vWm9JPQ"></a></span><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp; &nbsp;<a href="https://twitter.com/Iman1Web" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1oqkF7mgDHoJ94GwkFG5qnikhbnJi6CCh&amp;revid=0B8-wWhGFpGYCQzI0d2ppWDlIZGp6czRsc2RLK1lwZUljWkNrPQ"></a>&nbsp;</span><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp; <a href="https://www.linkedin.com/in/oneweb/" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1GorrsSKJS4xCSlqhlu2o4_xnAqms_Ncc&amp;revid=0B8-wWhGFpGYCQzdVN0RsUWtpb2s5TEpmVmFBZFVDT3hiOXc0PQ"></a></span></div></div></div></div></div></div></div></div></div></div></div></div>
`,
      };
      return transporter.sendMail(mailOptions, (error, data) => {
        if (error) {
          console.log({ error });
          return res.status(500).json({ error });
        }
        return res.status(200).json({ done: true });
      });
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};

exports.sendEventNotificationEmail = async (req, res) => {
  try {
    if ("email" in req.body && "firstname" in req.body) {
      const email = req.body.email;
      const firstname = req.body.firstname;
      let from1Cademy = false;
      if ("from1Cademy" in req.body) {
        from1Cademy = req.body.from1Cademy;
      }
      let order = "1st";
      if ("order" in req.body) {
        order = req.body.order;
      }
      let courseName = "";
      if ("courseName" in req.body) {
        courseName = req.body.courseName;
      }
      let weAreWaiting = false;
      if ("weAreWaiting" in req.body) {
        weAreWaiting = req.body.weAreWaiting;
      }
      let hangoutLink = "";
      if ("hangoutLink" in req.body) {
        hangoutLink = req.body.hangoutLink;
      }
      let hoursLeft = 0;
      if ("hoursLeft" in req.body) {
        hoursLeft = Math.floor(req.body.hoursLeft);
        if (hoursLeft < 1) {
          hoursLeft = "less than an hour";
        } else if (hoursLeft === 1) {
          hoursLeft = "an hour";
        } else {
          hoursLeft = hoursLeft + "  hours";
        }
      }
      const mailOptions = {
        from: "onecademy@umich.edu",
        to: email,
        subject:
          (from1Cademy ? "[1Cademy] " : "") +
          (courseName ? "[" + courseName + "] " : "") +
          (weAreWaiting
            ? "We Are Waiting for You in the UX Research Experiment Session!"
            : "Your UX Research Experiment Session Will Begin in " +
              hoursLeft +
              "!"),
        html: `<p>Hi ${firstname},</p>
<p></p>
${
  weAreWaiting
    ? "<p>Our UX researchers have been waiting for you in the UX research experiment session. " +
      "Please join the session at <a href=" +
      hangoutLink +
      ">this link</a>.</p><p>" +
      "You can also reply to this email to reschedule this session for you." +
      (["2nd", "3rd"].includes(order)
        ? " However, it does need to be today; otherwise, we must exclude your data from this study."
        : "")
    : "<p>Your UX research experiment session will begin in " +
      hoursLeft +
      "," +
      " but you've not accepted our invitation on Google Calendar yet!</p>" +
      "<p>Please respond Yes to our invitation on your Google Calendar, or reply to this email if you prefer to meet at another time today."
}
</p>
<p></p>
<p>Best regards,</p>
<p>1Cademy UX Research Team</p>
<div><div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature" data-lt-sig="1"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><div dir="ltr"><span style="color: rgb(136, 136, 136); font-size: 12.8px; --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">--</span></div><div dir="ltr"><span style="color: rgb(136, 136, 136); font-size: 12.8px; --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">Iman YeckehZaare</span><div><span style="color: rgb(136, 136, 136); font-size: 12.8px; --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">Ph.D. Candidate</span></div><div><span><font color="#888888" data-darkreader-inline-color="" style="--darkreader-inline-color:#7d756b;"><span style="font-size:12.8px">University of Michigan School of Information</span></font></span></div><div><font color="#888888" data-darkreader-inline-color="" style="--darkreader-inline-color:#7d756b;"><span style="font-size:12.8px">Outstanding Graduate Student Instructor of the Year 2018-2019</span></font><span><br></span></div><div><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color=""><a href="https://www.si.umich.edu/people/iman-yeckehzaare" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1x2fU9wvobcqM30Od779MVmeBQxWVXGfF&amp;revid=0B8-wWhGFpGYCckNhZUlHK250Tit3TGdVdlArajRGdlBsblFzPQ"></a>&nbsp; &nbsp;&nbsp;<a href="https://stackoverflow.com/users/2521204/1man" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1tSnswSYHWxRGGh-u54uNxPWKWqqHhvdM&amp;revid=0B8-wWhGFpGYCdlRmU2xPVkxjTS9HWU9lbHJGdC92OGgxeTFzPQ"></a>&nbsp;&nbsp;<a href="https://github.com/ImanYZ" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1ftgv8rj-ihFuA4ZE5mf9faXeNvz-F3vQ&amp;revid=0B8-wWhGFpGYCRVFGYjFDNGZRYnhMQ1dLU1lkNGZwT283UnFnPQ"></a>&nbsp;</span><a href="https://scholar.google.com/citations?user=zP9tLycAAAAJ" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=17-AQ6C9AoqN0pAqN3_4W07c8-ehTjZx-&amp;revid=0B8-wWhGFpGYCWHVhR1BjcnZraDNYMVdlRFcySytnRjkzOE9ZPQ" style="color: rgb(125, 117, 107); font-size: 12.8px; --darkreader-inline-color:#7f776d;" data-darkreader-inline-color=""></a>&nbsp;<span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp; </span><a href="https://dl.acm.org/profile/99659352229" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1wFUjKEJK1FwS3jkePqy0tVO6_vrJsEI0&amp;revid=0B8-wWhGFpGYCblkvNUJsSkVkQnVjTmtUMmtUaEljSWJkMFJvPQ" style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color=""></a><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp; &nbsp;<a href="https://en.wikipedia.org/wiki/User:I.yeckehzaare" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1E3DUxcWTrTw_tk357XSgzBGd6CgcyEOL&amp;revid=0B8-wWhGFpGYCR1ZmQ0YvaFg0NE9Nc2dTemhtemRMU00vWm9JPQ"></a></span><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp; &nbsp;<a href="https://twitter.com/Iman1Web" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1oqkF7mgDHoJ94GwkFG5qnikhbnJi6CCh&amp;revid=0B8-wWhGFpGYCQzI0d2ppWDlIZGp6czRsc2RLK1lwZUljWkNrPQ"></a>&nbsp;</span><span style="color: rgb(136, 136, 136); --darkreader-inline-color:#7d756b;" data-darkreader-inline-color="">&nbsp; <a href="https://www.linkedin.com/in/oneweb/" target="_blank"><img src="https://docs.google.com/uc?export=download&amp;id=1GorrsSKJS4xCSlqhlu2o4_xnAqms_Ncc&amp;revid=0B8-wWhGFpGYCQzdVN0RsUWtpb2s5TEpmVmFBZFVDT3hiOXc0PQ"></a></span></div></div></div></div></div></div></div></div></div></div></div></div>
`,
      };
      return transporter.sendMail(mailOptions, (error, data) => {
        if (error) {
          console.log({ error });
          return res.status(500).json({ error });
        }
        return res.status(200).json({ done: true });
      });
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ err });
  }
};
