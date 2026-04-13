import { useEffect, useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

function MermaidBlock({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
    });

    mermaid
      .render(`mermaid-${id}`, chart)
      .then(({ svg: rendered }) => {
        if (!cancelled) {
          setSvg(rendered);
          setError("");
        }
      })
      .catch((renderError) => {
        if (!cancelled) {
          setSvg("");
          setError(renderError instanceof Error ? renderError.message : "Mermaid 渲染失败");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        <p className="mb-2 font-medium">Mermaid 渲染失败</p>
        <pre className="overflow-x-auto whitespace-pre-wrap text-xs">{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        正在生成图示...
      </div>
    );
  }

  return <div className="overflow-x-auto rounded-2xl bg-white p-4" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function MarkdownRenderer({ content, className = "" }: { content: string; className?: string }) {
  return (
    <div className={`prose prose-slate max-w-none prose-headings:mb-3 prose-p:leading-7 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const value = String(children).replace(/\n$/, "");

            if (match?.[1] === "mermaid") {
              return <MermaidBlock chart={value} />;
            }

            return (
              <code
                className={`${codeClassName || ""} rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] text-slate-700`}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-slate-100">{children}</pre>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
