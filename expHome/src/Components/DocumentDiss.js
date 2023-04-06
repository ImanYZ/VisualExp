import React from "react";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const panels = [
  {
    id: "panel1",
    heading: <h2>Chapter 1: Introduction</h2>,
    details: (
      <div>
        <p>
          In this dissertation, I report on the design of{" "}
          <a href="https://1cademy.com/" target="_blank" rel="noreferrer">
            1Cademy
          </a>
          , a crowdsourcing platform for creating and updating a scalable knowledge graph of learning pathways. I
          explore design mechanisms that lead to a shared graph with individualized views for self-directed learning.
        </p>
        <p>
          The studies included in this dissertation focus on representation, presentation, and scheduling of studying
          micro-content to optimize their learning:
        </p>
        <ul>
          <li>
            <strong>Representation</strong>: how should we structure the network of micro-content in a knowledge graph,
            including their representation in nodes and links? How should we design collaboration mechanisms to
            generate, evaluate, and improve such a representation at scale?
          </li>
          <li>
            <strong>Presentation</strong>: how should we display and navigate the relationships among the micro-content?
          </li>
          <li>
            <strong>Scheduling</strong>: how should we plan for studying/practicing the micro-content to optimize their
            retention?
          </li>
        </ul>
        <p>
          How can we optimize life-long learning? Studying any book is a very time-consuming activity, as it may take
          months to complete. While instructors choose textbooks for us in school, after graduation, we must rely on
          search engines to select books, courses, and other resources. This can result in uncertainty about whether we
          have invested in the right learning materials, how they align with our learning objectives, and what we should
          study next.
        </p>
        <p>
          Another challenge is the need for a note-taking mechanism that connects concepts from different courses and
          books studied after graduation, as each resource often introduces its own terminology and thought process. To
          optimize life-long learning, I dedicated my Ph.D. to designing and developing a scalable, collaborative
          note-taking platform, called 1Cademy, for students, instructors, and researchers. 1Cademy aims to provide a
          digestible presentation and representation of science, facilitating more efficient learning.
        </p>
        <p>
          Minimizing redundancy in educational materials, such as books, websites, and videos, is crucial for optimizing
          life-long learning. This challenge is exacerbated by the mass generation of content by large language models.
          To maximize learning potential, we must eliminate overlapping content and merge all available explanations for
          a subject into a single comprehensive chunk. This chunk should encompass various perspectives and use-cases
          side-by-side, allowing learners to refer to it as the sole source for complete mastery of the topic.
        </p>
        <p>
          Large language models can serve this purpose by digesting all available content, automatically summarizing it,
          and providing short explanations. However, determining the most effective way to represent and present these
          small chunks (micro-content) for optimal learning remains an open question.
        </p>
      </div>
    )
  },
  {
    id: "panel2",
    heading: <h2>Chapter 2: Optimal chunk size and presentation for learning</h2>,
    details: (
      <div>
        <p>
          I introduce “Hybrid maps,” a new knowledge presentation format that combines the benefits of hypertext and
          Novakian concept maps. The design was inspired by previous research on knowledge presentation and hypertext.
          Its key design features are:
        </p>
        <ul>
          <li>
            Each node (micro-content) has a title and a paragraph, small enough to describe only one main concept.
          </li>
          <li>
            The links between nodes are visualized in a two-dimensional, left-to-right and top-to-bottom, orientation.
          </li>
          <li>
            All the nodes and links are on a single page that the user navigates by panning and zooming rather than
            paging.
          </li>
        </ul>
        <p>
          To improve learning through the “prerequisite knowledge graph,” we should consider how we present and
          represent the content within each paragraph and the relationship between paragraphs.
        </p>
        <h3>Experiment 1</h3>
        <p>
          Regrading the within paragraph relations, we compared reading through Hybrid maps and their equivalent
          Novakian knowledge models through a within-subject controlled experiment. We found that Hybrid maps improved
          readability, learnability, recall, and recognition, on both factual and inferential questions, in immediate
          and delayed tests, on college-level passages. Through quantitative and qualitative analysis of the results, we
          concluded that for efficient learning of college-level course content in the form of the prerequisite
          knowledge graph, each node should be represented as a paragraph of sentences and all the graph should be
          represented on a single page.
        </p>
        <h3>Experiment 2</h3>
        <p>
          Regrading the between paragraph relations, we are going to run a similar experiment comparing reading through
          Hybrid maps with their equivalent hierarchical hypertext. We chose the hierarchical hypertext representation,
          because prior studies have shown that hierarchical hypertext, compared to network hypertext, is more efficient
          for navigation and results in faster response time on tests.
        </p>
        <p>
          In addition to the substantive contribution, I also describe methodological contributions for conducting this
          kind of research with a Volunteer Research Team
        </p>
        <ul>
          <li>Tracking and motivating contributions, and decentralizing authorship assignment</li>
          <li>
            Automating free-recall grading and thematic analysis &nbsp;through large language models, including
            different ChatGPT engines, and assessing it through{" "}
            <a href="https://arxiv.org/pdf/2106.01254.pdf" target="_blank" rel="noreferrer">
              the Survey Equivalence mechanism
            </a>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: "panel3",
    heading: (
      <h2>
        Chapter 3: Crowdsourcing a Coherent, Prerequisite Knowledge Graph of Mutually Exclusive Learning Micro-content
      </h2>
    ),
    details: (
      <div>
        <p>
          The coherence of a knowledge entry is directly related to the effort put into its creation, as creators who
          invest little effort are less likely to ensure coherence with other entries. Social media platforms like
          Twitter and TikTok are examples of where many entries on the same topic can be found with little coherence
          between them. Conversely, Wikipedia, scientific publications, and Coursera courses demonstrate high coherence
          due to the effort invested in their creation and research into similar entries.
        </p>
        <p>
          For collaborative note-taking to optimize life-long learning at scale, I proposed a scalable prerequisite
          knowledge graph of mutually exclusive micro-content, where each entry covers a unique topic. However, creators
          may consider these entries trivial and put less effort into ensuring coherence with other entries. In this
          chapter, I explore alternative design elements and social mechanisms that can improve coherence in the
          scalable prerequisite knowledge graph that:
        </p>
        <ul>
          <li>Is fully interconnected, scalable, and usable</li>
          <li>Is understandable to newcomers and readers from different disciplines</li>
          <li>Avoids duplication and overlapping content</li>
          <li>Provides learning pathways</li>
          <li>Facilitates exploratory searching</li>
          <li>
            Enhances contributions:
            <ul>
              <li>In large magnitude</li>
              <li>Of high quality (mitigates dissemination of misinformation or disinformation)</li>
            </ul>
          </li>
          <li>Encourages reading and improving upon others&rsquo; contributions</li>
          <li>Favors majority of votes over individual biases</li>
        </ul>
        <p>
          I discuss my design space exploration of these topics and my solutions for crowdsourcing such a scalable
          knowledge graph on{" "}
          <a href="https://1cademy.com/" target="_blank" rel="noreferrer">
            1Cademy
          </a>{" "}
          to achieve the listed objectives in large student communities. Over the past two years, 1,543 students and
          researchers from 183 institutions have participated in a large-scale collaboration effort through{" "}
          <a href="https://1cademy.com/" target="_blank" rel="noreferrer">
            1Cademy
          </a>
          . This collaboration has resulted in the creation of 44,665 nodes and 235,674 prerequisite links between them,
          which have been proposed through 88,167 proposals. I will also report on my smaller field trials on voluntary
          question-generation and mapping, and Hybrid mapping as course assignments.
        </p>
      </div>
    )
  },
  {
    id: "panel4",
    heading: (
      <h2>
        Chapter 4: How to utilize spaced, interleaved retrieval practice to improve learner retention of micro-content
      </h2>
    ),
    details: (
      <div>
        {" "}
        <p>
          I have published two papers based on our analysis of the usage log data collected by our spaced, interleaved
          retrieval practice tool for computer science education:
        </p>
        <ul>
          <li>
            In
            <a href="https://dl.acm.org/doi/abs/10.1145/3446871.3469760" target="_blank" rel="noreferrer">
              ICER 2019
            </a>
            , we described the design of our practice tool. While each hour spent using the tool was associated with a
            1.04% increase in final exam grades, the number of hours of studying the textbook was not. To assess
            motivation, we report on the amount of practice tool use: 62 of the 193 students (32%) voluntarily used the
            tool more than the required 45 days. This indicates that the tool design successfully overcame negative
            perceptions of these desirable difficulties.
          </li>
          <li>
            In
            <a href="https://dl.acm.org/doi/abs/10.1145/3506860.3506907" target="_blank" rel="noreferrer">
              LAK 2022
            </a>
            , we analyzed 674 students&#39; interactions with an introductory programming course eBook over four
            semesters. We measured each student&#39;s spacing and procrastination and found a small positive correlation
            between the two. However, when controlling for total studying, academic and demographic characteristics, our
            SEM analysis showed a strong positive effect of spacing but no significant effect of procrastination on
            final exam scores.
          </li>
        </ul>
        <p>
          I also conducted two controlled experiments on the incentive mechanisms to space retrieval practice and
          different levels of interleaving the practice content in computer science courses:
        </p>
        <ul>
          <li>Experiment 1 :</li>
        </ul>
        <p>
          Spacing and retrieval practice improve learning, but many students do not use these strategies enough, and
          their grades can suffer as a result. We implemented a simple grading incentive, called counting days, and
          tested it in a semester-long randomized, controlled experiment. In the counting days treatment, 83 students
          received grading points for each day of answering ten questions correctly. In the counting questions control
          condition, 63 students earned grading points on a per-question basis rather than per-day. The counting days
          group earned higher exam scores, which was mediated by spacing practice over more days. Spacing was especially
          beneficial for lower-GPA students: the correlation between GPA and exam scores was significantly lower for the
          counting days group.
        </p>
        <ul>
          <li>Experiment 2 :</li>
        </ul>
        <p>
          The effectiveness of interleaved practice has been established in previous studies. However, I conducted a
          randomized controlled experiment across eight computer science courses and found that when topics are
          interrelated, interleaving can negatively impact standardized exam scores. The experiment suggests that
          interleaving is only beneficial when topics are distinct enough to cause forgetting. When topics progressively
          build upon one another, revisiting prior topics is necessary, and interleaving can waste students' time.
        </p>
      </div>
    )
  },
  {
    id: "panel5",
    heading: <h2>Chapter 5: Conclusion and future work</h2>,
    details: (
      <p>
        I summarize my experience gained through the studies discussed in the prior chapters and over the 15 years of
        developing{" "}
        <a href="https://1cademy.com/" target="_blank" rel="noreferrer">
          1Cademy
        </a>
        , the feedback collected from users, and my future research and development plans.
      </p>
    )
  },
  {
    id: "panel6",
    heading: <h2>Visualized Dissertation Prospectus</h2>,
    details: (
      <img
        alt=""
        src="https://docs.google.com/drawings/d/e/2PACX-1vRhqhVxMg00Av4QaNpbZ3kRDNpGud6VEbYnvXIM4nyi4lOV0D6cnTA2-h0ifipNLTB6pormZJeCjABz/pub?w=963&amp;h=1413"
      />
    )
  }
];

const DocumentDiss = props => {
  const [expanded, setExpanded] = React.useState(0);
  const [expandedDefault, setExpandedDefault] = React.useState(true);

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    setExpandedDefault(false);
  };
  return (
    <>
      {" "}
      <h1>Challenges in Crowdsourcing and Learning from Micro-content</h1>
      <p>&ldquo;If you want truly to understand something, try to change it.&rdquo; &mdash; Kurt Lewin</p>
      <div>
        {panels.map(accordion => {
          const { id, heading, details } = accordion;
          return (
            <Accordion
              expanded={(id === "panel1" && expandedDefault) || expanded === id}
              key={id}
              onChange={handleChange(id)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div>{heading}</div>
              </AccordionSummary>
              <AccordionDetails>
                <div>{details}</div>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </>
  );
};

export default DocumentDiss;
