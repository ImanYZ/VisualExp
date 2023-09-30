const { db } = require("../admin");
const { validateBooleanExpression } = require("../helpers/passage");
const stem = require("wink-porter2-stemmer");
const tokenizer = require("wink-tokenizer");
const sendPromptAndReceiveResponse = require("../helpers/send-prompt");

const USE_DIFFIRENT_PROMPT = [
  `In the escape jump, an ant orients its head and jaws perpendicular to the ground.`,
  `In the escape jump, trap-jaw ants slam their face straight down.`,
  `In the escape jump, cocked mandibles are released with a force 400 times the ant's body weight.`,
  `During the escape jump, the ant doesn't seem to go in any particular direction.`,
  `Escape jump helps the insect evade threats (ex. probing tongue of a lizard).`,
  `Escape jump helps the ants sow confusion.`,
  `Escape jump helps the ant get to a new vantage point to relaunch an attack.`,
  `Bouncer-defense jump is done when an intruder enters the trap-jaw ants' nest.`,
  `For bouncer-defense jump, one of the ants bangs its jaws against the intruder (if an intruder enters the ants' nest).`,
  `Bouncer-defense jump propels the interloper (if small enough) in one direction, out of the nest.`,
  `Bouncer-defense jump propels the ant in the other direction, away from the interloper.`,
  `Bouncer defense jump (force) often sends the ant an inch off the ground (vertical).`,
  `Bouncer defense jump (force) often sends the ant nearly a foot away (horizontal).`,
  `Bouncer-defense jump could have arisen out of attempts to bite intruders.`,
  `High, escape jump must have arisen from a different, perhaps accidental kind of behavior.`,
  `Escape jump helps the ants gain height.`,
  `Trap-jaw ants have two distinct modes of aerial locomotion (as observed by Patek and Baio).`,
  `The narrator (they) met Reena at the funeral of Aunt Vi (Reena's aunt)`,
  `Reena (She) imprinted those e's (in Reena) in people's minds with the black of her eyes and her threatening finger (which was like a quill).`,
  `They (The narrator and Reena) were not friends through their own choice.`,
  `Their (The narrator and Reena's) mothers knew each other (since their childhood).`,
  `Reena (She) seemed defined (mature).`,
  `The raw edges of her (Reena's) adolescence smoothed over.`,
  `Reena (She) was really an adult masquerading as a child (this idea consoled the narrator).`,
  `The narrator thinks the narrator was not Reena's match. (The narrator had been at a disadvantage)`,
  `Reena (She) had a negative attitude toward the narrator (them).`,
  `Reena (she) overwhelmed the narrator (them).`,
  `Reena (she) overwhelmed her family.`,
  `Reena's (Her) father avoided her (because he was in awe of Reena).`,
  `Reena (She) got away with (it) behaving like an only child.`,
  `Reena (she) behaved like an only child.`,
  `"Now...this" is commonly used on the radio and television newscasts.`,
  `"Now…this" indicates that what one has just heard or seen has no relevance to what one is about to hear and see.`,
  `"Now…this" indicates that what one has just heard or seen has no relevance to anything one is ever likely to hear and see.`,
  `The newscaster (saying "Now…this") means that you have thought long enough on the previous matter.`,
  `We are presented with news as pure entertainment.`,
  `The newscaster (saying "Now…this") means that you must not be morbidly preoccupied with the previous matter.`,
  `To attract the largest possible audience, you would, first, choose a cast of players.`,
  `A cast of players whose face should be "likable."`,
  `A cast of players whose face should be "credible."`,
  `A cast of players whose countenances (faces) are not suitable for nightly display should be eliminated.`,
  `We are presented with fragmented news on TV.`,
  `We are presented news without essential seriousness on TV.`,
  `You need to assemble a cast of talking hairdos.`,
  `The perception of the truth of a report rests heavily on the acceptability of a newscaster.`,
  `Research indicated Christine Craft's appearance "hampered viewer acceptance."`,
  `"Hampered viewer acceptance" means that the viewers do not like the look of the performer (reporter).`,
  `"Hampered viewer acceptance" means that viewers do not believe the performer (reporter).`,
  `Text messages are already a part of the cultural landscape.`,
  `The text message is more than a cultural fad.`,
  `Text messages offer permanence.`,
  `SMS is part of a broader shift in the way we connect with one another.`,
  `Speaking on an actual telephone is basically defunct (partly) because of the economic reason that "time is money."`,
  `Text messages provide a record of all our communications.`,
  `There are concerns about communication technologies.`,
  `“Real communication lives in the form - the tone, the unsteady hand on a particular word, the hasty erasures.” (Conceded by Fields)`,
  `Perhaps Fields is missing the point that everything (technologies) has compromised the way we think and understand.`,
  `Naysayers (critics) have said that new technologies have compromised the way we think and understand`,
  `Fields is (already) aware of the way new technologies compromise the way we think and understand.`,
  `Our communications are getting shorter and shorter.`,
  `The time we have for real interactions has shrunk.`,
  `All of these new devices are supposed to be time-savers.`,
  `Text messages bring us together.`,
  `We may cast text messages off quickly (casually).`,
  `We may have lost one of the essential elements of the human experience. (Suggested by Fields)`,
  `The (Cuban) revolution affected Isabel's early life in many ways`,
  `School was at least something Isabel (she) had known about.`,
  `Watching “Giselle” felt like a rebirth to Isabel.`,
  `The “Palace of the Galician Center” had a grandness of the interior.`,
  `The grandness of the interior (of “Palace of the Galician Center” ) made Isabel feel as if she were in the Cathedral, not a theater.`,
  `Years later, Isabel Moreno went to that (“Palace of the Galician Center”)  theater confidently clicking her high-heeled shoes on the same staircase.`,
  `When the music started and the dancers appeared (at the “Palace of the Galician Center”), Isabel couldn't lean back (due to being mesmerized). `,
  `When the music started and the dancers appeared (at the “Palace of the Galician Center”), Isabel was so mesmerized by what was happening on the stage. `,
  `Isabel whispered "thank you, my son" or “Gracias, mi hijo.”`,
  `(At the “Palace of the Galician Center” ) The dancers' movements transported Isabel to a joyful and yearning world. `,
  `Isabel (She) knew those feelings, but had never been able to convey (imagine or express) them as perfectly as dancers (at the “Palace of the Galician Center” ) did.`,
  `Isabel wept for weeks (due to her rejection from the ballet school).`,
  `Isabel had begged her mother to let her try out for ballet school.`,
  `When Isabel attended ballet as an adult, she felt the same overwhelming sadness so powerful that she felt strangely joyful.`,
  `Alejandro had been trying to get her to come visit Miami for years, but she had never accepted`,
  `Alejandro had tried to entice his mother with visits to the Miami Ballet, but Isabel wasn't interested.`,
  `Baryshnikov's fierceness inspired Isabel to overcome her hesitations (about paperwork and vacation time).`,
  `(At the Miami Ballet) Isabel (She) was transported back to that first day at the ballet when she was a schoolgirl. `,
  `As a schoolgirl, Isabel (she) hadn't known such places (“Palace of the Galician Center”) existed.`,
  `Berry was a recording-session musician.`,
  `There is a lack of recognition regarding Berry (Why people never heard of him is pretty simple). `,
  `Berry did not cut many sessions himself as a leader.`,
  `When given opportunity, Berry displayed great musical dexterity.`,
  `It wasn't in Berry's nature to call attention to himself (or his playing).`,
  `Berry was laid-back and affable (easy-going).`,
  `Berry exhibited the willingness to fit in (many dance bands). `,
  `Berry (was the rare artist who) refused to put his interests above those of the band.`,
  `Berry was a bandsman.`,
  `Berry never played (simply) to show off.`,
  `A Ghost of a Chance is the sole recording (in Berry's career) to feature Berry from start to finish.`,
  `A Ghost of a Chance was Berry's "Body and Soul."`,
  `A Ghost of a Chance is a response to Coleman Hawkin's famous recording ("Body and Soul").`,
  `A Ghost of a Chance may be Berry's one and only instance of indulgence on a record.`,
  `A Ghost of a Chance is a cathedral of a solo (due to its flourishes, angles, ornamentations, reflexivity).`,
  `Dr. Dajun Wang is an activist (conservation biologist).`,
  `Dr. Dajun Wang balances (walks a fine line between) advocating for wildlife habitat conservation and advocating for zoos.`,
  `Giant pandas are one of the most beloved creatures. (Pandas have universal appeal.)`,
  `Wang's ultimate goal is to preserve species in the wild.`,
  `Animal rights activists (Critics) say that zoos run counter to preserving species in the wild.`,
  `Animal rights activists (Critics) say that little is being done to slow habitat destruction (stem the tide) in the wild.`,
  `Wang sees the (new) habitat as a positive trend in zoo design.`,
  `Wang is concerned about all the animals affected by habitat loss.`,
  `Critics dislike the focus on pandas.`,
  `Wang understands the critics' dislikes (over focus on pandas and the overspending on a single species).`,
  `Pandas can serve as ambassadors for conservation.`,
  `Pandas were chosen as the icon for the World Wildlife Federation.`,
  `Pandas become a symbol for endangered species worldwide.`,
  `The resources (money and research) that pandas generate benefit other species.`,
  `Wang characterizes the corridors as rivers, rather than isolated ponds (that are constantly in danger of drying out). `,
  `Wang stresses the need to find balance between spending money on breeding pandas and addressing underlying human behaviors. `,
  `For the barn owl life depends on hearing.`,
  `Barn owls are nocturnal hunters.`,
  `The bird (barn owl) must find prey through sound.`,
  `The bird (barn owl) locate prey like field mice.`,
  `The barn owl can locate sounds better than any other animal (whose hearing has been tested).`,
  `The bird (barn owl) hunt from air.`,
  `Human beings locating sound in the azimuth (horizontal dimension) have similar accuracy as barn owls.`,
  `Human beings locating sound in elevation (vertical dimension) are three times worse than barn owls.`,
  `The layer of fine facial feathers is acoustically transparent.`,
  `Even in complete darkness (In a completely dark experimental chamber), the owl swoops down on the prey (mouse).`,
  `Even in complete darkness (In a completely dark experimental chamber), the barn owl aligns its talons with the body axis of the prey (mouse).`,
  `The ability to align talons is not an accidental behavior.`,
  `The ability to realign talons when the prey (mouse) turns and runs in a different direction.`,
  `The barn owl detects subtle changes in the sound origin to infer movement direction of the prey.`,
  `Realigning talons implies that the barn owl detects subtle changes in the origin of the sound.`
];

