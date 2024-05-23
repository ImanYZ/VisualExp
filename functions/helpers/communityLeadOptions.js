const { generateUID, capitalizeFirstLetter } = require("../utils");
const { ImanSignatureHTML, links } = require("../emailSignature");

exports.communityLeadOptions = (email, topic, prefix, lastname, instructorId, introducedBy, random) => {
  lastname = capitalizeFirstLetter(lastname);
  let emailOptions = {
    from: '"1Cademy" <community@1cademy.com>',
    to: email,
    subject: `1Cademy Knowledge Graph Research Community Lead Invitation`,
    html: `<p>Dear Professor ${lastname},</p>
    <p>We are excited to announce that <a href=" https://1cademy.com/home" target="_blank">1Cademy</a> is seeking Research Community Leaders for Summer 2024 to help build knowledge graphs for the general psychology curriculum. We invite you to apply to lead our psychology community.</p>
    <p>As a Research Community Leader, you will oversee a group of Research Interns—college students who have excelled in the <a href="https://openstax.org/details/books/psychology-2e" target="_blank">OpenStax Psychology 2e</a> course with an A grade. Your role will be to guide these students in constructing a comprehensive knowledge graph for the psychology curriculum using the 1Cademy platform and the <a href="https://openstax.org/details/books/psychology-2e" target="_blank">OpenStax Psychology textbook</a>.</p>
    <p><strong>Expectations</strong></p>
    <ul>
        <li>Work 10 hours/week</li>
        <li>Lead weekly meetings with a community of five students</li>
        <li>Attend weekly 1:1 meetings with the Honor project manager</li>
    </ul>
    <p><strong>Responsibilities</strong></p>
    <ul>
        <li>Participate in reviewing student intern applications to form your team of five students</li>
        <li>Attend onboarding sessions for 1Cademy, the knowledge graph creation platform</li>
        <li>Guide students towards the course objectives in knowledge graph generation, following the course plan</li>
        <li>Review community-approved proposals, on average 25% of all student-generated proposals</li>
        <li>Supervise the weekly student presentations of their contributions to the knowledge graph</li>
        <li>Decide on the references and topics to work on, the timeline, and the calculation of incentives based on the 1Cademy contribution points</li>
        <li>Meet weekly with the Honor project lead</li>
    </ul>
    <p><strong>Compensation</strong></p>
    <ul>
    <li>$4500</li>
    </ul>
    <p><strong>Timeline</strong></p>
    <ul>
    <li>Wednesday, May 29: Application due</li>
    <li>Monday, June 3: Instructor acceptance notification</li>
    <li>Monday, June 10: Project kick off</li>
    <li>Friday, August 2: Project conclusion</li>
    </ul>
    <p>For more information or to apply, please contact Iman YeckehZaare at <a href="mailto:community@1cademy.com">community@1cademy.com</a> or visit our application page <a href="https://forms.gle/MNg8CP6UAaH1Bz2P8">here</a>.</p>
    <p>If you would prefer not to receive further emails from us, you can unsubscribe by clicking <a href="https://1cademy.us/notInterestedFaculty/${instructorId}">this link</a>.</p>
     <p>Best regards,</p>
     ${ImanSignatureHTML}
     <img src="https://1cademy.us/api/loadImage/professor/${instructorId + "/" + generateUID()}"
    data-os="https://drive.google.com/uc?id=1H4mlCx7BCxIvewNtUwz5GmdVcLnqIr8L&amp;export=download"
    width="90" height="90">
    ${links}</div>`
  };
  return emailOptions;
};
