import React from "react";

import "./ConsentDocument.css";

const ConsentDocument = props => {
  return (
    <>
      <div id="ConsentContainer">
        <h2>University of Michigan</h2>
        <h2>Consent To Be Part Of A Research Study</h2>
        <h2>Title of Project: A Survey Study on Study Techniques</h2>
        <h2>eResearch ID: HUM00166649</h2>

        <h3>Principal Investigator</h3>
        <p>
          <strong>Iman YeckehZaare</strong>, Ph.D. Candidate, University of Michigan, School of Information
        </p>

        <h3>Faculty Advisors</h3>
        <p>
          <strong>Paul Resnick</strong>, Michael D. Cohen Collegiate Professor of Information and Associate Dean for
          Research and Faculty Affairs, University of Michigan School of Information
        </p>
        <p>
          <strong>Christopher Brooks</strong>, Assistant Professor, University of Michigan School of Information
        </p>

        <h2>GENERAL Information</h2>

        <h3>What is the purpose of this study? </h3>
        <p>
          We are conducting this study to learn more about the difficulties instructors experience with teaching in
          order to inform and update the design of 1Cademy.
        </p>
        <h3>What will I do?</h3>
        <p>
          You will take part in an interview session where you will be asked various questions about your teaching
          experiences, including the pains and gains. We will also ask about a general overview of the past semesters’
          courses to understand how you teach your courses and interact with your students. We expect the session to
          take 45 minutes, on average. You do not have to answer any question if you'd rather not.
        </p>

        <h3>Possible Benefits</h3>

        <p>
          By participating in this study, you will get access to 1Cademy for free. We will also be using the feedback to
          improve features on 1Cademy, which will make it a more useful tool. This research will also serve to generate
          ideas on how to improve the features of other learning resources and courseware.
        </p>
        <p>
          <strong>Who can see my data?</strong>
        </p>

        <>
          <p>
            · We (the researchers) will analyze your responses to all of the questions in this interview, and the
            academic records provided for researchers in the LARC database.
          </p>
          <p>
            · The Institutional Review Board (IRB) at U of M or other federal agencies may review all the study data.
            This is to ensure we are following laws and ethical guidelines.
          </p>
          <p>
            {" "}
            · We may share our findings in publications or presentations. If we do so, the results will be anonymized,
            with no individual identifiers so that your information stays private. If we quote you, we will use
            pseudonyms (fake names).
          </p>
          <p>
            {" "}
            · We may make our dataset public so other researchers can use it. This public dataset will include only
            anonymized data with no linkage to individuals.
          </p>
          <p>
            · If you wish to exclude your data from being used for further research, you may still participate in this
            study by informing one of the contacts below.
          </p>
        </>
        <h2>Contact Information</h2>

        <p>
          To find out more about the study, to ask a question or express a concern about the study, or to talk about any
          problems you may have as a study subject, you may contact the researchers at StudyStrategies@umich.edu
        </p>
        <table>
          <tbody>
            <tr>
              <td>Faculty Advisor</td>
              <td>Paul Resnick</td>
              <td>presnick@umich.edu</td>
              <td>(734) 647-9458</td>
            </tr>
            <tr>
              <td>Principal Investigator</td>
              <td>Iman YeckehZaare</td>
              <td>oneweb@umich.edu</td>
              <td>(734) 556-5922</td>
            </tr>
          </tbody>
        </table>

        <p>
          <strong>You may also express a concern about a study by contacting the Institutional Review Board:</strong>
        </p>
        <p>University of Michigan</p>
        <p>Health Sciences and Behavioral Sciences Institutional Review Board (IRB-HSBS)</p>
        <p>2800 Plymouth Road</p>
        <p>Building 520, Room 1169 Ann Arbor, MI 48109-2800</p>
        <p>Telephone: 734-936-0933 or toll free (866) 936-0933</p>
        <p>Fax: 734-936-1852</p>
        <p>E-mail: irbhsbs@umich.edu</p>
      </div>
    </>
  );
};

export default ConsentDocument;
