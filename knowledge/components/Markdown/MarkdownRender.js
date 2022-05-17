import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import { BlockMath, InlineMath } from "react-katex";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import "katex/dist/katex.min.css";

function MarkdownRender(props) {
  const newProps = {
    ...props,
    linkTarget: "_blank",
    escapeHtml: false,
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    components: {
      math: ({ value }) => <BlockMath>{value}</BlockMath>,
      inlineMath: ({ value }) => <InlineMath>{value}</InlineMath>,
      code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "");
        return !inline && match ? (
          <SyntaxHighlighter
            children={String(children).replace(/\n$/, "")}
            style={darcula}
            language={match[1]}
            PreTag="div"
            {...props}
          />
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    },
  };
  return <ReactMarkdown {...newProps} />;
}

export default MarkdownRender;
