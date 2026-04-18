import katex from "katex";

const INLINE_MATH_PATTERN = /(\$\$[^$]+\$\$|\$[^$]+\$)/g;

function renderMathExpression(source: string, displayMode: boolean): string {
  try {
    return katex.renderToString(source, {
      throwOnError: false,
      displayMode,
      strict: "ignore",
    });
  } catch {
    return source;
  }
}

export function MathText(props: { text: string; className?: string; as?: keyof JSX.IntrinsicElements }) {
  const { text, className, as = "span" } = props;
  const Tag = as;
  const segments = text.split(INLINE_MATH_PATTERN).filter(Boolean);

  return (
    <Tag className={className}>
      {segments.map((segment, index) => {
        if (segment.startsWith("$$") && segment.endsWith("$$")) {
          const expr = segment.slice(2, -2);
          return (
            <span
              key={`${segment}-${index}`}
              className="math-block"
              dangerouslySetInnerHTML={{ __html: renderMathExpression(expr, true) }}
            />
          );
        }

        if (segment.startsWith("$") && segment.endsWith("$")) {
          const expr = segment.slice(1, -1);
          return (
            <span
              key={`${segment}-${index}`}
              className="math-inline"
              dangerouslySetInnerHTML={{ __html: renderMathExpression(expr, false) }}
            />
          );
        }

        return <span key={`${segment}-${index}`}>{segment}</span>;
      })}
    </Tag>
  );
}