const updateGradingPointsForResearchers = (researchersUpdates, voteResearchers, recallGradeData, votePoint) => {
  for (const voteResearcher of voteResearchers) {
    if (researchersUpdates[voteResearcher].projects.hasOwnProperty(recallGradeData.project)) {
      let gradingPoints = researchersUpdates[voteResearcher].projects[recallGradeData.project].gradingPoints || 0;
      let negativeGradingPoints =
        researchersUpdates[voteResearcher].projects[recallGradeData.project].negativeGradingPoints || 0;
      gradingPoints += votePoint;

      if (votePoint < 0) {
        negativeGradingPoints += Math.abs(votePoint);
      }

      researchersUpdates[voteResearcher].projects[recallGradeData.project].gradingPoints = Math.max(gradingPoints, 0);
      researchersUpdates[voteResearcher].projects[recallGradeData.project].negativeGradingPoints =
        negativeGradingPoints;
    }
    if (researchersUpdates[voteResearcher].projects.hasOwnProperty("Autograding")) {
      let gradingPoints = researchersUpdates[voteResearcher].projects["Autograding"].gradingPoints || 0;
      let negativeGradingPoints = researchersUpdates[voteResearcher].projects["Autograding"].negativeGradingPoints || 0;
      gradingPoints += votePoint;
      if (votePoint < 0) {
        negativeGradingPoints += Math.abs(votePoint);
      }

      researchersUpdates[voteResearcher].projects["Autograding"].gradingPoints = gradingPoints;
      researchersUpdates[voteResearcher].projects["Autograding"].negativeGradingPoints = negativeGradingPoints;
    }
  }
};

