const { db, batchSet, commitBatch } = require("../admin");
const { instMailOptions } = require("../helpers/instructorsMailOptions");

module.exports = async context => {
  try {
    const instructorDocs = await db
      .collection("instructors")
      .where("no", "==", false)
      .where("yes", "==", false)
      .where("scheduled", "==", false)
      .where("deleted", "==", false)
      .get();
    const emailsDocs = await db.collection("emails").where("sent", "==", false).get();
    const emails = emailsDocs.docs.map(emailDoc => emailDoc.data().email);
    const instructors = instructorDocs.docs
      .map(instructorDoc => {
        return { ...instructorDoc.data(), id: instructorDoc.id };
      })
      .filter(
        inst =>
          ((inst?.upVotes || 0) - (inst?.downVotes || 0) >= 1 || inst.scraped) &&
          (!inst.nextReminder || inst.nextReminder.toDate().getTime() < new Date().getTime()) &&
          !emails.includes(inst.email) &&
          inst.interestedTopic &&
          inst.reminders < 4
      );
    for (let instructor of instructors) {
      const { email, prefix, lastname, interestedTopic, city, stateInfo, country } = instructor;
      const topic = interestedTopic
        .split(" ")
        .map(word => (word.length > 4 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word))
        .join(" ");
      let randomNumber = 0;
      if (instructor.hasOwnProperty("emailNumber")) {
        randomNumber = instructor.emailNumber;
      }
      let introducedBy = false;
      if (instructor.hasOwnProperty("introducedBy")) {
        introducedBy = instructor.introducedBy;
      }
      const mailOptions = instMailOptions(email, topic, prefix, lastname, instructor.id, introducedBy, randomNumber);
      const emailRef = db.collection("emails").doc();
      await batchSet(emailRef, {
        mailOptions,
        reason: "instructor",
        createdAt: new Date(),
        email,
        city,
        stateInfo,
        country,
        urgent: false,
        documentId: instructor.id,
        sent: false,
        emailNumber: randomNumber
      });
    }
    await commitBatch();
  } catch (err) {
    console.log({ err });
  }
};
