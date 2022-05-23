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
}

export type KnowledgeNodeContributor = {
  fullname?: string;
  reputation?: number;
  chooseUname?: boolean;
  imageUrl?: string;
};

export type KnowledgeNodeInstitutions = {
  reputation?: number;
  logoURL?: string;
  name?: string;
};

export type LinkedKnowledgeNode = {
  label?: string;
  node?: string;
  title?: string;
  content?: string;
  nodeImage?: string;
  nodeType?: NodeType;
};

export type KnowledgeNode = {
  id: string;
  studied?: number;
  versions?: number;
  maxVersionRating?: number;
  content?: string;
  admin?: string;
  corrects?: number;
  comments?: number;
  aFullname?: string;
  tagIds?: string[];
  updatedAt?: string;
  nodeImage?: string;
  changedAt?: string;
  tags?: LinkedKnowledgeNode[];
  createdAt?: string;
  referenceIds?: string[];
  referenceLabels?: string[];
  contribNames?: string[];
  aImgUrl?: string;
  institNames?: string[];
  deleted?: boolean;
  aChooseUname?: boolean;
  nodeType?: NodeType;
  references?: LinkedKnowledgeNode[];
  wrongs?: number;
  viewers?: number;
  closedHeight?: number;
  title?: string;
  height?: number;
  contributors?: KnowledgeNodeContributor[];
  institutions?: KnowledgeNodeInstitutions[];
  children?: LinkedKnowledgeNode[];
  parents?: LinkedKnowledgeNode[];
};
