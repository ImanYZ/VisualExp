export enum NodeTypes {
  "Relation",
  "Concept",
  "Code",
}

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
  tags?: string[];
  createdAt?: string;
  referenceIds?: string[];
  referenceLabels?: string[];
  contribNames?: string[];
  aImgUrl?: string;
  institNames?: string[];
  deleted?: boolean;
  aChooseUname?: boolean;
  nodeType?: string;
  references?: string[];
  wrongs?: number;
  viewers?: number;
  closedHeight?: number;
  title?: string;
  height?: number;
};
