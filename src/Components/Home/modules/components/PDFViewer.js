import React, { useState } from "react";
import { Document, Page } from "react-pdf/dist/umd/entry.webpack";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";

const PDFViewer = (props) => {
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const { pdf } = props;

  return (
    <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess}>
      {Array.from(new Array(numPages), (el, index) => (
        <Page key={`page_${index + 1}`} pageNumber={index + 1} />
      ))}
    </Document>
  );
};

export default PDFViewer;
