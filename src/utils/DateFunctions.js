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
