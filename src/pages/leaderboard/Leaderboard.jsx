import React, { useState, useEffect, useMemo } from 'react';
import './Leaderboard.css';
import ongcLogo from '../../assets/ongc-logo.png';

import {
  FilterPanel,
  DataTable,
  ExportButtons,
  Pagination,
} from "../../components";

const fieldTypes = {
  range: [
    "Contract Value",
    "Invoice submitted and amount Claimed ",
    "Amount Passed",
    "Deduction",
    "PBG AMOUNT",
    "Security Deposit Amount",
    "AMC charges for the entire duration"
  ],
  date: [
    "Date of commissioning",
    "Warranty End Date",
    "AMC start date",
    "AMC end date"
  ],
  yesNo: [
    "Quarterly AMC Payment status",
    "Post contract issues (Y/N)"
  ],
  number: [
    "DISHA File Number",
    "OLA No",
    "PR Nos",
    "PO Nos"
  ],
  yearDropdown: [
    "Warranty duration in years",
    "AMC duration in years"
  ],
  text: [
    "Sl No",
    "Name of the contract",
    "Brief Objective",
    "Name of the contractor",
    "Yearly outflow as per OLA",
    "Remarks"
  ]
};

const headers = [
  "Sl No", "Name of the contract", "Brief Objective", "Name of the contractor",
  "DISHA File Number", "Contract Value", "Date of commissioning", "Warranty duration in years",
  "AMC duration in years", "AMC charges for the entire duration", "Warranty End Date",
  "AMC start date", "AMC end date", "OLA No", "PR Nos", "Yearly outflow as per OLA",
  "PO Nos", "Quarterly AMC Payment status", "Invoice submitted and amount Claimed ",
  "Amount Passed", "Deduction", "Post contract issues (Y/N)", "PBG AMOUNT",
  "Security Deposit Amount", "Remarks"
];

const pad = (num) => (num < 10 ? `0${num}` : `${num}`);

const generateDummyData = () => {
  const data = [];
  for (let i = 1; i <= 500; i++) {
    const year = 2020 + (i % 10);
    const nextYear = year + 1;
    const yearAfter = year + 2;
    const month = pad((i % 12) + 1);
    const day = pad((i % 28) + 1);

    data.push({
      "Sl No": i,
      "Name of the contract": `Contract ${i} - Name`,
      "Brief Objective": `Objective for contract ${i}`,
      "Name of the contractor": `Contractor ${i} Ltd`,
      "DISHA File Number": `D10${i}`,
      "Contract Value": i * 100000,
      "Date of commissioning": `${year}-${month}-${day}`,
      "Warranty duration in years": `${(i % 5) + 1}`,
      "AMC duration in years": `${(i % 4) + 1}`,
      "AMC charges for the entire duration": i * 10000,
      "Warranty End Date": `${nextYear}-${month}-${day}`,
      "AMC start date": `${nextYear}-${month}-${day}`,
      "AMC end date": `${yearAfter}-${month}-${day}`,
      "OLA No": `OLA-80${i}`,
      "PR Nos": `PR-00${i}`,
      "Yearly outflow as per OLA": i * 5000,
      "PO Nos": `PO-10${i}`,
      "Quarterly AMC Payment status": i % 2 === 0 ? "Yes" : "No",
      "Invoice submitted and amount Claimed ": i * 2000,
      "Amount Passed": i * 1800,
      "Deduction": i * 100,
      "Post contract issues (Y/N)": i % 3 === 0 ? "Yes" : "No",
      "PBG AMOUNT": i * 5000,
      "Security Deposit Amount": i * 2000,
      "Remarks": `Remarks for contract ${i}`
    });
  }
  return data;
};

const Leaderboard = () => {
  const [originalData, setOriginalData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [rangeValues, setRangeValues] = useState(["", ""]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const rowsPerPage = 15;

  useEffect(() => {
    const dummyData = generateDummyData();
    setOriginalData(dummyData);
    setCurrentData(dummyData);
    setLoading(false);
  }, []);

  const handleFilterApply = () => {
    let filtered = [...originalData];

    if (filterField) {
      if (fieldTypes.range.includes(filterField)) {
  const [min, max] = rangeValues;

  filtered = filtered.filter(row => {
    const val = parseFloat(row[filterField]) || 0;
    const isMinValid = min !== "" ? val >= parseFloat(min) : true;
    const isMaxValid = max !== "" ? val <= parseFloat(max) : true;
    return isMinValid && isMaxValid;
  });

      } else if (fieldTypes.date.includes(filterField)) {
        const from = new Date(dateRange.from);
        const to = new Date(dateRange.to);
        filtered = filtered.filter(row => {
          const val = new Date(row[filterField]);
          return (!isNaN(from) ? val >= from : true) &&
                 (!isNaN(to) ? val <= to : true);
        });
      } else if (fieldTypes.yesNo.includes(filterField)) {
        filtered = filtered.filter(row =>
          (row[filterField] || "").toLowerCase() === filterValue.toLowerCase()
        );
      } else if (fieldTypes.yearDropdown.includes(filterField)) {
        filtered = filtered.filter(row => row[filterField] === filterValue);
      } else {
        filtered = filtered.filter(row =>
          row[filterField]?.toString().toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    }

    setCurrentData(filtered);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterField("");
    setFilterValue("");
    setDateRange({ from: "", to: "" });
    setRangeValues(["", ""]);
    setCurrentData(originalData);
    setCurrentPage(1);
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return currentData.slice(start, start + rowsPerPage);
  }, [currentData, currentPage]);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="leaderboard-container">
      <img src={ongcLogo} alt="ONGC Logo" className="ongc-logo" />

{!showPreview && (
  <div style={{ marginBottom: "10px" }}> {/* Reduced spacing below filter panel */}
    <FilterPanel
      headers={headers}
      fieldTypes={fieldTypes}
      filterField={filterField}
      setFilterField={setFilterField}
      filterValue={filterValue}
      setFilterValue={setFilterValue}
      rangeValues={rangeValues}
      setRangeValues={setRangeValues}
      dateRange={dateRange}
      setDateRange={setDateRange}
      onApply={handleFilterApply}
      onClear={handleClearFilters}
    />
  </div>
)}

<div style={{ marginTop: "0px", marginBottom: "24px" }}> {/* Brings filter/export closer */}
  <ExportButtons
    data={currentData}
    headers={headers}
    showPreview={showPreview}
    setShowPreview={setShowPreview}
  />
</div>



      {!showPreview && <DataTable data={paginatedData} headers={headers} />}
      {!showPreview && (
        <Pagination
          currentPage={currentPage}
          setPage={setCurrentPage}
          totalPages={Math.ceil(currentData.length / rowsPerPage)}
        />
      )}
    </div>
  );
};

export default Leaderboard;
