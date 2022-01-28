import React from "react";

export default [
  {
    title: "1Cademy Introduction",
    description: (
      <div>
        <p>
          Welcome to the second step in the application process! Please go
          through this tutorial to learn more about 1Cademy and how it works.
          First, we will introduce 1Cademy, its objective, and how it works
          before digging into collaborating with others on 1Cademy.
        </p>
        <p>
          Before moving forward, please make sure to make an account on{" "}
          <a href="https://1cademy.com/" target="_blank">
            1Cademy web app
          </a>
          .
        </p>
      </div>
    ),
    video: "vkNx-QUmbNI",
    questions: [
      {
        stem: "How can 1Cademy help us? (Please select all that apply)",
        answers: [a, b, d, f, g, h, i, j, k],
        choices: {
          a: "Through learning backwards like researchers",
          b: "Joining/forming multi-school research communities",
          c: "Passing standardized exams",
          d: "Deepening our learning by thinking through prerequisites necessary to learn each concept",
          e: "Better scheduling our studying sessions",
          f: "Learning from each other the more effective ways to learn each concept",
          g: "Collaboratively developing learning pathways to learn each concept",
          h: "Crowdsourcing our learning",
          i: "Learning through teaching others",
          j: "Improving exploratory search",
          k: "A consensus-based collaboration mechanism where alternative or even competing perspectives are placed side-by-side so that one can easily compare and contrast them to learn and rationalize each topic in different contexts.",
        },
      },
      {
        stem: "If everything is explained somewhere on the internet, then why do we pay for textbooks and online courses?",
        answers: [f],
        choices: {
          a: "Because we cannot find the explanations on the Internet.",
          b: "Because we are lazy!",
          c: "Because we don't know how to use the Internet efficiently.",
          d: "Because most explanations on the Internet are not free.",
          e: "Because most explanations on the Internet are incorrect.",
          f: "Because most explanations on the Internet do not provide us with learning pathways.",
        },
      },
    ],
  },
];
