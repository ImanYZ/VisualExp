import { toOrdinal } from "number-to-words";

const isEmail = email => {
  const regEx =
    // eslint-disable-next-line
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const formatPoints = (point = 0) => point.toFixed(2).replace(/\.0+$/, "");

const isValidHttpUrl = string => {
  let url;
  try {
    url = new URL(string);
    if (string.includes(" ")) {
      return false;
    }
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
};

const getFullname = (firstname, lastname) => {
  return (firstname + " " + lastname).replace(".", "").replace("__", " ").replace("/", " ");
};

const sortedIndex = (array, value) => {
  let low = 0,
    high = array.length;

  while (low < high) {
    const mid = (low + high) >>> 1;
    if (array[mid] < value) low = mid + 1;
    else high = mid;
  }
  return low;
};

const shuffleArray = array => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

export { isEmail, formatPoints, isValidHttpUrl, uuidv4, getFullname, sortedIndex, shuffleArray };
