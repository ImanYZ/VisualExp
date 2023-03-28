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
          The studies included in this dissertation largely focus on representation, presentation, and scheduling of
          learning content. It is important to define these terms because they are instrumental to the research
          described and a major component of 1Cademy’s design.
        </p>
        <ul>
          <li>
            <strong>Representation</strong>: the way knowledge is stored and organized in a database or knowledge graph,
            including the content of nodes, the meaning of links, and the relationships between them.
          </li>
          <li>
            <strong>Presentation</strong>: the way knowledge is displayed and accessed, including the layout of content
            on a page, the ability to search and filter it, and the use of different views for different audiences to
            enhance understanding.
          </li>
          <li>
            <strong>Scheduling</strong>: the timing in which knowledge is interacted with, including the frequency and
            distribution that subjects are studied.
          </li>
        </ul>
        <p>
          My goal is to convert human knowledge into an easily digestible presentation and representation that
          facilitates efficient learning. The issue of “knowledge overload” arises from the redundant nature of the same
          topics being covered in numerous books, websites, and videos. To maximize our learning potential, we must
          eliminate overlapping content and merge all available explanations for a particular subject into a single
          comprehensive chunk. This chunk should encompass various perspectives and use-cases side-by-side, allowing
          learners to refer to it as the sole source for complete mastery of the topic. Conventional knowledge
          structures organized in pages, whether in books or on websites, do not serve this purpose. Instead, we must
          divide the content into smaller chunks, each dedicated to a single topic, and present them as paragraphs
          within a single knowledge graph.
        </p>
        <p>
          <strong>
            It is important to note that the representation of these smaller chunks should not be combined into any
            larger constructs, such as books or collections. Doing so only perpetuates the issue of overlapping content
            and defeats the purpose of efficient learning.
          </strong>
        </p>
        <p>
          I explore the optimal size of content nodes for reader comprehension and learning, the design space of
          collaboration mechanisms that maintain coherence of the shared graph, and how to utilize spaced, interleaved
          retrieval practice to improve learner retention of micro-content. The findings offer practical solutions for
          generating a coherent and scalable knowledge graph, and empowering learners to improve and personalize their
          self-directed learning.
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
          <span>
            I introduce “Hybrid maps,” a new knowledge presentation format that combines the benefits of hypertext and
            Novakian concept maps. The design was inspired by previous research on knowledge presentation and hypertext.
            Its key design features are:
          </span>
        </p>
        <ul>
          <li>
            <span>
              Each node (micro-content) has a title and a paragraph, small enough to describe only one main concept.
            </span>
          </li>
          <li>
            <span>
              The links between nodes are visualized in a two-dimensional, left-to-right and top-to-bottom, orientation.
            </span>
          </li>
          <li>
            <span>
              All the nodes and links are on a single page that the user navigates by panning and zooming rather than
              paging.
            </span>
          </li>
        </ul>
        <h3>
          <span>Experiment 1</span>
        </h3>
        <p>
          <span>
            We compared reading through Hybrid maps and their equivalent Novakian knowledge models through a
            within-subject controlled experiment. We found that Hybrid maps improved readability, learnability, recall,
            and recognition, on both factual and inferential questions, in immediate and delayed tests, on college-level
            passages.
          </span>
        </p>
        <h3>
          <span>Experiment 2</span>
        </h3>
        <p>
          <span>
            We are going to run a similar experiment comparing reading through Hybrid maps with their equivalent linear
            text.
          </span>
        </p>
        <p>
          <span>
            In addition to the substantive contribution, I also describe methodological contributions for conducting
            this kind of research with a Volunteer Research Team
          </span>
        </p>
        <ul>
          <li>
            <span>Tracking and motivating contributions, and decentralizing authorship assignment</span>
          </li>
          <li>
            <span>
              Automating free-recall grading and thematic analysis &nbsp;through large language models, including
              different ChatGPT engines, and assessing it through{" "}
            </span>
            <span>
              <a href="https://arxiv.org/pdf/2106.01254.pdf" target="_blank" rel="noreferrer">
                the Survey Equivalence mechanism
              </a>
            </span>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: "panel3",
    heading: <h2>Chapter 3: Crowdsourcing coherent taxonomy of small, mutually exclusive learning modules</h2>,
    details: (
      <div>
        {" "}
        <p>
          <span>
            I discuss alternative design elements and social mechanisms with respect to how they contribute to a
            knowledge graph that:
          </span>
        </p>
        <ul>
          <li>
            <span>Is understandable to newcomers and readers from different disciplines</span>
          </li>
          <li>
            <span>Avoids duplication and overlapping content</span>
          </li>
          <li>
            <span>Provides learning pathways</span>
          </li>
          <li>
            <span>Facilitates exploratory searching</span>
          </li>
          <li>
            <span>Enhances contributions:</span>
            <ul>
              <li>
                <span>In large magnitude</span>
              </li>
              <li>
                <span>Of high quality (mitigates dissemination of misinformation or disinformation)</span>
              </li>
            </ul>
          </li>
          <li>
            <span>Encourages reading and improving upon others&rsquo; contributions</span>
          </li>
          <li>
            <span>Favors majority of votes over individual biases</span>
          </li>
        </ul>
        <p>
          <span>
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
            . This collaboration has resulted in the creation of 44,665 nodes and 235,674 prerequisite links between
            them, which have been proposed through 88,167 proposals. I will also report on my smaller field trials on
            voluntary question-generation and mapping, and Hybrid mapping as course assignments.
          </span>
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
          <span>
            I have published two papers based on our analysis of the usage log data collected by our spaced, interleaved
            retrieval practice tool for computer science education:
          </span>
        </p>
        <ul>
          <li>
            <span>In </span>
            <span>
              <a href="https://dl.acm.org/doi/abs/10.1145/3446871.3469760" target="_blank" rel="noreferrer">
                ICER 2019
              </a>
            </span>
            <span>
              , we described the design of our practice tool. While each hour spent using the tool was associated with a
              1.04% increase in final exam grades, the hours of studying the textbook was not. To assess motivation, we
              report on the amount of practice tool use: 62 of the 193 students (32%) voluntarily used the tool more
              than the required 45 days. This indicates that the tool design successfully overcame negative perceptions
              of these desirable difficulties.
            </span>
          </li>
          <li>
            <span>In </span>
            <span>
              <a href="https://dl.acm.org/doi/abs/10.1145/3506860.3506907" target="_blank" rel="noreferrer">
                LAK 2022
              </a>
            </span>
            <span>
              , we analyzed 674 students&#39; interactions with an introductory programming course eBook over four
              semesters. We measured each student&#39;s spacing and procrastination and found a small positive
              correlation between the two. However, when controlling for total studying, academic and demographic
              characteristics, our SEM analysis showed a strong positive effect of spacing but no significant effect of
              procrastination on final exam scores.
            </span>
          </li>
        </ul>
        <p>
          <span>
            I also conducted two controlled experiments on the incentive mechanisms to space retrieval practice and
            different levels of interleaving the practice content in computer science courses:
          </span>
        </p>
        <ul>
          <li>
            <span>Experiment 1</span>
            <span>:</span>
          </li>
        </ul>
        <p>
          <span>
            Spacing and retrieval practice improve learning, but many students do not use these strategies enough, and
            their grades can suffer as a result. We implemented a simple grading incentive, called counting days, and
            tested it in a semester-long randomized, controlled experiment. In the counting days treatment, 83 students
            received grading points for each day of answering ten questions correctly. In the counting questions control
            condition, 63 students earned grading points on a per-question basis rather than per-day. The counting days
            group earned higher exam scores, which was mediated by spacing practice over more days. Spacing was
            especially beneficial for lower-GPA students: the correlation between GPA and exam scores was significantly
            lower for the counting days group.
          </span>
        </p>
        <ul>
          <li>
            <span>Experiment 2</span>
            <span>:</span>
          </li>
        </ul>
        <p>
          <span>
            The effectiveness of interleaved practice has been established in previous studies. However, I conducted a
            randomized controlled experiment across eight computer science courses and found that when topics are
            interrelated, interleaving can negatively impact standardized exam scores. The experiment suggests that
            interleaving is only beneficial when topics are distinct enough to cause forgetting. When topics
            progressively build upon one another, revisiting prior topics is necessary, and interleaving can waste
            students' time.
          </span>
        </p>
      </div>
    )
  },
  {
    id: "panel5",
    heading: <h2>Chapter 5: Conclusion and future work</h2>,
    details: (
      <p>
        <span>
          I summarize my experience gained through the studies discussed in the prior chapters and over the 15 years of
          developing{" "}
          <a href="https://1cademy.com/" target="_blank" rel="noreferrer">
            1Cademy
          </a>
          , the feedback collected from users, and my future research and development plans.
        </span>
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
      <h1>
        <span>Challenges in Crowdsourcing and Learning from Micro-content</span>
      </h1>
      <p>
        <span>&ldquo;If you want truly to understand something, try to change it.&rdquo; &mdash; Kurt Lewin</span>
      </p>
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
