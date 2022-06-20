import React from "react";

import Button from "@mui/material/Button";

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
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import CodeIcon from "@mui/icons-material/Code";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ShareIcon from "@mui/icons-material/Share";

let secCounter = 0;
let quCounter = 0;

const newSec = () => {
  secCounter += 1;
  quCounter = 0;
  return secCounter + ". ";
};

const quNum = () => {
  quCounter += 1;
  return secCounter + "." + quCounter + ". ";
};

export default {
  Introduction_Fundamentals: {
    title: newSec() + "1Cademy Introduction: Fundamentals",
    description: (
      <div>
        <p>
          First, we will introduce 1Cademy, its objective, and how it works
          before digging into collaborating with others on 1Cademy.
        </p>
        <p>
          Before moving forward, please make an account on{" "}
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
        stem: (
          <div>
            {quNum()}How can 1Cademy help us? (Hint: find the answer from{" "}
            <a href="https://1cademy.us/home" target="_blank">
              the 1Cademy homepage
            </a>
            .)
          </div>
        ),
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
        stem: (
          <div>
            {quNum()}How does 1Cademy aim to help our society? (Hint: find the
            answer from{" "}
            <a href="https://1cademy.us/home" target="_blank">
              the 1Cademy homepage
            </a>
            .)
          </div>
        ),
        answers: ["a", "b", "c", "d"],
        choices: {
          a: "Joining/forming multi-school research communities",
          b: "Collaboratively developing learning pathways to learn each concept",
          c: "Crowdsourcing learning",
          d: "Improving exploratory search",
        },
      },
      // If_everything_is_explained_somewhere: {
      //   stem: "If everything is explained somewhere on the internet, then why do we pay for textbooks and online courses?",
      //   answers: ["e"],
      //   choices: {
      //     a: "Because we cannot find the explanations on the Internet.",
      //     b: "Because we are lazy!",
      //     c: "Because most explanations on the Internet are not free.",
      //     d: "Because most explanations on the Internet are incorrect.",
      //     e: "Because most explanations on the Internet do not provide us with learning pathways.",
      //   },
      // },
      Is_the_content_on_1Cademy_peer_reviewed: {
        stem: quNum() + "Is the content on 1Cademy peer-reviewed?",
        answers: ["a"],
        choices: {
          a: "Yes",
          b: "No",
        },
      },
      What_kind_of_content_should_be_added_to_1Cademy: {
        stem: (
          <div>
            <p>
              {quNum()}What kind of content should be added to 1Cademy? (Hint:
              check out{" "}
              <a
                href="https://apastyle.apa.org/style-grammar-guidelines/citations/paraphrasing"
                target="_blank"
              >
                the APA guidelines
              </a>
              .)
            </p>
            <p>
              <strong>Note:</strong> in addition to the types of content
              discussed in the video and APA guidelines, you can add links to
              online videos or audio recordings, and images from websites under
              public domain with correct citations in the content of the nodes
              you propose on 1Cademy.
            </p>
          </div>
        ),
        answers: ["c", "e", "f"],
        choices: {
          a: "Content from external source without proper citation",
          b: "Quotes that are not cited",
          c: "Paraphrased and correctly cited content",
          d: "Content directly copied from books or research papers, with or without citation",
          e: "Links to online videos or audio recordings with proper citation",
          f: "Images from websites under public domain with correct citations",
          g: "Images from copyrighted websites",
        },
      },
    },
  },
  Introduction_What_is_a_node_on_1Cademy: {
    title: newSec() + "1Cademy Introduction: What is a node on 1Cademy?",
    description: (
      <div>
        <p>
          <strong>Notes:</strong> A node represents the smallest unit of
          knowledge on 1Cademy. It can:
        </p>
        <ul>
          <li>Define a concept (i.e., "Concept" node)</li>
          <li>
            Explain relationships between multiple concepts (i.e., "Relation"
            node)
          </li>
          <li>Cite a reference (i.e., "Reference" node)</li>
          <li>Ask a multiple-choice question (i.e., "Question" node)</li>
          <li>Represent a new idea (i.e., "Idea" node).</li>
        </ul>
      </div>
    ),
    video: "exLS4UadfFU",
    questions: {
      What_is_all_knowledge_on_1Cademy_summarized_into: {
        stem: quNum() + "What is all knowledge on 1Cademy summarized into?",
        answers: ["b"],
        choices: {
          a: "Paragraphs",
          b: "Nodes",
          c: "Articles",
        },
      },
      What_kind_of_content_can_be_contained_in_a_node: {
        stem: (
          <div>
            <p>
              {quNum()}What kind of content can be contained in a{" "}
              <strong>single</strong> node?
            </p>
            <p>
              <strong>Note:</strong> "Idea" nodes do not require citations.
            </p>
          </div>
        ),
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
      Which_of_the_following_choices_are_true_about_a_node_on_1Cademy: {
        stem:
          quNum() +
          "Which of the following choices are true about a node on 1Cademy?",
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
    },
  },
  Introduction_The_Shared_Knowledge_Graph: {
    title: newSec() + "1Cademy Introduction: The Shared Knowledge Graph",
    description:
      "First, please watch this video to learn more about how the 1Cademy knowledge map is organized.",
    video: "Yc3VOpFb8Gc",
    questions: {
      Users_generate_evaluate_and__: {
        stem:
          quNum() +
          "Users generate, evaluate, and ________________ nodes by proposing changes to the graph.",
        answers: ["c"],
        choices: {
          a: "Change",
          b: "Expand",
          c: "Improve",
          d: "Increase",
        },
      },
      What_is_contained_in_the_1Cademy_shared_knowledge_graph: {
        stem:
          quNum() + "What is contained in the 1Cademy shared knowledge graph?",
        answers: ["b"],
        choices: {
          a: "Nodes and prerequisite relations (links) only you have proposed that have been accepted",
          b: "All nodes and prerequisite relations (links) that have been proposed and accepted by 1Cademy users",
          c: "Only nodes and prerequisite relations (links) that you have accepted",
          d: "Only nodes and prerequisite relations (links) that are visible to you",
        },
      },
      Is_the_content_of_the_shared_knowledge_graph_accessible_to_all_users: {
        stem:
          quNum() +
          "Is the content of the shared knowledge graph accessible to all users?",
        answers: ["a"],
        choices: {
          a: "Yes",
          b: "No",
        },
      },
    },
  },
  Introduction_Personalizing_Your_Knowledge_Map: {
    title: newSec() + "1Cademy Introduction: Personalizing Your Knowledge Map",
    description:
      "This next video is about creating your own personal knowledge map view from the nodes created in the 1Cademy knowledge graph.",
    video: "IzLaiIboPVE",
    questions: {
      True_or_False_Closing_a_node_on_your_map_view_changes_everyone_else_s_map_view:
        {
          stem:
            quNum() +
            "True or False? Closing a node on your map view changes everyone else's map view.",
          answers: ["b"],
          choices: {
            a: "True",
            b: "False",
          },
        },
      // What_are_the_overarching_learning_activities_supported_by_the_personalized:
      //   {
      //     stem: (
      //       <div>
      //         {quNum()}What are the overarching learning activities supported by
      //         the personalized knowledge map view? [Hint: one of the correct
      //         answers was not mentioned in the video, but you can find it from{" "}
      //         <a href="https://1cademy.us/home" target="_blank">
      //           the 1Cademy homepage
      //         </a>
      //       </div>
      //     ),
      //     answers: ["a", "b", "c", "d", "e"],
      //     choices: {
      //       a: "Navigation",
      //       b: "Summarization",
      //       c: "Evaluation",
      //       d: "Improvement",
      //       e: "Linking",
      //     },
      //   },
    },
  },
  Introduction_Ways_to_View_Nodes_on_Your_Personalized_Map: {
    title:
      newSec() +
      "1Cademy Introduction: Ways to View Nodes on Your Personalized Map",
    description:
      "This video explains the different ways nodes can be viewed while you're on 1Cademy",
    video: "6Auq_ZFVD7Q",
    questions: {
      Which_icon_closes_collapses_a_node_on_your_personalized_knowledge_map_view:
        {
          stem:
            quNum() +
            "Which icon closes (collapses) a node on your personalized knowledge map view?",
          answers: ["a"],
          choices: {
            a: <RemoveIcon />,
            b: <FullscreenIcon />,
            c: "⇤",
            d: <CloseIcon />,
          },
        },
      Which_icon_opens_expands_a_node_on_your_personalized_knowledge_map_view: {
        stem:
          quNum() +
          "Which icon opens (expands) a node on your personalized knowledge map view?",
        answers: ["b"],
        choices: {
          a: <RemoveIcon />,
          b: <FullscreenIcon />,
          c: "⇤",
          d: <CloseIcon />,
        },
      },
      Which_icon_hides_a_node_on_your_personalized_knowledge_map_view: {
        stem:
          quNum() +
          "Which icon hides a node on your personalized knowledge map view?",
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
          stem:
            quNum() +
            "Which icon hides the descendants of a node on your personalized knowledge map view?",
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
    title: newSec() + "1Cademy Introduction: Opening Nodes on 1Cademy",
    description:
      "This video goes over the ways a user can open nodes on 1Cademy.",
    video: "zXedPM2xPCc",
    questions: {
      How_many_ways_are_there_to_open_nodes_on_1Cademy: {
        stem: quNum() + "How many ways are there to open nodes on 1Cademy?",
        answers: ["b"],
        choices: {
          a: "8",
          b: "10",
          c: "5",
          d: "7",
        },
      },
      Which_of_the_following_are_considered_a_method_of_opening_nodes: {
        stem:
          quNum() +
          "Which of the following methods are used to add nodes to your personalized knowledge map view?",
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
    title: newSec() + "1Cademy Introduction: 1Cademy Sidebar",
    description: (
      <div>
        <p>
          In this section, you will be introduced to the sidebar on 1Cademy.
        </p>
        <p>
          <strong>Notes:</strong>
        </p>
        <ul>
          <li>
            The sidebar holds all the important functions and information users
            need on 1Cademy.
          </li>
          <li>The sidebar includes your community's leaderboard.</li>
          <li>
            By clicking your user profile picture, on top of the sidebar, you
            can open your user settings, where you can change your default
            community tag, profile picture, and the light/dark themes.
          </li>
          <li>
            If you click any other user's profile picture, in the leaderboard,
            it'll open their user profile, where you can see their history of
            contributions.
          </li>
          <li>
            The notifications tab displays upvotes, downvotes, and proposed
            edits on nodes you contributed to.
          </li>
        </ul>
      </div>
    ),
    video: "vedBocVh0hk",
    questions: {
      What_tools_are_accessible_through_the_sidebar: {
        stem: quNum() + "What tools are accessible through the sidebar?",
        answers: ["a", "b", "c", "d", "e", "f", "g"],
        choices: {
          a: "User settings",
          b: "Search box",
          c: "Notifications",
          d: "Bookmark",
          e: "Pending proposals list",
          f: "Chat room",
          g: "leaderboard",
        },
      },
      OneCademy_interface_is_in_dark_mode_by_default: {
        stem:
          quNum() +
          "1Cademy interface is in dark mode by default. How can you change it to light mode?",
        answers: ["a"],
        choices: {
          a: "Open the user settings by clicking your profile picture in the sidebar ⇨ Click the switch button, below your reputation points, and change it to light.",
          b: "You cannot, because there is no light mode for 1Cademy.",
          c: "You should change it outside of 1Cademy website.",
        },
      },
      True_or_False_You_can_change_the_background_color_and_image: {
        stem:
          quNum() +
          "True or False: You can switch the background image to a solid color on your 1Cademy map view.",
        answers: ["a"],
        choices: {
          a: "True",
          b: "False",
        },
      },
      What_does_the_clustering_feature_do: {
        stem: quNum() + "What does the clustering feature do?",
        answers: ["a"],
        choices: {
          a: "Puts a labeled box around nodes with the same tag",
          b: "Moves similar nodes closer together",
          c: "Spreads nodes out",
        },
      },
      What_are_you_notified_of_on_1Cademy: {
        stem: quNum() + "What are you notified of on 1Cademy?",
        answers: ["a", "b", "c"],
        choices: {
          a: "Upvotes on the nodes you contributed to",
          b: "Downvotes on the nodes you contributed to",
          c: "Proposed edits to the nodes you contributed to",
          d: "Other proposed nodes in your community",
        },
      },
      Which_pending_proposals_do_you_see_in_the_list_of_pending_proposals_in_the_sidebar:
        {
          stem:
            quNum() +
            "Which pending proposals do you see in the list of pending proposals in the sidebar?",
          answers: ["b"],
          choices: {
            a: "All pending proposals",
            b: "Only pending proposals in the community corresponding to your chosen default tag",
            c: "Only pending proposals in the communities other than the one corresponding to your chosen default tag",
          },
        },
      What_is_the_weekly_leaderboard: {
        stem: quNum() + "What is the weekly leaderboard?",
        answers: ["a"],
        choices: {
          a: "Rankings of all contributors of the week in your community",
          b: "Rankings of all contributors across the platform",
          c: "Rankings of all contributors",
        },
      },
      What_is_the_all_time_leaderboard: {
        stem: quNum() + "What is the all-time leaderboard?",
        answers: ["c"],
        choices: {
          a: "Top contributors across the platform",
          b: "All contributors",
          c: "Top contributors in your community",
        },
      },
    },
  },
  Introduction_Changing_Your_Profile_Picture: {
    title: newSec() + "1Cademy Introduction: Changing Your Profile Picture",
    description:
      "We highly encourage you to upload your profile picture by following the procedure in this video.",
    video: "oRv8CEjF1Bw",
    questions: {
      Which_choices_are_true_regarding_your_profile_picture_on_1Cademy: {
        stem:
          quNum() +
          "Which choices are true regarding your profile picture on 1Cademy?",
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
    title:
      newSec() +
      "1Cademy Introduction: Bookmarking and Marking Nodes as Studied",
    description:
      "This video goes over how to bookmark nodes and how to mark nodes as studied.",
    video: "ohhJvJ0yhqs",
    questions: {
      Which_icon_at_the_node_footer_should_you_click_to_mark_a_node_as_studied:
        {
          stem:
            quNum() +
            "Which icon in the node footer should you click to mark a node as studied?",
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
        stem:
          quNum() +
          "After marking a node as studied, the border turns to which color?",
        answers: ["b"],
        choices: {
          a: "Red",
          b: "Yellow",
          c: "Green",
          d: "Blue",
        },
      },
      If_a_node_is_NOT_marked_as_studied_what_is_its_border_color: {
        stem:
          quNum() +
          "If a node is NOT marked as studied, what is its border color?",
        answers: ["a"],
        choices: {
          a: "Red",
          b: "Yellow",
          c: "Green",
          d: "Blue",
        },
      },
      If_a_node_is_marked_as_studied_but_someone_updates_the_node: {
        stem:
          quNum() +
          "If a node is marked as studied, but someone updates the node through a proposal, what is its border color?",
        answers: ["a"],
        choices: {
          a: "Red",
          b: "Yellow",
          c: "Green",
          d: "Blue",
        },
      },
      Which_icon_at_the_node_footer_should_you_click_to_bookmark_a_node: {
        stem:
          quNum() +
          "Which icon in the node footer should you click to bookmark a node to be notified of its updates?",
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
        stem:
          quNum() +
          "When do you see a bookmarked node in your bookmarked updates tab?",
        answers: ["c"],
        choices: {
          a: "When it is marked as studied",
          b: "When it is marked as not studied",
          c: "When it is marked as studied, but is updated through others' proposals",
        },
      },
    },
  },
  Introduction_Chatroom: {
    title: newSec() + "1Cademy Introduction: Chatroom",
    description: "In this video, we go over how to use the 1Cademy chatroom.",
    video: "BSmoSN4RTxk",
    questions: {
      What_kind_of_messages_can_be_sent_in_the_chatroom: {
        stem: quNum() + "What kind of messages can be sent in the chatroom?",
        answers: ["a", "c", "d"],
        choices: {
          a: "Text",
          b: "Video",
          c: "Node link",
          d: "Image (jpg, png, gif, svg)",
        },
      },
      Who_will_see_the_messages_your_send_in_1Cademy_chatroom: {
        stem:
          quNum() + "Who will see the messages you send in 1Cademy chatroom?",
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
        stem: quNum() + "How can you share the link to a node in the chatroom?",
        answers: ["b"],
        choices: {
          a: "Click the title of the node you want to share ⇨ Click the node button in the chatroom",
          b: "Click the node button in the chatroom ⇨ Click the title of the node you want to share",
          c: "You cannot share a node link in the chatroom",
          d: "Click the share button at the node footer",
        },
      },
    },
  },
  Introduction_Search_Engine: {
    title: newSec() + "1Cademy Introduction: Search Engine",
    description: "This video goes over how to use the search tool on 1Cademy.",
    video: "WRUld8vA3i4",
    questions: {
      How_do_you_search_within_all_community_tags: {
        stem: quNum() + "How do you search within all community tags?",
        answers: ["b"],
        choices: {
          a: 'Select the "All" option under "Tags"',
          b: "Unselect all tags",
          c: "Searching all tags is the default option",
        },
      },
      How_do_you_specify_the_node_type_while_using_the_search_engine: {
        stem:
          quNum() +
          "How do you specify the node type while using the search engine?",
        answers: ["a"],
        choices: {
          a: "Select node types you want in a dropdown menu",
          b: "Select node type through tagging",
          c: "Type in the node type you want to search",
        },
      },
    },
  },
  Introduction_Changing_Your_Default_Community_Tag: {
    title:
      newSec() + "1Cademy Introduction: Changing Your Default Community Tag",
    description:
      "Now, it is time for you to change your default tag. Please watch this video to help you change it to the correct community tag that you are a member of, otherwise you'll not receive points on the community leaderboard.",
    video: "D_2A4s__SfM",
    questions: {
      How_can_you_change_your_default_tag_on_1Cademy: {
        stem: (
          <div>
            <p>
              {quNum()} What is the correct order for changing your default tag
              on 1Cademy?
            </p>
            <ul>
              <li>
                <strong>Open Settings</strong>: open the user settings sidebar.
              </li>
              <li>
                <strong>Click the Node</strong>: click the node corresponding to
                your desired tag.
              </li>
              <li>
                <strong>Open the Node</strong>: if the node corresponding to
                your desired tag does not exist on your map view, open it.
              </li>
              <li>
                <strong>Click the Tag Button</strong>: click the default tag
                button.
              </li>
            </ul>
          </div>
        ),
        answers: ["c"],
        choices: {
          a: "Open Settings ⇨ Click the Node ⇨ Open the Node ⇨ Click the Tag Button",
          b: "Click the Tag Button ⇨ Open Settings ⇨ Click the Node ⇨ Open the Node",
          c: "Open the Node ⇨ Open Settings ⇨ Click the Tag Button ⇨ Click the Node",
          d: "Click the Node ⇨ Open the Node ⇨ Open Settings ⇨ Click the Tag Button",
        },
      },
      Have_you_changed_your_tag_to_the_correct_community: {
        stem: (
          <div>
            <p>{quNum()} Have you changed your tag to the correct community?</p>
            <p>
              Note that on top of this page, we asked you:{" "}
              <strong>
                Before moving forward, please create an account on{" "}
                <a href="https://1cademy.com/" target="_blank">
                  1Cademy web app
                </a>
                , which is different from the account you created before on this
                web app.
              </strong>{" "}
              After creating your account, please go through this tutorial to
              learn more about 1Cademy and how it works.
            </p>
          </div>
        ),
        answers: ["b"],
        choices: {
          a: "No",
          b: "Yes",
          c: "I'll change it later!",
        },
      },
    },
  },
  Nodes_Node_Header: {
    title: newSec() + "1Cademy Nodes: Node Header",
    description: "This video goes over the node header.",
    video: "m6qIjU4tpL4",
    questions: {
      What_functions_are_in_the_node_header: {
        stem: quNum() + "What functions are in the node header?",
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
    title: newSec() + "1Cademy Nodes: Node Footer",
    description: "This video goes over the node footer.",
    video: "mhj3OeF1iFQ",
    questions: {
      Which_icon_should_you_click_to_get_access_to_the_node_s_parent_and_child_links:
        {
          stem:
            quNum() +
            "Which icon should you click to get access to the node's parent and child links?",
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
            {quNum()}If your nodes overlap like this, which icon in the node
            footer can you click to fix them?
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
          stem:
            quNum() +
            "If you find a node helpful to your learning, what icon do you click to upvote it?",
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
          stem:
            quNum() +
            "If you find a node unhelpful and you'd like to vote to delete it, what icon do you click?",
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
    title: newSec() + "1Cademy Nodes: Node Body",
    description: "This video goes over the node body.",
    video: "pRK5SpjMPlI",
    questions: {
      What_components_does_the_node_body_contain: {
        stem: quNum() + "What components does the node body contain?",
        answers: ["a", "b"],
        choices: {
          a: "Title",
          b: "Content",
          c: "Header",
          d: "Footer",
        },
      },
      Both_the_node_title_and_content_should_be: {
        stem: quNum() + "Both the node title and content should be:",
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
    title: newSec() + "1Cademy Nodes: Types of Nodes",
    description: "This video goes over the types of nodes.",
    video: "UD9kCb9LKWU",
    questions: {
      Which_of_the_following_types_of_nodes_exist_on_1Cademy: {
        stem:
          quNum() + "Which of the following types of nodes exist on 1Cademy?",
        answers: ["a", "c", "d", "e", "f", "g"],
        choices: {
          a: 'A "Concept" node defines a concept.',
          b: 'A "Multimedia" node contains an image or video.',
          c: 'A "Relation" node explains relationships between multiple concepts.',
          d: 'A "Reference" node cites a reference.',
          e: 'A "Question" node asks a multiple-choice question.',
          f: 'An "Idea" node represents a new idea.',
          g: 'A "Code" node contains a code snippet in its content.',
        },
      },
    },
  },
  Nodes_Concept_Nodes: {
    title: newSec() + "1Cademy Nodes: Concept Nodes",
    description:
      "This video introduces the purpose of concept nodes on 1Cademy.",
    video: "stRxLxXVsGw",
    questions: {
      A_concept_node: {
        stem: quNum() + "A concept node:",
        answers: ["c"],
        choices: {
          a: "Displays multiple concepts and their definitions",
          b: "Compares concepts",
          c: "Displays a single concept and its definition",
        },
      },
      Which_of_the_following_icons_represent_a_concept_node: {
        stem:
          quNum() + "Which of the following icons represent a concept node?",
        answers: ["b"],
        choices: {
          a: <MenuBookIcon />,
          b: <LocalLibraryIcon />,
          c: <EmojiObjectsIcon />,
          d: <CodeIcon />,
          e: <HelpOutlineIcon />,
          f: <ShareIcon />,
        },
      },
    },
  },
  Nodes_Relation_Nodes_vs_Concept_Nodes: {
    title: newSec() + "1Cademy Nodes: Relation Nodes vs. Concept Nodes",
    description:
      "Understanding the difference between relation nodes and concept nodes can be difficult. Please watch this video to gain a deeper understanding of the differences between these two types of nodes.",
    video: "Z9TzJUuLj9A",
    questions: {
      A_relation_node____________topics_and_a_concept_node___________topics: {
        stem:
          quNum() +
          "A relation node __________ topics, and a concept node _________ topics.",
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
            {quNum()}Is the following node a relation node, or a concept node?
            <img src="/static/tutorial/RelationNode.jpg" width="100%" />
          </div>
        ),
        answers: ["b"],
        choices: {
          a: "Concept node because it is going over a single topic",
          b: "Relation node because it is comparing/discussing two topics",
          c: "Concept node because it is defining multiple topics",
          d: "Relation node because it has two parents",
        },
      },
      Concept_Is_the_following_node_a_relation_node_or_a_concept_node: {
        stem: (
          <div>
            {quNum()}Is the following node a relation node, or a concept node?
            <img src="/static/tutorial/ConceptNode.jpg" width="100%" />
          </div>
        ),
        answers: ["a"],
        choices: {
          a: "Concept node because it is going over a single topic",
          b: "Relation node because it is comparing/discussing two topics",
          c: "Concept node because it is defining multiple topics",
          d: "Relation node because it has two parents",
        },
      },
    },
    Which_of_the_following_icons_represent_a_relation_node: {
      stem: quNum() + "Which of the following icons represent a relation node?",
      answers: ["f"],
      choices: {
        a: <MenuBookIcon />,
        b: <LocalLibraryIcon />,
        c: <EmojiObjectsIcon />,
        d: <CodeIcon />,
        e: <HelpOutlineIcon />,
        f: <ShareIcon />,
      },
    },
  },
  Nodes_Code_Nodes: {
    title: newSec() + "1Cademy Nodes: Code Nodes",
    description:
      "This video goes over the purpose of code nodes on 1Cademy and how to create them.",
    video: "C0r6W2gC_Wc",
    questions: {
      What_languages_can_be_specified_in_code_nodes: {
        stem: quNum() + "What languages can be specified in code nodes?",
        answers: ["a", "c", "d", "e"],
        choices: {
          a: "JavaScript",
          b: "C++",
          c: "Python",
          d: "HTML",
          e: "R",
        },
      },
      Which_of_the_following_icons_represent_a_code_node: {
        stem: quNum() + "Which of the following icons represent a code node?",
        answers: ["d"],
        choices: {
          a: <MenuBookIcon />,
          b: <LocalLibraryIcon />,
          c: <EmojiObjectsIcon />,
          d: <CodeIcon />,
          e: <HelpOutlineIcon />,
          f: <ShareIcon />,
        },
      },
    },
  },
  Nodes_Reference_Nodes: {
    title: newSec() + "1Cademy Nodes: Reference Nodes",
    description: (
      <div>
        <p>This video introduces reference nodes on 1Cademy.</p>
        <p>
          <strong>Note:</strong> You cannot cite a book chapter, video section,
          or webpage in a reference node, instead you should cite the
          encompassing book, video, or website. You can cite the specific
          section of the reference when putting it in the context of a concept,
          relation, question, or code node.
        </p>
      </div>
    ),
    video: "2mFzBfEX9mE",
    questions: {
      What_format_of_citation_should_be_used_in_reference_nodes: {
        stem:
          quNum() +
          "What format of citation should be used in reference nodes?",
        answers: ["b"],
        choices: {
          a: "MLA",
          b: "APA",
          c: "Chicago",
          d: "AMA",
        },
      },
      Which_of_the_following_icons_represent_a_reference_node: {
        stem:
          quNum() + "Which of the following icons represent a reference node?",
        answers: ["a"],
        choices: {
          a: <MenuBookIcon />,
          b: <LocalLibraryIcon />,
          c: <EmojiObjectsIcon />,
          d: <CodeIcon />,
          e: <HelpOutlineIcon />,
          f: <ShareIcon />,
        },
      },
      Which_of_the_following_can_a_reference_node_represent: {
        stem:
          quNum() + "Which of the following can a reference node represent?",
        answers: ["a", "b", "c", "d", "f"],
        choices: {
          a: "Video (e.g YouTube)",
          b: "Book",
          c: "Scholarly article",
          d: "Audio",
          e: "Book chapter",
          f: "Website (which may include many webpages)",
          g: "Webpage (i.e., a specific page of a website)",
        },
      },
    },
  },
  Nodes_Idea_Nodes: {
    title: newSec() + "1Cademy Nodes: Idea Nodes",
    description: (
      <div>
        This video introduces "idea" nodes on 1Cademy. We can use this type of
        node to:
        <ul>
          <li>Explain one of our ideas to others in a consice way</li>
          <li>Relate our ideas to others' idea, concept, and relation nodes</li>
          <li>Organize our ideas</li>
        </ul>
      </div>
    ),
    video: "5dXSNS4npFk",
    questions: {
      For_what_purpose_should_we_propose_an_idea_node_on_1Cademy: {
        stem:
          quNum() +
          "For what purpose should we propose an idea node on 1Cademy?",
        answers: ["b", "c", "d"],
        choices: {
          a: "To enforce others to listen to our ideas",
          b: "To explain one of our ideas to others in a consice way",
          c: "To relate our ideas to others' idea, concept, and relation nodes",
          d: "To organize our ideas",
        },
      },
      Which_of_the_following_icons_represent_a_idea_node: {
        stem: quNum() + "Which of the following icons represent a idea node?",
        answers: ["c"],
        choices: {
          a: <MenuBookIcon />,
          b: <LocalLibraryIcon />,
          c: <EmojiObjectsIcon />,
          d: <CodeIcon />,
          e: <HelpOutlineIcon />,
          f: <ShareIcon />,
        },
      },
    },
  },
  Nodes_Question_Nodes: {
    title: newSec() + "1Cademy Nodes: Question Nodes",
    description: (
      <div>
        <p>This video introduces question nodes on 1Cademy.</p>
        <p>
          We propose multiple-choice questions as "Question" type nodes to test,
          and improve others' learning through testing them.
        </p>
        <p>
          We only propose multiple-choice questions about topics that we have
          already learned, and we'd like to help others learn them.
        </p>
      </div>
    ),
    video: "4lgJqIr1BJA",
    questions: {
      For_what_purpose_should_we_propose_a_question_node_on_1Cademy: {
        stem:
          quNum() +
          "For what purpose should we propose a question node on 1Cademy?",
        answers: ["c", "d"],
        choices: {
          a: "To ask others' help to solve our problems",
          b: "To ask experts solutions to difficult problems",
          c: "To design a multiple-choice question to test others' learning",
          d: "To design a multiple-choice question to improve others' learning",
        },
      },
      Which_of_the_following_icons_represent_a_question_node: {
        stem:
          quNum() + "Which of the following icons represent a question node?",
        answers: ["e"],
        choices: {
          a: <MenuBookIcon />,
          b: <LocalLibraryIcon />,
          c: <EmojiObjectsIcon />,
          d: <CodeIcon />,
          e: <HelpOutlineIcon />,
          f: <ShareIcon />,
        },
      },
    },
  },
  Proposal_System_Getting_Started_as_a_User: {
    title: newSec() + "1Cademy Proposal System: Getting Started as a User",
    description: (
      <div>
        Before going into the specifics of the proposal system, here is a brief
        video going over what your first steps as a user on 1Cademy may look
        like when you are proposing nodes.
        <strong>Note: </strong>{" "}
        <i>
          To propose a new reference node, first consult with your community
          leaders or a liaison librarian to figure out the right prerequisites
          for that new reference node.
        </i>
      </div>
    ),
    video: "jhFAmGAr2fU",
    questions: {
      What_should_your_first_step_be_as_a_new_user_on_1Cademy: {
        stem:
          quNum() + "What should your first step be as a new user on 1Cademy?",
        answers: ["a"],
        choices: {
          a: "Changing your default tag to reflect your community membership",
          b: "Adding nodes",
          c: "Upvoting nodes you find helpful",
        },
      },
      Which_of_these_steps_are_needed_to_link_a_concept_node_to_a_reference_node:
        {
          stem: (
            <div>
              {quNum()}Which of these steps are needed to link a concept node to
              a reference node?
              <ul>
                <li>
                  <strong>Find reference node</strong>: find your desired
                  reference node, or consult a liaison librarian to create it if
                  the reference node does not exist.
                </li>
                <li>
                  <strong>Click "Cite an existing reference"</strong>: click
                  "Cite an existing reference" button on the node that you are
                  proposing/improving.
                </li>
                <li>
                  <strong>Click reference node</strong>: click the reference
                  node that you want to cite.
                </li>
                <li>
                  <strong>Add pages/URL/timeslot</strong>: depending on the type
                  of the reference, add the corresponding chapter, page numbers,
                  webpage URL, or video/audio timeslot.
                </li>
                <li>
                  <strong>Click "Propose"</strong>: after finalizing everything,
                  you need to click the "Propose" button to submit your
                  proposal.
                </li>
              </ul>
            </div>
          ),
          answers: ["a"],
          choices: {
            a: 'Find reference node ⇨ Click "Cite an existing reference" ⇨ Click reference node ⇨ Add pages/URL/timeslot ⇨ Click "Propose"',
            b: 'Click "Cite an existing reference" ⇨ Find reference node ⇨ Click reference node ⇨ Add pages/URL/timeslot ⇨ Click "Propose"',
            c: 'Find reference node ⇨ Add pages/URL/timeslot ⇨ Click "Propose" ⇨ Click "Cite an existing reference" ⇨ Click reference node',
            d: 'Click reference node ⇨ Add pages/URL/timeslot ⇨ Find reference node ⇨ Click "Cite an existing reference" ⇨ Click "Propose"',
          },
        },
      How_can_one_figure_out_whether_a_node_they_want_to_propose_already_exists_on_the_map:
        {
          stem:
            quNum() +
            "How can one figure out whether a node they want to propose already exists on the map? (Hint: part of the answer is in the section where we explained the search engine.)",
          answers: ["a", "e"],
          choices: {
            a: "By navigating through the prerequisite nodes and their children to find the immediate prerequisite, and then seeing if the proposed information is already there.",
            b: "Asking the community leader.",
            c: "It is OK to add repetitive information on 1Cademy.",
            d: "Using Ctrl+F or (Command+F on MAC).",
            e: "Using 1Cademy search engine",
          },
        },
    },
  },
  Proposal_System_Prerequisite_Linking_on_1Cademy: {
    title:
      newSec() + "1Cademy Proposal System: Prerequisite Linking on 1Cademy",
    description:
      "This video defines prerequisite linking and how it is used on 1Cademy",
    video: "76MSksNQYN0",
    questions: {
      What_do_you_think_the_phrase_prerequisite_relation_means: {
        stem:
          quNum() +
          'What does the phrase "prerequisite link" mean? (Please select all that apply.)',
        answers: ["b", "e"],
        choices: {
          a: "A relation of parallel concepts in different disciplines",
          b: "A relation in which a certain knowledge is required to learn another piece of information",
          c: "An example from a source related to a certain topic",
          d: "A relation of two similar principles",
          e: "If you need to learn concept A to be able to learn concept B, there is a prerequisite link from A to B.",
        },
      },
      The_following_boxes_are_two_nodes_on_1Cademy_each_of_them_defining_a_concept:
        {
          stem: (
            <div>
              {quNum()}The following boxes are two nodes on 1Cademy, each of
              them defining a concept: "1Cademy" or "1Cademy's Goal." Which of
              these is the correct order of prerequisite linking? (Hint: try
              reading the content in the nodes if you are confused.)
              <img
                src="/static/tutorial/TwoPrerequisiteNodes.jpg"
                width="100%"
              />
            </div>
          ),
          answers: ["a"],
          choices: {
            a: "[ 1Cademy ] ⇨ [ 1Cademy's goal ]",
            b: "[ 1Cademy's goal ] ⇨ [ 1Cademy ]",
          },
        },
      You_want_to_teach_a_friend_about_how_to_use_exponents: {
        stem:
          quNum() +
          "You want to teach a friend about how to use exponents. How would you organize the prerequisite links for them? (Assume each node already has a definition.)",
        answers: ["b"],
        choices: {
          a: "[ Summation ] ⇨  [ Exponents ] ⇨ [ Multiplication ]",
          b: "[ Summation ] ⇨ [ Multiplication ] ⇨ [ Exponents ]",
          c: "[ Exponents ] ⇨ [ Multiplication ] ⇨ [ Summation ]",
          d: "[ Exponents ] ⇨ [ Summation ] ⇨ [ Multiplication ]",
        },
      },
      What_is_the_correct_prerequisite_linking_of_these_three_nodes: {
        stem: (
          <div>
            <div>
              {quNum()}What is the correct prerequisite linking of these three
              nodes? (Hint: try reading the node contents if you are confused.)
            </div>
            <img
              src="/static/tutorial/ThreePrerequisiteNodes.jpg"
              width="100%"
            />
          </div>
        ),
        answers: ["d"],
        choices: {
          a: "[ Problem ] ⇨ [ Group brainstorming ] ⇨ [ Problem solving ]",
          b: "[ Group brainstorming ] ⇨ [ Problem ] ⇨ [ Problem solving ]",
          c: "[ Problem solving ] ⇨ [ Problem ] ⇨ [ Group brainstorming ]",
          d: "[ Problem ] ⇨ [ Problem solving ] ⇨ [ Group brainstorming ]",
          e: "[ Group brainstorming ] ⇨ [ Problem solving ] ⇨ [ Problem ]",
        },
      },
    },
  },
  Proposal_System_Finding_the_Immediate_Prerequisite: {
    title:
      newSec() + "1Cademy Proposal System: Finding the Immediate Prerequisite",
    description:
      "This video goes over how to find the immediate prerequisite information when you want to add nodes to the 1Cademy map.",
    video: "2idtxBKxS08",
    questions: {
      When_can_a_node_be_defined_as_a_parent_node_on_1Cademy: {
        stem:
          quNum() + "When can a node be defined as a parent node on 1Cademy?",
        answers: ["a"],
        choices: {
          a: "When it contains direct (immediate) prerequisite information to the information you would like to add",
          b: "When it contains information a user needs to know to understand the information you would like to add",
          c: "When it contains unrelated information",
        },
      },
      What_is_an_ancestor_node: {
        stem: quNum() + "An ancestor node ...",
        answers: ["b"],
        choices: {
          a: "Contains direct (immediate) prerequisite information to the information you would like to add",
          b: "Contains direct or indirect information a user needs to know to understand the information you would like to add",
          c: "Contains unrelated information",
          // d: "Can be a parent node",
        },
      },
    },
  },
  Proposal_System_Demonstration_of_Finding_the_Immediate_Prerequisite: {
    title:
      newSec() +
      "1Cademy Proposal System: Demonstration of Finding the Immediate Prerequisite",
    description:
      "This video goes over the process a user might go through while trying to find an immediate prerequisite node.",
    video: "fc6varqBW4s",
    questions: {
      What_is_the_first_step_in_finding_a_parent_node_on_1Cademy: {
        stem:
          quNum() +
          "When proposing a new node, what is the first step to find a potential parent node?",
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
    title: newSec() + "1Cademy Proposal System: Proposals on 1Cademy",
    description:
      "Now that you are well versed in prerequisite and immediate prerequisite linking, it is time to learn about proposals on 1Cademy.",
    video: "9dKL7ojJvro",
    questions: {
      For_what_purposes_should_we_submit_a_proposal_on_1Cademy: {
        stem:
          quNum() +
          "For what purpose(s) should we submit a proposal on 1Cademy?",
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
    title:
      newSec() + "1Cademy Proposal System: Proposing a Child Node on 1Cademy",
    description:
      "This video gives an overview of the steps to proposing a child node on 1Cademy.",
    video: "bhMvCqXbvbg",
    questions: {
      How_many_steps_are_there_to_proposing_a_child_node_on_1Cademy: {
        stem:
          quNum() +
          "How many steps are there to proposing a child node on 1Cademy?",
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
    title: newSec() + "1Cademy Proposal System: Proposing an edit on 1Cademy",
    description:
      "This video goes over how to propose an edit to a node on 1Cademy.",
    video: "rb0-ZvYTavE",
    questions: {
      What_can_users_edit_in_a_node: {
        stem: quNum() + "What can users edit in a node?",
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
    title:
      newSec() +
      "1Cademy Proposal System: What Happens to Proposals on 1Cademy",
    description: (
      <div>
        <p>
          This video gives an overview of what happens after a node edit is
          proposed, how the pending proposals list works, and what happens when
          one up/down-votes nodes and proposals.
        </p>
        <p>
          <strong>Note:</strong>
          <ul>
            <li>
              Any proposed change to a node gets implemented as soon as it
              receives net-votes (number of upvotes minus downvotes) greater
              than or equal to half the net-votes that the corresponding node
              has received.
            </li>
            <li>
              If the number of down-votes on a node gets greater than its number
              of up-votes, the node will be deleted from the whole knowledge
              graph and no one will be able to retrieve it.
            </li>
          </ul>
        </p>
      </div>
    ),
    video: "KaKYHZgQ7aM",
    questions: {
      Can_a_node_be_downvoted_off_the_pending_proposals_list: {
        stem:
          quNum() +
          "Can a node be downvoted directly off the pending proposals list?",
        answers: ["b"],
        choices: {
          a: "Yes",
          b: "No",
        },
      },
      You_are_making_a_proposal_on_a_node_with_____________downvotes_and_____________upvotes:
        {
          stem:
            quNum() +
            "If you make a proposal on a node with ___________ and ___________, your proposal is accepted right away.",
          answers: ["a", "c", "d"],
          choices: {
            a: "0 downvotes; 2 upvotes",
            b: "3 downvotes; 6 upvotes",
            c: "8 downvotes; 9 upvotes",
            d: "0 downvotes; 0 upvotes",
            e: "0 downvotes; 3 upvotes",
          },
        },
      Which_of_the_following_combinations_of_upvotes_and_downvotes_will_result_in_2_net_votes:
        {
          stem:
            quNum() +
            "Which of the following combinations of upvotes and downvotes will result in 2 net votes?",
          answers: ["b"],
          choices: {
            a: "3 downvotes; 6 upvotes",
            b: "6 downvotes; 8 upvotes",
            c: "0 downvotes; 1 upvote",
          },
        },
      // When_will_a_proposal_appear_on_the_pending_proposals_list: {
      //   stem:
      //     quNum() +
      //     "When will a proposal appear on the pending proposals list?",
      //   answers: ["b"],
      //   choices: {
      //     a: "Anytime you make a proposal on a node",
      //     b: "When you make a proposal on a node with a netvote higher than 2",
      //     c: "When you make a proposal on a node with 2 votes",
      //   },
      // },
      What_steps_are_needed_to_evaluate_a_proposed_edit_to_a_node: {
        stem: (
          <div>
            {quNum()}Which choice shows the correct order of steps needed to
            evaluate a proposed edit to a node?
            <ol>
              <li>Select the pending proposal you would like to evaluate.</li>
              <li>
                Click the tags and citations icon to find pending proposals to a
                specific node.
              </li>
              <li>
                Click propose/evaluate versions of this node to see the pending
                proposals to a specific node.
              </li>
              <li>
                Click the pending list on the sidebar (for nodes in your
                community).
              </li>
              <li>
                Click notifications in the side bar to view proposed edits to
                nodes.
              </li>
              <li>
                Click on a proposal in the pending list to open a specific node
                with a proposed edit.
              </li>
            </ol>
          </div>
        ),
        answers: ["b"],
        choices: {
          a: "2 ⇨ 6 ⇨ 3 ⇨ 4",
          b: "4 ⇨ 6 ⇨ 3 ⇨ 1",
          c: "6 ⇨ 1 ⇨ 3 ⇨ 5",
          d: "1 ⇨ 2 ⇨ 4 ⇨ 6",
        },
      },
      What_happens_to_a_node_with_more_downvotes_than_upvotes: {
        stem:
          quNum() +
          "What happens to a node with more downvotes than upvotes? HINT: A node is different from a proposal.",
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
    title: newSec() + "1Cademy Proposal System: Summarizing a Paper on 1Cademy",
    description: (
      <div>
        <p>
          This video gives an overview of how to summarize papers on 1Cademy.
        </p>
        <p>
          Our communities care a lot about the integrity of the knowledge shared
          on 1Cademy. For this purpose, in addition to the community leaders who
          supervise your contributions to 1Cademy, we have a dedicated community
          of liaison librarians who supervise all communities to ensure cohesion
          of the content across 1Cademy communities. If you're not sure about
          the credibility of the sources that you'd like to summarize, please do
          one of the followings:
        </p>
        <ul>
          <li>
            Ask the 1Cademy liaison librarians working with your community.
          </li>
          <li>Ask your 1Cademy community leader(s).</li>
          <li>Discuss in your community weekly meetings.</li>
        </ul>
      </div>
    ),
    video: "zrVh93YXHfY",
    questions: {
      When_summarizing_a_research_paper_should_you_propose_nodes_about_each_section_in_the_paper:
        {
          stem:
            quNum() +
            "When summarizing a research paper, should you propose nodes about each section in the paper?",
          answers: ["b"],
          choices: {
            a: "Yes",
            b: "No",
          },
        },
      Is_it_okay_to_duplicate_content_on_the_knowledge_graph: {
        stem:
          quNum() + "Is it okay to duplicate content on the knowledge graph?",
        answers: ["b"],
        choices: {
          a: "Yes",
          b: "No",
        },
      },
      Is_it_okay_to_use_direct_quotes_when_summarizing_a_paper_on_1Cademy_s_knowledge_graph:
        {
          stem:
            quNum() +
            "Is it okay to block quote when summarizing a paper on 1Cademy?",
          answers: ["b"],
          choices: {
            a: "Yes.",
            b: "No. We should paraphrase it.",
          },
        },
      What_should_you_do_if_you_re_not_sure: {
        stem:
          quNum() +
          "What should you do if you're not sure whether a source is reputable to cite on 1Cademy?",
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
  Congratulations: {
    title: "Congratulations!",
    description: <div>You successfully completed the 1Cademy tutorial.</div>,
    video: "",
    questions: {},
  },
};
