export const isValidHttpUrl = string => {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};

export const escapeBreaksQuotes = text => {
  return text.replace(/(?:\r\n|\r|\n)/g, "<br>").replace(/['"]/g, "");
};

export const encodeTitle = title => {
  return encodeURI(escapeBreaksQuotes(title)).replace(/[&\/\?\\]/g, "");
};
