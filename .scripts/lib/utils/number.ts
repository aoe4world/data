/** Round a number to x decimals */
export function round(number: number, decimals: number) {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
