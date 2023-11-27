const { dbReal } = require("../admin_real");

const { replaceNewLogs, ArrayToObject } = require("../helpers/grading-recalls");
const updateLogs = ({
  phrasesLLama,
  phrasesgpt4,
  previousLogData,
  conditionIndex,
  session,
  responseLogsGPT4,
  responseLogsllama
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

    const previousPhrasesLlama = (sessionItem[conditionIndex].llama || []).filter(
      item => item !== null && item !== undefined
    );

    const resultLogsGpt4 = replaceNewLogs({
      prevLogs: previousPhrasesGpt4,
      newLogs: responseLogsGPT4,
      phrasesToGrade: phrasesgpt4
    });
    const resultLogsLLama = replaceNewLogs({
      prevLogs: previousPhrasesLlama,
      newLogs: responseLogsllama,
      phrasesToGrade: phrasesLLama
    });

    sessionItem[conditionIndex].gpt4 = ArrayToObject(resultLogsGpt4);

    sessionItem[conditionIndex].llama = ArrayToObject(resultLogsLLama);
  } else {
    sessionItem[conditionIndex] = {
      gpt4: ArrayToObject(responseLogsGPT4),
      llama: ArrayToObject(responseLogsllama)
    };
  }
  return _previousLogData;
};

module.exports = async (req, res) => {
  try {
    const payload = req.body;
    const { phrasesLLama, gpt4phrases, conditionIndex, session, gpt4, llama, docId } = payload;
    const recallGradesLogsRef = dbReal.ref(`/recallGradesGPTLogs/${docId}`);
    await recallGradesLogsRef.transaction(currentData => {
      if (currentData === null) {
        currentData = { sessions: {} };
      }
      currentData = updateLogs({
        phrasesLLama: phrasesLLama || [],
        phrasesgpt4: gpt4phrases || [],
        previousLogData: currentData,
        conditionIndex: conditionIndex,
        session: session,
        responseLogsGPT4: gpt4 || [],
        responseLogsllama: llama || []
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
