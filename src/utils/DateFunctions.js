export const isToday = (theDate) => {
  const now = new Date();
  return (
    theDate.getFullYear() === now.getFullYear() &&
    theDate.getMonth() === now.getMonth() &&
    theDate.getDate() === now.getDate()
  );
};