const convertToVotesByPhrasesFunction = (conditionUpdates, sessionRecallGrade, fullname) => {
  return conditionUpdates.phrases.reduce((c, phrase) => {
    const phraseIdx = sessionRecallGrade.phrases.findIndex(p => p.phrase === phrase.phrase);
    const presentedPhrase = sessionRecallGrade.phrases[phraseIdx];

    // extracting researcher's vote from payload
    const { grades, researchers } = presentedPhrase || {};
    const researcherIdx = (researchers || []).indexOf(fullname);
    const grade = researcherIdx !== -1 ? grades[researcherIdx] || false : false; // researcher's vote

    // extracting other researcher's vote from firebase document
    let { grades: docGrades, researchers: docResearchers } = phrase;
    docGrades = docGrades || [];
    docResearchers = docResearchers || [];

    const previousGrades = {
      // sum of previous up votes from all researchers
      upVotes: docGrades.reduce((c, g) => c + (g === true ? 1 : 0), 0),
      // sum of previous up votes from all researchers
      downVotes: docGrades.reduce((c, g) => c + (g === false ? 1 : 0), 0)
    };

    // removing current researcher's vote from phrase if already exist by chance
    const currentResearcherIdx = (docResearchers || []).indexOf(fullname);
    if (currentResearcherIdx !== -1) {
      docResearchers.splice(currentResearcherIdx, 1);
      docGrades.splice(currentResearcherIdx, 1);
    }

    // adding values to condition updates
    phrase.grades = [...docGrades];
    phrase.researchers = [...docResearchers];

    if (phraseIdx !== -1) {
      phrase.grades.push(grade);
      phrase.researchers.push(fullname);
    }

    return {
      ...c,
      [phrase.phrase]: {
        // sum of up votes from other researchers and current one
        upVotes: docGrades.reduce((c, g) => c + (g === true ? 1 : 0), phraseIdx !== -1 ? (grade ? 1 : 0) : 0),
        // sum of down votes from other researchers and current one
        downVotes: docGrades.reduce((c, g) => c + (g === false ? 1 : 0), phraseIdx !== -1 ? (!grade ? 1 : 0) : 0),
        // list of all researchers that voted on this phrase
        researchers: phrase.researchers,
        grades: phrase.grades,
        previousResearcher: previousGrades.upVotes + previousGrades.downVotes
      }
    };
  }, {});
};

