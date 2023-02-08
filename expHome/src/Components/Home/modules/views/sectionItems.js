export const ONE_CADEMY_SECTIONS = [
  {
    id: "landing",
    title: "1Cademy's Landing Page",
    label: "1Cademy's Landing Page",
    description: ""
  },
  {
    id: "mechanism",
    title: "Mechanism",
    label: "Mechanism",
    description: "We collaboratively summarize, link, evaluate, and improve science on 1Cademy."
  },
  {
    id: "magnitude",
    title: "Magnitude",
    label: "Magnitude",
    description: `Over the past two years, ${1543} students and researchers from ${183} institutions have participated in a large-scale collaboration effort through 1Cademy. This collaboration has resulted in the creation of ${44665} nodes and ${235674} prerequisite links between them, which have been proposed through [${88167}] proposals.`,
    getDescription: ({ users, institutions, nodes, links, proposals }) =>
      `Over the past two years, [${users}] students and researchers from [${institutions}] institutions have participated in a large-scale collaboration effort through 1Cademy. This collaboration has resulted in the creation of [${nodes}] nodes and [${links}] prerequisite links between them, which have been proposed through [${proposals}] proposals.`
  },
  {
    id: "benefits",
    title: "Benefits",
    label: "Benefits",
    description: ""
  },
  {
    id: "topics",
    title: "Topics",
    label: "Topics",
    description:
      "1Cademy facilitated the formation of communities of learners and researchers who can learn from each other, exchange ideas and support one another in their learning journey.",
    options: [
      {
        title: "UX Research In Online Communities",
        link: "https://1cademy.us/community/Cognitive_Psychology"
      },
      {
        title: "Clinical Psychology",
        link: "https://1cademy.us/community/Clinical_Psychology"
      },
      {
        title: "Health Psychology",
        link: "https://1cademy.us/community/Health_Psychology"
      },
      {
        title: "Disability Studies",
        link: "https://1cademy.us/community/Disability_Studies"
      },
      {
        title: "Social Psychology",
        link: "https://1cademy.us/community/Social_Psychology"
      },
      {
        title: "Natural Language Processing",
        link: "https://1cademy.us/community/Deep_Learning"
      },
      {
        title: "UX Research in Online Communities",
        link: "https://1cademy.us/community/UX_Research_in_Online_Communities"
      },
      {
        title: "Liaison Librarians",
        link: "https://1cademy.us/community/Liaison_Librarians"
      }
    ]
  },
  {
    id: "systems",
    title: "Systems",
    label: "Systems",
    description:
      "1Cademy offers a comprehensive and integrated solution that enhances the educational and research experience through its three interconnected systems."
  },
  { id: "about-us", title: "About Us", label: "About Us", description: "" }
];
