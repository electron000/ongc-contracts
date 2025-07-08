import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from 'docx';

const ExportButtons = ({ data, headers, showPreview, setShowPreview }) => {
  const [selectedFields, setSelectedFields] = useState(headers);
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });
  const [fileName, setFileName] = useState("Contracts Details");
  const [isExporting, setIsExporting] = useState(false); // 🔥 Export loading state

  const handleFieldChange = (field) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : headers.filter(h => [...prev, field].includes(h))
    );
  };

  const toggleAllFields = () => {
    setSelectedFields(selectedFields.length === headers.length ? [] : headers);
  };

  const getSortedData = () => {
    if (!sortConfig.field) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortConfig.field]?.toString().toLowerCase() || '';
      const valB = b[sortConfig.field]?.toString().toLowerCase() || '';
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const toggleSort = (field) => {
    setSortConfig(prev =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' }
    );
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const sorted = getSortedData();
      const csvContent = [selectedFields.join(",")].concat(
        sorted.map(row =>
          selectedFields.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(",")
        )
      );
      const blob = new Blob([csvContent.join("\n")], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${fileName}.csv`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Contracts Details");
      worksheet.addRow(selectedFields);

      const sortedData = getSortedData();
      sortedData.forEach(row => worksheet.addRow(selectedFields.map(h => row[h] || "")));

      worksheet.columns = selectedFields.map(h => {
        const max = Math.max(h.length, ...sortedData.map(r => (r[h] || '').toString().length));
        return { width: Math.min(50, max * 0.8 + 2) };
      });

      worksheet.getRow(1).eachCell(cell => cell.font = { bold: true });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }), `${fileName}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const selectedData = getSortedData();
      const numCols = selectedFields.length;
      let format = 'a4';
      if (numCols > 10) format = 'a3';

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format });
      const maxColsAllowed = 30;
      const scale = Math.max(0.4, 1 - (numCols / maxColsAllowed));

      const fontSize = 10 * scale;
      const titleSize = 16 * scale;
      const cellPadding = 2 * scale;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(titleSize);
      doc.text(fileName.replace(/_/g, ' '), 14, 14);

      autoTable(doc, {
        startY: 20,
        head: [selectedFields.map(h => h.replace(/\s*\(₹\)/, ' (INR)'))],
        body: selectedData.map(row =>
          selectedFields.map(h => row[h]?.toString() || "")
        ),
        theme: 'grid',
        tableWidth: 'auto',
        margin: { top: 30, left: 10, right: 10 },
        styles: {
          fontSize,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          cellPadding,
          lineColor: [204, 204, 204],
          lineWidth: 0.3,
          fillColor: [243, 239, 234],
          textColor: 20,
        },
        headStyles: {
          fillColor: [122, 20, 20],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: fontSize + 1.5,
          cellPadding,
        },
        alternateRowStyles: {
          fillColor: [243, 239, 234],
        },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(10);
          doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        }
      });

      doc.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Export failed. Try reducing the number of selected fields.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToDocx = async () => {
    setIsExporting(true);
    try {
      const sortedData = getSortedData();
      const colWidths = selectedFields.map(h => {
        const maxLength = Math.max(h.length, ...sortedData.map(r => (r[h] || '').toString().length));
        return Math.min(8000, Math.max(1500, 6000 / selectedFields.length + maxLength * 100));
      });

      const headerRow = new TableRow({
        children: selectedFields.map((h, i) =>
          new TableCell({
            width: { size: colWidths[i], type: WidthType.DXA },
            children: [new Paragraph(h)]
          })
        )
      });

      const dataRows = sortedData.map(row =>
        new TableRow({
          children: selectedFields.map((h, i) =>
            new TableCell({
              width: { size: colWidths[i], type: WidthType.DXA },
              children: [new Paragraph(row[h]?.toString() || "")]
            })
          )
        })
      );

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: fileName.replace(/_/g, ' '), heading: "Heading1" }),
            new Table({ rows: [headerRow, ...dataRows] })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${fileName}.docx`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllFormats = async () => {
    setIsExporting(true);
    try {
      await exportToCSV();
      await exportToExcel();
      await exportToPDF();
      await exportToDocx();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="export-panel-row">
        <div className="filename-group">
          <label htmlFor="filename" className="font-semibold mr-2">File Name:</label>
          <input
            id="filename"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="filename-input"
            placeholder="Enter file name"
          />
        </div>

        <div className="export-btn-group">
          <button onClick={exportToCSV} className="export-btn csv" disabled={isExporting}>CSV</button>
          <button onClick={exportToExcel} className="export-btn excel" disabled={isExporting}>Excel</button>
          <button onClick={exportToPDF} className="export-btn pdf" disabled={isExporting}>PDF</button>
          <button onClick={exportToDocx} className="export-btn word" disabled={isExporting}>Word</button>
          <button onClick={exportAllFormats} className="export-btn all" disabled={isExporting}>Export All</button>
          <button onClick={() => setShowPreview(!showPreview)} className="export-btn preview">
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>
      </div>

      {isExporting && (
        <p className="exporting-message">Exporting file(s)... Please wait.</p>
      )}

      {showPreview && (
  <div className="field-selection-container">
    <div className="export-heading-container">
      <h3 className="export-heading">CHOOSE FIELDS</h3>
    </div>

    <div className="field-selection-table-container">
      <table className="field-selection-table">
        <tbody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {headers.slice(rowIndex * 5, rowIndex * 5 + 5).map((field) => (
                <td key={field}>
                  <label className="field-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={() => handleFieldChange(field)}
                    />
                    {field}
                  </label>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="select-button-container">
      <button
        onClick={toggleAllFields}
        className={`select-toggle-btn ${
          selectedFields.length === headers.length ? "deselect-state" : "select-state"
        }`}
      >
        {selectedFields.length === headers.length ? "Deselect All" : "Select All"}
      </button>
    </div>
  </div>
)}


      {showPreview && (
        <div className="preview-section">
    <div className="table-preview-container">
      <table className="preview-table">
        <thead>
          <tr>
            {selectedFields.map((field) => (
              <th
                key={field}
                onClick={() => toggleSort(field)}
                className="table-header-cell"
              >
                {field}{" "}
                {sortConfig.field === field
                  ? sortConfig.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getSortedData()
            .slice(0, 10)
            .map((row, index) => (
              <tr key={index}>
                {selectedFields.map((field) => (
                  <td
                    key={field}
                    className={`table-cell ${
                      field.toLowerCase().includes("remark")
                        ? "remarks-column"
                        : ""
                    }`}
                  >
                    {row[field]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      <p className="preview-note">* Preview limited to first 10 rows</p>
    </div>
  </div>
      )}
    </div>
  );
};

export default ExportButtons;

