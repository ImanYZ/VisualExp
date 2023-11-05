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
      gpt4: ArrayToObject(responseLogsGPT4),
      gpt35: ArrayToObject(responseLogsGPT3_5)
    };
  }
  return _previousLogData;
};

module.exports = async (req, res) => {
  try {
    const payload = req.body;
    const recallGradesLogsRef = dbReal.ref(`/recallGradesGPTLogs/${payload.docId}`);
    console.log("payload", payload);
    await recallGradesLogsRef.transaction(currentData => {
      if (currentData === null) {
        currentData = { sessions: {} };
      }
      currentData = updateLogs({
        phrasesgpt35: payload.gpt35phrases || [],
        phrasesgpt4: payload.gpt4phrases || [],
        previousLogData: currentData,
        conditionIndex: payload.conditionIndex,
        session: payload.session,
        responseLogsGPT4: payload?.gpt4 || [],
        responseLogsGPT3_5: payload?.gpt3_5 || []
      });
      if (currentData.hasOwnProperty("sessions")) {
        console.log(currentData);
        return currentData;
      }
    });
    return res.status(200).send({ error: false });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: true
    });
  }
};