const incrementGradingNum = (researcher, project) => {
  if (researcher.projects.hasOwnProperty(project)) {
    let gradenum = researcher.projects[project].gradingNum || 0;
    gradenum += 1;
    researcher.projects[project].gradingNum = gradenum;
  }
};

const getRecallResponse = session => {
  switch (session) {
    case "1st":
      return "recallreGrade";
    case "2nd":
      return "recall3DaysreGrade";
    case "3rd":
      return "recall1WeekreGrade";
    default:
      throw new Error("Unknown value for session");
  }
};

const separateResearchersByVotes = votesOfPhrase => {
  const upVoteResearchers = [];
  const downVoteResearchers = [];
  for (let r = 0; r < votesOfPhrase.grades.length; r++) {
    if (votesOfPhrase.grades[r]) {
      upVoteResearchers.push(votesOfPhrase.researchers[r]);
    } else {
      downVoteResearchers.push(votesOfPhrase.researchers[r]);
    }
  }
  return { upVoteResearchers, downVoteResearchers };
};
const loadBooleanExpressions = async () => {
  const booleanByphrase = {};
  const booleanScratch = await db.collection("booleanScratch").get();
  for (const booleanScratchDoc of booleanScratch.docs) {
    const booleanScratchData = booleanScratchDoc.data();
    if (booleanScratchData.deleted) continue;
    if (booleanByphrase.hasOwnProperty(booleanScratchData.phrase)) {
      booleanByphrase[booleanScratchData.phrase].push(booleanScratchData);
    } else {
      booleanByphrase[booleanScratchData.phrase] = [booleanScratchData];
    }
  }
  for (const phrase in booleanByphrase) {
    booleanByphrase[phrase].sort((e1, e2) => {
      const e1Vote = (e1.upVotes || 0) - (e1.downVotes || 0);
      const e2Vote = (e2.upVotes || 0) - (e2.downVotes || 0);
      return e1Vote < e2Vote ? 1 : -1;
    });
  }
  return booleanByphrase;
};

