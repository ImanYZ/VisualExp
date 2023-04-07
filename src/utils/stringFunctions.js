export function capitalizeFirstLetter(str) {
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return capitalized;
}
export const capitalizeString = str => {
  return str
    .split(" ")
    .map(cur => capitalizeFirstLetter(cur))
    .join(" ");
};
