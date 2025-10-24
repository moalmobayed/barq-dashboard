"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface HTMLEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isRTL?: boolean; // Add RTL support for Arabic text
}

const HTMLEditor: React.FC<HTMLEditorProps> = ({
  value = "",
  onChange = () => {},
  placeholder = "",
  className = "",
  disabled = false,
  isRTL = false,
}) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "indent",
    "align",
    "link",
  ];

  return (
    <div
      className={`html-editor ${className} ${isRTL ? "rtl-editor" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        readOnly={disabled}
      />

      <style jsx global>{`
        .html-editor .ql-editor {
          min-height: 300px;
        }

        /* RTL Support for Arabic text */
        .rtl-editor .ql-editor {
          direction: rtl;
          text-align: right;
        }

        .rtl-editor .ql-toolbar {
          direction: ltr; /* Keep toolbar LTR for button layout */
        }

        .html-editor .ql-toolbar {
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 8px 8px 0 0;
        }

        .html-editor .ql-container {
          border-bottom: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          background: white;
          border-radius: 0 0 8px 8px;
          font-family: "Rubik", "Rubik Fallback";
        }

        .dark .html-editor .ql-toolbar {
          background: #374151;
          border-color: #6b7280;
        }

        .dark .html-editor .ql-container {
          background: #1f2937;
          border-color: #6b7280;
          color: #f3f4f6;
        }

        .dark .html-editor .ql-editor {
          color: #f3f4f6;
        }

        .dark .html-editor .ql-snow .ql-stroke {
          stroke: #9ca3af;
        }

        .dark .html-editor .ql-snow .ql-fill,
        .dark .html-editor .ql-snow .ql-stroke.ql-fill {
          fill: #9ca3af;
        }

        .dark .html-editor .ql-snow .ql-picker-label {
          color: #9ca3af;
        }

        .dark .html-editor .ql-snow .ql-picker-options {
          background: #374151;
          border-color: #6b7280;
        }

        .dark .html-editor .ql-snow .ql-picker-item {
          color: #f3f4f6;
        }

        .dark .html-editor .ql-snow .ql-picker-item:hover {
          background: #4b5563;
          color: #f3f4f6;
        }

        .dark .html-editor .ql-snow .ql-tooltip {
          background: #374151;
          border-color: #6b7280;
          color: #f3f4f6;
        }

        .dark .html-editor .ql-snow .ql-tooltip input {
          background: #1f2937;
          border-color: #6b7280;
          color: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default HTMLEditor;
