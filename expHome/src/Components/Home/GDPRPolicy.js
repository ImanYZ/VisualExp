import React from "react";

import Typography from "./modules/components/Typography";
import PagesNavbar from "./PagesNavbar";

const GDPRPolicy = () => {
  return (
    <PagesNavbar thisPage="GDPR Policy">
      <Typography variant="h3" gutterBottom marked="center" align="center">
        1Cademy General Data Protection Regulation (GDPR) Policy
      </Typography>
      <h1>1Cademy General Data Protection Regulation (GDPR) Policy</h1>
      <h2>Introduction</h2>
      <p>
        1Cadmey respects users' personal and sensitive information and is committed to ensuring the security and privacy
        of such information in accordance with the requirements of the GDPR. 1Cademy takes the necessary measures to
        comply with the GDPR regarding personal and sensitive information of users on 1Cademy and all third-party
        services. The following policy outlines 1Cademy's commitments to the GDPR and the measures it takes to protect
        users' personal and sensitive information.
      </p>
      <h2>Commitments to the GDPR</h2>
      <p>
        1Cademy is committed to complying with the GDPR in all its operations. This includes using data processors with
        suitable technical and administrative measures and assessing 1Cademy's compliance with the GDPR, which may
        include the following:
      </p>
      <h3>Reliability and Resources</h3>
      <p>
        1Cademy is dedicated to maintaining its defense strategies, developing security review processes, building a
        more robust security infrastructure, and precisely executing 1Cademy’s security policies to ensure the
        protection of users' personal and sensitive information.
      </p>
      <h3>Data Safeguard Commitments</h3>
      <p>1Cademy takes several measures to protect the personal and sensitive information of its users, including:</p>
      <h4>Data Processing Agreements</h4>
      <p>
        1Cademy has data processing agreements in place that clearly communicate its privacy commitment to users. These
        agreements are updated regularly to reflect the GDPR and to facilitate users' compliance assessment and GDPR
        readiness when using 1Cademy services.
      </p>
      <h4>Processing According to Instructions</h4>
      <p>
        1Cademy will only process personal data provided by users under the users' instructions, as described in
        1Cademy's GDPR data processing agreements.
      </p>
      <h4>Personnel Confidentiality Commitments</h4>
      <p>
        All 1Cademy employees are required to sign a confidentiality agreement and complete compulsory confidentiality
        and privacy training to manage their responsibilities and expected behavior concerning data protection.
      </p>
      <h4>Use of Subprocessors</h4>
      <p>
        Most of the data processing actions required to provide 1Cademy services are run by 1Cademy itself. However,
        1Cademy may engage third-party vendors to assist in supporting these services. In such cases, 1Cademy thoroughly
        surveys these third parties to ensure their competence to deliver the appropriate level of security and privacy.
        1Cademy complies with the Data Protection Act 1998 when transferring user data to a third-party located outside
        the European Economic Area (EEA).
      </p>
      <h3>Security of the Services</h3>
      <p>
        1Cademy takes reasonable technical and administrative measures to ensure the protection of users' personal and
        sensitive information, in accordance with the GDPR. 1Cademy uses state-of-the-art security infrastructures
        throughout the entire data processing lifecycle, which include:
      </p>
      <ul>
        <li>Secure deployment of services</li>
        <li>Secure storage of data with end-user privacy safeguards</li>
        <li>Secure communications between services</li>
        <li>Secure and private communication with consumers over the Internet</li>
        <li>Safe operation by administrators</li>
        <li>Regular security assessments and vulnerability scans</li>
        <li>
          Implementation of firewalls, intrusion detection and prevention systems, and other security technologies
        </li>
        <li>
          Implementation of access controls and authentication mechanisms to prevent unauthorized access to sensitive
          data and systems
        </li>
        <li>
          Implementation of data backup and disaster recovery solutions to ensure business continuity in case of
          unforeseen events
        </li>
      </ul>
      <p>
        By implementing these measures, 1Cademy is committed to ensuring that all of your data is securely protected,
        and that you can use our platform with complete peace of mind.
      </p>
      <h3>Updates to Privacy Policy</h3>
      <p>
        1Cademy reserves the right to change its privacy policy at any time. If there are any material changes to the
        policy, 1Cademy will notify you via email or through a notice on its website.
      </p>
      <h3>Contact Information</h3>
      <p>
        If you have any questions or concerns about our privacy policy or the way we collect, use, or store your data,
        please contact us at <a href="mailto:privacy@1cademy.com">privacy@1cademy.com</a>.
      </p>{" "}
    </PagesNavbar>
  );
};

export default GDPRPolicy;
