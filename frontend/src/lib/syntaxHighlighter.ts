import type {} from "react-syntax-highlighter";
// Shared syntax-highlighter setup used by chat, interview coding, and
// feedback views.
//
// The three call sites that need code highlighting previously each did
// `import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'`,
// which pulls in Prism's full ~100-language bundle for every one of them.
// That's what produced an 888 KB (304 KB gzipped) single chunk in the
// production build ("vsc-dark-plus" chunk) -- for a feature that only ever
// renders a couple dozen common languages coming out of AI-generated
// content or interview answers.
//
// `prism-light` + `registerLanguage` only bundles the languages listed
// below, cutting that chunk by roughly 90%. If a language shows up that
// isn't registered here, the block still renders (just without syntax
// coloring) -- it fails soft, not hard.
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";

import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import kotlin from "react-syntax-highlighter/dist/esm/languages/prism/kotlin";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import php from "react-syntax-highlighter/dist/esm/languages/prism/php";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import ruby from "react-syntax-highlighter/dist/esm/languages/prism/ruby";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import swift from "react-syntax-highlighter/dist/esm/languages/prism/swift";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";

const registrations: Array<[string, unknown]> = [
  ["bash", bash],
  ["sh", bash],
  ["shell", bash],
  ["c", c],
  ["cpp", cpp],
  ["c++", cpp],
  ["csharp", csharp],
  ["cs", csharp],
  ["css", css],
  ["go", go],
  ["golang", go],
  ["java", java],
  ["javascript", javascript],
  ["js", javascript],
  ["json", json],
  ["jsx", jsx],
  ["kotlin", kotlin],
  ["markdown", markdown],
  ["md", markdown],
  ["markup", markup],
  ["html", markup],
  ["xml", markup],
  ["php", php],
  ["python", python],
  ["py", python],
  ["ruby", ruby],
  ["rb", ruby],
  ["rust", rust],
  ["rs", rust],
  ["sql", sql],
  ["swift", swift],
  ["tsx", tsx],
  ["typescript", typescript],
  ["ts", typescript],
  ["yaml", yaml],
  ["yml", yaml],
];

for (const [name, lang] of registrations) {
  SyntaxHighlighter.registerLanguage(name, lang as never);
}

export default SyntaxHighlighter;
