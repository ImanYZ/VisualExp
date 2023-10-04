const dbReal = require("../../admin_real");
const { gradeSinglePhrase, replaceNewLogs, ObjectToArray, ArrayToObject } = require("../../helpers/grading-recalls");

module.exports = async (req, res) => {
  try {
    console.log("GRADE GPT");
    // const { docId, session, condition, phrase, response, passageTitle, originalPassage } = req.body.record;
    // await dbReal.ref().transaction(async transactionData => {
    //   const previousLogDoc = await transactionData.child(`recallGradesBotLogs/${docId}`).once("value");
    //   const previousLogData = previousLogDoc.val();

    //   const { response_array_gpt4 } = await gradeSinglePhrase({ phrase, response, passageTitle, originalPassage });

    //   if (!previousLogData.sessions.hasOwnProperty(session)) {
    //     previousLogData.sessions[session] = {};
    //   }
    //   const sessionItem = previousLogData.sessions[session];
    //   if (sessionItem.hasOwnProperty(condition)) {
    //     const previousPhrasesGpt4 = session[condition].gpt4;
    //     const resultResponses = replaceNewLogs({
    //       prevLogs: ObjectToArray(previousPhrasesGpt4),
    //       newLogs: response_array_gpt4
    //     });
    //     session[condition].gpt4 = ArrayToObject(resultResponses);
    //   } else {
    //     session[condition] = {
    //       gpt4: ArrayToObject(response_array_gpt4)
    //     };
    //   }
    //   transactionData.child(`recallGradesBotLogs/${docId}`).set(previousLogData);
    // });
    return res.status(200).send({});
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
};
