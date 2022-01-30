import React from "react";

import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import EmailIcon from "@mui/icons-material/Email";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CreateIcon from "@mui/icons-material/Create";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";

export default {
  Introduction_Fundamentals: {
    title: "1Cademy Introduction: Fundamentals",
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
    questions: {
      How_can_1Cademy_help_us: {
        stem: "How can 1Cademy help us?",
        answers: ["a", "c", "d", "e"],
        choices: {
          a: "Through learning backwards like researchers",
          b: "Passing standardized exams",
          c: "Deepening our learning by thinking through prerequisites necessary to learn each concept",
          d: "Learning from each other the more effective ways to learn each concept",
          e: "Improving our own learning through teaching others",
        },
      },
      How_can_1Cademy_help_our_society: {
        stem: "How can 1Cademy help our society?",
        answers: ["a", "b", "c", "d", "e"],
        choices: {
          a: "Joining/forming multi-school research communities",
          b: "Collaboratively developing learning pathways to learn each concept",
          c: "Crowdsourcing learning",
          d: "Improving exploratory search",
          e: "Collaboratively learning by comparing and contrasting alternative or even competing perspectives side-by-side.",
        },
      },
      If_everything_is_explained_somewhere: {
        stem: "If everything is explained somewhere on the internet, then why do we pay for textbooks and online courses?",
        answers: ["f"],
        choices: {
          a: "Because we cannot find the explanations on the Internet.",
          b: "Because we are lazy!",
          c: "Because we don't know how to use the Internet efficiently.",
          d: "Because most explanations on the Internet are not free.",
          e: "Because most explanations on the Internet are incorrect.",
          f: "Because most explanations on the Internet do not provide us with learning pathways.",
        },
      },
      Is_the_content_on_1Cademy_peer_reviewed: {
        stem: "Is the content on 1Cademy peer-reviewed?",
        answers: ["a"],
        choices: {
          a: "Yes",
          b: "No",
        },
      },
      How_can_you_learn_like_a_researcher_on_1Cademy: {
        stem: "How can you learn like a researcher on 1Cademy?",
        answers: ["a"],
        choices: {
          a: "Find complex topics and learn backwards",
          b: "Start from the highest-level concept and move to more advanced topics",
          c: "Start from the easiest topic and move up",
        },
      },
      What_kind_of_content_should_be_added_to_1Cademy: {
        stem: "What kind of content should be added to 1Cademy?",
        answers: ["c", "d", "e", "g", "h"],
        choices: {
          a: "Original content without proper citation",
          b: "Quotes that are not cited",
          c: "Paraphrased and correctly cited content",
          d: "Short and correctly cited quotes from books or research papers",
          e: "Content directly copied from open-source websites and correctly cited",
          f: "Content copied from books or research papers",
          g: "Links to online videos or audio recordings",
          h: "Images from websites under public domain with correct citation",
          i: "Images from copyrighted websites with correct citation",
        },
      },
      What_should_you_do_if_you_re_not_sure: {
        stem: "What should you do if you're not sure whether a source is reputable to cite on 1Cademy?",
        answers: ["c", "d", "e"],
        choices: {
          a: "Ask other people on the Internet.",
          b: "Trust your best guess.",
          c: "Ask the leaders of your 1Cademy community.",
          d: "Ask the 1Cademy liaison librarians working with your community.",
          e: "Discuss in your community weekly meetings.",
        },
      },
    },
  },
  Introduction_What_is_a_node_on_1Cademy: {
    title: "1Cademy Introduction: What is a node on 1Cademy?",
    description:
      'A node represents the smallest unit of knowledge on 1Cademy. It can define a concept (i.e., "Concept" node), explain relationships between multiple concepts (i.e., "Relation" node), cite a reference (i.e., "Reference" node), ask a multiple-choice question (i.e., "Question" node), or represent a new idea (i.e., "Idea" node).',
    video: "NX2uJJ3RFsM",
    questions: {
      Which_of_the_following_choices_are_true_about_a_node_on_1Cademy: {
        stem: "Which of the following choices are true about a node on 1Cademy?",
        answers: ["a", "b", "d", "e", "f", "g"],
        choices: {
          a: "It is shown as a single rectangular box.",
          b: "It contains information described in its content.",
          c: "There should be multiple nodes on 1Cademy explaining the exact same concept.",
          d: "It is presented with a title.",
          e: "It represents the smallest unit of knowledge on 1Cademy.",
          f: "It can be connected to other nodes.",
          g: "It can cite sources.",
        },
      },
      Which_of_the_following_types_of_nodes_exist_on_1Cademy: {
        stem: "Which of the following types of nodes exist on 1Cademy?",
        answers: ["a", "c", "d", "e", "f"],
        choices: {
          a: 'A "Concept" node defines a concept.',
          b: 'A "Multimedia" node contains an image or video.',
          c: 'A "Relation" node explains relationships between multiple concepts.',
          d: 'A "Reference" node cites a reference.',
          e: 'A "Question" node asks a multiple-choice question.',
          f: 'An "Idea" node represents a new idea.',
        },
      },
    },
  },
  Introduction_The_Shared_Knowledge_Graph: {
    title: "1Cademy Introduction: The Shared Knowledge Graph",
    description:
      "First, please watch this video to learn more about how the 1Cademy knowledge map is organized.",
    video: "Yc3VOpFb8Gc",
    questions: {
      Users_generate_evaluate_and__: {
        stem: "Users generate, evaluate, and ________________ nodes by proposing changes to the graph.",
        answers: ["c"],
        choices: {
          a: "Change",
          b: "Expand",
          c: "Improve",
          d: "Increase",
        },
      },
      What_is_contained_in_the_1Cademy_shared_knowledge_graph: {
        stem: "What is contained in the 1Cademy shared knowledge graph?",
        answers: ["b"],
        choices: {
          a: "Nodes and prerequisite relations (links) only you have proposed that have been accepted",
          b: "All nodes and prerequisite relations (links) that have been proposed and accepted by 1Cademy users",
          c: "Only nodes and prerequisite relations (links) that you have accepted",
          d: "Only nodes and prerequisite relations (links) that are visible to you",
        },
      },
      Is_the_content_of_the_shared_knowledge_graph_accessible_to_all_users: {
        stem: "Is the content of the shared knowledge graph accessible to all users?",
        answers: ["a"],
        choices: {
          a: "Yes",
          b: "No",
        },
      },
    },
  },
  Introduction_Personalizing_Your_Knowledge_Map: {
    title: "1Cademy Introduction: Personalizing Your Knowledge Map",
    description:
      "This next video is about creating your own personal knowledge map view from the nodes created in the 1Cademy knowledge graph.",
    video: "IzLaiIboPVE",
    questions: {
      True_or_False_Closing_a_node_on_your_map_view_changes_everyone_else_s_map_view:
        {
          stem: "True or False? Closing a node on your map view changes everyone else's map view.",
          answers: ["b"],
          choices: {
            a: "True",
            b: "False",
          },
        },
      What_are_the_overarching_learning_activities_supported_by_the_personalized:
        {
          stem: "What are the overarching learning activities supported by the personalized knowledge map view? [Hint: one of the correct answers was not mentioned in the video]",
          answers: ["a", "b", "c", "d", "f"],
          choices: {
            a: "Navigation",
            b: "Summarization",
            c: "Evaluation",
            d: "Improvement",
            e: "Citations",
            f: "Linking",
          },
        },
    },
  },
  Introduction_Ways_to_View_Nodes_on_Your_Personalized_Map: {
    title: "1Cademy Introduction: Ways to View Nodes on Your Personalized Map",
    description:
      "This video explains the different ways nodes can be viewed while you're on 1Cademy",
    video: "6Auq_ZFVD7Q",
    questions: {
      Which_icon_closes_collapses_a_node_on_your_personalized_knowledge_map_view:
        {
          stem: "Which icon closes (collapses) a node on your personalized knowledge map view?",
          answers: ["a"],
          choices: {
            a: <RemoveIcon />,
            b: <FullscreenIcon />,
            c: "⇤",
            d: <CloseIcon />,
          },
        },
      Which_icon_opens_expands_a_node_on_your_personalized_knowledge_map_view: {
        stem: "Which icon opens (expands) a node on your personalized knowledge map view?",
        answers: ["b"],
        choices: {
          a: <RemoveIcon />,
          b: <FullscreenIcon />,
          c: "⇤",
          d: <CloseIcon />,
        },
      },
      Which_icon_hides_a_node_on_your_personalized_knowledge_map_view: {
        stem: "Which icon hides a node on your personalized knowledge map view?",
        answers: ["d"],
        choices: {
          a: <RemoveIcon />,
          b: <FullscreenIcon />,
          c: "⇤",
          d: <CloseIcon />,
        },
      },
      Which_icon_hides_the_descendants_of_a_node_on_your_personalized_knowledge_map_view:
        {
          stem: "Which icon hides the descendants of a node on your personalized knowledge map view?",
          answers: ["c"],
          choices: {
            a: <RemoveIcon />,
            b: <FullscreenIcon />,
            c: "⇤",
            d: <CloseIcon />,
          },
        },
    },
  },
  Introduction_Opening_Nodes_on_1Cademy: {
    title: "1Cademy Introduction: Opening Nodes on 1Cademy",
    description:
      "This video goes over the ways a user can open nodes on 1Cademy.",
    video: "zXedPM2xPCc",
    questions: {
      How_many_ways_are_there_to_open_nodes_on_1Cademy: {
        stem: "How many ways are there to open nodes on 1Cademy?",
        answers: ["b"],
        choices: {
          a: "8",
          b: "10",
          c: "5",
          d: "7",
        },
      },
      Which_of_the_following_are_considered_a_method_of_opening_nodes: {
        stem: "Which of the following are considered a method of opening nodes on your personalized knowledge map view?",
        answers: ["a", "b", "c", "d", "e", "f", "g", "h", "j", "k"],
        choices: {
          a: "Search box",
          b: "Notifications",
          c: "Bookmark",
          d: "Pending proposals list",
          e: "Chat room",
          f: "User mini profiles",
          g: "Parent links",
          h: "Child links",
          i: "Open/close buttons",
          j: "Citation links",
          k: "Tag links",
        },
      },
    },
  },
  Introduction_1Cademy_Sidebar: {
    title: "1Cademy Introduction: 1Cademy Sidebar",
    description:
      "In this next section, you will be introduced to the sidebar on 1Cademy. The sidebar holds all the important functions and information users need on 1Cademy.",
    video: "xEdNDQDImEM",
    questions: {
      What_tools_are_accessible_through_the_sidebar: {
        stem: "What tools are accessible through the sidebar?",
        answers: ["a", "b", "c", "d", "e", "f", "g"],
        choices: {
          a: "User settings",
          b: "Search box",
          c: "Notifications",
          d: "Bookmark",
          e: "Pending proposals list",
          f: "Chat room",
          g: "leaderboard",
          h: "Sign out button",
        },
      },
      How_can_you_change_your_default_tag_on_1Cademy: {
        stem: "How can you change your default tag on 1Cademy?",
        answers: ["a"],
        choices: {
          a: (
            <ol>
              <li>Open the user settings sidebar.</li>
              <li>Click the default tag button.</li>
              <li>Click the node corresponding to your desired tag.</li>
            </ol>
          ),
          b: (
            <ol>
              <li>Click the default tag in sidebar.</li>
              <li>Click the node corresponding to your desired tag.</li>
            </ol>
          ),
          c: "Open the node corresponding to your desired tag.",
          d: "Tag the desired tag when proposing changes to current nodes.",
          e: "Ask your community leaders to change your default tag.",
        },
      },
      OneCademy_interface_is_in_dark_mode_by_default: {
        stem: "1Cademy interface is in dark mode by default. How can you change it to light mode?",
        answers: ["a"],
        choices: {
          a: (
            <ol>
              <li>
                Open the user settings by clicking your profile picture in the
                sidebar
              </li>
              <li>
                Click the switch button, below your reputation points, and
                change it to light.
              </li>
            </ol>
          ),
          b: "You cannot, because there is no light mode for 1Cademy.",
          c: "You should change it outside of 1Cademy website.",
        },
      },
      True_or_False_You_can_change_the_background_color_and_image: {
        stem: "True or False: You can change the background color and image of your 1Cademy map view.",
        answers: ["a"],
        choices: {
          a: "True",
          b: "False",
        },
      },
      What_does_the_clustering_feature_do: {
        stem: "What does the clustering feature do?",
        answers: ["a"],
        choices: {
          a: "Puts a labeled box around nodes with the same tag",
          b: "Moves similar nodes closer together",
          c: "Spreads nodes out",
        },
      },
      What_are_you_notified_of_on_1Cademy: {
        stem: "What are you notified of on 1Cademy?",
        answers: ["a", "b", "c"],
        choices: {
          a: "Upvotes on the nodes you contributed to",
          b: "Downvotes on the nodes you contributed to",
          c: "Proposed edits to the nodes you contributed to",
          d: "Other proposed nodes in your community",
        },
      },
      When_will_a_proposal_appear_on_the_pending_proposals_list: {
        stem: "When will a proposal appear on the pending proposals list?",
        answers: ["b"],
        choices: {
          a: "Anytime you make a proposal on a node",
          b: "When you make a proposal on a node with a netvote higher than 2",
          c: "When you make a proposal on a node with 2 votes",
        },
      },
      Which_pending_proposals_do_you_see_in_the_list_of_pending_proposals_in_the_sidebar:
        {
          stem: "Which pending proposals do you see in the list of pending proposals in the sidebar?",
          answers: ["b"],
          choices: {
            a: "All pending proposals",
            b: "Only pending proposals in the community corresponding to your chosen default tag",
            c: "Only pending proposals in the communities other than the one corresponding to your chosen default tag",
          },
        },
      What_is_the_weekly_leaderboard: {
        stem: "What is the weekly leaderboard?",
        answers: ["a"],
        choices: {
          a: "Top contributors of the week in your community",
          b: "Top contributors of the week across the platform",
          c: "All contributors of the week",
        },
      },
      What_is_the_all_time_leaderboard: {
        stem: "What is the all-time leaderboard?",
        answers: ["c"],
        choices: {
          a: "Top contributors across the platform",
          b: "All contributors",
          c: "Top contributors in your community",
        },
      },
    },
  },
  Introduction_Changing_Your_Default_Community_Tag: {
    title: "1Cademy Introduction: Changing Your Default Community Tag",
    description:
      "Now, it is time for you to change your default tag. Please watch this video to help you change it to the correct community tag that you are a member of, otherwise you'll not receive points on the community leaderboard.",
    video: "D_2A4s__SfM",
    questions: {
      Have_you_changed_your_tag_to_the_correct_community: {
        stem: "Have you changed your tag to the correct community?",
        answers: ["b"],
        choices: {
          a: "No",
          b: "Yes",
          c: "I'll change it later!",
        },
      },
    },
  },
  Introduction_Changing_Your_Profile_Picture: {
    title: "1Cademy Introduction: Changing Your Profile Picture",
    description:
      "We highly encourage you to upload your profile picture by following the procedure in this video.",
    video: "oRv8CEjF1Bw",
    questions: {
      Which_choices_are_true_regarding_your_profile_picture_on_1Cademy: {
        stem: "Which choices are true regarding your profile picture on 1Cademy?",
        answers: ["a", "b", "c", "d"],
        choices: {
          a: "It increases your social presence within 1Cademy.",
          b: "We highly encourage you to upload yours, but not required.",
          c: "To change it, go to the sidebar located on the left of your map view, and click on your current profile picture. Then, click on your profile picture again in the user settings sidebar, and upload your new profile picture.",
          d: "Once you change your profile picture, it updates on all the nodes and proposals that you contributed to.",
        },
      },
    },
  },
  Introduction_Bookmarking_and_Marking_Nodes_as_Studied: {
    title: "1Cademy Introduction: Bookmarking and Marking Nodes as Studied",
    description:
      "This video goes over how to bookmark nodes and how to mark nodes as studied.",
    video: "ohhJvJ0yhqs",
    questions: {
      Which_icon_at_the_node_footer_should_you_click_to_mark_a_node_as_studied:
        {
          stem: "Which icon at the node footer should you click to mark a node as studied?",
          answers: ["a"],
          choices: {
            a: <EmailIcon />,
            b: <LocalOfferIcon />,
            c: <BookmarkIcon />,
            d: <CreateIcon />,
            e: <MenuBookIcon />,
            f: <EventAvailableIcon />,
          },
        },
      After_marking_a_node_as_studied_the_border_turns_to_which_color: {
        stem: "After marking a node as studied, the border turns to which color?",
        answers: ["b"],
        choices: {
          a: "Red",
          b: "Yellow",
          c: "Green",
          d: "Blue",
        },
      },
      If_a_node_is_NOT_marked_as_studied_what_is_its_border_color: {
        stem: "If a node is NOT marked as studied, what is its border color?",
        answers: ["a"],
        choices: {
          a: "Red",
          b: "Yellow",
          c: "Green",
          d: "Blue",
        },
      },
      If_a_node_is_marked_as_studied_but_someone_updates_the_node: {
        stem: "If a node is marked as studied, but someone updates the node through a proposal, what is its border color?",
        answers: ["a"],
        choices: {
          a: "Red",
          b: "Yellow",
          c: "Green",
          d: "Blue",
        },
      },
      Which_icon_at_the_node_footer_should_you_click_to_bookmark_a_node: {
        stem: "Which icon at the node footer should you click to bookmark a node to be notified of its updates?",
        answers: ["c"],
        choices: {
          a: <EmailIcon />,
          b: <LocalOfferIcon />,
          c: <BookmarkIcon />,
          d: <CreateIcon />,
          e: <MenuBookIcon />,
          f: <EventAvailableIcon />,
        },
      },
      When_do_you_see_a_bookmarked_node_in_your_bookmarked_updates_tab: {
        stem: "When do you see a bookmarked node in your bookmarked updates tab?",
        answers: ["b", "c"],
        choices: {
          a: "When it is marked as studied",
          b: "When it is marked as not studied",
          c: "When it is marked as studied, but is updated through others' proposals",
        },
      },
    },
  },
  Introduction_Chatroom: {
    title: "1Cademy Introduction: Chatroom",
    description: "In this video, we go over how to use the 1Cademy chatroom.",
    video: "BSmoSN4RTxk",
    questions: {
      What_kind_of_messages_can_be_sent_in_the_chatroom: {
        stem: "What kind of messages can be sent in the chatroom?",
        answers: ["a", "c", "d", "e"],
        choices: {
          a: "Text",
          b: "Video",
          c: "Node link",
          d: "Image",
          e: "GIFs",
        },
      },
      Who_will_see_the_messages_your_send_in_1Cademy_chatroom: {
        stem: "Who will see the messages your send in 1Cademy chatroom?",
        answers: ["a"],
        choices: {
          a: "Every member of every community",
          b: "Only members of your community",
          c: "Only those people you specify",
          d: "Only your friends",
          e: "Only yourself",
        },
      },
      How_can_you_share_the_link_to_a_node_in_the_chatroom: {
        stem: "How can you share the link to a node in the chatroom?",
        answers: ["b"],
        choices: {
          a: (
            <ol>
              <li>Click the title of the node you want to share</li>
              <li>Click the node button in the chatroom</li>
            </ol>
          ),
          b: (
            <ol>
              <li>Click the node button in the chatroom</li>
              <li>Click the title of the node you want to share</li>
            </ol>
          ),
          c: "You cannot share a node link in the chatroom",
          d: "Click the share button at the node footer",
        },
      },
    },
  },
  Introduction_Search_Engine: {
    title: "1Cademy Introduction: Search Engine",
    description: "This video goes over how to use the search tool on 1Cademy.",
    video: "WRUld8vA3i4",
    questions: {
      How_do_you_search_within_all_community_tags: {
        stem: "How do you search within all community tags?",
        answers: ["b"],
        choices: {
          a: 'Select the "All" option under "Tags"',
          b: "Unselect all tags",
          c: "Searching all tags is the default option",
        },
      },
      How_do_you_specify_the_node_type_while_using_the_search_engine: {
        stem: "How do you specify the node type while using the search engine?",
        answers: ["a"],
        choices: {
          a: "Select node types you want in a dropdown menu",
          b: "Select node type through tagging",
          c: "Type in the node type you want to search",
        },
      },
    },
  },
  Nodes_Defining_a_Node: {
    title: "1Cademy Nodes: Defining a Node",
    description:
      "Now that you have gone through the introduction tutorial, it is time to learn about nodes on 1Cademy! In this video, we define what a node is on 1Cademy.",
    video: "NX2uJJ3RFsM",
    questions: {
      What_is_all_knowledge_on_1Cademy_summarized_into: {
        stem: "What is all knowledge on 1Cademy summarized into?",
        answers: ["b"],
        choices: {
          a: "Paragraphs",
          b: "Nodes",
          c: "Articles",
        },
      },
      What_kind_of_content_can_be_contained_in_a_node: {
        stem: "What kind of content can be contained in a node?",
        answers: ["a", "b", "c", "e", "f"],
        choices: {
          a: "Cited sources",
          b: "A single concept",
          c: "Relating multiple concepts",
          d: "Definitions of multiple concepts",
          e: "An idea without any citations",
          f: "A multiple-choice question",
        },
      },
    },
  },
  Nodes_Node_Header: {
    title: "1Cademy Nodes: Node Header",
    description: "This video goes over the node header.",
    video: "m6qIjU4tpL4",
    questions: {
      What_functions_are_in_the_node_header: {
        stem: "What functions are in the node header?",
        answers: ["b", "c", "e"],
        choices: {
          a: "Open offspring",
          b: "Hide offspring",
          c: "Hide node",
          d: "Open parents",
          e: "Close (collapse) node",
        },
      },
    },
  },
  Nodes_Node_Footer: {
    title: "1Cademy Nodes: Node Footer",
    description: "This video goes over the node footer.",
    video: "mhj3OeF1iFQ",
    questions: {
      Which_icon_should_you_click_to_get_access_to_the_node_s_parent_and_child_links:
        {
          stem: "Which icon should you click to get access to the node's parent and child links?",
          answers: ["g"],
          choices: {
            a: <EmailIcon />,
            b: <LocalOfferIcon />,
            c: <BookmarkIcon />,
            d: <CreateIcon />,
            e: <MenuBookIcon />,
            f: <EventAvailableIcon />,
            g: "2⇄2",
            h: "↕",
            i: <CheckIcon />,
            j: <CloseIcon />,
          },
        },
      If_your_nodes_overlap_like_this_which_icon_in_the_node_footer_can: {
        stem: (
          <div>
            If your nodes overlap like this, which icon in the node footer can
            you click to fix them?
            <img src="/static/tutorial/OverlappingNodes.jpg" width="100%" />
          </div>
        ),
        answers: ["h"],
        choices: {
          a: <EmailIcon />,
          b: <LocalOfferIcon />,
          c: <BookmarkIcon />,
          d: <CreateIcon />,
          e: <MenuBookIcon />,
          f: <EventAvailableIcon />,
          g: "2⇄2",
          h: "↕",
          i: <CheckIcon />,
          j: <CloseIcon />,
        },
      },
      If_you_find_a_node_helpful_to_your_learning_what_icon_do_you_click_to_upvote_it:
        {
          stem: "If you find a node helpful to your learning, what icon do you click to upvote it?",
          answers: ["i"],
          choices: {
            a: <EmailIcon />,
            b: <LocalOfferIcon />,
            c: <BookmarkIcon />,
            d: <CreateIcon />,
            e: <MenuBookIcon />,
            f: <EventAvailableIcon />,
            g: "2⇄2",
            h: "↕",
            i: <CheckIcon />,
            j: <CloseIcon />,
          },
        },
      If_you_find_a_node_unhelpful_and_youd_like_to_vote_to_delete_it_what_icon_do_you_click:
        {
          stem: "If you find a node unhelpful and you'd like to vote to delete it, what icon do you click?",
          answers: ["j"],
          choices: {
            a: <EmailIcon />,
            b: <LocalOfferIcon />,
            c: <BookmarkIcon />,
            d: <CreateIcon />,
            e: <MenuBookIcon />,
            f: <EventAvailableIcon />,
            g: "2⇄2",
            h: "↕",
            i: <CheckIcon />,
            j: <CloseIcon />,
          },
        },
    },
  },
  Nodes_Node_Body: {
    title: "1Cademy Nodes: Node Body",
    description: "This video goes over the node body.",
    video: "pRK5SpjMPlI",
    questions: {
      What_components_does_the_node_body_contain: {
        stem: "What components does the node body contain?",
        answers: ["a", "b"],
        choices: {
          a: "Title",
          b: "Content",
          c: "Header",
          d: "Footer",
        },
      },
      Both_the_node_title_and_content_should_be: {
        stem: "Both the node title and content should be:",
        answers: ["a", "c", "d"],
        choices: {
          a: "Comprehensive",
          b: "Cryptic",
          c: "Concise",
          d: "Clear",
        },
      },
    },
  },
  Nodes_Types_of_Nodes: {
    title: "1Cademy Nodes: Types of Nodes",
    description: "This video goes over the types of nodes.",
    video: "UD9kCb9LKWU",
    questions: {
      What_are_different_types_of_nodes_on_1Cademy: {
        stem: "What are different types of nodes on 1Cademy?",
        answers: ["a", "b", "d", "e", "f", "g"],
        choices: {
          a: "Concept",
          b: "Relation",
          c: "Funny",
          d: "Reference",
          e: "Code",
          f: "Question",
          g: "Idea",
          h: "Social Network",
        },
      },
    },
  },
  Nodes_Concept_Nodes: {
    title: "1Cademy Nodes: Concept Nodes",
    description:
      "This video introduces the purpose of concept nodes on 1Cademy.",
    video: "stRxLxXVsGw",
    questions: {
      A_concept_node: {
        stem: "A concept node:",
        answers: ["c"],
        choices: {
          a: "Displays multiple concepts and their definitions",
          b: "Compares concepts",
          c: "Displays a single concept and its definition",
        },
      },
    },
  },
  Nodes_Relation_Nodes_vs_Concept_Nodes: {
    title: "1Cademy Nodes: Relation Nodes vs. Concept Nodes",
    description:
      "Understanding the difference between relation nodes and concept nodes can be difficult. Please watch this video to gain a deeper understanding of the differences between these two types of nodes.",
    video: "Z9TzJUuLj9A",
    questions: {
      A_relation_node____________topics_and_a_concept_node___________topics: {
        stem: "A relation node __________ topics, and a concept node _________ topics.",
        answers: ["a"],
        choices: {
          a: "compares; defines",
          b: "introduces; defines",
          c: "compares; relates",
        },
      },
      Relation_Is_the_following_node_a_relation_node_or_a_concept_node: {
        stem: (
          <div>
            Is the following node a relation node, or a concept node?
            <img src="/static/tutorial/RelationNode.jpg" width="100%" />
          </div>
        ),
        answers: ["b"],
        choices: {
          a: "Concept node because it is going over a single topic",
          b: "Relation node because it is comparing/discussing two topics",
          c: "Concept node because it is not a bulleted list",
          d: "Relation node because it has two parents",
        },
      },
      Concept_Is_the_following_node_a_relation_node_or_a_concept_node: {
        stem: (
          <div>
            Is the following node a relation node, or a concept node?
            <img src="/static/tutorial/ConceptNode.jpg" width="100%" />
          </div>
        ),
        answers: ["a"],
        choices: {
          a: "Concept node because it is going over a single topic",
          b: "Relation node because it is comparing/discussing two topics",
          c: "Concept node because it is not a bulleted list",
          d: "Relation node because it has two parents",
        },
      },
    },
  },
  Nodes_Code_Nodes: {
    title: "1Cademy Nodes: Code Nodes",
    description:
      "This video goes over the purpose of code nodes on 1Cademy and how to create them.",
    video: "C0r6W2gC_Wc",
    questions: {
      What_languages_can_be_specified_in_code_nodes: {
        stem: "What languages can be specified in code nodes?",
        answers: ["a", "c", "d", "e"],
        choices: {
          a: "JavaScript",
          b: "C++",
          c: "Python",
          d: "HTML",
          e: "R",
        },
      },
    },
  },
  Nodes_Reference_Nodes: {
    title: "1Cademy Nodes: Reference Nodes",
    description: "This video introduces reference nodes on 1Cademy.",
    video: "R9V7Kjoznyw",
    questions: {
      What_format_of_citation_should_be_used_in_reference_nodes: {
        stem: "What format of citation should be used in reference nodes?",
        answers: ["b"],
        choices: {
          a: "MLA",
          b: "APA",
          c: "Chicago",
          d: "AMA",
        },
      },
    },
  },
  Nodes_Idea_Nodes: {
    title: "1Cademy Nodes: Idea Nodes",
    description: "This video introduces idea nodes on 1Cademy.",
    video: "5dXSNS4npFk",
    questions: {
      For_what_purpose_should_we_propose_an_idea_node_on_1Cademy: {
        stem: "For what purpose should we propose an idea node on 1Cademy?",
        answers: ["b", "c", "d"],
        choices: {
          a: "To enforce others to listen to our ideas",
          b: "To explain one of our ideas to others in a consice way",
          c: "To relate our ideas to others' idea, concept, and relation nodes",
          d: "To organize our ideas",
        },
      },
    },
  },
  Nodes_Question_Nodes: {
    title: "1Cademy Nodes: Question Nodes",
    description: "This video introduces question nodes on 1Cademy.",
    video: "4lgJqIr1BJA",
    questions: {
      For_what_purpose_should_we_propose_a_question_node_on_1Cademy: {
        stem: "For what purpose should we propose a question node on 1Cademy?",
        answers: ["c", "d"],
        choices: {
          a: "To ask others' help to solve our problems",
          b: "To ask experts solutions to difficult problems",
          c: "To design a multiple-choice question to test others' learning",
          d: "To design a multiple-choice question to improve others' learning",
        },
      },
    },
  },
  Proposal_System_Getting_Started_as_a_User: {
    title: "1Cademy Proposal System: Getting Started as a User",
    description:
      "Before going into the specifics of the proposal system, here is a brief video going over what your first steps as a user on 1Cademy may look like when you are proposing nodes.",
    video: "jhFAmGAr2fU",
    questions: {
      What_is_the_very_first_step_in_proposing_a_new_node_on_1Cademy: {
        stem: "What is the very first step in proposing a new node on 1Cademy?",
        answers: ["a", "b"],
        choices: {
          a: "Reviewing the knowledge graph to make sure that the information you want to add does not already exist on 1Cademy",
          b: "Using the search tool to make sure that the information you want to add does not already exist on 1Cademy",
          c: "Creating a proposal",
          d: "Finding the right prerequisite node",
          e: "Adding the right citation to the node",
          f: "Defining the node type",
        },
      },
      What_should_your_first_step_be_as_a_new_user_on_1Cademy: {
        stem: "What should your first step be as a new user on 1Cademy?",
        answers: ["a"],
        choices: {
          a: "Changing your default tag to reflect your community membership",
          b: "Adding nodes",
          c: "Upvoting nodes you find helpful",
        },
      },
    },
  },
  Proposal_System_Prerequisite_Linking_on_1Cademy: {
    title: "1Cademy Proposal System: Prerequisite Linking on 1Cademy",
    description:
      "This video defines prerequisite linking and how it is used on 1Cademy",
    video: "76MSksNQYN0",
    questions: {
      What_do_you_think_the_phrase_prerequisite_relation_means: {
        stem: 'What do you think the phrase "prerequisite relation" means?',
        answers: ["b", "e"],
        choices: {
          a: "A relation of parallel concepts in different disciplines",
          b: "A relation between knowledge and what it helps to learn next",
          c: "An example from a source related to a certain topic",
          d: "A relation of two similar principles",
          e: "A relation between concepts A and B if you need to learn A to be able to learn B",
        },
      },
      The_following_boxes_are_two_nodes_on_1Cademy_each_of_them_defining_a_concept:
        {
          stem: (
            <div>
              The following boxes are two nodes on 1Cademy, each of them
              defining a concept: "1Cademy" or "1Cademy's Goal." Which of these
              is the correct order of prerequisite linking? (Hint: try reading
              the content in the nodes if you are confused.)
              <img
                src="/static/tutorial/TwoPrerequisiteNodes.jpg"
                width="100%"
              />
            </div>
          ),
          answers: ["a"],
          choices: {
            a: "[ 1Cademy ] --> [ 1Cademy's goal ]",
            b: "[ 1Cademy's goal ] --> [ 1Cademy ]",
          },
        },
      You_want_to_teach_a_friend_about_how_to_use_exponents: {
        stem: "You want to teach a friend about how to use exponents. How would you organize the prerequisite links for them? (Assume each node already has a definition.)",
        answers: ["b"],
        choices: {
          a: "[ Summation ] -->  [ Exponents ] --> [ Multiplication ]",
          b: "[ Summation ] --> [ Multiplication ] --> [ Exponents ]",
          c: "[ Exponents ] --> [ Multiplication ] --> [ Summation ]",
          d: "[ Exponents ] --> [ Summation ] --> [ Multiplication ]",
        },
      },
      What_is_the_correct_prerequisite_linking_of_these_three_nodes: {
        stem: (
          <div>
            <div>
              What is the correct prerequisite linking of these three nodes?
              (Hint: try reading the node contents if you are confused.)
            </div>
            <img
              src="/static/tutorial/ThreePrerequisiteNodes.jpg"
              width="100%"
            />
          </div>
        ),
        answers: ["d"],
        choices: {
          a: "[ Problem ] --> [ Group brainstorming ] --> [ Problem solving ]",
          b: "[ Group brainstorming ] --> [ Problem ] --> [ Problem solving ]",
          c: "[ Problem solving ] --> [ Problem ] --> [ Group brainstorming ]",
          d: "[ Problem ] --> [ Problem solving ] --> [ Group brainstorming ]",
          e: "[ Group brainstorming ] --> [ Problem solving ] --> [ Problem ]",
        },
      },
    },
  },
  Proposal_System_Finding_the_Immediate_Prerequisite: {
    title: "1Cademy Proposal System: Finding the Immediate Prerequisite",
    description:
      "This video goes over how to find the immediate prerequisite information when you want to add nodes to the 1Cademy map.",
    video: "2idtxBKxS08",
    questions: {
      When_can_a_node_be_defined_as_a_parent_node_on_1Cademy: {
        stem: "When can a node be defined as a parent node on 1Cademy?",
        answers: ["a"],
        choices: {
          a: "When it contains direct (immediate) prerequisite information to the information you would like to add",
          b: "When it contains information a user needs to know to understand the information you would like to add",
          c: "When it contains unrelated information",
        },
      },
      What_is_an_ancestor_node: {
        stem: "What is an ancestor node?",
        answers: ["b"],
        choices: {
          a: "When it contains direct (immediate) prerequisite information to the information you would like to add",
          b: "When it contains direct and indirect information a user needs to know to understand the information you would like to add",
          c: "When it contains unrelated information",
          d: "A parent node is also considered an ancestor node",
        },
      },
    },
  },
  Proposal_System_Demonstration_of_Finding_the_Immediate_Prerequisite: {
    title:
      "1Cademy Proposal System: Demonstration of Finding the Immediate Prerequisite",
    description:
      "This video goes over the process a user might go through while trying to find an immediate prerequisite node.",
    video: "fc6varqBW4s",
    questions: {
      What_is_the_first_step_in_finding_a_parent_node_on_1Cademy: {
        stem: "What is the first step in finding a parent node on 1Cademy?",
        answers: ["a"],
        choices: {
          a: "Using the search tool",
          b: "Navigating through our knowledge map view",
          c: "Looking at the current nodes visible on our map",
        },
      },
    },
  },
  Proposal_System_Proposals_on_1Cademy: {
    title: "1Cademy Proposal System: Proposals on 1Cademy",
    description:
      "Now that you are well versed in prerequisite and immediate prerequisite linking, it is time to learn about proposals on 1Cademy.",
    video: "9dKL7ojJvro",
    questions: {
      For_what_purposes_should_we_submit_a_proposal_on_1Cademy: {
        stem: "For what purpose(s) should we submit a proposal on 1Cademy?",
        answers: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
        choices: {
          a: "Creating a node",
          b: "Updating the title of a node",
          c: "Updating the content of a node",
          d: "Uploading an image to a node",
          e: "Adding a new citation to a node",
          f: "Editing a citation on a node",
          g: "Adding a new tag to a node",
          h: "Editing a tag on a node",
          i: "Adding/removing a parent link to/from a node",
          j: "Adding/removing a child link to/from a node",
        },
      },
    },
  },
  Proposal_System_Proposing_a_Child_Node_on_1Cademy: {
    title: "1Cademy Proposal System: Proposing a Child Node on 1Cademy",
    description:
      "This video gives an overview of the steps to proposing a child node on 1Cademy.",
    video: "bhMvCqXbvbg",
    questions: {
      How_many_steps_are_there_to_proposing_a_child_node_on_1Cademy: {
        stem: "How many steps are there to proposing a child node on 1Cademy?",
        answers: ["b"],
        choices: {
          a: "6",
          b: "7",
          c: "8",
          d: "9",
        },
      },
    },
  },
  Proposal_System_Proposing_an_edit_on_1Cademy: {
    title: "1Cademy Proposal System: Proposing an edit on 1Cademy",
    description:
      "This video goes over how to propose an edit to a node on 1Cademy.",
    video: "rb0-ZvYTavE",
    questions: {
      What_can_users_edit_in_a_node: {
        stem: "What can users edit in a node?",
        answers: ["a", "b", "c", "d", "e", "f", "h"],
        choices: {
          a: "Node title",
          b: "Node content",
          c: "Parent links",
          d: "Child links",
          e: "References",
          f: "Tags",
          g: "Node type",
          h: "Node image",
        },
      },
    },
  },
  Proposal_System_What_Happens_to_Proposals_on_1Cademy: {
    title: "1Cademy Proposal System: What Happens to Proposals on 1Cademy",
    description:
      "This video gives an overview of what happens after a node edit is proposed, and how the pending proposals list works.",
    video: "4JKsI0zIEzU",
    questions: {
      Can_a_node_be_downvoted_off_the_pending_proposals_list: {
        stem: "Can a node be downvoted directly off the pending proposals list?",
        answers: ["b"],
        choices: {
          a: "Yes",
          b: "No",
        },
      },
      You_are_making_a_proposal_on_a_node_with_____________downvotes_and_____________upvotes:
        {
          stem: "You are making a proposal on a node with ___________ downvotes and ___________ upvotes. How many of each should there be so your proposal is accepted right away?",
          answers: ["a", "c", "d"],
          choices: {
            a: "0 downvotes; 2 upvotes",
            b: "3 downvotes; 6 upvotes",
            c: "8 downvotes; 9 upvotes",
            d: "0 downvotes; 0 upvotes",
            e: "0 downvotes; 3 upvotes",
          },
        },
      You_are_making_a_proposal_on_a_node_with_____________downvotes_and_____________upvotes:
        {
          stem: "Which of the following combinations of upvotes and downvotes will result in 2 net votes?",
          answers: ["b"],
          choices: {
            a: "3 downvotes; 6 upvotes",
            b: "6 downvotes; 8 upvotes",
            c: "0 downvotes; 1 upvote",
          },
        },
      What_happens_to_a_node_with_more_downvotes_than_upvotes: {
        stem: "What happens to a node with more downvotes than upvotes?",
        answers: ["a"],
        choices: {
          a: "It gets deleted from the whole knowledge graph.",
          b: "It remains untouched.",
          c: "It gets locked.",
          d: "It is kept as a proposal.",
        },
      },
    },
  },
  Proposal_System_Summarizing_a_Paper_on_1Cademy: {
    title: "1Cademy Proposal System: Summarizing a Paper on 1Cademy",
    description:
      "This video gives an overview of how to summarize papers on 1Cademy.",
    video: "zrVh93YXHfY",
    questions: {
      When_summarizing_a_research_paper_should_you_propose_nodes_about_each_section_in_the_paper:
        {
          stem: "When summarizing a research paper, should you propose nodes about each section in the paper?",
          answers: ["b"],
          choices: {
            a: "Yes",
            b: "No",
          },
        },
      Is_it_okay_to_duplicate_content_on_the_knowledge_graph: {
        stem: "Is it okay to duplicate content on the knowledge graph?",
        answers: ["b"],
        choices: {
          a: "Yes",
          b: "No",
        },
      },
      Is_it_okay_to_use_direct_quotes_when_summarizing_a_paper_on_1Cademy_s_knowledge_graph:
        {
          stem: "Is it okay to use direct quotes when summarizing a paper on 1Cademy's knowledge graph?",
          answers: ["b"],
          choices: {
            a: "Yes",
            b: "No",
          },
        },
    },
  },
  Congratulations: {
    title: "Congratulations!",
    description: (
      <div>
        You successfully completed the 1Cademy tutorial. You can now explore
        1Cademy communities{" "}
        <a href="/community/Social_Political_Psychology" target="_blank">
          on this page
        </a>{" "}
        and complete the requirements of whichever community you'd like to apply
        to.
      </div>
    ),
    video: "",
    questions: {},
  },
};
