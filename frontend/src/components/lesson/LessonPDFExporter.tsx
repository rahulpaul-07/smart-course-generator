import { useState } from "react";
import html2pdf from "html2pdf.js";
import { Printer } from "lucide-react";

const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const slugify = (value = "lesson") => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const renderBlockToHtml = (block, index) => {
  switch (block.type) {
    case "heading":
      return `<h2>${escapeHtml(block.text)}</h2>`;

    case "paragraph":
      return `<p>${escapeHtml(block.text)}</p>`;

    case "code":
      return `
        <pre>
          <code>${escapeHtml(block.text || block.code)}</code>
        </pre>
      `;

    case "video":
      return `
        <div class="pdf-video-box">
          <strong>Suggested Video Search:</strong>
          <p>${escapeHtml(block.query)}</p>
        </div>
      `;

    case "mcq": {
      const answerText =
        typeof block.answer === "number"
          ? block.options?.[block.answer]
          : block.answer;

      return `
        <div class="pdf-mcq-box">
          <h3>Question ${index + 1}</h3>
          <p>${escapeHtml(block.question)}</p>
          <ul>
            ${(block.options || [])
              .map((option) => `<li>${escapeHtml(option)}</li>`)
              .join("")}
          </ul>
          ${
            answerText
              ? `<p><strong>Answer:</strong> ${escapeHtml(answerText)}</p>`
              : ""
          }
          ${
            block.explanation
              ? `<p><strong>Explanation:</strong> ${escapeHtml(block.explanation)}</p>`
              : ""
          }
        </div>
      `;
    }

    case "quiz": {
      const questionsHtml = (block.questions || [])
        .map((q, qIdx) => `
          <div class="pdf-mcq-box" style="margin-top: 14px; page-break-inside: avoid;">
            <h3>Question ${qIdx + 1}: ${escapeHtml(q.question)}</h3>
            <ul>
              ${(q.options || [])
                .map((opt) => `<li>${escapeHtml(opt)}</li>`)
                .join("")}
            </ul>
            <p><strong>Correct Answer:</strong> Option ${(q.correctAnswer || 0) + 1} (${escapeHtml(q.options[q.correctAnswer])})</p>
            ${q.explanation ? `<p><strong>Explanation:</strong> ${escapeHtml(q.explanation)}</p>` : ""}
          </div>
        `).join("");
      return `
        <div style="margin-top: 24px; border-top: 2px solid #e2e8f0; padding-top: 14px;">
          <h2>${escapeHtml(block.title || "Knowledge Check")}</h2>
          ${questionsHtml}
        </div>
      `;
    }

    default:
      return "";
  }
};

const LessonPDFExporter = ({ lesson }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!lesson) return;

    try {
      setDownloading(true);

      const title = lesson.title || "Lesson";
      const description = lesson.description || "";
      const objectives = Array.isArray(lesson.objectives) ? lesson.objectives : [];
      const content = Array.isArray(lesson.content) ? lesson.content : [];

      const pdfElement = document.createElement("div");

      pdfElement.innerHTML = `
        <style>
          .lesson-pdf {
            color: #0f172a;
            font-family: Inter, Arial, sans-serif;
            line-height: 1.55;
            padding: 24px;
          }

          .lesson-pdf h1 {
            font-size: 28px;
            margin: 0 0 10px;
          }

          .lesson-pdf h2 {
            font-size: 20px;
            margin: 24px 0 8px;
          }

          .lesson-pdf h3 {
            font-size: 16px;
            margin: 0 0 8px;
          }

          .lesson-pdf p,
          .lesson-pdf li {
            font-size: 12px;
          }

          .pdf-description {
            color: #475569;
            margin-bottom: 16px;
          }

          .lesson-pdf pre {
            background: #0f172a;
            border-radius: 8px;
            color: #f8fafc;
            overflow-wrap: anywhere;
            padding: 14px;
            white-space: pre-wrap;
          }

          .pdf-video-box,
          .pdf-mcq-box,
          .pdf-objectives {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin: 14px 0;
            padding: 14px;
          }
        </style>
        <div class="lesson-pdf">
          <h1>${escapeHtml(title)}</h1>
          ${description ? `<p class="pdf-description">${escapeHtml(description)}</p>` : ""}
          ${
            objectives.length
              ? `<div class="pdf-objectives"><h3>Objectives</h3><ul>${objectives
                  .map((objective) => `<li>${escapeHtml(objective)}</li>`)
                  .join("")}</ul></div>`
              : ""
          }
          <hr />
          ${content.map(renderBlockToHtml).join("")}
        </div>
      `;

      const options = {
        margin: 0.5,
        filename: `${slugify(title)}.pdf`,
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait",
        },
      };

      await html2pdf().set(options).from(pdfElement).save();
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownloadPDF}
      disabled={downloading || !lesson}
      className="btn-secondary"
    >
      <Printer className="h-4 w-4" />
      {downloading ? "Preparing PDF..." : "Print or save PDF"}
    </button>
  );
};

export default LessonPDFExporter;
