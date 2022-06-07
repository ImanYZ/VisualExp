import { Timestamp } from "firebase-admin/firestore";

export enum NodeType {
  "Relation" = "Relation",
  "Concept" = "Concept",
  "Code" = "Code",
  "Reference" = "Reference",
  "Idea" = "Idea",
  "Question" = "Question",
  "Profile" = "Profile",
  "Sequel" = "Sequel",
  "Advertisement" = "Advertisement",
  "News" = "News",
  "Private" = "Private",
  "Tag" = "Tag"
}

export type KnowledgeNodeContributor = {
  fullname?: string;
  reputation?: number;
  chooseUname?: boolean;
  imageUrl?: string;
  username?: string;
};

export type KnowledgeNodeInstitution = {
  reputation?: number;
  logoURL?: string;
  name?: string;
};

export type LinkedKnowledgeNode = {
  label?: string;
  node: string;
  title?: string;
  content?: string;
  nodeImage?: string;
  nodeType: NodeType;
};

export type KnowledgeChoice = {
  choice: string;
  correct: boolean;
  feedback: string;
};

export type NodeFireStore = {
  aChooseUname?: boolean;
  aFullname?: string;
  aImgUrl?: string;
  admin?: string;
  bookmarks?: number;
  changedAt: Timestamp;
  children?: { node?: string; label?: string; title?: string }[];
  closedHeight?: number;
  comments?: number;
  content?: string;
  contribNames?: string[];
  contributors?: {
    [key: string]: {
      chooseUname?: boolean;
      fullname?: string;
      imageUrl?: string;
      reputation?: number;
    };
  };
  corrects?: number;
  createdAt?: Timestamp;
  deleted?: boolean;
  height?: number;
  institNames?: string[];
  institutions?: {
    [key: string]: { reputation?: number };
  };
  isTag?: boolean;
  maxVersionRating?: number;
  nodeImage?: string;
  nodeType: NodeType;
  parents?: { node?: string; label?: string; title?: string }[];
  referenceIds?: string[];
  referenceLabels?: string[];
  references?: string[] | { node: string; title?: string; label?: string }[];
  studied?: number;
  tagIds?: string[];
  tags?: string[] | { node: string; title?: string; label?: string }[];
  title?: string;
  updatedAt: Timestamp;
  versions?: number;
  viewers?: number;
  wrongs?: number;
};

export type KnowledgeNode = Omit<
  NodeFireStore,
  "updatedAt" | "changedAt" | "createdAt" | "contributors" | "institutions" | "tags" | "parents"
> & {
  id: string;
  updatedAt?: string;
  nodeImage?: string;
  changedAt?: string;
  tags?: LinkedKnowledgeNode[];
  createdAt?: string;
  choices?: KnowledgeChoice[];
  references?: LinkedKnowledgeNode[];
  contributors?: KnowledgeNodeContributor[];
  institutions?: KnowledgeNodeInstitution[];
  children?: LinkedKnowledgeNode[];
  parents?: LinkedKnowledgeNode[];
};

export type SimpleNode = {
  id: string;
  title?: string;
  changedAt?: string;
  content?: string;
  nodeType: NodeType;
  nodeImage?: string;
  // updatedAt?: string;
  corrects?: number;
  wrongs?: number;
  tags: string[];
  contributors: { fullName: string; imageUrl: string }[];
  institutions: { name: string }[];
};

export type ResponseAutocompleteTags = {
  results?: string[];
  errorMessage?: string;
};

// export type TypesenseNodesSchema = {
//   id: string;
//   title: string;
//   changedAt: string;
//   changedAtMillis: number;
//   updatedAt: number;
//   corrects: number;
//   content: string;
//   // contributors: string[];
//   // institutions: string[];
//   contributors: { fullName: string; imageUrl: string }[];
//   institutions: { name: string }[];
//   nodeType: NodeType;
//   nodeImage?: string;
//   tags: string[];
//   wrongs: number;
// };

export type TypesenseNodesSchema = {
  changedAt: string;
  changedAtMillis: number; // typesense
  content: string; // typesense
  contributors: { fullName: string; imageUrl: string }[];
  contributorsNames: string[]; // typesense
  corrects: number; // typesense
  id: string;
  institutions: { name: string }[];
  institutionsNames: string[]; // typesense
  nodeImage?: string;
  nodeType: NodeType; // typesense
  tags: string[]; // typesense
  title: string; // typesense
  updatedAt: number;
  wrongs: number;
};

export type ResponseAutocompleteFilter = {
  results?: FilterValue[];
  errorMessage?: string;
};

export enum TimeWindowOption {
  "ThisWeek" = "This Week",
  "ThisMonth" = "This Month",
  "ThisYear" = "This Year"
}

export enum SortTypeWindowOption {
  "MOST_RECENT" = "MOST_RECENT",
  "UPVOTES_DOWNVOTES" = "UPVOTES_DOWNVOTES",
  "NONE" = "NONE"
}

export type FilterValue = {
  id: string;
  name: string;
  imageUrl?: string | undefined;
};