const checkFullyGradedRecall = async (recallSession, researcher) => {
  if (process.env.NODE_ENV === "test") {
    return true;
  }
  let fullyGraded = true;
  const booleanByphrase = await loadBooleanExpressions();

  recallSession.forEach(conditionItem => {
    const filtered = (conditionItem.response || "")
      .replace(/[\.,]/g, " ")
      .split(" ")
      .filter(w => w.trim());
    if (filtered.length > 2) {
      const phrasesSatisfied = conditionItem.phrases.filter(phrase => {
        const schemaE = booleanByphrase[phrase.phrase] ? booleanByphrase[phrase.phrase][0].schema : [];
        return (
          !phrase.deleted &&
          !phrase.researchers.includes(researcher) &&
          phrase.researchers.length < 4 &&
          validateBooleanExpression(schemaE, conditionItem.response)
        );
      });

      if (phrasesSatisfied.length > 0) {
        fullyGraded = false;
      }
    }
  });

  return fullyGraded;
};
const extractArray = arrayString => {
  const start = arrayString.indexOf("[");
  const end = arrayString.lastIndexOf("]");
  const jsonArrayString = arrayString.slice(start, end + 1);
  return jsonArrayString;
};

const stemPhrase = str => {
  const myTokenizer = tokenizer();
  let tokenized = myTokenizer.tokenize(str);
  tokenized = tokenized.filter(token => token.tag !== "punctuation");
  for (let token of tokenized) {
    token.value = stem(token.value);
  }
  return tokenized;
};

const generatePrompt = ({ phrase, passageTitle, response, originalPassage }) => {
  if (USE_DIFFIRENT_PROMPT.includes(phrase)) {
    return `
  ‘’'${originalPassage}‘’'\n
  A student has written the following triple-quoted answer to a question:\n
  ‘’'${response}‘’'\n
  \n
  Respond whether the student has mentioned each of the following rubric items, listed as items of the following array, in their writing (Don't try to add any extra rubric items, only use the ones in this array):\n
  [${phrase}]
  \n
  Your response should be a javascript array of objects. Each item-object should represent a rubric item, as an object with the following key-value pairs:
  {
  "rubric_item": [the rubric item string goes here],
  "mentioned": the value should be either "YES" or "NO",
  "correct": if the student has mentioned the key phrase and their explanation is correct, the value should be "YES", otherwise, "NO",
  "sentences": [an array of sentences from the student's answer, which mention the key phrase.] If the student has not mentioned the key phrase anywhere in their answer, the value should be an empty array [].
  }`;
  }

  return `A student has written the following triple-quoted answer to a question:\n
      ‘’'\n${passageTitle}:\n${response}‘’'\n
      \n
      Respond whether the student has mentioned each of the following rubric items, listed as items of the following array, in their writing (Don't try to add any extra rubric items, only use the ones in this array):\n
      [${phrase}]
      \n
      Your response should be a javascript array of objects. Each item-object should represent a rubric item, as an object with the following key-value pairs:
      {
      "rubric_item": [the rubric item string goes here],
      "mentioned": the value should be either "YES" or "NO",
      "correct": if the student has mentioned the key phrase and their explanation is correct, the value should be "YES", otherwise, "NO",
      "sentences": [an array of sentences from the student's answer, which mention the key phrase.] If the student has not mentioned the key phrase anywhere in their answer, the value should be an empty array [].
      }`;
};

const areArraysEqual = (array1, array2) => {
  if (array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (array1[i].value !== array2[i].value) {
      return false;
    }
  }

  return true;
};

const needsToStopGrading = (phrase, responseGptArray) => {
  const gptMajority = responseGptArray.reduce((acc, cur) => countMajority(acc, cur, phrase), []);
  const condition =
    gptMajority.filter(e => e === "yes").length === 2 || gptMajority.filter(e => e === "no").length === 3;
  return condition;
};

