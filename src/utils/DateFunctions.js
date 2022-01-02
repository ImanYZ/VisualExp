export const isToday = (theDate) => {
  const now = new Date();
  return (
    theDate.getFullYear() === now.getFullYear() &&
    theDate.getMonth() === now.getMonth() &&
    theDate.getDate() === now.getDate()
  );
};

export const getISODateString = (dateObj) => {
  const theDay = dateObj.getDate();
  const theMonth = dateObj.getMonth() + 1;
  return (
    dateObj.getFullYear() +
    "-" +
    (theMonth < 10 ? "0" + theMonth : theMonth) +
    "-" +
    (theDay < 10 ? "0" + theDay : theDay)
  );
};

export const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};
