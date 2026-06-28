import React, { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from '../ui/button';
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Highlight, themes } from "prism-react-renderer";

const slugify = (value = "lesson") => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const PDFCodeBlock = ({ block }: { block: any }) => {
  const code = block.code || (block.codes ? Object.values(block.codes).find(Boolean) : "");
  const lang = block.language || "text";

  return (
    <div style={{ pageBreakInside: "avoid", marginBottom: "16px", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", backgroundColor: "#ffffff" }}>
      <div style={{ backgroundColor: "#f8fafc", padding: "6px 12px", borderBottom: "1px solid #e2e8f0", fontFamily: "monospace", fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>
        {lang}
      </div>
      <Highlight theme={themes.github} code={code as string} language={lang as any}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className} style={{ ...style, padding: "12px", margin: 0, fontSize: "12px", whiteSpace: "pre-wrap", backgroundColor: "#ffffff" }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

const PDFMarkdown = ({ text }: { text: string }) => (
  <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#334155", marginBottom: "16px", pageBreakInside: "auto" }}>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
  </div>
);

const PDFDocument = ({ lesson }: { lesson: any }) => {
  const title = lesson.title || "Lesson";
  const description = lesson.description || "";
  const objectives = Array.isArray(lesson.objectives) ? lesson.objectives : [];
  const content = Array.isArray(lesson.content) ? lesson.content : [];

  return (
    <div style={{ color: "#0f172a", fontFamily: "Inter, Arial, sans-serif", lineHeight: "1.55", padding: "0 10px" }}>
      <style>{`
        .markdown-content p { margin: 0 0 12px 0; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { page-break-after: avoid; color: #0f172a; margin-top: 24px; margin-bottom: 12px; }
        .markdown-content ul, .markdown-content ol { margin-top: 0; margin-bottom: 16px; padding-left: 24px; }
        .markdown-content li { margin-bottom: 6px; }
        .markdown-content blockquote { border-left: 4px solid #cbd5e1; margin: 0 0 16px; padding-left: 16px; color: #475569; }
        .markdown-content table { width: 100%; border-collapse: collapse; margin-bottom: 16px; page-break-inside: avoid; }
        .markdown-content th, .markdown-content td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
        .markdown-content th { background-color: #f8fafc; }
        .markdown-content code { background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #c53030; }
      `}</style>
      
      <h1 style={{ fontSize: "28px", margin: "0 0 12px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px", pageBreakAfter: "avoid" }}>{title}</h1>
      
      {description && <p style={{ color: "#475569", fontSize: "15px", marginBottom: "20px" }}>{description}</p>}
      
      {objectives.length > 0 && (
        <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", marginBottom: "24px", pageBreakInside: "avoid" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: "16px" }}>Objectives</h3>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px" }}>
            {objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="markdown-content">
        {content.map((block, index) => {
          if (!block) return null;

          switch (block.type) {
            case "heading": {
              const Tag = block.level === 3 ? "h3" : "h2";
              return <Tag key={index} style={{ pageBreakAfter: "avoid" }}>{block.text}</Tag>;
            }
            case "paragraph":
            case "text":
              return <PDFMarkdown key={index} text={block.text} />;
            case "code":
              return <PDFCodeBlock key={index} block={block} />;
            case "video":
              return (
                <div key={index} style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", marginBottom: "16px", pageBreakInside: "avoid" }}>
                  <strong style={{ display: "block", marginBottom: "8px", color: "#334155" }}>Suggested Video Search:</strong>
                  <p style={{ margin: 0, color: "#64748b" }}>{block.query}</p>
                </div>
              );
            case "callout":
              return (
                <div key={index} style={{ backgroundColor: "#f0f9ff", borderLeft: "4px solid #0ea5e9", padding: "16px", margin: "16px 0", pageBreakInside: "avoid" }}>
                  <h4 style={{ margin: "0 0 8px", color: "#0369a1", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{block.emoji || "💡"}</span>
                    {block.title || "Note"}
                  </h4>
                  <p style={{ margin: 0, color: "#0c4a6e", fontSize: "14px", lineHeight: "1.6" }}>{block.text}</p>
                </div>
              );
            case "list": {
              const isNumbered = block.style === "numbered";
              const ListTag = isNumbered ? "ol" : "ul";
              return (
                <ListTag key={index} style={{ marginBottom: "16px", paddingLeft: "24px", fontSize: "14px", lineHeight: "1.6" }}>
                  {(block.items || []).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ListTag>
              );
            }
            case "mcq":
            case "quiz": {
              // Exclude interactive quiz blocks from the main reading document or format them nicely
              const questions = block.type === "quiz" ? block.questions : [block];
              if (!questions || questions.length === 0) return null;
              
              return (
                <div key={index} style={{ marginTop: "24px", borderTop: "2px solid #e2e8f0", paddingTop: "20px" }}>
                  <h2 style={{ margin: "0 0 16px", pageBreakAfter: "avoid" }}>{block.title || "Knowledge Check"}</h2>
                  {questions.map((q: any, qIdx: number) => {
                    const answerText = typeof q.answer === "number" ? q.options?.[q.answer] : (q.answer || (typeof q.correctAnswer === "number" ? q.options?.[q.correctAnswer] : ""));
                    
                    return (
                      <div key={qIdx} style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", marginBottom: "16px", pageBreakInside: "avoid" }}>
                        <h3 style={{ margin: "0 0 12px", fontSize: "15px" }}>Question {qIdx + 1}: {q.question}</h3>
                        <ul style={{ margin: "0 0 12px", paddingLeft: "20px", fontSize: "14px" }}>
                          {(q.options || []).map((opt: string, optIdx: number) => (
                            <li key={optIdx}>{opt}</li>
                          ))}
                        </ul>
                        {answerText && <p style={{ margin: "0 0 8px", fontSize: "14px" }}><strong>Correct Answer:</strong> {answerText}</p>}
                        {q.explanation && <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}><strong>Explanation:</strong> {q.explanation}</p>}
                      </div>
                    );
                  })}
                </div>
              );
            }
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

const LessonPDFExporter = React.memo(({ lesson, courseTitle = "Course" }: any) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!lesson) return;

    try {
      setDownloading(true);

      const title = lesson.title || "Lesson";
      const pdfElement = document.createElement("div");

      // Generate the static HTML using React server rendering
      const htmlContent = renderToStaticMarkup(<PDFDocument lesson={lesson} />);
      pdfElement.innerHTML = htmlContent;

      const options = {
        margin: [0.8, 0.5, 0.8, 0.5], // top, left, bottom, right in inches
        filename: `${slugify(title)}.pdf`,
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: { mode: ["css", "legacy"] },
      };

      const { default: html2pdf } = await import("html2pdf.js");
      
      await html2pdf()
        .set(options)
        .from(pdfElement)
        .toPdf()
        .get("pdf")
        .then((pdf: any) => {
          const totalPages = pdf.internal.getNumberOfPages();
          const dateStr = new Date().toLocaleDateString();
          
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(9);
            pdf.setTextColor(100);
            
            // Header
            pdf.text(title, 0.5, 0.4);
            pdf.text(dateStr, pdf.internal.pageSize.getWidth() - 0.5, 0.4, { align: "right" });
            
            // Footer
            pdf.text(`Page ${i} of ${totalPages}`, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 0.4, { align: "center" });
            
            // Add a subtle header line
            pdf.setDrawColor(226, 232, 240); // slate-200
            pdf.setLineWidth(0.01);
            pdf.line(0.5, 0.5, pdf.internal.pageSize.getWidth() - 0.5, 0.5);
          }
        })
        .save();
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleDownloadPDF}
      disabled={downloading || !lesson}
      variant="secondary"
    >
      <Printer className="h-4 w-4 mr-2" />
      {downloading ? "Preparing PDF..." : "Export to PDF"}
    </Button>
  );
});

export default LessonPDFExporter;
