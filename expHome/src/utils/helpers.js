import { toOrdinal } from "number-to-words";

const isEmail = (email) => {
  const regEx =
  // eslint-disable-next-line
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const formatPoints = (point = 0) => point.toFixed(2).replace(/\.0+$/, '');

const isValidHttpUrl = (string) => {
  let url;
  try {
    url = new URL(string);
    if (string.includes(" ")) {
      return false;
    }
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

const getFullname = (firstname, lastname) => {
  return (firstname + " " + lastname)
    .replace(".", "")
    .replace("__", " ")
    .replace("/", " ");
};

const sortedIndex = (array, value) => {
  let low = 0,
    high = array.length;

  while (low < high) {
    const mid = (low + high) >>> 1;
    if (array[mid] < value) low = mid + 1;
    else high = mid;
  }
  return low;
};

const shuffleArray = (array) => {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return array;
}

const getRecallConditionsByRecallGrade = (recallGradeDoc, fullname, gptResearcher) => {
  const recallGradeData = recallGradeDoc.data();
  const conditionItems = [];

  let sessionNums = Object.keys(recallGradeData.sessions).map(sessionKey =>
    parseInt(sessionKey.replace(/[^0-9]+/g, ""))
  );
  sessionNums.sort((a, b) => (a < b ? -1 : 1));

  for (const sessionNum of sessionNums) {
    if (!sessionNum) continue;
    for (const conditionItem of recallGradeData.sessions[toOrdinal(sessionNum)]) {
      const filtered = (conditionItem.response || "")
        .replace(/[\.,]/g, " ")
        .split(" ")
        .filter(w => w.trim());
      if (
        recallGradeData.user !== fullname &&
        !conditionItem.researchers.includes(fullname) &&
        (
          conditionItem.researchers.filter((researcher) => researcher !== gptResearcher).length < 4 ||
          fullname === gptResearcher
        ) &&
        filtered.length > 2
      ) {
        conditionItems.push({
          docId: recallGradeDoc.id,
          session: toOrdinal(sessionNum),
          user: recallGradeData.user,
          project: recallGradeData.project,
          ...conditionItem
        });
      }
    }
  }

  return conditionItems;
}

const consumeRecallGradesChanges = (changes, recallGrades, fullname, gptResearcher) => {
  const recallBotId = localStorage.getItem("recall-bot-id");
  let _recallGrades = [...recallGrades];
  for (const change of changes) {
    const recallGradeDoc = change.doc;

    if(change.type === "removed") {
      _recallGrades = _recallGrades.filter((_recallGrade) => _recallGrade.docId !== recallGradeDoc.id);
    } else if(change.type === "added") {
      const alreadyExisting = _recallGrades.some((_recallGrade) => _recallGrade.docId === recallGradeDoc.id);
      if(alreadyExisting) continue;

      const __recallGrades = getRecallConditionsByRecallGrade(recallGradeDoc, fullname, gptResearcher);
      for(const __recallGrade of __recallGrades) {
        // if its bot then we need to check if these recalls are being processed by other bot instance
        if(gptResearcher === fullname) {
          if(__recallGrade.gptInstance && __recallGrade.gptInstance !== recallBotId) {
            continue;
          }
        }
        _recallGrades.push(__recallGrade);
      }
    } else if(change.type === "modified") {
      const __recallGrades = getRecallConditionsByRecallGrade(recallGradeDoc, fullname, gptResearcher);
      const currentRecallGrades = _recallGrades.filter((_recallGrade) => _recallGrade.docId === recallGradeDoc.id);
      // removing recall grades from state if they are removed due to conditions
      for(const currentRecallGrade of currentRecallGrades) {
        const conditionItems = __recallGrades.filter(
          (__recallGrade) =>
          __recallGrade.session === currentRecallGrade.session && 
          __recallGrade.passage === currentRecallGrade.passage
        );
        const currentRecallIdx = _recallGrades.indexOf(currentRecallGrade);
        if(currentRecallIdx !== -1) {
          // if condition item is removed
          if(!conditionItems.length) {
            _recallGrades.splice(currentRecallIdx, 1);
          } else {
            _recallGrades[currentRecallIdx] = conditionItems[0];
          }
        }
      }
    }
  }
  return _recallGrades;
}

export {
  isEmail,
  formatPoints,
  isValidHttpUrl,
  uuidv4,
  getFullname,
  sortedIndex,
  shuffleArray,
  getRecallConditionsByRecallGrade,
  consumeRecallGradesChanges
}