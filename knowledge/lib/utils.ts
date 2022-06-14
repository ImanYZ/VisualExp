import slugify from "slugify";

import { TimeWindowOption } from "../src/knowledgeTypes";

export const isValidHttpUrl = (possibleUrl?: string) => {
  let url;
  if (!possibleUrl) {
    return false;
  }

  try {
    url = new URL(possibleUrl);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};

export const escapeBreaksQuotes = (text?: string) => {
  if (!text) {
    return "";
  }
  return text.replace(/(?:\r\n|\r|\n)/g, "<br>").replace(/['"]/g, "");
};

export const encodeTitle = (title?: string) => {
  return encodeURI(escapeBreaksQuotes(title)).replace(/[&\/\?\\]/g, "");
};

export const getQueryParameter = (val: string | string[] | undefined) => {
  if (Array.isArray(val)) {
    return val[0];
  } else {
    return val;
  }
};

export const getQueryParameterAsNumber = (val: string | string[] | undefined): number | undefined => {
  const res = getQueryParameter(val);
  if (res === undefined || Number.isNaN(parseInt(res)) || !Number.isFinite(parseInt(res))) {
    return undefined;
  }

  return parseInt(res);
};

export const getQueryParameterAsBoolean = (val: string | string[] | undefined): boolean => {
  const res = getQueryParameter(val);
  if (res === undefined || val === "false") {
    return false;
  }

  return true;
};

export const SortedByTimeOptions: TimeWindowOption[] = [
  TimeWindowOption.AnyTime,
  TimeWindowOption.ThisWeek,
  TimeWindowOption.ThisMonth,
  TimeWindowOption.ThisYear
];

export const getNodePageURLTitle = (title: string | undefined, id: string) => {
  const resTitleSlug = slugify(title || "", { lower: true, remove: /[*+~.,$()\\'"!:@\r\n]/g });
  if (resTitleSlug.length === 0) {
    return id;
  }
  if (resTitleSlug.length > 100) {
    return resTitleSlug.substring(0, 100);
  }
  return resTitleSlug;
};

export const getNodePageUrl = (title: string, id: string) => {
  return `/${getNodePageURLTitle(title, id)}/${id}`;
};

export const homePageSortByDefaults = {
  upvotes: true,
  mostRecent: false,
  timeWindow: SortedByTimeOptions[0],
  perPage: 10
};
