# 1Cademy.us involves five subsystems:

## 1Cademy Home, Community, and User Profile Pages

### Publicly accessible at 1cademy.us/home (React.js App on Firebase Hosting)

These pages consist of:

- The description of the 1Cademy project, its rationale, and use-cases
- Communities involved and their activities, requirements, and qualifications to join
- Students and researchers who have contributed to 1Cademy communities, the types of their activities, and their leaderboards based on the reputation points they have accumulated in their communities
- Description of how to get involved and apply to join communities
- The map of schools from which students and researchers have joined 1Cademy
- The team behind 1Cademy and their publications

## Public view of 1Cademy.com

### Publicly accessible to unauthenticated users and search engines (Next.js App with Server-side rendering on Google Cloud Run)

These pages consist of:

- **Main page**: for searching, filtering, sorting, and navigating through 1Cademy.com knowledge content in a linear fashion.
- **Community pages**: dedicated for each community to show-case the content generated for searching, filtering, sorting
- **Institution pages**: dedicated for each institution to show-case the content generated by their members for searching, filtering, sorting
- **Node pages**: each node has a dedicated page which is linked to other node pages through its parent, child, tag, and reference links.

## 1Cademy Application System

### Only accessible to authenticated participants at 1cademy.us/home (React.js App on Firebase Hosting)

This subsystem involves the following modules that facilitate the application process:

- Applicant authentication
- Matching applicants' availability with our researchers to automatically schedule the experiment sessions
- Reminding applicants through email to accept their Google Calendar invitations and do not miss their experiment sessions
- Community specific application pages for uploading resume and transcript, explaining intention to apply to each community, and taking the community-specific test quizzes based on the assigned readings
- Tracking the applicants' progress and sending automated reminder emails to continue their applications
- Facilitating evaluation of the applications for the community leaders based on the applicant's progress and the documents submitted through the application system
- Reminding community leaders through email about the new community applications to review
- Informing applicants about their acceptance/rejection to each community, and encouraging the accepted applicants to complete the 1Cademy tutorial as a step in their onboarding process
- 1Cademy interactive tutorial and collecting feedbacks about the instructions and questions
- Reporting the feedback collected about the tutorial to the 1Cademy documentation team to improve

## Online Controlled Experiment Pipeline Platform

### Only accessible to authenticated participants and researchers at 1cademy.us (React.js App on Firebase Hosting + Node.js server on Google Cloud Functions)

The experiments are conducted as the first step in the application process. Every 1Cademy applicant should participate in the online sessions of one of these experiments, which are led by one of the researchers in our team. Their scores will be considered by 1Cademy community leaders when evaluating their applications. In addition to the student participants, this system enables to recruit participants from crowdsourcing platforms, such as Amazon Mechanical Turk, Dynata, and Prolific.
Through these experiments, we study the effects of learning through different methods on students' immediate, delayed, and long-term reading comprehension, free-recall, critical thinking, creativity, inductive reasoning, and judgement of learning. This system helps to conduct these experiments through:

- Automatically entering each participant to the assigned experiment sessions at the time slots allotted for their sessions
- Facilitating the participants' interactions with the experimental treatments and monitoring their interactions with the system and the treatments
- Randomizing participants into experimental conditions and orders
- Randomly assigning learning material under each of the experimental conditions to learn
- Tracking the participants' progress and returning them to their last step if they lose their Internet connection
- Automatically grading participants' answers to different questions throughout each session and reporting their scores at the end of experiment to assess their judgement of learning after exposure to their scores and compare them with their prior judgement
- Automatically measuring behavioral factors observed based on the participant's interactions with the experiment system
- Enabling the researchers to combine their observations with the automatically collected data, filter, sort, and clean the data
- Providing the experimental data in useful formats for researchers to analyze

## Experiment Project Management System

### Only accessible to authenticated researchers and PI at 1cademy.us/activities (React.js App on Firebase Hosting + Node.js server on Google Cloud Functions)

This subsystem facilitates management of our large research teams to conduct the experiments and other research studies. It involves:

- Dividing the activities involved in each research project into six categories of microtasks
- Facilitating accomplishment of each type of activity and tracking researchers' progress
- Assigning reputation points to researchers in each project based on their autograded activities and the votes cast by other researchers on their other activities
- Synchronously retrieving 1Cademy reputation points for each of the researchers on the topics related to their research project and assigning their points for literature review
- Improving synchronization of the research team during the weekly group presentations based on their interactions with 1Cademy.com
- Reporting intellectual activities in prespecified time-slots and group-evaluating each other's activities to receive points based on the contribution of each activity to the project
- Automatically scheduling experiment sessions, and assigning points to researchers for the sessions they lead and monitor
- Reminding researchers about their assigned experiment sessions through email
- Providing affordances for researchers to crowdsource collection of instructors and school administrators' information to be able to invite their students to join 1Cademy communities and consequently participant in our experiments as the first step in their application process
- Automatically sending emails, tracking opened emails, and sending reminders to instructors and school administrators to invite their students
- Enabling researchers to thematically group-code participants' comments and qualitative feedback
- Accumulating reputation points based on the similarity of the themes assigned to each collected feedback
- Enabling researchers to group-evaluate participants' free-recall responses
- Accumulating reputation points based on the similarity of the identified points in each of the participants' essay responses
- Tracking the reputation points, converting them to meaningful hours of contribution to each project and reporting them to project managers
- Generating dynamic leaderboards for each research project based the reputation points to determine the inclusion and order of authors in the research papers authored by each research team based on the project-specific criteria
