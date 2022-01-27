/** Create an alphanumeric representation of a string, replacing accented characters with plain ones */
export function slugify(str: string | number): string {
  const a = "àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ";
  const b = "aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh";
  const p = new RegExp(a.split("").join("|"), "g");
  return String(str)
    .trim()
    .toLowerCase()
    .replace(p, (c: string) => b.charAt(a.indexOf(c))) // Replace special chars with normalized versions
    .replace(/[^a-z0-9]/g, "-") // replace non-alphanumeric characters with a hyphen
    .replace(/\-+/g, "-"); // Replace multiple dashes with a single one
}

/** Get the first string that is between parenthesis */
export const getStringBetweenParenthesis = (str: string | number) => {
  const match = String(str).match(/\((.*?)\)/);
  if (match) return match[1];
  return "";
};

export const getStringOutsideParenthesis = (str: string | number) => {
  return String(str).replace(/\(.*?\)/, "");
};

/** Only keep alphanumeric, accented characters (diacritics) and dashes */
export function getStringWithAlphanumericLike(str: string | number) {
  return String(str)
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9\s\-]/g, "")
    .replace(/\s+/g, " ");
}
