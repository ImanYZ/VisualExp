const { db } = require("../../admin");
const { getNonSatisfiedPhrasesByPassageTitle } = require("../../helpers/passage");

module.exports = async (req, res) => {
  try {
    const {
      recallGrade: sessionRecallGrade,
      voterProject,
      viewedPhrases
    } = req.body;
    const { docId: fullname } = req.researcher;
    
    const { researcher } = req;
  
    if(!sessionRecallGrade || !voterProject || !viewedPhrases) {
      return res.status(500).send({
        message: "some parameters are missing"
      });
    }
  
    const { session, condition } = sessionRecallGrade;
  
    await db.runTransaction(async (t) => {
      const transactionWrites = [];
      
      const researcherProject = researcher.projects[voterProject];
      let gradingNum = researcherProject?.gradingNum || 0;
      gradingNum += viewedPhrases.length;
      researcher.projects[voterProject].gradingNum = gradingNum;
  
      const passage = await db.collection("passages").doc(sessionRecallGrade.passage).get();
      const passageData = passage.data();
  
      const recallGradeRef = db.collection("recallGradesV2").doc(sessionRecallGrade.docId);
      const recallGrade = await recallGradeRef.get();
      const recallGradeData = recallGrade.data();
      const conditionIdx = recallGradeData.sessions[session].findIndex((conditionItem) => conditionItem.condition === condition);
      if(conditionIdx === -1) {
        throw new Error("unknown condition supplied")
      }
      const conditionUpdates = recallGradeData.sessions[session][conditionIdx];

      const researchers = await db.collection("researchers").get();
      let researchersUpdates = {};
      let updatedResearcers = [];
      for(const researcher of researchers.docs) {
        const researcherData = researcher.data();
        if(!researcherData.projects.hasOwnProperty(recallGradeData.project) || !researcherData.projects[recallGradeData.project].active) {
          continue;
        }
        researchersUpdates[researcher.id] = researcherData;
      }

      // adding gradingNum
      researchersUpdates[researcher.docId].projects = researcher.projects;
      updatedResearcers.push(researcher.docId);

      // loading user data from recall grade document
      const user = await db.collection("users").doc(recallGradeData.user).get();
      let userUpdates = user.data();
      let userUpdated = false;
  
      // filtering non satisfied phrases from recallgrade
      const nonSatisfiedPhrases = await getNonSatisfiedPhrasesByPassageTitle(passageData.title, conditionUpdates.response, conditionUpdates.phrases);
  
      // filtering satisfied phrases to calculate if session is verified or not
      const satisfiedPhrases = conditionUpdates.phrases.filter((phrase) => !nonSatisfiedPhrases.includes(phrase.phrase))
  
      // there should be 4 down/no votes or up/yes votes to consider phrase approval
      const votesByPhrases = conditionUpdates.phrases.reduce((c, phrase) => {
        const _phrase = sessionRecallGrade.phrases.find((_phrase) => _phrase.phrase === phrase.phrase);

        // extracting researcher's vote from payload
        const { grades, researchers } = _phrase || {};
        const researcherIdx = (researchers || []).indexOf(fullname);
        const grade = researcherIdx !== -1 ? (grades[researcherIdx] || false) : false; // researcher's vote

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
        const _researcherIdx = (docResearchers || []).indexOf(fullname);
        if(_researcherIdx !== -1) {
          docResearchers.splice(_researcherIdx, 1)
          docGrades.splice(_researcherIdx, 1)
        }

        // if phrase was previously approved we skip it (according to sam we only execute when we have exactly 4 researchers in phrase)
        /* const previouslyApprove = previousGrades.upVotes >= 3 || previousGrades.downVotes >= 3;
        if(previouslyApprove) {
          return c;
        } */

        // adding values to condition updates
        const wasPresented = viewedPhrases.includes(phrase.phrase);
        phrase.grades = [...docGrades]
        phrase.researchers = [...docResearchers]

        if(wasPresented) {
          phrase.grades.push(grade)
          phrase.researchers.push(fullname)
        }

        return {
          ...c, [phrase.phrase]: {
            // sum of up votes from other researchers and current one
            upVotes: docGrades.reduce((c, g) => c + (g === true ? 1 : 0), wasPresented ? (grade ? 1 : 0) : 0),
            // sum of down votes from other researchers and current one
            downVotes: docGrades.reduce((c, g) => c + (g === false ? 1 : 0), wasPresented ? (!grade ? 1 : 0) : 0),
            // list of all researchers that voted on this phrase
            researchers: phrase.researchers,
            grades: phrase.grades,
            previousResearcher: previousGrades.upVotes + previousGrades.downVotes
          }
        };
      }, {});

      // check if all satisfying phrases have atleast 4 researchers we flag condition has done = true
      const isDone = satisfiedPhrases.reduce((c, phrase) => c && phrase.researchers.length >= 4, true)
      conditionUpdates.done = isDone;

      const _phrases = Object.keys(votesByPhrases);
      // phrases considered as approved
      const phrasesApproval = _phrases.filter((phrase) => votesByPhrases[phrase].upVotes >= 3 || votesByPhrases[phrase].downVotes >= 3)

      // distribute points to participants
      if(phrasesApproval.length) {
        for(let i = 0; i < phrasesApproval.length; i++) {
          const phraseApproval = phrasesApproval[i];
          const votesOfPhrase = votesByPhrases[phraseApproval];
          if(!phraseApproval) continue;

          // we are only processing points when we have 4 researchers voted on phrase
          if(!votesOfPhrase?.researchers || votesOfPhrase.researchers.length !== 4 || votesOfPhrase.previousResearcher >= 4) continue;

          let recallResponse = "";
          switch (session) {
            case "1st":
              recallResponse = "recallreGrade";
              break;
            case "2nd":
              recallResponse = "recall3DaysreGrade";
              break;
            case "3rd":
              recallResponse = "recall1WeekreGrade";
              break;
            default:
              throw new Error("Unknown value for session")
          }

          const passageIdx = (userUpdates.pConditions || []).findIndex((conditionItem) => conditionItem.passage === sessionRecallGrade.passage);
          if(passageIdx === -1) {
            throw new Error("Unknown value for passage");
          }

          userUpdated = true;
          // The only piece of the user data that should be modified is
          // pCondition based on the point received.
          let grades = 1;
          if (recallResponse && userUpdates.pConditions?.[passageIdx]?.[recallResponse]) {
            // We should add up points here because each free recall response
            // may get multiple points from each of the key phrases identified
            // in it.
            grades += userUpdates.pConditions[passageIdx][recallResponse];
          }

          userUpdates.pConditions[passageIdx][recallResponse] = grades;

          // Depending on how many key phrases were in the passage, we should
          // calculate the free-recall response ratio.
          userUpdates.pConditions[passageIdx][`${recallResponse}Ratio`] =
            parseFloat((grades / conditionUpdates.phrases.length).toFixed(2));
          
          const upVoteResearchers = [];
          const downVoteResearchers = [];
          for(let r = 0; r < votesOfPhrase.grades.length; r++) {
            if(votesOfPhrase.grades[r]) {
              upVoteResearchers.push(votesOfPhrase.researchers[r]);
            } else {
              downVoteResearchers.push(votesOfPhrase.researchers[r]);
            }
          }

          let upVotePoint = 0.5;
          let downVotePoint = -0.5;
          if(votesOfPhrase.upVotes < votesOfPhrase.downVotes) {
            upVotePoint = -0.5;
            downVotePoint = 0.5;
          }

          for(const upVoteResearcher of upVoteResearchers) {
            let gradingPoints = researchersUpdates[upVoteResearcher].projects[recallGradeData.project].gradingPoints || 0;
            let negativeGradingPoints = researchersUpdates[upVoteResearcher].projects[recallGradeData.project].negativeGradingPoints || 0;
            gradingPoints += upVotePoint;
            // -ve
            if(upVotePoint < 0) {
              negativeGradingPoints += Math.abs(upVotePoint);
            }

            researchersUpdates[upVoteResearcher].projects[recallGradeData.project].gradingPoints = gradingPoints;
            researchersUpdates[upVoteResearcher].projects[recallGradeData.project].negativeGradingPoints = negativeGradingPoints;
          }

          for(const downVoteResearcher of downVoteResearchers) {
            let gradingPoints = researchersUpdates[downVoteResearcher].projects[recallGradeData.project].gradingPoints || 0;
            let negativeGradingPoints = researchersUpdates[downVoteResearcher].projects[recallGradeData.project].negativeGradingPoints || 0;
            gradingPoints += downVotePoint;
            // -ve
            if(downVotePoint < 0) {
              negativeGradingPoints += Math.abs(downVotePoint);
            }

            researchersUpdates[downVoteResearcher].projects[recallGradeData.project].gradingPoints = gradingPoints;
            researchersUpdates[downVoteResearcher].projects[recallGradeData.project].negativeGradingPoints = negativeGradingPoints;
          }

          updatedResearcers.push(...votesOfPhrase.researchers);
        }
      }

      // pushing researcher to condition so, that it doesn't show up to him again
      if(!conditionUpdates.researchers.includes(fullname)) {
        conditionUpdates.researchers.push(fullname);
      }

      // if all conditions in all sessions are done then flag recall grade document as done
      let isAllDone = true;
      for(const session in recallGradeData.sessions) {
        for(const condition of recallGradeData.sessions[session]) {
          if(!condition.done) {
            isAllDone = false;
            break;
          }
        }
        if(!isAllDone) {
          break;
        }
      }
      if(isAllDone) {
        recallGradeData.done = true;
      }

      transactionWrites.push({
        type: "update",
        refObj: recallGradeRef,
        updateObj: recallGradeData
      });

      // updating points for researchers if required
      for (const researcherId in researchersUpdates) {
        if(!updatedResearcers.includes(researcherId)) {
          continue;
        }

        const researcherRef = db.collection("researchers").doc(researcherId);
        transactionWrites.push({
          type: "update",
          refObj: researcherRef,
          updateObj: researchersUpdates[researcherId]
        });
      }

      // updating participant points if required
      if(userUpdated) {
        const userRef = db.collection("users").doc(recallGradeData.user);
        transactionWrites.push({
          type: "update",
          refObj: userRef,
          updateObj: userUpdates
        });
      }

      for (const transactionWrite of transactionWrites) {
        if (transactionWrite.type === "update") {
          t.update(transactionWrite.refObj, transactionWrite.updateObj);
        } else if (transactionWrite.type === "set") {
          t.set(transactionWrite.refObj, transactionWrite.updateObj);
        } else if (transactionWrite.type === "delete") {
          t.delete(transactionWrite.refObj);
        }
      }
    });

    return res.status(200).json({
      message: "grade recalls updated"
    })
  } catch(e) {
    console.log(e, "error")
    res.status(500).send({
      message: "Error Occurred, please try again later."
    })
  }
}