export type Span = {
  start: number;
  end: number;
  line: number;
  col: number;
};

export function mergeSpan(a: Span, b: Span): Span {
  const start = Math.min(a.start, b.start);
  const end = Math.max(a.end, b.end);

  const startsWithA = a.start <= b.start;
  const first = startsWithA ? a : b;

  return { start, end, line: first.line, col: first.col };
}
