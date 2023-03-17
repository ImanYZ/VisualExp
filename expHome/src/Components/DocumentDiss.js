import React from "react";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const panels = [
  {
    id: "panel1",
    heading: <h2>Chapter 1 : Introduction</h2>,
    details: (
      <p>
        <span>
          In this dissertation, I report on the design of 1Cademy, a crowdsourcing platform for creating and updating a
          scalable knowledge graph of learning pathways. I explore design mechanisms that lead to a shared graph with
          individualized views for self-directed learning. I explore the optimal size of content nodes for reader
          comprehension and learning, the design space of collaboration mechanisms that maintain coherence of the shared
          graph, and how to utilize spaced, interleaved retrieval practice to improve learner retention of
          micro-content.
        </span>
      </p>
    )
  },
  {
    id: "panel2",
    heading: <h2>Chapter 2 : Optimal chunk size and representation for learning</h2>,
    details: (
      <div>
        <p>
          <span>I designed Hybrid Maps, a method of visualizing </span>
          <span>hierarchical</span>
          <span>
            &nbsp;knowledge graph motivated by past research on knowledge representation and hypertext. Its key design
            features are:
          </span>
        </p>
        <ul>
          <li>
            <span>Each node has a title and a paragraph, small enough to describe only one main concept.</span>
          </li>
          <li>
            <span>The links between nodes are visualized in a left-to-right orientation.</span>
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
              <a href="https://www.google.com/url?q=https://arxiv.org/pdf/2106.01254.pdf&amp;sa=D&amp;source=editors&amp;ust=1679056223252872&amp;usg=AOvVaw3qLRk2hN19mKMnugcUNH_o">
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
    heading: <h2>Chapter 3 : Crowdsourcing coherent taxonomy of small, mutually exclusive learning modules</h2>,
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
          </li>
        </ul>
        <ul>
          <li>
            <span>In large magnitude</span>
          </li>
          <li>
            <span>Of high quality (mitigates dissemination of misinformation or disinformation)</span>
          </li>
        </ul>
        <ul>
          <li>
            <span>Encourages reading and improving upon others&rsquo; contributions</span>
          </li>
          <li>
            <span>Favors majority of votes over individual biases</span>
          </li>
        </ul>
        <p>
          <span>
            I discuss my design space exploration of these topics and my solutions for crowdsourcing such a scale
            knowledge graph on 1Cademy to achieve the listed objectives.
          </span>
        </p>
      </div>
    )
  },
  {
    id: "panel4",
    heading: (
      <h2>
        Chapter 4 : How to utilize spaced, interleaved retrieval practice to improve learner retention of micro-content
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
              <a href="https://www.google.com/url?q=https://dl.acm.org/doi/abs/10.1145/3446871.3469760&amp;sa=D&amp;source=editors&amp;ust=1679056223255122&amp;usg=AOvVaw2B6c_6Vq9QpwpIXzxhu7La">
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
              <a href="https://www.google.com/url?q=https://dl.acm.org/doi/abs/10.1145/3506860.3506907&amp;sa=D&amp;source=editors&amp;ust=1679056223255551&amp;usg=AOvVaw1D-l7UPOObcLXvn7bMpY24">
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
            Research indicates that interleaved practice, mixing problems from different topics, is more effective than
            traditional mathematics assignments focused on a block of questions about a single topic. Interleaving
            challenges students to use the appropriate strategy for each problem, leading to higher test scores. Despite
            the proven benefits of interleaved practice, most math textbooks rely on blocked practice. Interleaving has
            been found to have a positive impact on learning, but its effectiveness may depend on the course design. In
            progressive learning pathways where concepts build upon each other, interleaving may hinder learning if
            prior chapters are not distinct enough. We conducted a randomized, controlled experiment across eight
            computer science courses, where the topics progressively built upon one another. The results showed a
            significant negative effect of high interleaving on standardized exam scores.
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
          developing 1Cademy, the feedback collected from users, and my future research and development plans.
        </span>
      </p>
    )
  },
  {
    id: "panel6",
    heading: <h2>Visualized Dissertation Prospectus</h2>,
    details: (
      <img src="https://docs.google.com/drawings/d/e/2PACX-1vRhqhVxMg00Av4QaNpbZ3kRDNpGud6VEbYnvXIM4nyi4lOV0D6cnTA2-h0ifipNLTB6pormZJeCjABz/pub?w=963&amp;h=1413"></img>
    )
  }
];

const DocumentDiss = props => {
  const [expanded, setExpanded] = React.useState(false);
  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
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
            <Accordion expanded={expanded === id} key={id} onChange={handleChange(id)}>
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
