import stem from 'wink-porter2-stemmer';
import tokenizer from 'wink-tokenizer';
import stopword from 'stopword';

const myTokenizer = tokenizer();

export const tokenize = str => {
  let tokens = [];
  if (str) {
    const tokenized = myTokenizer.tokenize(str);
    for (const w of tokenized) {
      if (w.tag === 'word' && w.value.length > 1) {
        tokens.push(stem(w.value));
      }
    }
    tokens = stopword.removeStopwords(tokens);
  }
  return tokens;
};

const wordCountMap = tokens => {
  const wordCount = {};
  for (const w of tokens) {
    wordCount[w] = (wordCount[w] || 0) + 1;
  }
  return wordCount;
};

const addWordsToDictionary = (wordCountmap, dict) => {
  for (const key in wordCountmap) {
    dict[key] = true;
  }
};

const wordMapToVector = (map, dict) => {
  const wordCountVector = [];
  for (const term in dict) {
    wordCountVector.push(map[term] || 0);
  }
  return wordCountVector;
};

const dotProduct = (vecA, vecB) => {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
};

const magnitude = vec => {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
};

export const cosineSimilarity = (vecA, vecB) =>
  dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));

export const textCosineSimilarity = (tokensA, tokensB) => {
  const wordCountA = wordCountMap(tokensA);
  const wordCountB = wordCountMap(tokensB);
  const dict = {};
  addWordsToDictionary(wordCountA, dict);
  addWordsToDictionary(wordCountB, dict);
  const vectorA = wordMapToVector(wordCountA, dict);
  const vectorB = wordMapToVector(wordCountB, dict);
  return cosineSimilarity(vectorA, vectorB);
};
