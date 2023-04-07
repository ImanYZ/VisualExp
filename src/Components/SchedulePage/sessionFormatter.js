const sessionFormatter = (start, minutes) => {
  return (
    " " +
    start.toLocaleDateString(navigator.language, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }) +
    ", " +
    start.toLocaleTimeString(navigator.language, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }) +
    " - " +
    new Date(start.getTime() + minutes * 60000).toLocaleTimeString(navigator.language, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })
  );
};

export default sessionFormatter;