const gradeSinglePhrase = async ({ phrase, response, passageTitle, originalPassage }) => {
  try {
    let response_array_gpt4 = [];

    let ERROS_DETECTED = 0;
    for (let i = 0; i < 4; i++) {
      let prompt_gpt4 = generatePrompt({ phrase, passageTitle, response, originalPassage });

      let response_gpt4 = "";
      let numberTries_gpt4 = 0;

      console.log({ prompt_gpt4 });
      console.log(
        `waiting for response from  gpt-4-0613...` +
          (ERROS_DETECTED > 0 ? "\x1b[33m" + `--> TRY AGAIN ${ERROS_DETECTED}\n` + "\x1b[0m" : `\n`)
      );
      while (!response_gpt4) {
        if (numberTries_gpt4 > 0) console.log(" request failed trying again ...\n ");
        try {
          response_gpt4 = await sendPromptAndReceiveResponse({
            model: "gpt-4-0613",
            prompt: prompt_gpt4
          });
        } catch (error) {
          console.log("ERROR SENDING PROMPT TO gpt-4-0613 PLEASE CHECK FOR ANY ERRORS IN THE CONSOLE");
          console.log("error", error);
        }
        numberTries_gpt4++;
        if (numberTries_gpt4 > 3) {
          break;
        }
      }
      console.log({ response_gpt4: extractArray(response_gpt4) });

      try {
        const responseArray_gpt4 = JSON.parse(extractArray(response_gpt4));

        responseArray_gpt4.forEach((element, idx) => {
          const tokenizedPhrase = stemPhrase(element["rubric_item"]);

          const _tokenizedPhrase = stemPhrase(phrase);
          if (areArraysEqual(tokenizedPhrase, _tokenizedPhrase)) {
            element["rubric_item"] = phrase;
          }
        });

        response_array_gpt4.push(responseArray_gpt4);
        if (needsToStopGrading(phrase, response_array_gpt4)) {
          break;
        }

        ERROS_DETECTED = 0;
      } catch (error) {
        console.log(error);
        ERROS_DETECTED++;
        console.log(
          "\x1b[31m" +
            "THERE IS AN ERROR WHILE PARSING THE REPONSE FROM GPT " +
            "\x1b[33m" +
            (ERROS_DETECTED < 2 ? "\n --> TRYING AGAIN ...\n" : "") +
            "\x1b[0m"
        );
      }
      if (ERROS_DETECTED >= 2) {
        break;
      }
    }
    if (ERROS_DETECTED >= 2) {
      return { error: true };
    }
    return { response_array_gpt4 };
  } catch (error) {
    console.log(error);
  }
};

const ObjectToArray = object => {
  const resultArray = [];
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      resultArray.push(object[key]);
    }
  }
  return resultArray;
};

const ArrayToObject = arrayOfArrays => {
  const resultObject = {};
  for (let i = 0; i < arrayOfArrays.length; i++) {
    resultObject[i + 1] = arrayOfArrays[i];
  }
  return resultObject;
};
function filterItemsByRubric(array, rubricItems) {
  return array.filter(item => !rubricItems.includes(item.rubric_item));
}

const replaceNewLogs = ({ prevLogs, newLogs, phrasesToGrade }) => {
  prevLogs = prevLogs.map(subarray =>
    filterItemsByRubric(
      subarray,
      phrasesToGrade.map(p => p.phrase)
    )
  );

  const maxLength = Math.max(prevLogs.length, newLogs.length);

  for (let preIdx = 0; preIdx < maxLength; preIdx++) {
    const newLogsIteration = newLogs[preIdx] || [];
    const prevLogsIteration = prevLogs[preIdx] || [];
    for (const phrase of newLogsIteration) {
      prevLogsIteration.push(phrase);
    }
    if (preIdx < prevLogs.length) {
      prevLogs[preIdx] = prevLogsIteration;
    } else {
      prevLogs.push(prevLogsIteration);
    }
  }

  return prevLogs;
};

const countMajority = (acc, cur, phrase) => {
  const phraseResponseIdx = cur.findIndex(p => p.rubric_item === phrase);
  if (phraseResponseIdx !== -1) {
    if (cur[phraseResponseIdx].correct.toLowerCase() === "yes") {
      acc.push("yes");
    } else if (cur[phraseResponseIdx].correct.toLowerCase() === "no") {
      acc.push("no");
    }
  }
  return acc;
};

const reduceGrade = (responseLogs, phrase) => {
  const gptMajority = responseLogs.reduce((acc, cur) => countMajority(acc, cur, phrase), []);
  if (gptMajority.length === 0) return null;

  if (gptMajority.filter(e => e === "yes").length >= 2) {
    return true;
  }

  if (gptMajority.filter(e => e === "no").length >= 3) {
    return false;
  }
};
module.exports = {
  loadBooleanExpressions,
  checkFullyGradedRecall,
  updateGradingPointsForResearchers,
  convertToVotesByPhrasesFunction,
  separateResearchersByVotes,
  getRecallResponse,
  incrementGradingNum,
  gradeSinglePhrase,
  ObjectToArray,
  ArrayToObject,
  replaceNewLogs,
  reduceGrade
};
