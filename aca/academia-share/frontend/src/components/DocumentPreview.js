import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import mammoth from "mammoth";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// ✅ FIX: Use pdfjs.version so the worker always matches your installed version
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const DocumentPreview = ({ fileUrl, fileType }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [docxHtml, setDocxHtml] = useState("");
  const [docxLoading, setDocxLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    setNumPages(null);
    setPdfError(false);
  }, [fileUrl]);

  useEffect(() => {
    if (fileType === "docx" && fileUrl) {
      setDocxLoading(true);
      fetch(fileUrl)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then(buffer => mammoth.convertToHtml({ arrayBuffer: buffer }))
        .then(result => setDocxHtml(result.value))
        .catch(err => {
          console.error("DOCX load error:", err);
          setDocxHtml("<p>Could not load document.</p>");
        })
        .finally(() => setDocxLoading(false));
    }
  }, [fileUrl, fileType]);

  if (!fileUrl) return <p>No file URL provided.</p>;

  if (fileType === "pdf") {
    // Fallback to iframe if react-pdf fails (version mismatch, 401, CORS)
    if (pdfError) {
      return (
        <iframe
          src={fileUrl}
          width="100%"
          height="550px"
          style={{ border: "none", borderRadius: "8px" }}
          title="PDF Preview"
        />
      );
    }
    return (
      <div style={{ textAlign: "center" }}>
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => { setNumPages(numPages); setPdfError(false); }}
          onLoadError={(err) => { console.error("PDF load error:", err); setPdfError(true); }}
        >
          <Page pageNumber={currentPage} width={700} />
        </Document>
        {numPages && (
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "12px", alignItems: "center" }}>
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>◀ Prev</button>
            <span>Page {currentPage} of {numPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, numPages))} disabled={currentPage === numPages}>Next ▶</button>
          </div>
        )}
      </div>
    );
  }

  if (fileType === "docx") {
    if (docxLoading) return <p style={{ textAlign: "center" }}>Loading document...</p>;
    return (
      <div
        style={{ padding: "12px", border: "1px solid #eee", borderRadius: "8px", lineHeight: "1.6" }}
        dangerouslySetInnerHTML={{ __html: docxHtml }}
      />
    );
  }

  if (["xlsx", "xls", "ppt", "pptx"].includes(fileType)) {
    return (
      <iframe
        src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
        width="100%"
        height="550px"
        style={{ border: "none", borderRadius: "8px" }}
        title="Document Preview"
      />
    );
  }

  return (
    <p style={{ color: "gray", textAlign: "center" }}>
      Preview not available for this file type: <b>{fileType || "unknown"}</b>
    </p>
  );
};

export default DocumentPreview;