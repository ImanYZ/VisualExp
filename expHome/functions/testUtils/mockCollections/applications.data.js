const { Timestamp } = require("firebase-admin/firestore");
const MockData = require("../MockData");

module.exports = new MockData([
  {
    "documentId": "6JzytMHazI5FyC9HT3BA",
    "ended": false,
    "leader": "Sam Ouhra",
    "communiId": "Clinical_Psychology",
    "attempts": {
      "Congratulations": {
        "corrects": 0,
        "wrongs": 0,
        "started": Timestamp.fromDate(new Date()),
        "questions": {}
      },
      "A_brief_survey_of_Cryptocurrency_systems": {
        "submitted": Timestamp.fromDate(new Date()),
        "wrongs": 0,
        "corrects": 0,
        "questions": {
          "This_paper_states_that_Proof_of_Stake_is_vulnerable_to_the_Nothing_at_Stake_Problem_what_issue_does_this_problem_specifically_refer_to": {
            "corrects": 0,
            "wrongs": 0,
            "answers": [
              "d"
            ]
          },
          "Which_of_the_following_are_Cryptocurrency_systems_examined_in_this_paper": {
            "answers": [
              "a"
            ],
            "corrects": 0,
            "wrongs": 0
          },
          "Which_of_the_following_statements_according_to_this_paper_is_true_about_the_user_s_private_key": {
            "corrects": 0,
            "answers": [
              "d"
            ],
            "wrongs": 1
          },
          "According_to_Figure_4_what_is_the_most_common_resource_intensive_task_used_by_the_set_of_listed_Cryptocurrencies": {
            "answers": [
              "a"
            ],
            "wrongs": 0,
            "corrects": 0
          },
          "Which_Cryptocurrency_was_the_first_to_use_Scrypt_as_its_mining_algorithm": {
            "corrects": 0,
            "answers": [
              "a"
            ],
            "wrongs": 0
          },
          "What_happens_if_two_blocks_are_created_only_a_few_seconds_apart": {
            "corrects": 0,
            "wrongs": 0,
            "answers": [
              "b"
            ]
          },
          "When_was_the_first_decentralized_Cryptocurrency_implemented": {
            "corrects": 0,
            "wrongs": 0,
            "answers": [
              "c"
            ]
          },
          "Which_of_the_following_statements_according_to_this_paper_is_true": {
            "corrects": 0,
            "wrongs": 0,
            "answers": [
              "c"
            ]
          },
          "Which_of_the_following_are_advantages_of_using_the_Scrypt_mining_algorithm": {
            "corrects": 0,
            "wrongs": 0,
            "answers": [
              "a"
            ]
          },
          "What_is_referred_to_as_the_act_of_mining_in_the_context_of_this_paper": {
            "wrongs": 0,
            "answers": [
              "c"
            ],
            "corrects": 0
          }
        }
      }
    },
    "corrects": 0,
    "createdAt": Timestamp.fromDate(new Date()),
    "fullname": "Ameer Hamza",
    "completed": 0,
    "accepted": false,
    "rejected": false,
    "explanation": "mock explanation",
    "checkedAt": Timestamp.fromDate(new Date()),
    "wrongs": 0
  }
], "applications")