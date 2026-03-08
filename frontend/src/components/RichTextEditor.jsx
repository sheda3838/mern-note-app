import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function RichTextEditor({ value, onChange, placeholder = "" }) {
  return (
    <div className="quill-Custom-Wrapper mb-6 relative z-0">
      <ReactQuill
        value={value}
        onChange={onChange}
        theme="snow"
        placeholder={placeholder}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 transition-colors"
      />
    </div>
  );
}

export default RichTextEditor;
