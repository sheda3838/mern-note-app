import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function RichTextEditor({ value, onChange, placeholder = "" }) {
  return (
    <ReactQuill
      value={value}
      onChange={onChange}
      theme="snow"
      placeholder={placeholder}
      className="mb-4"
    />
  );
}

export default RichTextEditor;
