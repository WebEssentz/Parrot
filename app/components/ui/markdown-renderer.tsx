// import React from 'react';
// import ReactMarkdown from 'react-markdown';
// import remarkMath from 'remark-math';
// import rehypeKatex from 'rehype-katex';
// import remarkGfm from 'remark-gfm';
// import rehypeRaw from 'rehype-raw';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { tomorrow as tomorrowStyle } from 'react-syntax-highlighter/dist/esm/styles/prism';

// interface MarkdownRendererProps {
//   content: string;
// }

// export function MarkdownRenderer({ content }: MarkdownRendererProps) {
//   return (
//     <ReactMarkdown
//       remarkPlugins={[remarkMath, remarkGfm]}
//       rehypePlugins={[rehypeKatex, rehypeRaw]}
//       components={{
//         code({ node, inline, className, children, ...props }) {
//           const match = /language-(\w+)/.exec(className || '');
//           return !inline && match ? (
//             <SyntaxHighlighter
//               style={tomorrowStyle}
//               language={match[1]}
//               PreTag="div"
//               className="rounded-md"
//               {...props}
//             >
//               {String(children).replace(/\n$/, '')}
//             </SyntaxHighlighter>
//           ) : (
//             <code className={className} {...props}>
//               {children}
//             </code>
//           )
//         },
//         // Custom table styling
//         table: ({ children }) => (
//           <div className="overflow-x-auto my-4">
//             <table className="min-w-full divide-y divide-border">
//               {children}
//             </table>
//           </div>
//         ),
//         // Custom heading styling
//         h1: ({ children }) => (
//           <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
//         ),
//         h2: ({ children }) => (
//           <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>
//         ),
//         h3: ({ children }) => (
//           <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
//         ),
//         // Blockquote styling
//         blockquote: ({ children }) => (
//           <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/50">
//             {children}
//           </blockquote>
//         ),
//         // Math display
//         math: ({ value }) => (
//           <div className="py-2 overflow-x-auto">
//             <span className="katex-display">{value}</span>
//           </div>
//         ),
//         inlineMath: ({ value }) => (
//           <span className="katex">{value}</span>
//         ),
//       }}
//     >
//       {content}
//     </ReactMarkdown>
//   );
// }