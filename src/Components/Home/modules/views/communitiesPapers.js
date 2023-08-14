import React from "react";
import { Equation } from "react-equation";

const communitiesPapers = {
  Cognitive_Psychology: {
    Hybrid_Map_Visualizing_Relations_Between_Paragraphs_Improves_Readability_Reading_Comprehension_and_Learning: {
      title:
        "Hybrid Map: Visualizing Relations Between Paragraphs Improves Readability, Reading Comprehension, and Learning Compared to Novakian Concept Maps",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FHybrid%20Map%20Visualizing%20Relations%20Between%20Paragraphs%20Improves%20Readability%2C%20Reading%20Comprehension%2C%20and%20Learning.pdf?alt=media&token=fbdab75a-c1b0-4deb-87eb-0082e7da8acd",
      questions: {
        What_do_nodes_in_Hybrid_maps_and_Novakian_concept_maps_include: {
          stem: "1. What do nodes in Hybrid maps and Novakian concept maps include?",
          answers: ["b"],
          choices: {
            a: "Hybrid nodes include only a few words; Nokavian nodes include a paragraph.",
            b: "Nokavian nodes include only a few words; Hybrid nodes include a paragraph.",
            c: "Both Hybrid and Nokavian nodes include multiple paragraph.",
            d: "Both Hybrid and Nokavian nodes include only a few words."
          }
        },
        How_are_the_orientation_of_Hybrid_maps_and_Novakian_concept_maps: {
          stem: "2. How are the orientation of Hybrid maps and Novakian concept maps?",
          answers: ["a"],
          choices: {
            a: "Hybrid maps are left-to-right; Nokavian concept maps are top-down.",
            b: "Nokavian concept maps are left-to-right; Hybrid maps are top-down.",
            c: "Both Hybrid and Nokavian maps are left-to-right.",
            d: "Both Hybrid and Nokavian maps are top-down."
          }
        },
        What_do_titles_and_contents_of_nodes_in_Hybrid_maps_represent: {
          stem: "3. What do titles and contents of nodes in Hybrid maps represent?",
          answers: ["a"],
          choices: {
            a: "Each node title represents a key concept and the content explains it.",
            b: "Each node title represents any concept and the content explains it.",
            c: "Each node content represents a key concept and the title explains it.",
            d: "Each node content represents any concept and the title explains it."
          }
        },
        What_research_methods_are_used_in_this_study: {
          stem: "4. What research method(s) are used in this study?",
          answers: ["a", "c"],
          choices: {
            a: "Quantitative Research",
            b: "Theoretical Research",
            c: "Qualitative Research",
            d: "Applied Research"
          }
        },
        What_are_the_research_questions_in_this_study: {
          stem: "5. What are the research question(s) in this study",
          answers: ["a", "b", "c", "d", "e", "f"],
          choices: {
            a: "Do Hybrid maps increase immediate reading comprehension test scores more/less than the corresponding Novakian Knowledge Models?",
            b: "Do Hybrid maps increase immediate free recall test scores more/less than the corresponding Novakian Knowledge Models?",
            c: "Do Hybrid maps increase delayed reading comprehension test scores more/less than the corresponding Novakian Knowledge Models?",
            d: "Do Hybrid maps increase delayed free recall test scores more/less than the corresponding Novakian Knowledge Models?",
            e: "Do students find Hybrid maps more/less easy-to-read than the corresponding Novakian Knowledge Models?",
            f: "Do students find Hybrid maps more/less helpful for their learning than the corresponding Novakian Knowledge Models?"
          }
        },
        What_are_the_results_of_this_study: {
          stem: "6. What are the results of this study?",
          answers: ["a", "b", "c", "d", "e", "f"],
          choices: {
            a: "Hybrid maps increased immediate reading comprehension test scores significantly more than the corresponding Novakian Knowledge Models.",
            b: "Hybrid maps increased immediate free recall test scores significantly more than the corresponding Novakian Knowledge Models.",
            c: "Hybrid map increased delayed reading comprehension test scores significantly more than the corresponding Novakian Knowledge Models.",
            d: "Hybrid map did NOT increase delayed free recall test scores significantly more than the corresponding Novakian Knowledge Models.",
            e: "Students found Hybrid maps easier-to-read than the corresponding Novakian Knowledge Models.",
            f: "Students found Hybrid maps more helpful for their learning than the corresponding Novakian Knowledge Models."
          }
        },
        Which_of_the_following_can_be_a_rationale_for_using_ACT_passages_in_this_study: {
          stem: "7. Which of the following can be a rationale for using ACT passages in this study?",
          answers: ["a", "b", "e", "f"],
          choices: {
            a: "Passages have standard difficulty level",
            b: "Subjects are neutral",
            c: "Passages are chosen from best-selling novels",
            d: "ACT material are endorsed by US authorities",
            e: "Students are familiarized with the structure",
            f: "ACT exams consist of variety of topics"
          }
        },
        What_type_of_experiment_design_is_used_in_this_study: {
          stem: "8. What type of experiment design is used in this study?",
          answers: ["a"],
          choices: {
            a: "Within-subject design: each participant gets exposed to both conditions.",
            b: "Between-subject design: each participant gets exposed to both conditions.",
            c: "Within-subject design: each participant gets exposed to only one condition.",
            d: "Between-subject design: each participant gets exposed to only one condition."
          }
        },
        Why_did_each_participant_answer_the_pre_test_questions_before_reading_the_passages: {
          stem: "9. Why did each participant answer the pre-test questions before reading the passages?",
          answers: ["c", "d"],
          choices: {
            a: 'To analyze the "generation effect"',
            b: "To improve students' learning of the passages",
            c: "To measure and control for their prior knowledge of the topic in regression analyses",
            d: "To make sure, we only compare the two conditions across students with similar prior knowledge on each topic"
          }
        },
        What_does_the_following_diagram_tell_us: {
          stem: (
            <div>
              <p>10. What does the following diagram tell us?</p>
              <img alt="" src="/static/CommunityQuizzes/EstimatedMarginalMeans.png" width="100%" />
            </div>
          ),
          answers: ["b", "d", "f", "g"],
          choices: {
            a: "Participants got on average 7.7% lower immediate reading comprehension scores in the Hybrid map condition compared to the Knowledge model condition.",
            b: "Participants got on average 7.7% higher immediate reading comprehension scores in the Hybrid map condition compared to the Knowledge model condition.",
            c: "Participants got on average 9.8% lower delayed reading comprehension scores in the Hybrid map condition compared to the Knowledge model condition.",
            d: "Participants got on average 9.8% higher delayed reading comprehension scores in the Hybrid map condition compared to the Knowledge model condition.",
            e: "Participants got on average 3.7% lower immediate free recall scores in the Hybrid map condition compared to the Knowledge model condition.",
            f: "Participants got on average 3.7% higher immediate free recall scores in the Hybrid map condition compared to the Knowledge model condition.",
            g: "On average, there was no significant difference between the delayed free recall scores across the Hybrid map condition and the Knowledge model condition."
          }
        },
        What_was_randomized_in_this_experiment: {
          stem: "11. What was randomized in this experiment?",
          answers: ["a", "b"],
          choices: {
            a: "ACT passages",
            b: "Hybrid map and Novakian Knowledge model conditions",
            c: "Order of reading comprehension questions",
            d: "Order of free recall questions"
          }
        },
        How_many_passages_were_used_in_this_study: {
          stem: "12. How many passages were used in this study?",
          answers: ["a", "c"],
          choices: {
            a: "Five real ACT reading comprehension passages and four practice ones",
            b: "Four real ACT reading comprehension passages and five practice ones",
            c: "Two Novakian knowledge models from IHMC",
            d: "Four Novakian knowledge models from IHMC"
          }
        },
        How_many_linear_mixed_effect_regression_models_were_used_in_the_analysis: {
          stem: "13. How many linear mixed-effect regression models were used in the analysis?",
          answers: ["d"],
          choices: {
            a: "One",
            b: "Two",
            c: "Three",
            d: "Four"
          }
        },
        What_were_the_dependent_variables_in_the_regression_models: {
          stem: "14. What were the dependent variables in the regression models?",
          answers: ["a", "b", "c", "d"],
          choices: {
            a: "(Immediate) reading comprehension score",
            b: "Delayed reading comprehension score",
            c: "(Immediate) free recall score",
            d: "Delayed free recall score",
            e: "Pretest score",
            f: "Second passage"
          }
        },
        What_random_and_fixed_effects_were_controlled_for_in_the_regression_models: {
          stem: "15. What random and fixed effects were controlled for in the regression models?",
          answers: ["a", "b", "c", "d"],
          choices: {
            a: "Fixed effect of pretest score",
            b: "Fixed effect of the passage appearing as the second passage",
            c: "Random effect of the participant",
            d: "Random effect of the passage"
          }
        },
        How_many_qualitative_questions_did_each_participant_answer: {
          stem: "16. How many qualitative questions did each participant answer?",
          answers: ["b"],
          choices: {
            a: "One",
            b: "Two",
            c: "Three",
            d: "Four"
          }
        },
        How_many_themes_were_retrieved_from_the_qualitative_feedback_provided_by_the_participants: {
          stem: "17. How many themes were retrieved from the qualitative feedback provided by the participants?",
          answers: ["c"],
          choices: {
            a: "13",
            b: "25",
            c: "28",
            d: "40"
          }
        },
        When_did_the_participants_answer_the_demographic_questions_and_why: {
          stem: "18. When did the participants answer the demographic questions and why?",
          answers: ["a"],
          choices: {
            a: "At the conclusion of the first session, to prevent the effects of stereotype threat",
            b: "After completing the second session to prevent the effects of stereotype threat",
            c: "At the beginning of the first session, to prevent the effects of stereotype threat",
            d: "Before completing the first session to prevent the effects of stereotype threat"
          }
        },
        How_many_online_experiment_sessions_did_each_participant_attend: {
          stem: "19. How many online experiment sessions did each participant attend?",
          answers: ["b"],
          choices: {
            a: "One session",
            b: "Two sessions, three days apart",
            c: "Two sessions, four days apart",
            d: "Three sessions, two days apart"
          }
        },
        For_what_purpose_Cosine_similarity_was_used_in_this_study: {
          stem: "20. For what purpose Cosine similarity was used in this study?",
          answers: ["b"],
          choices: {
            a: "To code the qualitative data from participants’ feedback",
            b: "To assess the free recall responses",
            c: "To measure the difficulty level of the passage in each H/K condition",
            d: "To assess reading comprehension score from multiple choice questions"
          }
        },
        Which_of_the_following_is_NOT_advised_for_a_good_Novakian_concept_map: {
          stem: "21. Which of the following is NOT advised for a good Novakian concept map?",
          answers: ["a"],
          choices: {
            a: "All nodes should be aligned in equally spaced columns.",
            b: "Nodes should be as concise as possible.",
            c: "Maps should have top-down orientation.",
            d: "Each map should answer one focus question."
          }
        },
        Which_of_the_following_is_a_string_map: {
          stem: (
            <div>
              <p>22. Which of the following is a string map?</p>
              <p>
                a) <img alt="" src="/static/CommunityQuizzes/Concept_Map_Tree.png" width="100%" />
              </p>
              <p>
                b) <img alt="" src="/static/CommunityQuizzes/Concept_Map_String.png" width="100%" />
              </p>
              <p>
                c) <img alt="" src="/static/CommunityQuizzes/Concept_Map_Network.png" width="100%" />
              </p>
            </div>
          ),
          answers: ["b"],
          choices: {
            a: "a",
            b: "b",
            c: "c"
          }
        },
        Which_theory_is_behind_the_invention_of_concept_maps: {
          stem: "23. Which theory is behind the invention of concept maps?",
          answers: ["a"],
          choices: {
            a: "Ausubel’s assimilation theory of meaningful learning",
            b: "Novak and Gowin theory of knowledge visualization",
            c: "Cañas theory of affinity concept relation"
          }
        },
        Which_of_the_followings_are_use_cases_of_concept_maps: {
          stem: "24. Which of the followings are use cases of concept maps?",
          answers: ["a", "b", "c", "d", "e", "f", "g"],
          choices: {
            a: "Facilitating learning",
            b: "knowledge sharing and communication",
            c: "Meaningful learning",
            d: "Summarization",
            e: "Visualizing relations between concepts",
            f: "Developing metacognitive skills",
            g: "Identifying existing understandings"
          }
        },
        Which_options_are_encouraged_in_generating_a_Good_concept_map: {
          stem: '25. Which option(s) are encouraged in generating a "Good" concept map?',
          answers: ["d"],
          choices: {
            a: "Complete sentences are used as linking phrases.",
            b: "Each node contains one focus question.",
            c: "Cross-links are as few as possible.",
            d: "Each node should include only a few words.",
            e: "Larger dense maps are more favored than hyper linked smaller maps."
          }
        }
      }
    }
  },
  Clinical_Psychology: {
    Clinical_Psychology_Reading_Test: {
      title: "Definition and Training of Clinical Psychology",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FClinical%20Psychology%20Reading.pdf?alt=media&token=fbf1103d-d716-40f2-a95f-5e70178a5e09",
      questions: {
        What_aspect_of_training_distinguishes_clinical_psychology_from_other_helping_professions: {
          stem: "1. What aspect of training distinguishes clinical psychology from other helping professions?",
          answers: ["b"],
          choices: {
            a: "Graduate school",
            b: "Training in research",
            c: "Assessment"
          }
        },
        Which_of_the_following_is_a_field_closely_related_to_clinical_psychology: {
          stem: "2. Which of the following is a field closely related to clinical psychology?",
          answers: ["c"],
          choices: {
            a: "Police officer",
            b: "Neuroscientist",
            c: "Social work"
          }
        },
        What_is_the_difference_between_a_psychiatrist_and_clinical_psychologist: {
          stem: "3. What is the difference between a psychiatrist and clinical psychologist?",
          answers: ["d"],
          choices: {
            a: "A clinical psychologist is not a doctor",
            b: "A psychiatrist is an M.D.",
            c: "There are differences in training content and methods",
            d: "Options 2 and 3"
          }
        },
        What_is_the_most_common_approach_to_training_clinical_psychologists: {
          stem: "4. What is the most common approach to training clinical psychologists?",
          answers: ["b"],
          choices: {
            a: "Scholar-practitioner model (Vail model)",
            b: "Science-practitioner model (Boulder-model)",
            c: "Clinical-scientist model"
          }
        },
        What_integration_defines_training_in_clinical_psychology: {
          stem: "5. What integration defines training in clinical psychology?",
          answers: ["c"],
          choices: {
            a: "Teaching and counseling",
            b: "Assessment and consultation",
            c: "Science and practice"
          }
        },
        Which_of_the_following_is_an_aspect_of_clinical_psychology: {
          stem: "6. Which of the following is an aspect of clinical psychology?",
          answers: ["d"],
          choices: {
            a: "Psychotherapy",
            b: "Teaching",
            c: "Research",
            d: "All of the above"
          }
        },
        Which_doctorate_emphasizes_psychological_practice: {
          stem: "7. Which doctorate emphasizes psychological practice?",
          answers: ["a"],
          choices: {
            a: "Psy.D.",
            b: "Ph.D."
          }
        },
        Which_of_the_following_do_undergraduates_need_to_do_in_order_to_prepare: {
          stem: "8. Which of the following do undergraduates need to do in order to prepare for graduate training in clinical psychology?",
          answers: ["a", "b", "d", "e"],
          choices: {
            a: "Impressive GRE scores",
            b: "Gain research experience",
            c: "Get a masters degree",
            d: "High GPA",
            e: "Strong recommendation letters from professors and/or research supervisors"
          }
        }
      }
    }
  },
  Mindfulness: {
    Mindfulness_Based_Eating_Awareness_Training: {
      title: "MB-EAT for Binge Eating: A Randomized Clinical Trial",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FKristellerWoleverSheets_BED_In_Mindfulness2013.pdf?alt=media&token=ee440abf-b8ef-459d-92de-3e32475b8cf8",
      questions: {
        In_this_community_we_will_focus_on_Mindfulness_in_what_context: {
          stem: "1. In this community, we will focus on Mindfulness in what context?",
          answers: ["b"],
          choices: {
            a: "Religious history",
            b: "Clinical Psychology",
            c: "Professional settings",
            d: "Physical exercise"
          }
        },
        As_an_intern_you_will_be_expected_to: {
          stem: "2. As an intern, you will be expected to:",
          answers: ["d"],
          choices: {
            a: "Attend weekly meetings",
            b: "Collaborate with peers on presentations",
            c: "Partake in mindfulness practices",
            d: "All of the Above"
          }
        },
        What_disorder_was_Mindfulness_Based_Eating_Awareness_Training_MB_EAT_developed_for: {
          stem: "3. What disorder was Mindfulness Based Eating Awareness Training (MB-EAT) developed for?",
          answers: ["c"],
          choices: {
            a: "Anorexia",
            b: "Bulimia",
            c: "Binge Eating Disorder",
            d: "None of the Above"
          }
        },
        What_are_the_stages_of_MB_EAT: {
          stem: "4. What are the stages of MB-EAT?",
          answers: ["a"],
          choices: {
            a: "Cultivating Mindfulness, Cultivating Mindful Eating, Cultivating Emotional Balance, Cultivating Self-Acceptance",
            b: "Psychotherapy, Mindfulness Practices, Eating Practice",
            c: "Individual Counseling, Group Counseling, At-Home Interventions",
            d: "Emotional Mindfulness, Mindful Eating, Mindful Wisdom"
          }
        },
        Which_of_the_following_is_a_core_issue_of_the_disorder_that_MB_EAT_treats: {
          stem: "5. Which of the following is a core issue of the disorder that MB-EAT treats?",
          answers: ["c"],
          choices: {
            a: "Calorie counting",
            b: "Compulsive binging",
            c: "Awareness of hunger and satiety cues",
            d: "Taste recognition"
          }
        },
        True_or_False_MB_EAT_focuses_on_the_internal_experiences_of_eating_as_well_as_external_patterns_and_triggers: {
          stem: "6. True or False: MB-EAT focuses on the internal experiences of eating as well as external patterns and triggers.",
          answers: ["a"],
          choices: {
            a: "True",
            b: "False"
          }
        }
      }
    }
  },
  Health_Psychology: {
    Health_Psychology_Chapter_1: {
      title: "Health Psychology: An Introduction",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FHealth%20Psychology.%20Fifth%20Edition%20Chapter%201.pdf?alt=media&token=484f630b-18b6-467a-a65a-faec2257e39c",
      questions: {
        In_the_definition_given_in_this_book_health_psychology_is_defined_as_an________field: {
          stem: "1. In the definition given in this book, health psychology is defined as an ______ field.",
          answers: ["b"],
          choices: {
            a: "International",
            b: "Interdisciplinary",
            c: "Interactive",
            d: "Interesting"
          }
        },
        The_leading_risk_factor_for_global_disease_burden_in_2002_was_______: {
          stem: "2. The leading risk factor for global disease burden in 2002 was ______.",
          answers: ["b"],
          choices: {
            a: "Alcohol",
            b: "Childhood and maternal underweight",
            c: "Tobacco",
            d: "High blood pressure"
          }
        },
        According_to_S_S_Stevens_measurement_is_the_assignment_of_numbers_to_attributes: {
          stem: "3. According to S.S. Stevens, measurement is the assignment of numbers to attributes according to ______.",
          answers: ["c"],
          choices: {
            a: "Formulae",
            b: "Size",
            c: "Rules",
            d: "Quality"
          }
        },
        According_to_Michell_before_quantification_can_happen_it_is_first_necessary: {
          stem: "4. According to Michell, before quantification can happen, it is first necessary to obtain evidence that the relevant attribute is quantitative in ______.",
          answers: ["a"],
          choices: {
            a: "Structure",
            b: "Stature",
            c: "Status",
            d: "Studies"
          }
        },
        When_findings_are_difficult_to_generalize_to_the_world_outside_of_the_laboratory: {
          stem: "5. When findings are difficult to generalize to the world outside of the laboratory, we say the research is lacking in ______ validity.",
          answers: ["a"],
          choices: {
            a: "Ecological",
            b: "Economical",
            c: "Empirical",
            d: "Experimental"
          }
        },
        The_Health_Onion_is_an_example_of_a_______: {
          stem: "6. The 'Health Onion' is an example of a ______.",
          answers: ["d"],
          choices: {
            a: "Paradigm",
            b: "Model",
            c: "Theory",
            d: "Framework"
          }
        },
        More_research_is_necessary_to_confirm_the_assumption_that: {
          stem: "7. More research is necessary to confirm the assumption that ______ cause positive changes to quality of life.",
          answers: ["a"],
          choices: {
            a: "Lifestyle changes",
            b: "Research findings",
            c: "Survey data",
            d: "Questionnaire responses"
          }
        },
        _______have_some_of_the_characteristics_of_paradigms: {
          stem: "8. ______ have some of the characteristics of paradigms (Kuhn, 1970) as they refer to a complete system of thinking about a field of inquiry.",
          answers: ["c"],
          choices: {
            a: "Pathways",
            b: "Theories",
            c: "Frameworks",
            d: "Models"
          }
        }
      }
    }
  },
  Neuroscience: {
    Fundamentals_of_Neuroscience: {
      title: "Fundamentals of Neuroscience",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FFundamentals_of_Neuroscience.pdf?alt=media&token=ede5917c-2278-4143-89b1-60797ad530ca",
      questions: {
        Vertebrate_nervous_system_components_are_named_for_both_their: {
          stem: "1. Vertebrate nervous system components are named for both their _________and _________.",
          answers: ["b"],
          choices: {
            a: "Size; location",
            b: "Appearance; location",
            c: "Appearance; size",
            d: "None of these"
          }
        },
        Which_of_these_best_describes_the_interconnected_differentiated: {
          stem: "2.	Which of these best describes the interconnected, differentiated, and bioelectrically driven units of the nervous system?",
          answers: ["a"],
          choices: {
            a: "Neurons",
            b: "Lobes",
            c: "Networks",
            d: "Axons"
          }
        },
        Neurons_are_classified_according_to_which_of_the_following: {
          stem: "3. Neurons are classified according to which of the following?",
          answers: ["d"],
          choices: {
            a: "Function",
            b: "Shape",
            c: "Type of transmitter released",
            d: "All of these"
          }
        },
        Neurons_generally_have__________axon_s_and_many___________that_extend_from_the_nerve_cell_body: {
          stem: "4. Neurons generally have ________ axon (s) and many _________ that extend from the nerve cell body.",
          answers: ["a"],
          choices: {
            a: "One; dendrites",
            b: "Many; dendrites",
            c: "One; synapses",
            d: "Many; synapses"
          }
        },
        Which_cellular_component_is_responsible_for_structural_support: {
          stem: "5. Which cellular component is responsible for structural support for long neuronal processes as well as transport along those processes?",
          answers: ["c"],
          choices: {
            a: "Dendrites",
            b: "Spines",
            c: "Microtubules",
            d: "Endoplasmic reticulum"
          }
        },
        Neurons_communicate_with_each_other_via: {
          stem: "6.	Neurons communicate with each other via",
          answers: ["c"],
          choices: {
            a: "Astrocytes",
            b: "Mechanical junctions",
            c: "Synapses",
            d: "Microglia"
          }
        },
        Neurotransmitter_release_occurs_in_the_____________neuron_through_binding_of_the____________to_the_membrane: {
          stem: "7.	Neurotransmitter release occurs in the ___________ neuron through binding of the __________ to the membrane.",
          answers: ["d"],
          choices: {
            a: "Postsynaptic; protein",
            b: "Postsynaptic; vesicle",
            c: "Presynaptic; protein",
            d: "Presynaptic; vesicle"
          }
        },
        When_the_axon_of_one_neuron_synapses_on_the_cell_body_of_another_neuron_this_is_termed: {
          stem: "8.	When the axon of one neuron synapses on the cell body of another neuron, this is termed",
          answers: ["a"],
          choices: {
            a: "Axosomatic",
            b: "Axodendritic",
            c: "Somasomatic",
            d: "Dendrodendritic"
          }
        },
        Synapses_are_categorized_by_their_: {
          stem: "9. Synapses are categorized by their ___________  and ___________.",
          answers: ["b"],
          choices: {
            a: "Structure; location",
            b: "Structure; function",
            c: "Size; location",
            d: "Size; function"
          }
        },
        Excitatory_and_inhibitory_____________produce_short_term_changes: {
          stem: "10. Excitatory and inhibitory ___________ produce short-term changes in membrane permeability, while __________ produce a much more lasting change in postsynaptic membrane properties.",
          answers: ["c"],
          choices: {
            a: "Enzymes; proteins",
            b: "Proteins; enzymes",
            c: "Amino acids; monoamines",
            d: "Monoamines; amino acids"
          }
        },
        At_the_molecular_level_neuron_function_is_modified_by_alterations_in_which_these: {
          stem: "11. At the molecular level, neuron function is modified by alterations in which these?",
          answers: ["b"],
          choices: {
            a: "Regulation of ion channels and binding of synaptic vesicles",
            b: "Regulation of ion channels and alterations in gene expression",
            c: "Binding of synaptic vesicles and growth of microtubules",
            d: "Growth of microtubules and alterations in gene expression"
          }
        },
        What_is_the_hierarchical_order_of_the_study_of_the_nervous_system: {
          stem: "12. What is the hierarchical order of the study of the nervous system (from smallest to largest)?",
          answers: ["c"],
          choices: {
            a: "Cellular, molecular, systems, behavioral",
            b: "Cellular, molecular, behavioral, systems",
            c: "Molecular, cellular, systems, behavioral",
            d: "Molecular, cellular, behavioral, systems"
          }
        },
        The_brain_is_broadly_subdivided_into_which_regions_based_on_gross_anatomy_and_epidemiology: {
          stem: "13. The brain is broadly subdivided into which regions based on gross anatomy and epidemiology?",
          answers: ["a"],
          choices: {
            a: "Forebrain, midbrain, and hindbrain",
            b: "Spinal cord and brain",
            c: "Cephalic, thoracic, and abdominal",
            d: "Rostral, caudal, dorsal, and ventral"
          }
        }
      }
    }
  },
  Disability_Studies: {
    What_is_Disability_Studies_UMInDS: {
      title: "UM Initiative on Disability Studies: What is Disability Studies?",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FWhat_is_Disability_Studies_UMInDS.pdf?alt=media&token=3e16f0ee-e8b5-492e-a776-8b8025b18559",
      questions: {
        Disability_studies_is_primarily_interested_in_looking_at_disability_from_a_medical_perspective: {
          stem: "1. Disability studies is primarily interested in looking at disability from a medical perspective.",
          answers: ["b"],
          choices: {
            a: "True",
            b: "False"
          }
        },
        Around_8_of_Americans_have_a_disability: {
          stem: "2. Around 8% of Americans have a disability",
          answers: ["b"],
          choices: {
            a: "True",
            b: "False"
          }
        },
        What_did_the_Americans_with_Disabilities_Act_ADA_accomplish: {
          stem: "3. What did the Americans with Disabilities Act (ADA) accomplish?",
          answers: ["d"],
          choices: {
            a: "It added a disability component to the census",
            b: "It changed the definition of disability to be more than just a medical condition",
            c: `It created an “International Day of Disabled Persons” to raise awareness and promote participation`,
            d: "It empowered persons with disabilities and changed how institutions conduct business"
          }
        }
      }
    },
    Redefining_disability_culture: {
      title: "(Re)defining Disability Culture",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FForber-Pratt-2018-CP-DisCulture.pdf?alt=media&token=d74a5104-9735-4f6b-9c90-299d097be30d",
      questions: {
        Which_of_the_following_is_NOT_part_of_the_ADAs_definition_of_disability: {
          stem: "4. Which of the following is NOT part of the ADA's definition of disability?",
          answers: ["a"],
          choices: {
            a: "You must have been born with the impairment",
            b: "The impairment can be physical OR mental",
            c: "The impairment must substantially limit one's life activities"
          }
        },
        Which_of_the_following_was_NOT_identified_as_one_of_the_three_main_values: {
          stem: "5. Which of the following was NOT identified as one of the three main values of disability culture in this article?",
          answers: ["c"],
          choices: {
            a: "Social justice",
            b: "Giving back to others",
            c: "Positivity",
            d: "Independence"
          }
        },
        Which_of_the_following_was_listed_as_a_shortcoming_of_previous_disability_culture_research: {
          stem: `6. Which of the following was listed as a shortcoming of previous disability culture research?`,
          answers: ["a"],
          choices: {
            a: "Many scholars have limited their demographic to one subgroup of disability",
            b: "Previous research has focused too heavily on the social model of disability",
            c: "Many researchers use the wrong terminology when talking about disability",
            d: "Previous studies have focused too heavily on the experiences of school age children"
          }
        },
        What_does_the_author_mean_when_they_say_that_disability_is_cross_cultural: {
          stem: `7. What does the author mean when they say that disability is cross-cultural?`,
          answers: ["c"],
          choices: {
            a: "Disability culture looks similar in different parts of the world",
            b: "Disabled people have an agreed upon set of values and beliefs",
            c: "Disabled people can belong to different nationalities, religions, and ethnicities"
          }
        },
        Why_does_the_author_say_that_university_students_with_disabilities_are_a_unique_demographic: {
          stem: `8. Why does the author say that university students with disabilities are a unique demographic?`,
          answers: ["d"],
          choices: {
            a: "They are more educated about their rights",
            b: "They are living away from home for the first time",
            c: "They are first first generation to have lived their entire lives with the ADA in effect",
            d: "They are the first generation to have lived their entire lives with the ADA in effect."
          }
        }
      }
    }
  },
  Social_Psychology: {
    Effects_of_Ownership_Text_Message_Wording_and_Reminders_on_Receipt_of_an_Influenza_Vaccination: {
      title: "Effects of Ownership Text Message Wording and Reminders on Receipt of an Influenza Vaccination",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2Fbuttenheim_2022_oi_211203_1644504654.86367.pdf?alt=media&token=5b13c45b-6552-4766-8c94-fb4cb03d69d1",
      questions: {
        One_example_of_the_behavioral_theories_this_study_relies_upon_is: {
          stem: `1. One example of the behavioral theories this study relies upon is:`,
          answers: ["a"],
          choices: {
            a: "Reciprocity norm",
            b: "Scarcity",
            c: "Extinction",
            d: "Classical conditioning"
          }
        },
        The_experimental_treatment_included: {
          stem: `2. The experimental treatment included:`,
          answers: ["b"],
          choices: {
            a: "A message that personalizes the flu shot request",
            b: "An appointment reminder; image of a vaccine vial with “your flu shot” witten on it; A message stating that a shot has “reserved for you” or “available”",
            c: "An appointment reminder; image of a vaccine vial with “your flu shot” witten on it; A message only stating that a shot has “reserved for you”",
            d: "An appointment reminder; image of a vaccine vial with “your flu shot” witten on it; A message only stating that a shot is “available”"
          }
        },
        The_main_outcome_measure_of_this_study_is: {
          stem: `3. The main outcome measure of this study is:`,
          answers: ["b"],
          choices: {
            a: "Number of participants that schedule a flu shot appointment",
            b: "Number of participants that received the flu shot within the timeframe of  treatment administration",
            c: "Number of participants that schedule an additional appointment within the timeframe of the treatment",
            d: "Number of participants that share the availability of flu shot with family"
          }
        },
        The_controlled_treatment_is: {
          stem: `4. The controlled treatment is:`,
          answers: ["c"],
          choices: {
            a: "An appointment reminder only",
            b: "An appointment reminder and image of a vaccine vial with “your flu shot” witten on it",
            c: "No messages/ text",
            d: "There was no controlled treatment"
          }
        },
        How_many_experimental_conditions_were_there: {
          stem: `5. How many experimental conditions were there?`,
          answers: ["a"],
          choices: {
            a: "2",
            b: "3",
            c: "Between 1-14",
            d: "1"
          }
        },
        In_the_instance_that_a_participant_reschedules_the_appointment_where_the_flu_shot_could_be_received_the_study_would_not_track_the_receipt_of_the_flu_shot_after_original_appointment:
          {
            stem: `6. In the instance that a participant reschedules the appointment where the flu shot could be received, the study would not track the receipt of the flu shot after original appointment `,
            answers: ["b"],
            choices: {
              a: "TRUE",
              b: "FALSE"
            }
          },
        Which_of_the_following_could_be_a_potential_threat_to_external_validity_in_this_study: {
          stem: `7. Which of the following could be a potential threat to external validity in this study?`,
          answers: ["d"],
          choices: {
            a: "Small sample size",
            b: "Bust myths",
            c: "Use jargon in corrections",
            d: "The homogeneity of the sample"
          }
        },
        Which_subject_specialty_is_this_study_drawing_foundation_from: {
          stem: `8. Which subject specialty is this study drawing foundation from?`,
          answers: ["c"],
          choices: {
            a: "Developmental psychology",
            b: "Clinical psychology",
            c: "Social psychology",
            d: "Forensic psychology"
          }
        },
        The_participants_were_rewarded_with_which_of_the_following_for_getting_the_flu_shot: {
          stem: `9. The participants were rewarded with which of the following for getting the flu shot?`,
          answers: ["c"],
          choices: {
            a: "Ability to get text notification for future appointments",
            b: "Flu shot was free of cost",
            c: "No rewards for the participants",
            d: "Monetary compensation"
          }
        },
        What_can_the_study_do_better_to_minimize_external_validity_threat: {
          stem: `10. What can the study do better to minimize external validity threat?`,
          answers: ["d"],
          choices: {
            a: "Acquire a larger sample size",
            b: "Avoid making a casualty assertions.",
            c: "Avoid making correlational assertions",
            d: "Acquire a heterogeneous or diverse sample"
          }
        },
        What_type_of_variable_was_the_outcome_measure: {
          stem: `11. What type of variable was the outcome measure?`,
          answers: ["a"],
          choices: {
            a: "A binary variable, where 0 suggested that the participant did not get their vaccination and 1 meant that they did receive their vaccination",
            b: "A binary variable, where 0 suggested that the participant was assigned in the control condition and 1 meant that they received a message.",
            c: "A continuous variable, where scoring higher meant the participant was more responsive to the text message.",
            d: "A continuous variable, where scoring higher meant the participant was more likely to get the vaccination."
          }
        },
        Why_were_the_researchers_interested_in_including_demographic_information_into_their_analyses: {
          stem: `12. Why were the researchers interested in including demographic information into their analyses?`,
          answers: ["a"],
          choices: {
            a: "For equity purposes",
            b: "To increase statistical significance.",
            c: "For manipulation check purposes",
            d: "To avoid texting fake phone numbers"
          }
        },
        What_statistical_analysis_did_the_researchers_use_to_explore_their_primary_hypothesis: {
          stem: `13. What statistical analysis did the researchers use to explore their primary hypothesis?`,
          answers: ["c"],
          choices: {
            a: "Analysis of Variance",
            b: "T-tests",
            c: "Modeling",
            d: "Descriptive analyses"
          }
        },
        What_is_one_of_the_findings_of_the_study: {
          stem: `14. What is one of the findings of the study?`,
          answers: ["d"],
          choices: {
            a: "Participants in both message conditions were more likely to receive their flu shot as compared to the usual care control condition",
            b: "No differences were found between any of the message conditions and the usual care control condition",
            c: "Telling participants that there were available flu shots rendered them more likely to actually receive the vaccination than if they had not received a message, but no statistical differences were found between the reserved message condition and the control condition",
            d: "Reminding participants that they had reserved a shot rendered them more likely to actually receive the vaccination than if they had not received a message, but no statistical differences were found between the available message condition and the control condition"
          }
        },
        What_relationship_did_the_researchers_find_between_participants_race_and_the_reserved_message_condition: {
          stem: `15. What relationship did the researchers find between participants’ race and the reserved message condition?`,
          answers: ["c"],
          choices: {
            a: "The reserved message condition significantly increased the likelihood of receiving a message about availability for all races",
            b: "There was no clear relationship between race and the effectiveness of the reserved message condition",
            c: "The reserved message condition significantly increased the likelihood of receiving the flu shot for White participants but not for Black participants",
            d: "The reserved message condition significantly decreased the likelihood of receiving the flu shot for White participants but not for Black participants"
          }
        },
        What_relationship_did_the_researchers_find_between_participants_race_and_the_combined_effect_of_both_message_conditions_on_vaccination_rate:
          {
            stem: `16. What relationship did the researchers find between participants’ race and the combined effect of both message conditions on vaccination rate?`,
            answers: ["b"],
            choices: {
              a: "There was no clear relationship",
              b: "The combined effect was higher for White participants over Black participants",
              c: "The combined effect was higher for Black participants over White participants",
              d: "No analysis on the combined effect was conducted"
            }
          },
        What_do_the_results_suggest_about_texting_back: {
          stem: `17. What do the results suggest about texting back?`,
          answers: ["c"],
          choices: {
            a: "Those who texted back were less likely to receive a flu shot.",
            b: "The available message condition increased one’s likelihood of messaging back, and texting back was associated with higher likelihood of receiving a flu shot.",
            c: "The reserved message condition increased one’s likelihood of messaging back, and texting back was associated with higher likelihood of receiving a flu shot.",
            d: "All message conditions decreased one’s likelihood of messaging back, and texting back was associated with higher likelihood of receiving a flu shot."
          }
        },
        Messaging_back_significantly_mediated_the_relationship_between_message_condition_and_vaccination_rate: {
          stem: `18. Messaging back significantly mediated the relationship between message condition and vaccination rate?`,
          answers: ["a"],
          choices: {
            a: "True",
            b: "False"
          }
        },
        What_limitation_is_mentioned_in_the_article: {
          stem: `19. What limitation is mentioned in the article?`,
          answers: ["d"],
          choices: {
            a: "We cannot know if participants had negative attitudes towards vaccination",
            b: "There is no way to know if the participants opened the text message",
            c: "The study was not pre-registered",
            d: "The study took place during the COVID-19 pandemic"
          }
        },
        What_might_a_suggestion_for_future_research_be_based_on_the_article: {
          stem: `20. What might a suggestion for future research be based on the article?`,
          answers: ["a"],
          choices: {
            a: "Taking into account any possible clinical interactions participants may have had about the flu shot",
            b: "Repeating the study with more participants",
            c: "Considering the relationship between gender identity and vaccination rate",
            d: "Adding additional message conditions"
          }
        }
      }
    }
  },
  Social_Political_Psychology: {
    When_Fake_News_feels_true: {
      title: "When (Fake) News Feels True",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FWhen_Fake_News_feels_true.pdf?alt=media&token=f7d6bfa1-5937-409e-ace8-3ad4d087a3cb",
      questions: {
        What_is_the_goal_of_article_1_When_Fake_News_Feels_True: {
          stem: `1. What is the goal of article 1, "When (Fake) News Feels True"?`,
          answers: ["d"],
          choices: {
            a: "To explain how we evaluate messages",
            b: "To describe the impact of certain features in a message and how this can lead to message acceptance.",
            c: "To give a history of how media has been regulated to prevent misinformation",
            d: "a and b"
          }
        },
        According_to_article_1_what_are_the_most_important_things_people_consider: {
          stem: `2. According to article 1, what are the most important things people consider when evaluating information (click all that apply)?`,
          answers: ["a", "b", "c", "d", "f"],
          choices: {
            a: "The compatibility of the new information with one's previous knowledge.",
            b: "The coherence of the information in its own context.",
            c: "The credibility of the source.",
            d: "The consensus among other people that the information is true.",
            e: "The length of the message.",
            f: "If there is supporting evidence."
          }
        },
        What_are_the_different_types_of_system_processing: {
          stem: `3. What are the different types of system processing (click all that apply)?`,
          answers: ["a", "c"],
          choices: {
            a: "Intuitive",
            b: "Autonomic",
            c: "Analytic",
            d: "Academic"
          }
        },
        Repetition_plays_a_role_in_information_acceptance_by_manipulating_our_perception_of: {
          stem: `4. Repetition plays a role in information acceptance by manipulating our perception of ________.`,
          answers: ["c"],
          choices: {
            a: "Compatibility",
            b: "Coherence",
            c: "Social consensus"
          }
        },
        Warnings_against_misinformation_are_most_effective_when_issued: {
          stem: `5. Warnings against misinformation are most effective when issued _______.`,
          answers: ["a"],
          choices: {
            a: "Before the claim",
            b: "After the claim"
          }
        },
        How_do_the_factors_discussed_in_this_article_play_a_role_in_the_spread_of_misinformation_on_social_media: {
          stem: `6. How do the factors discussed in this article play a role in the spread of misinformation on social media (click all that apply)?`,
          answers: ["b", "c", "d"],
          choices: {
            a: "People see a diversity in opinions.",
            b: "Short messages are easy to process.",
            c: "We see posts from friends, establishing credibility.",
            d: "Users can gain a false sense of expertise."
          }
        },
        What_does_this_article_recommend_as_a_means_to_correct_and_prevent_misinformation: {
          stem: `7. What does this article recommend as a means to correct and prevent misinformation?`,
          answers: ["a"],
          choices: {
            a: "Avoid repeating false information",
            b: "Bust myths",
            c: "Use jargon in corrections"
          }
        },
        What_is_associated_with_the_intuitive_processing_system: {
          stem: `8. What is associated with the intuitive processing system?`,
          answers: ["b"],
          choices: {
            a: "Effort, analysis",
            b: "Speed, heuristics"
          }
        },
        What_is_associated_with_the_analytic_system: {
          stem: `9. What is associated with the analytic system?`,
          answers: ["a"],
          choices: {
            a: "Effort, slowness, systematic reasoning",
            b: "Speed, heuristics"
          }
        },
        What_is_naive_realism: {
          stem: `10. What is naive realism?`,
          answers: ["a"],
          choices: {
            a: "People believe that their view of the world is the true perception and other opposing opinions are either wrong or deliberately causing harm.",
            b: "People incorrectly believe that people who spread information are doing so unintentionally and with pure intentions."
          }
        }
      }
    },
    Fake_news_game_confers_psychological_resistance_ag: {
      title: "Fake News Game Confers Psychological Resistance Against Online Misinformation",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FFake_news_game_confers_psychological_resistance_ag.pdf?alt=media&token=4a2332d4-3750-4308-9c72-96e28c514e80",
      questions: {
        What_is_the_inoculation_theory_of_misinformation: {
          stem: `1. What is the inoculation theory of misinformation?`,
          answers: ["b"],
          choices: {
            a: "A theory that proposes that vaccination-related information tends to be misconstrued by people.",
            b: "A theory that suggests that people build immunity against misinformation by being exposed to false information that is later corrected.",
            c: "A theory that proposes that media platforms gain benefits by intentionally misinforming viewers on controversial topics, such as vaccinations.",
            d: "A theory that suggests that when people are repeatedly exposed to fake news, they tend to internalize misinformation."
          }
        },
        Which_of_the_following_does_the_article_describe_as_a_limitation_of_the_majority_of_research_on_the_inoculation_theory:
          {
            stem: `2. Which of the following does the article describe as a limitation of the majority of research on the inoculation theory?`,
            answers: ["c"],
            choices: {
              a: "Research has not investigated the effects of inoculating against misinformation using naturalistic media platforms.",
              b: "Researchers have mostly studied participants from Western countries and have yet to investigate the effects of the inoculation of misinformation on people from other cultures.",
              c: "Studies have focused on inoculating against specific topics, which brings into question whether the effects of the inoculation of misinformation extend to other contexts.",
              d: "Limited research has been conducted on the topic, since the inoculation theory of misinformation is fairly recent."
            }
          },
        The_researchers_created_an_intervention_in_the_form_of_a_game_that_essentially_asks_participants_to: {
          stem: `3. The researchers created an intervention in the form of a game that essentially asks participants to ...`,
          answers: ["d"],
          choices: {
            a: "Read hypothetical fake news scenarios and rate how believable they are.",
            b: "Openly discuss instances when they have been victims of misinformation with other users.",
            c: "Identify and share techniques through which misinformation can be avoided.",
            d: "Assume the role of the originator of misinformation by attempting to gain followers and credibility."
          }
        },
        How_was_the_effectiveness_of_the_intervention_evaluated: {
          stem: `4. How was the effectiveness of the intervention evaluated?`,
          answers: ["a"],
          choices: {
            a: "Through a pretest-posttest survey design that required participants to rate the credibility of headlines and tweets.",
            b: "By observing the participants' use of Twitter for one month to see whether they retweeted fake news.",
            c: "Through the points the users gained after playing the game for 15 minutes.",
            d: "By asking them how confident they were about identifying fake news."
          }
        },
        Why_do_the_researchers_argue_that_the_differences_in_the_ratings_of_the_two_control_stimuli_were_not_important:
          {
            stem: `5. Why do the researchers argue that the differences in the ratings of the two control stimuli were not important, even though the results were statistically significant?`,
            answers: ["d"],
            choices: {
              a: "The p-values were above .05.",
              b: "The effect sizes (Cohen's d, Hedges g) were too large, meaning that the p-values were not significant.",
              c: "The researchers did not believe the intervention would affect the participants' perception of control tweets.",
              d: "The effect sizes (Cohen's d, Hedges g) were too small, meaning that statistical significance was likely reached because of the large sample size."
            }
          },
        For_which_of_the_following_domains_of_misinformation_was_there_a_better_performance_after_the_intervention: {
          stem: `6. For which of the following domains of misinformation was there a better performance after the intervention?`,
          answers: ["a"],
          choices: {
            a: "Impersonation, Conspiracy, Deflection",
            b: "Impersonation, Emotion",
            c: "Conspiracy, Trolling, Discredit, Impersonation",
            d: "Polarization, Trolling, Discredit"
          }
        },
        Why_was_the_addition_of_control_stimuli_important_in_combination_with_fake_news_stimuli: {
          stem: `7. Why was the addition of control stimuli important (in combination with fake news stimuli)?`,
          answers: ["d"],
          choices: {
            a: "It tricked participants into answering differently.",
            b: "It made the study more realistic.",
            c: "It showed that participants answer more accurately when they are asked multiple questions.",
            d: "It suggested that the inoculation was effective against false information without having an impact on correct information."
          }
        },
        Which_of_the_following_groups_benefited_the_most_from_the_intervention: {
          stem: `8. Which of the following groups benefited the most from the intervention?`,
          answers: ["b"],
          choices: {
            a: "People who were young.",
            b: "People who were more likely to believe false information before the intervention.",
            c: "People who were less likely to trust misinformation before the intervention.",
            d: "People who identified as liberal."
          }
        },
        Which_of_the_following_is_discussed_as_a_limitation_of_the_research: {
          stem: `9. Which of the following is discussed as a limitation of the research?`,
          answers: ["b"],
          choices: {
            a: "The participants were predominantly university students from private academic institutions.",
            b: "The researchers did not have a control group.",
            c: "The participants were not enough for the statistical analyses.",
            d: "The study did not ask the participants questions about their Facebook use."
          }
        },
        What_suggestion_for_future_research_do_the_authors_offer: {
          stem: `10. What suggestion for future research do the authors offer?`,
          answers: ["c"],
          choices: {
            a: "To perform the same study using stimuli from varied social media platforms.",
            b: "To collect information on people's social media use through data scraping.",
            c: "To identify the rate at which the inoculation decreases.",
            d: "To investigate why men tend to be overrepresented in game-related research."
          }
        }
      }
    }
  },
  Cryptoeconomics: {
    Bitcoin_whitepaper: {
      title: "Bitcoin: A Peer-to-Peer Electronic Cash System",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FBitcoin_whitepaper.pdf?alt=media&token=372bf6cc-642b-4541-9407-d51527fd83a5",
      questions: {
        What_is_a_blockchain: {
          stem: `1. What is a blockchain?`,
          answers: ["a"],
          choices: {
            a: "A distributed database that is shared among the nodes of a computer network",
            b: "A digital currency",
            c: "A file where data pertaining to the network are recorded",
            d: "A database which structures its data into tables"
          }
        },
        How_does_a_blockchain_prevent_users_from_tampering_with_its_data: {
          stem: `2. How does a blockchain prevent users from tampering with its data?`,
          answers: ["a"],
          choices: {
            a: "All other nodes cross-reference each other and pinpoint the node with incorrect information",
            b: "A company has full control over the database",
            c: "The identities of all users are known and linked to their transactions",
            d: "A single node in the network can alter the information held within"
          }
        },
        Of_the_sentences_describing_blockchain_listed_below_which_are_true: {
          stem: `3. Of the sentences describing blockchain listed below, which are true?`,
          answers: ["b", "c", "d"],
          choices: {
            a: "Blockchain has a physical form",
            b: "Blockchain has intrinsic value as a trustworthy, secure, and fast way to transfer value",
            c: "Data entered into a blockchain is irreversible",
            d: "Blockchain has been most commonly used as a ledger for transactions"
          }
        },
        What_is_a_cryptocurrency: {
          stem: `4. What is a cryptocurrency?`,
          answers: ["a"],
          choices: {
            a: "A digital currency that is secured by cryptography",
            b: "A distributed ledger enforced by a disparate network of computers",
            c: "A currency issued by a central authority",
            d: "A currency that enables secure online payments with the use of third-party intermediaries"
          }
        },
        Section_2_A_common_solution_to_prevent_double_spending_is_to_introduce: {
          stem: `5. [Section 2] A common solution to prevent double-spending is to introduce a trusted
          central authority. What is the main problem with this solution?`,
          answers: ["a"],
          choices: {
            a: "The fate of the entire money system depends on the trusted central authority",
            b: "Transactions aren't publicly announced",
            c: "Participants can't agree on a single transaction history",
            d: "Later attempts to double-spend are not counted"
          }
        },
        Section_4_Under_Proof_of_Work_what_would_an_attacker_have_to_do_to_modify_a_past_block: {
          stem: `6. [Section 4] Under Proof-of-Work, what would an attacker have to do to modify a past
          block?`,
          answers: ["a", "b"],
          choices: {
            a: "Redo the proof-of-work of the block and all blocks after it",
            b: "Catch up and then surpass the work of the honest nodes",
            c: "Scan for a value that when hashed begins with a number of zero bits",
            d: "Allocate many IPs"
          }
        },
        Section_6_What_are_two_ways_to_fund_an_incentive_for_nodes_to_support_the_network: {
          stem: `7. [Section 6] What are two ways to fund an incentive for nodes to support the network?`,
          answers: ["a", "b"],
          choices: {
            a: "Generating new coins",
            b: "Transaction fees",
            c: "Proof-of-Stake",
            d: "Timestamp Server"
          }
        },
        Section_7_What_is_the_name_for_the_data_structure_used_to_save_disk_space_by_hashing_transactions_in_a_block: {
          stem: `8. [Section 7] What is the name for the data structure used to save disk space by hashing
          transactions in a block?`,
          answers: ["a"],
          choices: {
            a: "Merkle Tree",
            b: "Block Hash",
            c: "Blockchain",
            d: "Proof-of-Work Chain"
          }
        }
      }
    }
  },
  Deep_Learning: {
    NLP_Chapter13: {
      title: "Natural Language Processing",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FNLP_Chapter.pdf?alt=media&token=b49e9a3d-cf77-49ec-a17e-81757c1ca72b",
      questions: {
        Which_of_the_following_is_TRUE_about_NLP: {
          stem: `1. Which of the following is TRUE about NLP?`,
          answers: ["d"],
          choices: {
            a: "We must take care of Syntax, Semantics, and Pragmatics in NLP",
            b: "Preprocessing tasks include Tokenization, Stemming, Lemmatization, and Vectorization",
            c: "NLP can be used for spam filtering, sentiment analysis, and machine translation",
            d: "All of the above"
          }
        },
        Which_of_the_following_is_NOT_an_application_of_NLP: {
          stem: `2. Which of the following is NOT an application of NLP?`,
          answers: ["b"],
          choices: {
            a: "Personal assistants (like Alexa, Siri, Google Assistant, Cortana, etc.)",
            b: "Image recognition",
            c: "Auto-correct grammatical mistakes",
            d: "Named entity recognition"
          }
        },
        Which_of_the_following_is_an_application_of_NLP: {
          stem: `3. Which of the following is an application of NLP?`,
          answers: ["d"],
          choices: {
            a: "Google Translate",
            b: "Google Assista",
            c: "Chatbots",
            d: "All of the above"
          }
        },
        Which_of_the_following_is_FALSE_about_Tokenization_in_NLP: {
          stem: `4. Which of the following is FALSE about Tokenization in NLP?`,
          answers: ["a"],
          choices: {
            a: "It is used to remove stopwords from the text",
            b: "Each word in a text is called a token",
            c: "We can use regular expressions to find out tokens from the text",
            d: "None of the above"
          }
        },
        Which_of_the_following_is_a_correct_order_of_preprocessing_of_raw_data_in_NLP: {
          stem: `5. Which of the following is a correct order of preprocessing of raw data in NLP?`,
          answers: ["a"],
          choices: {
            a: "Remove Punctuation, Tokenization, Remove Stopwords, Stemming / Lemmatization, Vectorization",
            b: "Tokenization, Vectorization, Remove Punctuation, Remove Stopwords, Stemming / Lemmatization",
            c: "Stemming / Lemmatization, Remove Punctuation, Tokenization, Remove Stopwords, Vectorization",
            d: "Remove Stopwords, Remove Punctuation, Stemming / Lemmatization, Vectorization, Tokenization"
          }
        },
        Which_of_the_following_is_FALSE_about_preprocessing_of_raw_data_in_NLP: {
          stem: `6. Which of the following is FALSE about preprocessing of raw data in NLP?`,
          answers: ["c"],
          choices: {
            a: "We remove stopwords and do stemming to decrease the number of tokens",
            b: "We should remove all the punctuation marks and stopwords from the text",
            c: "Lemmatization is a process of removing punctuation and stopwords from the text",
            d: "Vectorization is used to encode tokens into numbers to create feature vectors"
          }
        },
        Which_of_the_following_is_FALSE_about_Stemming_and_Lemmatization_in_NLP: {
          stem: `7. Which of the following is FALSE about Stemming and Lemmatization in NLP?`,
          answers: ["b"],
          choices: {
            a: "Lemmatization is more powerful and sophisticated as compared to stemming",
            b: "Lemmatization is fast but more complex as compared to the stemming",
            c: "Both are used to reduce the inflected words to their word stem or root",
            d: "Both are used to reduce the number of tokens"
          }
        },
        Which_of_the_following_is_TRUE_about_Stemming_and_Lemmatization_in_NLP: {
          stem: `8. Which of the following is TRUE about Stemming and Lemmatization in NLP?`,
          answers: ["c"],
          choices: {
            a: "Stemming considers the context of a word in which it is used in a sentence while Lemmatization does not",
            b: "Stemming provides more accurate results as compared to Lemmatization",
            c: "Stemming is faster than Lemmatization",
            d: "All of the above"
          }
        },
        Which_of_the_following_is_TRUE_about_Vectorization_in_NLP: {
          stem: `9. Which of the following is TRUE about Vectorization in NLP?`,
          answers: ["d"],
          choices: {
            a: "It is used to encode tokens into feature vectors which algorithms can understand",
            b: "Document term matrix is used to represent the words in the text in the form of a matrix of numbers",
            c: "Count, N-gram, and TF-IDF are the types of Vectorization",
            d: "All of the above"
          }
        },
        Which_of_the_following_is_TRUE_about_types_of_Vectorization_in_NLP: {
          stem: `10. Which of the following is TRUE about types of Vectorization in NLP?`,
          answers: ["b"],
          choices: {
            a: "Count vectorization considers the count and weightage of each word in a text",
            b: "N-gram vectorization considers the context of the word depending upon the value of N",
            c: "TF-IDF vectorization considers both the count and context of the words in the text",
            d: "All of the above"
          }
        },
        Which_of_the_following_is_FALSE_about_Term_Frequency_Inverse_Document: {
          stem: `11. Which of the following is FALSE about Term Frequency - Inverse Document Frequency (TF- IDF) Vectorization in NLP?`,
          answers: ["a"],
          choices: {
            a: "It considers the context of the word in a particular document",
            b: "It considers how frequent the word occurs in a particular document",
            c: "It considers how frequent the word occurs in other documents",
            d: "None of the above"
          }
        },
        Which_of_the_following_is_FALSE_about_the_NLTK_library_in_Python: {
          stem: `12. Which of the following is FALSE about the NLTK library in Python? `,
          answers: ["d"],
          choices: {
            a: "It is the most commonly used library in Python for NLP",
            b: "It provides efficient modules for preprocessing and cleaning of raw data in NLP",
            c: "It can be used for tokenization, stemming, lemmatization, and vectorization",
            d: "All of the above"
          }
        },
        Which_of_the_following_stemmers_are_available_in_the_NLTK_library_in_Python: {
          stem: `13. Which of the following stemmers are available in the NLTK library in Python?`,
          answers: ["d"],
          choices: {
            a: "Porter Stemmer",
            b: "Snowball Stemmer",
            c: "Lancaster Stemmer",
            d: "All of the above"
          }
        }
      }
    }
  },
  Graphic_Design: {
    Graphic_Design_Reading_Chapter_1: {
      title: "A Design Process for Digital Products",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FGraphic_Design_Reading.pdf?alt=media&token=ad7bd3fc-6541-4a3b-978a-b412b43f260c",
      questions: {
        What_is_one_of_the_consequences_of_poor_product_behavior: {
          stem: `1. What is one of the consequences of poor product behavior?`,
          answers: ["b"],
          choices: {
            a: "The user can lose their phone",
            b: "Can cause users who are not familiar with certain jargon confusion when operating a digital product",
            c: "The user's needs are anticipated"
          }
        },
        How_could_a_lack_of_a_design_process_cause_a_digital_product_to_fail: {
          stem: `2. How could a lack of a design process cause a digital product to fail?`,
          answers: ["c"],
          choices: {
            a: "The product fails to increase productivity",
            b: "The developer fails to advocate for the user, the business, and the technology",
            c: "The product is not desirable to the users and fails to meet their professional, personal, and emotional needs"
          }
        },
        What_does_design_of_behavior_require_a_greater_knowledge_of: {
          stem: `3. What does design of behavior require a greater knowledge of?`,
          answers: ["a"],
          choices: {
            a: "Context",
            b: "Logos",
            c: "Typography"
          }
        },
        Personal_goals_of_employee_s_matter_when_building_a_product_for_a_business: {
          stem: `4. Personal goals of employee's matter when building a product for a business.`,
          answers: ["a"],
          choices: {
            a: "True",
            b: "False"
          }
        },
        What_is_a_problem_within_the_traditional_style_of_the_design_process: {
          stem: `5. What is a problem within the traditional style of the design process?`,
          answers: ["a"],
          choices: {
            a: "Researchers are overbearing",
            b: "Designers are not included in the research process",
            c: "There is no ethnographic data"
          }
        },
        Good_designs_make_users_more______: {
          stem: `6. Good designs make users more _____`,
          answers: ["a"],
          choices: {
            a: "Effective",
            b: "Quick",
            c: "Intelligent"
          }
        }
      }
    }
  },
  UI_Design: {
    UI_Design: {
      title: "UI Test",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FMUI_Accessibility.pdf?alt=media&token=53fe5836-45fc-4ffa-abca-cf7059b88f65",
      questions: {
        what_is_the_name_of: {
          stem: (
            <>
              1. Please skim through this web page:
              <a href="https://mui.com/material-ui/customization/color/" target="_blank" rel="noreferrer">
                https://mui.com/material-ui/customization/color/
              </a>{" "}
              and answer this question: what is the name of #616161? (select one)
            </>
          ),
          answers: ["c"],
          choices: {
            a: "grey",
            b: "grey[600]",
            c: "grey[700]",
            d: "dark grey"
          }
        },
        Why_should_we_avoid_using_non_standard_elements: {
          stem: (
            <>
              2. Read this web page:{" "}
              <a
                href="https://m3.material.io/foundations/accessible-design/accessibility-basics"
                target="_blank"
                rel="noreferrer"
              >
                https://m3.material.io/foundations/accessible-design/accessibility-basics
              </a>{" "}
              and answer: Why should we avoid using non-standard elements? (select one)
            </>
          ),
          answers: ["b"],
          choices: {
            a: "We don’t have access to non-standard elements",
            b: "They could have bad accessibility since the element may not be tested yet",
            c: "We already know how bad the accessibility of the non-standard elements is",
            d: "I don’t know"
          }
        },
        what_are_chips_used_for: {
          stem: (
            <>
              3. Read this article on chips:{" "}
              <a href="https://m3.material.io/components/chips/guidelines" target="_blank" rel="noreferrer">
                https://m3.material.io/components/chips/guidelines
              </a>{" "}
              and answer: what are chips used for? (select multiple)
            </>
          ),
          answers: ["a", "b", "c", "d"],
          choices: {
            a: "Filter",
            b: "Input",
            c: "Suggestion",
            d: "Assist"
          }
        },
        How_do_you_break_the_link_between_the_instance_and_its_main_component: {
          stem: (
            <>
              4. If you are not familiar with Figma components, please watch this video:{" "}
              <a
                href="https://www.youtube.com/watch?list=PLXDU_eVOJTx5LSjOmeBYMuvaa4UayfMe4&v=k74IrUNaJVk&feature=emb_imp_woyt&ab_channel=Figma"
                target="_blank"
                rel="noreferrer"
              >
                https://www.youtube.com/watch?list=PLXDU_eVOJTx5LSjOmeBYMuvaa4UayfMe4&v=k74IrUNaJVk&feature=emb_imp_woyt&ab_channel=Figma
              </a>
              . Then answer the question: How do you break the link between the instance and its main component? (select
              one)
            </>
          ),
          answers: ["c"],
          choices: {
            a: "Delete the component and paste it again on the canvas",
            b: "We cannot break the link between an instance and its main component",
            c: "Click “detach component” on the menu when right-clicking",
            d: "Click “remove instance” on the menu when right-clicking"
          }
        },
        How_to_create_an_interactive_toggle_button_in_Figma: {
          stem: (
            <>
              5. Duplicate and finish the Figma playground file:
              <a href="https://www.figma.com/community/file/1033456279024883078" target="_blank" rel="noreferrer">
                https://www.figma.com/community/file/1033456279024883078
              </a>{" "}
              (keep pressing N to view the frames like a ppt). Then answer: How to create an interactive toggle button
              in Figma? (select one)
            </>
          ),
          answers: ["a"],
          choices: {
            a: "Click the prototype panel on the right, and add interaction between different variants of the component.",
            b: "Click the prototype panel on the right, and add interaction between different components.",
            c: "Click the triangle icon on the top right to present the file and add interactions",
            d: "I don’t know"
          }
        },
        What_is_the_auto_layout_used_for: {
          stem: (
            <>
              6. Read this article on Figma’s Auto Layout:{" "}
              <a
                href="https://help.figma.com/hc/en-us/articles/360040451373-Explore-auto-layout-properties"
                target="_blank"
                rel="noreferrer"
              >
                https://help.figma.com/hc/en-us/articles/360040451373-Explore-auto-layout-properties
              </a>{" "}
              and answer: What is the auto layout used for? (select one)
            </>
          ),
          answers: ["b"],
          choices: {
            a: "Auto layout is the same as grouping and framing elements",
            b: "Auto layout offers a way to consistently organize elements with the same spacing which is useful for responsive design",
            c: "Auto layout is used for grouping different components together and it does not change the spacing between the components.",
            d: "I don’t know"
          }
        },
        What_is_the_best_practice_to_make_the_blue_filled_box_occupy_the_entire_width_of_the_red_bordered_frame: {
          stem: (
            <>
              7. Duplicate and finish the Figma file:
              <a href="https://www.figma.com/community/file/784448220678228461" target="_blank" rel="noreferrer">
                https://www.figma.com/community/file/784448220678228461.
              </a>
              "Then answer: What is the best practice to make the blue-filled box occupy the entire width of the
              red-bordered frame (with auto-layout)?(select one)
              <br />
              <img
                alt=""
                src="https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FUI_Design%2FQ7_What_is_the_best_practice_to_make_the_blue_filled_box_occupy_the_entire_width_of_the_red_bordered_frame.png?alt=media&token=60e34b53-e31e-4905-a09b-01957909b0d3"
              />{" "}
            </>
          ),
          answers: ["c"],
          choices: {
            a: "Use the scale tool to resize the blue box",
            b: "Set the width of the whole frame to “hug contents” which will auto-resize the elements including the blue box",
            c: "Set the width of the blue box to “fill container”",
            d: "Set the blue box to an absolute position in the auto-layout"
          }
        },
        to_toggle_between_showing_and_hiding_the_text_in_a_component_____to_change_the_icon_in_a_button_with_an_instance_swap_property:
          {
            stem: (
              <>
                8. Duplicate and finish the Figma playground file:
                <a href="https://www.figma.com/community/file/1100581138025393004" target="_blank" rel="noreferrer">
                  https://www.figma.com/community/file/1100581138025393004
                </a>{" "}
                and answer: _____ to toggle between showing and hiding the text in a component; _____ to change the icon
                in a button with an instance swap property. (select one){" "}
                <img
                  alt=""
                  src="https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FUI_Design%2FQ8_Duplicate_and%20finish_the_Figma%20playground%20file.png?alt=media&token=d1d21c71-373d-4bcd-9193-febf22d6a396"
                />
              </>
            ),
            answers: ["b"],
            choices: {
              a: "create a boolean property of the text layer in the component; click the icon component and paste another",
              b: "create a boolean property of the text layer in the component; click the button and swap the icon in the right property panel",
              c: "create a variant property of the text layer in the component; click the icon component and paste another",
              d: "create a variant property of the text layer in the component; click the button and swap the icon in the right property panel"
            }
          }
      }
    }
  },
  UX_Research: {
    When_to_Use_Which_User_Experience_Research_Methods: {
      title: "When to Use Which User-Experience Research Methods",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FWhen%20to%20Use%20Which%20User-Experience%20Research%20Methods.pdf?alt=media&token=948c0113-1abb-452b-83e2-6c7a9c6e1189",
      questions: {
        What_are_the_phases_of_product_development: {
          stem: `1. What are the phases of product development? Please select all that apply.`,
          answers: ["b", "c", "d"],
          choices: {
            a: "Create",
            b: "Strategize",
            c: "Assess",
            d: "Execute"
          }
        },
        Exploring_what_people_say_and_trying_to_discover_how_why_to_fix_their_problem_is_what_kind_of_research_method: {
          stem: `2. Exploring what people say and trying to discover how &amp; why to fix their problem is what kind of research method?`,
          answers: ["c"],
          choices: {
            a: "Behavioral, qualitative",
            b: "Behavioral, quantitative",
            c: "Attitudinal, qualitative",
            d: "Attitudinal, quantitative"
          }
        },
        What_are_ethnographic_field_studies: {
          stem: `3. What are ethnographic field studies?`,
          answers: ["b"],
          choices: {
            a: "A researcher meets with participants one-on-one to discuss in-depth what the participant thinks about the topic in question",
            b: "Researchers meet with and study participants in their natural environment, where they would most likely encounter the product or service in question",
            c: "Participants are brought into a lab and given a set of scenarios that lead to tasks and usage of specific interest within a product or service"
          }
        },
        Which_UX_research_methods_fall_in_the_attitudinal_AND_qualitative_categories: {
          stem: `4. Which UX research methods fall in the attitudinal AND qualitative categories?`,
          answers: ["a", "b", "e"],
          choices: {
            a: "Focus groups",
            b: "Interviews",
            c: "Email surveys",
            d: "Eye-tracking",
            e: "Diary studies",
            f: "A/B testing"
          }
        },
        What_UX_research_method_is_best_to_study_participants_over_a_long_period_of_time: {
          stem: `5. What UX research method is best to study participants over a long period of time and lets participants record their experiences with a product?`,
          answers: ["b"],
          choices: {
            a: "Participatory Design",
            b: "Diary Study",
            c: "Eye-tracking",
            d: "A/B testing"
          }
        }
      }
    }
  },
  Graph_Neural_Network: {
    Heterogeneous_Graph_Attention_Network: {
      title: "Heterogeneous Graph Attention Network",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FGNNsub-quiz-TianYan.pdf?alt=media&token=7a7b8064-02fe-474d-a3bf-69311a58f7da",
      questions: {
        Suppose_there_is_a_heterogeneous_graph_that_has_types_of_nodes_how_many_types_of_meta_path_you_can_define_in_this_graph:
          {
            stem: `1. Suppose there is a heterogeneous graph that has 3 types of nodes, how many types of
          meta-path you can define in this graph at most? Only consider the meta-paths that have
          a length of exactly 3, and have the same type of nodes at the start and end.`,
            answers: ["b"],
            choices: {
              a: "3",
              b: "6",
              c: "18",
              d: "2"
            }
          },
        In_Figure_1_which_pair_of_meta_path_based_neighbors_is_based_on_meta_path_Movie_director_movie: {
          stem: `2. In Figure 1, which pair of meta-path based neighbors is based on meta-path “Movie-
          director-movie”?`,
          answers: ["a"],
          choices: {
            a: "m1-m2",
            b: "m1-m3",
            c: "m1-a1",
            d: "m1-d1"
          }
        },
        Which_statement_is_correct: {
          stem: `3. Which statement is correct?`,
          answers: ["c"],
          choices: {
            a: "In node-level attention stage, the transformation matrix M is edge type specific.",
            b: "Node’s meta-path based neighbors doesn’t’ include itself.",
            c: "In node-level attention stage, the importance between meta-path basedneighbors are normalized to get the weight coefficients.",
            d: "Node level attention vector is another name for the node level weight coefficients."
          }
        },
        Which_loss_function_did_this_paper_use: {
          stem: `4. Which loss function did this paper use?`,
          answers: ["d"],
          choices: {
            a: "Binary Cross-Entropy Loss",
            b: "Hinge Loss",
            c: "Mean Square Error",
            d: "Multiclass Cross-Entropy Loss"
          }
        },
        Which_statement_about_model_in_the_paper_is_incorrect: {
          stem: `5.Which statement about model in the paper is incorrect?`,
          answers: ["c"],
          choices: {
            a: "Testing data can appear in the graph of training data",
            b: "This is a semi-supervised training model",
            c: "Each node in the graph of training data is labelled",
            d: "Each node in the graph of training data has input feature."
          }
        }
      }
    }
  },
  Financial_Technology: {
    A_brief_survey_of_Cryptocurrency_systems: {
      title: "A brief survey of Cryptocurrency systems",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FA_brief_survey_of_Cryptocurrency_systems.pdf?alt=media&token=048e3faf-e0dd-4f31-bdf3-cf8d4c3778cb",
      questions: {
        When_was_the_first_decentralized_Cryptocurrency_implemented: {
          stem: `1. Suppose there is a heterogeneous graph that has 3 types of nodes, how many types of
        meta-path you can define in this graph at most? Only consider the meta-paths that have
        a length of exactly 3, and have the same type of nodes at the start and end.`,
          answers: ["c"],
          choices: {
            a: "2020",
            b: "1998",
            c: "2009",
            d: "All of the above"
          }
        },
        Which_of_the_following_statements_according_to_this_paper_is_true_about_the_user_s_private_key: {
          stem: `2. Which of the following statements, according to this paper, is true about the user’s private key?`,
          answers: ["d"],
          choices: {
            a: "The user’s private key is contained in his wallet",
            b: "The user’s private key proves ownership",
            c: "The user’s private key is used to sign transactions",
            d: "All of the above"
          }
        },
        What_is_referred_to_as_the_act_of_mining_in_the_context_of_this_paper: {
          stem: `3. What is referred to as the act of mining in the context of this paper?`,
          answers: ["c"],
          choices: {
            a: "The process of obtaining coal or other minerals from a mine.",
            b: "A required verification step for clearing transaction records from the public ledger",
            c: "The process of introducing new Cryptocurrency units in the system.",
            d: "All of the above."
          }
        },
        Which_of_the_following_statements_according_to_this_paper_is_true: {
          stem: `4. Which of the following statements, according to this paper, is true?`,
          answers: ["c"],
          choices: {
            a: "There exist several linear paths from the first block of a blockchain to the current block",
            b: "All cryptocurrencies focus on restricting the validation of transactions per unit time",
            c: "Bitcoin mining uses Proof of Work",
            d: "All of the above"
          }
        },
        Which_of_the_following_are_Cryptocurrency_systems_examined_in_this_paper: {
          stem: `5.Which of the following are Cryptocurrency systems examined in this paper?`,
          answers: ["a"],
          choices: {
            a: "Peercoin.",
            b: "Polkadot.",
            c: "Dogecoin.",
            d: "All of the above."
          }
        },
        What_happens_if_two_blocks_are_created_only_a_few_seconds_apart: {
          stem: `6.What happens if two blocks are created only a few seconds apart?`,
          answers: ["b"],
          choices: {
            a: "One of the blocks is ignored at random.",
            b: "The block received first is added to the Blockchain.",
            c: "A fork is used to split the Blockchain into two sequences.",
            d: "All of the above."
          }
        },
        This_paper_states_that_Proof_of_Stake_is_vulnerable_to_the_Nothing_at_Stake_Problem_what_issue_does_this_problem_specifically_refer_to:
          {
            stem: `7.This paper states that Proof of Stake is vulnerable to the Nothing-at Stake Problem, what issue does this problem specifically refer to?`,
            answers: ["d"],
            choices: {
              a: "When miners have no currency left in the system and vote for a wrong transaction.",
              b: "When miners have nothing to lose and create multiple nodes to try to validate an invalid transaction.",
              c: "When miners try to double spend currency when they have no currency left in the system.",
              d: "All of the above."
            }
          },
        Which_of_the_following_are_advantages_of_using_the_Scrypt_mining_algorithm: {
          stem: `8.Which of the following are advantages of using the Scrypt mining algorithm?`,
          answers: ["a"],
          choices: {
            a: "Scrypt makes it such that attackers would need more memory to attack faster.",
            b: "Scrypt had been successfully implemented as a Proof of Stake verification.",
            c: "Scrypt is computationally intensive.",
            d: "All of the above."
          }
        },
        According_to_Figure_4_what_is_the_most_common_resource_intensive_task_used_by_the_set_of_listed_Cryptocurrencies:
          {
            stem: `9.According to Figure 4, what is the most common resource-intensive task used by the set of listed Cryptocurrencies?`,
            answers: ["a"],
            choices: {
              a: "Proof of Stake.",
              b: "Proof of Identity.",
              c: "Proof of Retrievability.",
              d: "Proof of Work."
            }
          },
        Which_Cryptocurrency_was_the_first_to_use_Scrypt_as_its_mining_algorithm: {
          stem: `10.Which Cryptocurrency was the first to use Scrypt as its mining algorithm?`,
          answers: ["a"],
          choices: {
            a: "Bitcoin.",
            b: "Dogecoin.",
            c: "Dogecoin.",
            d: "All of the above."
          }
        }
      }
    }
  },
  Responsible_AI: {
    The_role_of_artificial_intelligence_in_mitigating_bias_to_enhance_diversity_and_inclusion: {
      title: "The role of artificial intelligence in mitigating bias to enhance diversity and inclusion",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FThe%20role%20of%20artificial%20intelligence%20in%20mitigating%20bias%20to%20enhance%20diversity%20and%20inclusion.pdf?alt=media&token=6a1e5b50-baa0-4e9a-b64f-63d1e28f96c5",
      questions: {
        Today_what_potential_do_AI_solutions_have_that_enable_more_diverse_and_inclusive_workplaces: {
          stem: `1. Today, what potential do AI solutions have that enable more diverse and inclusive workplaces?`,
          answers: ["b"],
          choices: {
            a: "Advanced algorithms",
            b: "Mitigate bias",
            c: "Convenience",
            d: "All of the above"
          }
        },
        According_to_the_similarity_attraction_paradigm_why_does_a_diverse_group_tend_to_have_more_conflict: {
          stem: `2. According to the similarity attraction paradigm, why does a diverse group tend to have more conflict?`,
          answers: ["a"],
          choices: {
            a: "People don’t prefer to work with people who are unlike them",
            b: "Increased turnover of employees.",
            c: "Members usually bring different cognitive attributes",
            d: "None of the above"
          }
        },
        What_does_social_identity_theory_suggest: {
          stem: `3. What does social identity theory suggest?`,
          answers: ["d"],
          choices: {
            a: "People’s social identity is classified by factors including their current economic status.",
            b: "People tend to classify people who are like them as ‘out-group’ members because theyare competitors",
            c: "In-group members tend to experience negative outcomes than out-group members.",
            d: "People tend to classify themselves and others into demographic categories."
          }
        },
        What_are_the_benefits_of_inclusivity: {
          stem: `4. What are the benefits of inclusivity`,
          answers: ["d"],
          choices: {
            a: "Ensure compliance as a minimum",
            b: "Create better customer experiences",
            c: "Increase access to desired skills",
            d: "All of the above"
          }
        },
        In_formal_employment_decision_making_processes_how_can_bias_be_present: {
          stem: `5.In formal employment decision-making processes, how can bias be present?`,
          answers: ["d"],
          choices: {
            a: "Job advertisements in male-dominated fields use more masculine wording, and as aresult, appear to be less appealing to women.",
            b: "People tend to describe good managers in masculine terms.",
            c: "Elder workers tend to receive lower performances scores although they are as productive as their younger colleagues.",
            d: "All of the above."
          }
        },
        Which_of_the_following_can_be_true_about_microaggression: {
          stem: `6.Which of the following can be true about microaggression?`,
          answers: ["c"],
          choices: {
            a: "Microaggression refers to verbal slights in daily life.",
            b: "Microaggression is seldom intentional.",
            c: "Microaggression prevents a company from building a D&I workplace.",
            d: "All of the above."
          }
        },
        Why_do_we_need_to_think_critically_about_AI_based_tools: {
          stem: `7.Why do we need to think critically about AI-based tools?`,
          answers: ["d"],
          choices: {
            a: "Some AI-based hiring tools show biases against certain groups of job applicants",
            b: "AI is trained with machine learning algorithms that are created by humans.",
            c: "the development of AI solutions requires humans to make decisions.",
            d: "All of the above."
          }
        },
        Which_of_the_following_is_true_when_AI_is_used_to_mitigate_bias: {
          stem: `8.Which of the following is true when AI is used to mitigate bias?`,
          answers: ["c"],
          choices: {
            a: " Machines can have an inherent bias that inhibits D&I.",
            b: "AI can spontaneously remove the attributes that lead to bias.",
            c: "AI can learn how to detect unintentional and unconscious biases.",
            d: "AI doesn’t inherit bias from humans on objective tasks including resume scanning."
          }
        },
        Which_of_the_following_is_not_a_reasonable_consideration_that_helps_evaluate_progress_on_our_journey_to_inclusivity:
          {
            stem: `9.Which of the following is not a reasonable consideration that helps evaluate progress on our journey to inclusivity?`,
            answers: ["c"],
            choices: {
              a: "Ensure equal access to opportunities.",
              b: "Build a diverse organization.",
              c: "Make efficient employment decisions.",
              d: "Create an inclusive organizational culture."
            }
          },
        Which_of_the_following_can_be_critical_actions_for_success_in_using_AI_to_enhance_DI: {
          stem: `10.Which of the following can be critical action(s) for success in using AI to enhance D&I?`,
          answers: ["d"],
          choices: {
            a: "involve experienced industrial-organizational psychologists and data scientists.",
            b: "Use an AI-enabled framework to ensure a consistent and objective benchmark for assessing employees and job candidates alike.",
            c: "Adjust model features based on its algorithm outputs to mitigate bias.",
            d: "All of the above."
          }
        }
      }
    }
  },
  Computer_Vision: {
    Computer_Vision_excerpt: {
      title: "Computer Vision excerpt",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FComputer%20Vision%20excerpt.pdf?alt=media&token=4f5865c0-8488-4920-918e-75d696a2befa",
      questions: {
        _learning_requires_labeled_data_in_the_form_of_paired_inputs_and_outputs: {
          stem: `1. ___________ learning requires labeled data in the form of paired inputs and outputs`,
          answers: ["a"],
          choices: {
            a: "Supervised",
            b: "Unsupervised"
          }
        },
        Deep_networks_were_originally_developed_for: {
          stem: `2.Deep networks were originally developed for ________`,
          answers: ["c"],
          choices: {
            a: "Semantic segmentation.",
            b: "Motion estimation.",
            c: "Image classification",
            d: "Image denoising"
          }
        },
        What_is_the_end_goal_of_training_a_machine_learning_model: {
          stem: `3.What is the end goal of training a machine learning model?`,
          answers: ["a"],
          choices: {
            a: "Have a trained model that can accurately label new, unseen inputs.",
            b: "Have a trained model with perfect prediction statistics on training inputs",
            c: "Have a model trained to the point where its parameters are fixed"
          }
        },
        In_machine_learning_when_teaching_a_model_to_predict_data_why_do_we_use_training_data_distribution_as_a_proxy_for_the_real_world_distribution:
          {
            stem: `4. In machine learning, when teaching a model to predict data, why do we use training data distribution as a proxy for the real-world distribution `,
            answers: ["b"],
            choices: {
              a: "We assume that our training data is the true probability representation of the real-world data we are estimating",
              b: "We usually do not have access to the true probability distribution over the inputs, so we assume the training data is a fair approximation with some margin of error",
              c: "Due to the mechanism of the network model, we do not actually care about the true real-world distribution when training the model"
            }
          },
        In_the_expected_risk_function: {
          stem: (
            <>
              <p>5. In the expected risk function, </p>
              <Equation value="E_Risk(w)=1/N L(y_i,f(x_i,w))" />
              <p></p>
              <Equation value="what is denoted by f(x_i,w)" />
              <>?</>
            </>
          ),
          answers: ["c"],
          choices: {
            a: "Difference between the true label of the output and the predicted label.",
            b: "The true label of the output.",
            c: "The predicted label of the output."
          }
        },
        Out_of_centering_standardizing_and_whitening_input_data_which_preprocessing_step_is_the_most_computationally_expensive:
          {
            stem: `6. Out of centering, standardizing, and whitening input data, which preprocessing step is the most computationally expensive?`,
            answers: ["c"],
            choices: {
              a: "Centering.",
              b: "Standardizing.",
              c: "Whitening."
            }
          }
      }
    }
  },
  UX_Research_in_Online_Communities: {
    what_motivates_online_community_contributors_to_contribute_consistently_A_case_study_on_Stackoverflow_netizens: {
      title:
        "What motivates online community contributors to contribute consistently? A case study on Stackoverflow netizens?",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FWhat-motivates-online-%20community-contributors-to-%20contribute-consistently.pdf?alt=media&token=c1b7fbc4-f9c6-4f23-942f-0107c3961ece",
      questions: {
        what_is_the_main_problem_trying_to_be_solved_tested: {
          stem: `1. What is the main problem trying to be solved/tested?`,
          answers: ["b"],
          choices: {
            a: "A lack of members in Q&A communities limits useful knowledge sharing ",
            b: "People do not participate enough to provide sought knowledge ",
            c: "There are not good ways to vet and evaluate the quality of information shared ",
            d: "There are not good methods to keep questions within a community’s scope of interest "
          }
        },
        which_of_the_following_are_results_of_their_study: {
          stem: `2. Which of the following are results of their study?`,
          answers: ["a", "b", "d"],
          choices: {
            a: "There was a positive interaction between social interaction and knowledge contribution .",
            b: "There was a negative interaction between knowledge seeking and knowledge contribution .",
            c: "There was a positive interaction between knowledge seeking and knowledge contribution .",
            d: "There was a positive interaction between reciprocation of knowledge and knowledge contribution ."
          }
        },
        what_is_graph_1_depicting_about_Stackoverflows_community: {
          stem: `3.What is graph 1 depicting about Stackoverflow’s community?`,
          answers: ["b"],
          choices: {
            a: "How active users are contributing overtime ",
            b: "The number of questions asked relative to how many answers are being given ",
            c: "Average contributions relative to the size of the community ",
            d: "The number of blue dots vs. number of orange dots used in the community overtime "
          }
        },
        What_is_their_main_research_question: {
          stem: `4.What is their main research question?`,
          answers: ["a"],
          choices: {
            a: "What motivates online community users to contribute consistently?",
            b: "How do Q&A communities get people to join and contribute? ",
            c: "How can Q&A communities evaluate the quality of the contributions? ",
            d: "What are the theoretical factors that correspond to StackOverflow features? "
          }
        },
        What_are_the_theories_they_use_to_understand_contribution_in_online_communities: {
          stem: `5. What are the theories they use to understand contribution in online communities?`,
          answers: ["b", "c"],
          choices: {
            a: "Information Search Process (ISP) ",
            b: "Social Cognitive Theory ",
            c: "Social Exchange Theory",
            d: "Kuhlthau Model "
          }
        },
        What_is_fig1_depicting: {
          stem: `6. What is fig.1 depicting?`,
          answers: ["a"],
          choices: {
            a: "Framework of variables and their corresponding systems that will be measured against knowledge contribution and compared in the study",
            b: "The systems used to increase the utility of knowledge contributions on StackOverflow ",
            c: "Different methods and their corresponding systems used for knowledge contribution on StackOverflow ",
            d: "Diagram of features used in all Q&A communities"
          }
        },
        In_the_Commenting_effect_on_knowledge_contribution_section_which_of_the_studies_cited_support_the_notion_that_peer_comments_will_increase_users_knowledge_contribution:
          {
            stem: `7. In the Commenting effect on knowledge contribution section, which of the studies cited support the notion that peer comments will increase users’ knowledge contribution?`,
            answers: ["a", "b", "c", "d"],
            choices: {
              a: "Chen, 2019 ",
              b: "Guan et al, 2018 ",
              c: "Chang & Chuang, 2011 ",
              d: "Tajfel & Turner, 1986 "
            }
          },
        In_H2_they_hypothesize_that_knowledge_seeking_has_what_type_of_effect_on_knowledge_contribution: {
          stem: `8. In H2 they hypothesize that knowledge-seeking has what type of effect on knowledge contribution?`,
          answers: ["c"],
          choices: {
            a: "Negative",
            b: "Positive",
            c: "Does not specify"
          }
        },
        In_the_subsection_Answer_received_effect_on_knowledge_contribution_which_cited_study_disagrees_with_hypothesis_7_H7:
          {
            stem: `9. In the subsection Answer received effect on knowledge contribution, which cited study disagrees with hypothesis 7 (H7)?`,
            answers: ["c"],
            choices: {
              a: "Negative",
              b: "Positive",
              c: "Does not specify"
            }
          },

        How_many_users_data_were_used_in_the_study: {
          stem: `10. How many users’ data were used in the study?`,
          answers: ["d"],
          choices: {
            a: "Entire population of users on StackOverflow ",
            b: "13,376 ",
            c: "199,190 ",
            d: "304"
          }
        },
        what_was_the_criteria_for_an_active_user: {
          stem: `11. What was the criteria for an active user?`,
          answers: ["c"],
          choices: {
            a: "Asked one question and provided two answers at least once a month ",
            b: "Accessed the website at least once every three months ",
            c: "Asked a question, provided an answer, or wrote a comment at least once in three months ",
            d: "Generated at least 10 up-votes per month "
          }
        },
        Which_of_the_following_explanatory_variables_had_a_statistically_significant_negative_effect_on_knowledge_contribution:
          {
            stem: `12. Which of the following explanatory variables had a statistically significant negative effect on knowledge contribution?`,
            answers: ["a", "d"],
            choices: {
              a: "Upvotes ",
              b: "Bronze badge",
              c: "Favorite votes",
              d: "Peeve votes "
            }
          },
        What_hypotheses_are_supported: {
          stem: `13. What hypotheses are supported?`,
          answers: ["c"],
          choices: {
            a: "Only H1,2,3, and 5 ",
            b: "Only 1, 2, 4,6 and 7 ",
            c: "All of the hypotheses were supported",
            d: "None of them were supported"
          }
        },
        Which_of_the_following_voting_features_have_a_positive_effect_on_knowledge_contribution_Increases_contribution:
          {
            stem: `14. Which of the following voting features have a positive effect on knowledge contribution(i.e. Increases contribution)?`,
            answers: ["b", "c"],
            choices: {
              a: "Upvotes",
              b: "Favorite votes",
              c: "Downvotes",
              d: "Peeve votes"
            }
          },
        What_do_the_authors_speculate_is_the_reason_behind_the_relationship_between_upvotes_and_knowledge_contribution:
          {
            stem: `15. What do the authors speculate is the reason behind the relationship between upvotes and knowledge contribution?`,
            answers: ["d"],
            choices: {
              a: "Users begin to feel competitive with other high point earners ",
              b: "Users begin to feel that they have adequately served their community as they obtain more upvotes ",
              c: "Users become increasingly confident in their knowledge and ability to answer questions ",
              d: "Users that receive many upvotes become conscious and protective of their reputation "
            }
          }
      }
    },
    The_psychology_of_task_management_The_smaller_tasks_trap: {
      title: "The Psychology of Task Management: The Smaller Tasks Trap",
      url: "https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FThe%20psychology%20of%20task%20management%20Article.pdf?alt=media&token=18c2f69f-2812-49e6-a2d3-24c9f93cc911",
      questions: {
        What_is_this_article_about: {
          stem: "1. What is this article about?",
          answers: ["a"],
          choices: {
            a: "Task Management",
            b: "Procrastination",
            c: "Multitasking"
          }
        },
        When_is_this_article_published: {
          stem: "2. When is this article published?",
          answers: ["a"],
          choices: {
            a: "2020",
            b: "2017",
            c: "2014",
            d: "2008"
          }
        },
        When_confronted_with_multiple_tasks_what_is_the_normative_approach: {
          stem: "3. When confronted with multiple tasks, what is the normative approach?",
          answers: ["b"],
          choices: {
            a: "Complete the smallest tasks first.",
            b: "Rely on a cost-benefit analysis to schedule them.",
            c: "Complete the task with the soonest deadline first."
          }
        },
        The_goal_of_the_first_study_is_to: {
          stem: "4. The goal of the first study is to:",
          answers: ["c"],
          choices: {
            a: "Examine whether participants were able to meet the deadlines of their assigned tasks.",
            b: "Explore if participants preferred quantitative or qualitative tasks more.",
            c: "Examine whether participants were prone to the small tasks trap bias."
          }
        },
        The_goal_of_the_second_study_is_to: {
          stem: "5. The goal of the second study is to:",
          answers: ["a"],
          choices: {
            a: "Examine the impact of starting with a smaller or larger task on overall performance.",
            b: "Determine whether starting with smaller or larger tasks was better for quality of work completed.",
            c: "Examine if starting with smaller tasks sped up the rate of completion of more tasks."
          }
        },
        What_are_the_findings_of_these_studies: {
          stem: "6. What are the findings of these studies?",
          answers: ["c"],
          choices: {
            a: "Starting with smaller tasks leads to faster completion and better quality of work overall.",
            b: "The smaller task trap can delay the completion of sub-goals but can make achieving larger tasks easier.",
            c: "The smaller task trap can lead to the completion of sub-goals but impede achieving the larger, more beneficial goal."
          }
        }
      }
    }
  },

  ADHD_and_autism: {
    Hyperfocus_the_forgotten_frontier_of_attention: {
      title: `Hyperfocus: the forgotten frontier of attention`,
      url: `https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2Fthe%20forgotten%20frontier%20of%20attention.pdf?alt=media&token=e4660e8a-0f6c-4d01-a972-a8c4d51a73ba`,
      questions: {
        official_definition_hyperfocus: {
          stem: `1. What’s the official definition of “hyperfocus”? Choose one answer.`,
          answers: [`c`],
          choices: {
            a: `An intense and unbreakable state of concentration.`,
            b: `A symptom of ADHD, ASD, and Schizophrenia where one is so immersed in a task that they become unaware of surrounding stimulus.`,
            c: `There is no official definition, and many papers leave it undefined and rely on the assumption that the reader inherently knows what it entails.`
          }
        },
        general_criteria_hyperfocus: {
          stem: `2. What are the four general criteria for hyperfocus that are consistently reported?`,
          answers: [`a`, `c`, `d`, `e`],
          choices: {
            a: `Hyperfocus is characterized by an intense state of concentration/focus.`,
            b: `The person hyperfocusing is diagnosed with or shows signs of ADHD/ASD/Schizophrenia`,
            c: `When engaged in hyperfocus, unrelated external stimuli do not appear to be consciously perceived; sometimes reported as a diminished perception of the environment.`,
            d: `To engage in hyperfocus, the task has to be fun or interesting.`,
            e: `During a hyperfocus state, task performance improves.`
          }
        },
        hyperfocus_forgotten_reasons: {
          stem: `3. Why has hyperfocus been “forgotten” when it comes to research and clinical literature?`,
          answers: [`b`, `c`, `d`],
          choices: {
            a: `Because most people who want to research it have ADHD and forget to conduct the experiments.`,
            b: `There is no clear general or operational definition of hyperfocus in the literature.`,
            c: `It is very difficult to experimentally manipulate a subject into a hyperfocus state.`,
            d: `Some studies do not refer to hyperfocus by name, but describe processes that appear to be related, such as “in the zone” and “flow”.`
          }
        },
        ultimate_purpose_article: {
          stem: `4. What is the ULTIMATE purpose of this article?`,
          answers: [`a`],
          choices: {
            a: `To provide a common baseline for researchers of the hyperfocus phenomenon.`,
            b: `To propose an operational definition of hyperfocus.`,
            c: `To analyze all literature currently written about hyperfocusing.`,
            d: `To discuss hyperfocus in ADHD vs ASD vs Schizophrenia.`
          }
        },
        hyperfocus_flow_exclusivity: {
          stem: `5. True or False: Only people with attentional disorders such as ADHD, ASD, or Schizophrenia report experiencing hyperfocus-like states/states of “flow”.`,
          answers: [`b`],
          choices: {
            a: `True`,
            b: `False`
          }
        },
        weber_et_al_theoretical_framework: {
          stem: `6. What was Weber et al’s (2009) theoretical framework regarding neural correlates of “flow”?`,
          answers: [`a`],
          choices: {
            a: `That flow states are due to synchronization of attentional networks and reward networks, creating a particularly efficient information processing method.`,
            b: `That flow is associated with suppression of activity in the explicit system, specifically the frontal and prefrontal cortex—referred to as “transient hypofrontality”.`,
            c: `That flow states are induced by certain sensory stimuli such as music, after looking at neuroimaging of the somatosensory cortex and prefrontal cortex.`
          }
        },
        What_is_the_gradual_continuous_performance_task: {
          stem: `7. What is the gradual continuous performance task? (grad CPT)?`,
          answers: [`a`, `c`],
          choices: {
            a: `Mechanic created by Esterman et al. (2012) to assess moment to moment fluctuations in sustained attention performance.`,
            b: `A test where participants had to continually perform in front of researchers after gradually learning a script in order to assess if theater could be used to get people “in the zone”.`,
            c: `A test with slowly shifting images of either city scenes or mountain scenes where participants had to respond to city scenes and withhold responses to mountain scenes.`
          }
        },
        in_the_zone_not_hyperfocus: {
          stem: `8. Why does being “in the zone” not qualify as a state of hyperfocus in the experiments outlined in this paper?`,
          answers: [`a`, `b`],
          choices: {
            a: `The activity is not particularly fun or engaging beyond being a psychology experiment.`,
            b: `The variance time condition doesn’t have a baseline condition, so it’s unclear if task performance is actually enhanced or if it’s simply unimpaired.`,
            c: `The experiment was faulty because they selected from a pool of undergraduate psychology majors.`
          }
        },
        hyperfocus_same_adhd_asd_schizophrenia: {
          stem: `9. Did the authors conclude that hyperfocus seems to be the same in ADHD, ASD, and Schizophrenia?`,
          answers: [`a`, `c`],
          choices: {
            a: `The version of hyperfocus described in the paper and anecdotal evidence occurs in both ADHD and ASD, but it is unclear if it appears in Schizophrenia due to a severe lack of literature about the subject.`,
            b: `The version of hyperfocus described in the paper and anecdotal evidence appears equally in all three disorders.`,
            c: `The version of hyperfocus described in the paper occurs in ASD but is often incorrectly used to refer to stereotypic and self-stimulatory behavior.`
          }
        },
        flow_experience_exams: {
          stem: `10. True or False: It was noted that the paper about “flow experience” and exams did not specify if the flow state occurred during class lectures or only during the exam itself.`,
          answers: [`a`],
          choices: {
            a: `True`,
            b: `False`
          }
        }
      }
    }
  },
  AI_Language_Models_in_Education: {
    Hyperfocus_the_forgotten_frontier_of_attention: {
      title: `Exploring the potential of using an AI language model for automated essay scoring`,
      url: `https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FExploring%20the%20potential%20of%20using%20an%20AI%20language%20model%20for%20automated%20essay%20scoring.pdf?alt=media&token=96025a28-a940-49f2-9989-b72f0c707638`,
      questions: {
        What_differentiates_ChatGPT_from_OpenAI_previous_GPT_language_model: {
          stem: "1. What differentiates ChatGPT from OpenAI's previous GPT language model?",
          answers: ["c"],
          choices: {
            a: "ChatGPT allows users to use Python for asking questions.",
            b: "OpenAI's GPT was limited to English language processing.",
            c: "ChatGPT allows users to ask questions on a browser and presents answers in multiple languages.",
            d: "OpenAI's GPT had limited application in the field of natural language processing."
          }
        },
        What_is_the_main_focus_of_the_paper: {
          stem: "2. What is the main focus of the paper?",
          answers: ["c"],
          choices: {
            a: "Investigating the potential of AI language models for natural language processing tasks.",
            b: "Comparing different versions of GPT-3 language models for text generation.",
            c: "Evaluating the effectiveness of GPT-3 text-davinci-003 model for automated essay scoring (AES).",
            d: "Analyzing the historical development of artificial intelligence (AI) language models."
          }
        },
        "What_is_the_primary_advantage_of_using_AI-based_language_models_in_AES": {
          stem: "3. What is the primary advantage of using AI-based language models in Automated Essay Scoring (AES)?",
          answers: ["d"],
          choices: {
            a: "Increasing the word count of student essays.",
            b: "Providing feedback on grammar and punctuation errors.",
            c: "Gaining popularity among students for AES tasks.",
            d: "Accurately assessing the quality of student writing."
          }
        },
        What_is_the_primary_objective_of_the_study: {
          stem: "4. What is the primary objective of the study?",
          answers: ["d"],
          choices: {
            a: "Analyzing the historical development of AI language models.",
            b: "Investigating the implications of using linguistic features in AES.",
            c: "Exploring the potential role of AES in language model development.",
            d: "Examining the implications of using an AI language model for AES and the potential role of linguistic features in improving AES accuracy."
          }
        },
        "Background_-_Automated_Essay_Scoring_(AES)": {
          stem: "5. What is the main advantage of AES over human scoring according to the text?",
          answers: ["a"],
          choices: {
            a: "It can avoid the risks associated with human scoring, such as the time-consuming and inaccurate scoring of essays.",
            b: "It can use computer programs to analyze and score written work based on predefined criteria.",
            c: "It can use NLP to simulate human intellectual abilities.",
            d: "It can provide automatic feedback on errors."
          }
        },
        What_is_the_main_criticism_of_early_AES_systems_such_as_PEG_according_to_the_text: {
          stem: "6. What is the main criticism of early AES systems, such as PEG, according to the text?",
          answers: ["a"],
          choices: {
            a: "They solely focused on surface structures and neglected features pertaining to the content.",
            b: "They used multiple regression analysis to predict the scores of essays.",
            c: "They compared the scores of essays to the scores given by human raters on similar topics.",
            d: "They used measurable text characteristics, such as the average sentence length and number of commas."
          }
        },
        What_is_the_term_used_to_describe_the_use_of_AES_systems_to_provide_automatic_feedback_on_errors_for_student_writing_in_the_classroom:
          {
            stem: "7. What is the term used to describe the use of AES systems to provide automatic feedback on errors for student writing in the classroom?",
            answers: ["a"],
            choices: {
              a: "Automated Writing Evaluation",
              b: "Neural Machine Translation",
              c: "Machine Learning",
              d: "Natural Language Processing"
            }
          },
        "What_is_the_name_of_the_web-based_AWE_tool_that_uses_e-rater_as_its_AES_system": {
          stem: "8. What is the name of the web-based AWE tool that uses e-rater as its AES system?",
          answers: ["b"],
          choices: {
            a: "PEG",
            b: "Criterion",
            c: "IntelliMetric",
            d: "MY Access!"
          }
        },
        What_is_the_branch_of_AI_that_uses_computer_programming_to_simulate_human_intellectual_abilities: {
          stem: "9. What is the branch of AI that uses computer programming to simulate human intellectual abilities, which allowed for more accurate scoring using not only superficial linguistic features but also deeper ones?",
          answers: ["c"],
          choices: {
            a: "Support vector machines",
            b: "Convolutional neural networks",
            c: "Natural Language Processing",
            d: "Neural Machine Translation"
          }
        },
        Machine_learning_and_deep_learning: {
          stem: "10. Which of the following is a sub-discipline of AI that is used to construct different automated scoring models and cross-validate them?",
          answers: ["a"],
          choices: {
            a: "Machine learning",
            b: "Deep learning",
            c: "Natural language processing",
            d: "Neural networks"
          }
        },
        What_is_the_ultimate_goal_of_machine_learning_in_an_AES_system: {
          stem: "11. What is the ultimate goal of machine learning in an AES system?",
          answers: ["a"],
          choices: {
            a: "To make accurate predictions that align with the scores given by human raters.",
            b: "To select critical features that yield better results and reduce the risk of using irrelevant or noisy features.",
            c: "To train a model on a large corpus of essays scored by human expert raters.",
            d: "To use various features of the text to automatically extract linguistic features such as text cohesion, syntactic complexity, lexical sophistication, etc."
          }
        },
        What_is_the_difference_between_deep_learning_and_other_machine_learning_techniques: {
          stem: "12. What is the difference between deep learning and other machine learning techniques?",
          answers: ["c"],
          choices: {
            a: "Deep learning uses multiple layers to learn and make decisions, whereas other machine learning techniques typically use a single layer.",
            b: "Deep learning uses structured and unstructured data, whereas other machine learning techniques only use structured data.",
            c: "Deep learning extracts features directly from raw data by itself, whereas features are often handcrafted by domain expert humans in other machine learning techniques.",
            d: "All of the above"
          }
        },
        What_is_the_advantage_of_using_deep_learning_approaches_in_modern_AES: {
          stem: "13. What is the advantage of using deep learning approaches in modern AES?",
          answers: ["a"],
          choices: {
            a: "The model can take the content of the essay, inducing syntactic and semantic features, into account, in addition to the surface features.",
            b: "The model can use a large corpus of essays scored by human expert raters to train itself.",
            c: "The model can select critical features that yield better results and reduce the risk of using irrelevant or noisy features.",
            d: "The model can automatically extract linguistic features such as text cohesion, syntactic complexity, lexical sophistication, etc."
          }
        },
        Transformers: {
          stem: "14. What distinguishes Transformers from previous neural network architectures, such as CNNs and RNNs?",
          answers: ["c"],
          choices: {
            a: "Transformers achieve better results in computer vision tasks.",
            b: "Transformers can process non-sequential data more efficiently.",
            c: "Transformers are an evolution of CNNs and RNNs, combining their benefits.",
            d: "Transformers have a simpler architecture than CNNs and RNNs."
          }
        },
        In_applied_linguistics_research_how_did_the_use_of_BERT_in_creating_lexical_sophistication_measures_compare_to_traditional_methods:
          {
            stem: "15. In applied linguistics research, how did the use of BERT in creating lexical sophistication measures compare to traditional methods?",
            answers: ["b"],
            choices: {
              a: "BERT measures showed a weaker correlation with L2 English writing quality.",
              b: "BERT measures correlated more strongly with L2 English writing quality.",
              c: "Traditional methods were found to be more accurate in measuring lexical sophistication.",
              d: "BERT was solely used for contextualized word embeddings without any significant findings."
            }
          },
        "What_approach_leads_to_the_current_state-of-the-art_performance_in_Automated_Essay_Scoring_AES": {
          stem: "16. What approach leads to the current state-of-the-art performance in Automated Essay Scoring (AES)?",
          answers: ["b"],
          choices: {
            a: "Using BERT in isolation without any additional features.",
            b: "Combining BERT with other transformer-based models.",
            c: "Utilizing handcrafted features without BERT.",
            d: "Combining BERT with handcrafted features."
          }
        },
        How_are_BERT_and_GPT_typically_utilized_in_the_field_of_natural_language_processing_NLP: {
          stem: "17. How are BERT and GPT typically utilized in the field of natural language processing (NLP)?",
          answers: ["b"],
          choices: {
            a: "BERT is used for natural language generation tasks, and GPT is used for natural language understanding tasks.",
            b: "BERT is used for both natural language understanding and natural language generation tasks.",
            c: "GPT is used for both natural language understanding and natural language generation tasks.",
            d: "BERT and GPT are exclusively used for text summarization tasks."
          }
        },
        Why_has_BERT_been_applied_to_Automated_Essay_Scoring_AES: {
          stem: "18. Why has BERT been applied to Automated Essay Scoring (AES)?",
          answers: ["a"],
          choices: {
            a: "BERT is primarily designed for natural language understanding tasks.",
            b: "BERT is capable of generating coherent and fluent language.",
            c: "BERT has demonstrated efficiency in tasks like sentiment analysis and text classification, which are similar to AES.",
            d: "BERT has a prompt-based learning approach for diverse task performance."
          }
        },
        The_present_study: {
          stem: "19. What is the goal of this study?",
          answers: ["a"],
          choices: {
            a: "To explore the potential use of prompt-based GPT for AES and compare it with research-based linguistic features.",
            b: "To explore the potential use of prompt-based GPT for AES and compare it with human raters.",
            c: "To explore the potential use of prompt-based GPT for AES and compare it with other machine learning techniques.",
            d: "To explore the potential use of prompt-based GPT for AES and compare it with natural language processing tools."
          }
        },
        Which_of_the_following_are_the_two_research_questions_used_in_this_study: {
          stem: "20. Which of the following are the two research questions used in this study? (Select all that apply)",
          answers: ["a", "b"],
          choices: {
            a: "To what extent is AES by GPT reliable?",
            b: "To what extent does AES by GPT predict benchmark essay scores relative to a set of research-based linguistic features?",
            c: "To what extent does AES by GPT align with the scores given by human raters?",
            d: "To what extent does AES by GPT extract linguistic features directly from raw data by itself?"
          }
        },
        "Methods_-_Dataset": {
          stem: "21. How are the essays scored in the corpus?",
          answers: ["c"],
          choices: {
            a: "Low, Medium, High",
            b: "Beginner, Intermediate, Advanced",
            c: "A, B, C, D, F",
            d: "1, 2, 3, 4, 5"
          }
        },
        "Methods_-_Types_of_GPT": {
          stem: "22. What is the name of the technique that ChatGPT used to improve its functionality as a chatbot?",
          answers: ["a"],
          choices: {
            a: "Reinforcement Learning from Human Feedback",
            b: "Generative Pre-training from Text and Code",
            c: "Fine-tuning on a Specific Task",
            d: "Misalignment Correction and Optimization"
          }
        },
        "What_is_the_main_difference_between_text-davinci-003_model_and_ChatGPT_in_terms_of_training": {
          stem: "23. What is the main difference between text-davinci-003 model and ChatGPT in terms of training?",
          answers: ["c"],
          choices: {
            a: "text-davinci-003 model was trained on a blend of text and code, while ChatGPT was trained only on text",
            b: "text-davinci-003 model was trained on a larger dataset than ChatGPT",
            c: "text-davinci-003 model did not undergo any additional training, while ChatGPT underwent additional training using RLHF",
            d: "text-davinci-003 model was trained on a specific task, while ChatGPT was trained on a general domain"
          }
        },
        "Methods_-_Prompt": {
          stem: "24. How many points are in the scale of the rubric?",
          answers: ["c"],
          choices: {
            a: "5",
            b: "9",
            c: "10",
            d: "12"
          }
        },
        "Methods_-_Stratified_sampling": {
          stem: "25. What was the main finding of the re-scoring process?",
          answers: ["b"],
          choices: {
            a: "There were statistically significant differences between the mean scores of the three levels in the randomly sampled essays and those of the three levels in the original 12,100 essays",
            b: "There were no statistically significant differences between the mean scores of the three levels in the randomly sampled essays and those of the three levels in the original 12,100 essays",
            c: "There were statistically significant differences between the mean scores of each level in the randomly sampled essays and those of each level in the original 12,100 essays",
            d: "There were no statistically significant differences between the mean scores of each level in the randomly sampled essays and those of each level in the original 12,100 essays"
          }
        },
        Statistical_Analysis: {
          stem: "26. What statistical methods did the researchers employ to address Research Question 1 and assess intra-rater reliability in the study?",
          answers: ["b"],
          choices: {
            a: "Descriptive statistics and effect sizes",
            b: "Quadratic Weighted Kappa and Cohen's Kappa",
            c: "Inferential statistics and effect sizes",
            d: "Inferential statistics and Quadratic Weighted Kappa"
          }
        },
        What_statistical_method_did_the_researchers_use_to_assess_the_ability_of_AES_by_GPT_to_reproduce_the_benchmark_levels_in_Research_Question_2:
          {
            stem: "27. What statistical method did the researchers use to assess the ability of AES by GPT to reproduce the benchmark levels in Research Question 2?",
            answers: ["c"],
            choices: {
              a: "Multiple regression",
              b: "Ordinal regressions",
              c: "Model comparison approach",
              d: "Inferential statistics"
            }
          },
        Results: {
          stem: "28. What was the name of the information criterion that the authors used to compare the model fit of different regression models?",
          answers: ["c"],
          choices: {
            a: "Akaike Information Criterion (AIC)",
            b: "Bayesian Information Criterion (BIC)",
            c: "Leave-One-Out cross-validation Information Criterion (LOOIC)",
            d: "Deviance Information Criterion (DIC)"
          }
        },
        Discussion: {
          stem: "29. What was the outcome of the second research question regarding Automated Essay Scoring (AES) by GPT and linguistic features?",
          answers: ["c"],
          choices: {
            a: "The addition of linguistic features had no impact on predicting benchmark levels.",
            b: "AES by GPT without linguistic features outperformed all other models.",
            c: "The combination of GPT and linguistic features improved the prediction of benchmark levels.",
            d: "Research-based linguistic features did not contribute to the accuracy of AES by GPT."
          }
        },
        What_are_some_benefits_of_employing_AES_with_GPT: {
          stem: "30. What are some benefits of employing AES with GPT?",
          answers: ["a"],
          choices: {
            a: "Increased consistency in scoring and reduced evaluation bias.",
            b: "Augmented feedback on writing quality and improved linguistic features.",
            c: "Longer rating times and immediate scoring capabilities.",
            d: "Focus on linguistic features and alignment with specific criteria."
          }
        },
        How_does_AES_with_GPT_differ_from_Automated_Writing_Evaluation_AWE: {
          stem: "31. How does AES with GPT differ from Automated Writing Evaluation (AWE)?",
          answers: ["c"],
          choices: {
            a: "AES provides detailed feedback to learners, while AWE only gives scores.",
            b: "AES is more suitable for teachers, while AWE is designed for learners.",
            c: "AES gives scores and detailed feedback to both learners and teachers.",
            d: "AWE is a separate technology and not related to AES with GPT."
          }
        },
        What_advantage_does_AES_using_GPT_offer_over_AES_systems_like_Criterion: {
          stem: "32. What advantage does AES using GPT offer over AES systems like Criterion?",
          answers: ["b"],
          choices: {
            a: "AES using GPT provides more accurate scoring aligned with large-scale tests.",
            b: "AES using GPT allows for the incorporation of rubrics used in instruction.",
            c: "AES using GPT can be used exclusively in out-of-class writing settings.",
            d: "AES using GPT eliminates the need for written corrective feedback."
          }
        },
        What_are_the_future_research_possibilities_regarding_AES_with_GPT: {
          stem: "33. What are the future research possibilities regarding AES with GPT?",
          answers: ["a"],
          choices: {
            a: "Comparing the GPT model without fine-tuning with other language models.",
            b: "Integrating linguistic features to enhance the performance of AES with GPT.",
            c: "Focusing on syntactic dependency measures to predict essay quality.",
            d: "Refining the GPT model through fine-tuning for comparison with ChatGPT."
          }
        },
        "What_aspect_of_AI-based_automated_essay_scoring_does_this_study_primarily_focus_on": {
          stem: "34. What aspect of AI-based automated essay scoring does this study primarily focus on?",
          answers: ["c"],
          choices: {
            a: "The impact of AI-generated scores on student motivation and engagement.",
            b: "Ethical considerations related to using AI technologies in education.",
            c: "The wider educational implications of AI-based automated essay scoring.",
            d: "The potential benefits and drawbacks of AI-based automated essay scoring for foreign language education."
          }
        },
        What_is_the_role_of_AI_language_models_like_GPT_in_the_field_of_applied_linguistics: {
          stem: "35. What is the role of AI language models like GPT in the field of applied linguistics?",
          answers: ["c"],
          choices: {
            a: "They are intended to replace human expertise entirely.",
            b: 'They are a form of "high-tech plagiarism," as claimed by Chomsky.',
            c: "They can be used as logical assistants to complement human expertise.",
            d: "They have limited potential utility and are not beneficial for non-native English speakers."
          }
        }
      }
    }
  },
  Behavioral_Sciences: {
    Connecting_to_our_future_healthier_selves: {
      title: `Connecting to our future, healthier selves: Associations between self-continuity measures and eating behaviors in daily life`,
      url: `https://firebasestorage.googleapis.com/v0/b/visualexp-a7d2c.appspot.com/o/Papers%2FConnecting%20to%20our%20future%2C%20healthier%20selves.pdf?alt=media&token=b2d80a65-3f71-4a67-a3cb-1c98dff42e82`,
      questions: {
        challenges_healthy_eating: {
          stem: `1. What are some challenges preventing healthy eating?`,
          answers: [`a`, `b`, `c`],
          choices: {
            a: `The cost of healthy foods compared to unhealthy foods`,
            b: `The amount of time between healthy eating behaviors and later health benefits`,
            c: `The instantaneous reward of eating something that tastes good can be perceived as more rewarding than eating healthy`
          }
        },
        type_of_rewards: {
          stem: `2. Which type of rewards are, on average, temporarily valued as being most rewarding?`,
          answers: [`b`],
          choices: {
            a: `Distal rewards`,
            b: `Instantaneous rewards`
          }
        },
        self_determination_theory: {
          stem: `3. What does self-determination theory say aids one’s likelihood to achieve goals?`,
          answers: [`c`],
          choices: {
            a: `Constant reinforcement`,
            b: `Routine positive punishment`,
            c: `Autonomous motivation`,
            d: `Outside coaching`
          }
        },
        self_continuity: {
          stem: `4. What is self-continuity?`,
          answers: [`a`],
          choices: {
            a: `The subjective identification as being both your past, present, and future self`,
            b: `The belief that you will never age`,
            c: `The belief that your behaviors will only impact your present self`,
            d: `The belief that your current behaviors and mindset will remain fixed for your entire lifespan`
          }
        },
        consideration_of_future_consequences: {
          stem: `5. True or False: Consideration of Future Consequences was more strongly associated with measures related to healthy foods.`,
          answers: [`b`],
          choices: {
            a: `True`,
            b: `False`
          }
        },
        study_control_condition: {
          stem: `6. What was the study’s control condition?`,
          answers: [`b`],
          choices: {
            a: `Cognitive reappraisal`,
            b: `No training`,
            c: `Situation selection`,
            d: `Situation modification`
          }
        },
        affecting_consumption: {
          stem: `7. Which of these significantly, but indirectly, affected the consumption of both healthy and unhealthy foods?`,
          answers: [`a`],
          choices: {
            a: `Future Self-Connectedness`,
            b: `Consideration of Future Consequences`,
            c: `Autonomous motivation`
          }
        },
        study_limitation: {
          stem: `8. What is the most notable limitation of this study?`,
          answers: [`b`],
          choices: {
            a: `Its causational nature`,
            b: `Its correlational nature`,
            c: `Number of participants`,
            d: `Lack of participants with eating disorders`
          }
        }
      }
    }
  },
  Liaison_Librarians: {}
};
export default communitiesPapers;
