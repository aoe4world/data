
// Captures the code file and location for error reporting
export function captureCallContext(stackOffset: number, lineOffset?: number) {
  let context = new Error()?.stack?.trim().split("\n")?.at(stackOffset+2)?.replace(/\s+at\s+.+?\s+\((.*?)\)/mg, "$1") || "";

  if (lineOffset) {
    context = context.replace(/(:)(\d+):\d+$/m, (s, a, b, c) => a + (parseInt(b) + lineOffset).toString());
  }

  return context;
}
