import React from "react";

const DocumentDiss = props => {
  return (
    <div style={{ "max-width": "1900pt", display: "center" }}>
      <h1 class="c27" id="h.r9cgp4ne8fyd">
        <span class="c5">Challenges in Crowdsourcing and Learning from Micro-content</span>
      </h1>
      <p class="c2">
        <span class="c7">
          &ldquo;If you want truly to understand something, try to change it.&rdquo; &mdash; Kurt Lewin
        </span>
      </p>
      <h2 class="c9" id="h.xlqjsoxb1tx9">
        <span class="c1">Chapter 1</span>
        <span class="c4">: Introduction</span>
      </h2>
      <p class="c2">
        <span class="c7">
          In this dissertation, I report on the design of 1Cademy, a crowdsourcing platform for creating and updating a
          scalable knowledge graph of learning pathways. I explore design mechanisms that lead to a shared graph with
          individualized views for self-directed learning. I explore the optimal size of content nodes for reader
          comprehension and learning, the design space of collaboration mechanisms that maintain coherence of the shared
          graph, and how to utilize spaced, interleaved retrieval practice to improve learner retention of
          micro-content.
        </span>
      </p>
      <h2 class="c8" id="h.4nc4jp7ilcz7">
        <span class="c1">Chapter 2</span>
        <span class="c4">&nbsp;- Optimal chunk size and representation for learning</span>
      </h2>
      <p class="c21">
        <span class="c25">I designed Hybrid Maps, a method of visualizing </span>
        <span class="c1 c25">hierarchical</span>
        <span class="c10">
          &nbsp;knowledge graph motivated by past research on knowledge representation and hypertext. Its key design
          features are:
        </span>
      </p>
      <ul class="c16 lst-kix_mywmr63n14c1-0 start">
        <li class="c21 c3 li-bullet-0">
          <span class="c10">
            Each node has a title and a paragraph, small enough to describe only one main concept.
          </span>
        </li>
        <li class="c21 c3 li-bullet-0">
          <span class="c10">The links between nodes are visualized in a left-to-right orientation.</span>
        </li>
        <li class="c3 c21 li-bullet-0">
          <span class="c10">
            All the nodes and links are on a single page that the user navigates by panning and zooming rather than
            paging.
          </span>
        </li>
      </ul>
      <h3 class="c18" id="h.o69qshpow3rw">
        <span class="c22">Experiment 1</span>
      </h3>
      <p class="c6">
        <span class="c10">
          We compared reading through Hybrid maps and their equivalent Novakian knowledge models through a
          within-subject controlled experiment. We found that Hybrid maps improved readability, learnability, recall,
          and recognition, on both factual and inferential questions, in immediate and delayed tests, on college-level
          passages.
        </span>
      </p>
      <h3 class="c18" id="h.q79oy5u5x2vk">
        <span class="c22">Experiment 2</span>
      </h3>
      <p class="c6">
        <span class="c10">
          We are going to run a similar experiment comparing reading through Hybrid maps with their equivalent linear
          text.
        </span>
      </p>
      <p class="c2">
        <span class="c7">
          In addition to the substantive contribution, I also describe methodological contributions for conducting this
          kind of research with a Volunteer Research Team
        </span>
      </p>
      <ul class="c16 lst-kix_ng2aeoxtq4z4-0 start">
        <li class="c2 c3 li-bullet-0">
          <span class="c7">Tracking and motivating contributions, and decentralizing authorship assignment</span>
        </li>
        <li class="c2 c3 li-bullet-0">
          <span>
            Automating free-recall grading and thematic analysis &nbsp;through large language models, including
            different ChatGPT engines, and assessing it through{" "}
          </span>
          <span class="c11">
            <a
              class="c12"
              href="https://www.google.com/url?q=https://arxiv.org/pdf/2106.01254.pdf&amp;sa=D&amp;source=editors&amp;ust=1679056223252872&amp;usg=AOvVaw3qLRk2hN19mKMnugcUNH_o"
            >
              the Survey Equivalence mechanism
            </a>
          </span>
        </li>
      </ul>
      <h2 class="c9" id="h.edtpraepndfr">
        <span class="c1">Chapter 3</span>
        <span class="c4">: Crowdsourcing coherent taxonomy of small, mutually exclusive learning modules</span>
      </h2>
      <p class="c2">
        <span class="c7">
          I discuss alternative design elements and social mechanisms with respect to how they contribute to a knowledge
          graph that:
        </span>
      </p>
      <ul class="c16 lst-kix_njei1hij6982-0 start">
        <li class="c2 c3 li-bullet-0">
          <span class="c7">Is understandable to newcomers and readers from different disciplines</span>
        </li>
        <li class="c2 c3 li-bullet-0">
          <span class="c7">Avoids duplication and overlapping content</span>
        </li>
        <li class="c2 c3 li-bullet-0">
          <span class="c7">Provides learning pathways</span>
        </li>
        <li class="c2 c3 li-bullet-0">
          <span class="c7">Facilitates exploratory searching</span>
        </li>
        <li class="c2 c3 li-bullet-0">
          <span class="c7">Enhances contributions:</span>
        </li>
      </ul>
      <ul class="c16 lst-kix_e9f2b0fs3gxp-0 start">
        <li class="c2 c17 li-bullet-0">
          <span class="c7">In large magnitude</span>
        </li>
        <li class="c2 c17 li-bullet-0">
          <span class="c7">Of high quality (mitigates dissemination of misinformation or disinformation)</span>
        </li>
      </ul>
      <ul class="c16 lst-kix_vbpjgwtkl0vg-0 start">
        <li class="c2 c3 li-bullet-0">
          <span class="c7">Encourages reading and improving upon others&rsquo; contributions</span>
        </li>
        <li class="c2 c3 li-bullet-0">
          <span class="c7">Favors majority of votes over individual biases</span>
        </li>
      </ul>
      <p class="c2">
        <span class="c7">
          I discuss my design space exploration of these topics and my solutions for crowdsourcing such a scale
          knowledge graph on 1Cademy to achieve the listed objectives.
        </span>
      </p>
      <h2 class="c9" id="h.mojwq444kgf8">
        <span class="c1">Chapter 4</span>
        <span class="c4">
          : How to utilize spaced, interleaved retrieval practice to improve learner retention of micro-content
        </span>
      </h2>
      <p class="c2">
        <span class="c7">
          I have published two papers based on our analysis of the usage log data collected by our spaced, interleaved
          retrieval practice tool for computer science education:
        </span>
      </p>
      <ul class="c16 lst-kix_azgggazxe9j-0 start">
        <li class="c2 c3 li-bullet-0">
          <span>In </span>
          <span class="c11">
            <a
              class="c12"
              href="https://www.google.com/url?q=https://dl.acm.org/doi/abs/10.1145/3446871.3469760&amp;sa=D&amp;source=editors&amp;ust=1679056223255122&amp;usg=AOvVaw2B6c_6Vq9QpwpIXzxhu7La"
            >
              ICER 2019
            </a>
          </span>
          <span class="c7">
            , we described the design of our practice tool. While each hour spent using the tool was associated with a
            1.04% increase in final exam grades, the hours of studying the textbook was not. To assess motivation, we
            report on the amount of practice tool use: 62 of the 193 students (32%) voluntarily used the tool more than
            the required 45 days. This indicates that the tool design successfully overcame negative perceptions of
            these desirable difficulties.
          </span>
        </li>
        <li class="c2 c3 li-bullet-0">
          <span>In </span>
          <span class="c11">
            <a
              class="c12"
              href="https://www.google.com/url?q=https://dl.acm.org/doi/abs/10.1145/3506860.3506907&amp;sa=D&amp;source=editors&amp;ust=1679056223255551&amp;usg=AOvVaw1D-l7UPOObcLXvn7bMpY24"
            >
              LAK 2022
            </a>
          </span>
          <span class="c7">
            , we analyzed 674 students&#39; interactions with an introductory programming course eBook over four
            semesters. We measured each student&#39;s spacing and procrastination and found a small positive correlation
            between the two. However, when controlling for total studying, academic and demographic characteristics, our
            SEM analysis showed a strong positive effect of spacing but no significant effect of procrastination on
            final exam scores.
          </span>
        </li>
      </ul>
      <p class="c2">
        <span class="c7">
          I also conducted two controlled experiments on the incentive mechanisms to space retrieval practice and
          different levels of interleaving the practice content in computer science courses:
        </span>
      </p>
      <ul class="c16 lst-kix_hdv66uqo7oyl-0 start">
        <li class="c2 c3 li-bullet-0">
          <span class="c15">Experiment 1</span>
          <span class="c7">:</span>
        </li>
      </ul>
      <p class="c2 c13">
        <span class="c7">
          Spacing and retrieval practice improve learning, but many students do not use these strategies enough, and
          their grades can suffer as a result. We implemented a simple grading incentive, called counting days, and
          tested it in a semester-long randomized, controlled experiment. In the counting days treatment, 83 students
          received grading points for each day of answering ten questions correctly. In the counting questions control
          condition, 63 students earned grading points on a per-question basis rather than per-day. The counting days
          group earned higher exam scores, which was mediated by spacing practice over more days. Spacing was especially
          beneficial for lower-GPA students: the correlation between GPA and exam scores was significantly lower for the
          counting days group.
        </span>
      </p>
      <ul class="c16 lst-kix_64uvg7ecr5nq-0 start">
        <li class="c2 c3 li-bullet-0">
          <span class="c15">Experiment 2</span>
          <span class="c7">:</span>
        </li>
      </ul>
      <p class="c2 c13">
        <span class="c7">
          Research indicates that interleaved practice, mixing problems from different topics, is more effective than
          traditional mathematics assignments focused on a block of questions about a single topic. Interleaving
          challenges students to use the appropriate strategy for each problem, leading to higher test scores. Despite
          the proven benefits of interleaved practice, most math textbooks rely on blocked practice. Interleaving has
          been found to have a positive impact on learning, but its effectiveness may depend on the course design. In
          progressive learning pathways where concepts build upon each other, interleaving may hinder learning if prior
          chapters are not distinct enough. We conducted a randomized, controlled experiment across eight computer
          science courses, where the topics progressively built upon one another. The results showed a significant
          negative effect of high interleaving on standardized exam scores.
        </span>
      </p>
      <h2 class="c9" id="h.1zulzpttan3g">
        <span class="c1">Chapter 5</span>
        <span class="c14">: Conclusion and future work</span>
      </h2>
      <p class="c6">
        <span class="c7">
          I summarize my experience gained through the studies discussed in the prior chapters and over the 15 years of
          developing 1Cademy, the feedback collected from users, and my future research and development plans.
        </span>
      </p>
      <p class="c6">
        <span class="c11 c25">
          My Interactive Dissertation Gantt Chart, excluding the completed modules, is Available  bellow
        </span>
      </p>
      <h3 class="c18" id="h.ow2wy5d62r7c">
        <span
          style={{
            overflow: "hidden",
            margin: "0px 0px",
            border: "0px solid #000000",
            width: "50%",
            height: "100%",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto"
          }}
        >
          <img
            src="https://docs.google.com/drawings/d/e/2PACX-1vRhqhVxMg00Av4QaNpbZ3kRDNpGud6VEbYnvXIM4nyi4lOV0D6cnTA2-h0ifipNLTB6pormZJeCjABz/pub?w=963&amp;h=1413"
            alt="hi"
          />
        </span>
      </h3>
    </div>
  );
};

export default DocumentDiss;
