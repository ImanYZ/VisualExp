const { dbReal } = require("../admin_real");

const { replaceNewLogs, ArrayToObject } = require("../helpers/grading-recalls");
const updateLogs = ({
  phrasesgpt35,
  phrasesgpt4,
  previousLogData,
  conditionIndex,
  session,
  responseLogsGPT4,
  responseLogsGPT3_5
}) => {
  const _previousLogData = { ...previousLogData };
  if (!_previousLogData.sessions.hasOwnProperty(session)) {
    _previousLogData.sessions[session] = {};
  }

  const sessionItem = _previousLogData.sessions[session];
  if (sessionItem.hasOwnProperty(conditionIndex)) {
    const previousPhrasesGpt4 = (sessionItem[conditionIndex]?.gpt4 || []).filter(
      item => item !== null && item !== undefined
    );

    const previousPhrasesGpt3_5 = (sessionItem[conditionIndex].gpt35 || []).filter(
      item => item !== null && item !== undefined
    );

    const resultLogsGpt4 = replaceNewLogs({
      prevLogs: previousPhrasesGpt4,
      newLogs: responseLogsGPT4,
      phrasesToGrade: phrasesgpt4
    });
    const resultLogsGpt3_5 = replaceNewLogs({
      prevLogs: previousPhrasesGpt3_5,
      newLogs: responseLogsGPT3_5,
      phrasesToGrade: phrasesgpt35
    });

    sessionItem[conditionIndex].gpt4 = ArrayToObject(resultLogsGpt4);

    sessionItem[conditionIndex].gpt35 = ArrayToObject(resultLogsGpt3_5);
  } else {
    sessionItem[conditionIndex] = {
      gpt4: ArrayToObject(responseLogsGPT3_5),
      gpt35: ArrayToObject(responseLogsGPT4)
    };
  }
  return _previousLogData;
};

module.exports = async (req, res) => {
  try {
    const { docId, recallGrade } = req.body;
    const recallGradesLogsRef = dbReal.ref(`/recallGradesGPTLogs/${docId}`);
    await recallGradesLogsRef.transaction(currentData => {
      if (currentData !== null) {
        currentData = { sessions: {} };
      }
      currentData = updateLogs({
        phrasesgpt35: recallGrade.gpt35phrases,
        phrasesgpt4: recallGrade.gpt4phrases,
        previousLogData: currentData,
        conditionIndex: recallGrade.conditionIndex,
        session: recallGrade.session,
        responseLogsGPT4: recallGrade?.gpt4 || [],
        responseLogsGPT3_5: recallGrade?.gpt3_5 || []
      });
      if (currentData.hasOwnProperty("sessions")) {
        return currentData;
      }
    });
    return res.status(200).send({ message: "updated Logs successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "error occurred",
      error
    });
  }
};
