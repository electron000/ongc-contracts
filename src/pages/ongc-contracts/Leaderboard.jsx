import React, { useState, useEffect, useMemo } from 'react';
import './Leaderboard.css';
import ongcLogo from '../../assets/ongc-logo.png';

import { FilterPanel, DataTable, ExportButtons, Pagination } from "../../components";

const fieldTypes = {
  range: [
    "Contract Value",
    "Invoice submitted and amount Claimed ",
    "Amount Passed",
    "Deduction",
    "PBG AMOUNT",
    "Security Deposit Amount",
    "AMC charges for the entire duration",
    "Yearly outflow as per OLA"
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
    "Sl No"  // Numeric range for Sl No
  ],
  yearDropdown: [
    "Warranty duration in years",  // Year range filter
    "AMC duration in years"       // Year range filter
  ],
  text: [
    "DISHA File Number",
    "OLA No",
    "PR Nos",
    "PO Nos",
    "Name of the contract",
    "Brief Objective",
    "Name of the contractor",
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

      // ✅ Changed to numeric only
      "DISHA File Number": 100000 + i,
      "OLA No": 200000 + i,
      "PR Nos": 300000 + i,
      "PO Nos": 400000 + i,

      "Contract Value": i * 100000,
      "Date of commissioning": `${year}-${month}-${day}`,
      "Warranty duration in years": `${(i % 5) + 1}`,
      "AMC duration in years": `${(i % 4) + 1}`,
      "AMC charges for the entire duration": i * 10000,
      "Warranty End Date": `${nextYear}-${month}-${day}`,
      "AMC start date": `${nextYear}-${month}-${day}`,
      "AMC end date": `${yearAfter}-${month}-${day}`,
      "Yearly outflow as per OLA": i * 5000,
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
  const [error, setError] = useState(null); // New error state
  const rowsPerPage = 15;

  useEffect(() => {
    try {
      const dummyData = generateDummyData();
      setOriginalData(dummyData);
      setCurrentData(dummyData);
    } catch (error) {
      setError("Error loading data. Please try again later.");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

const handleFilterApply = () => {
  let filtered = [...originalData];  // Start with original data for filtering

  if (filterField) {
    // Handle Sl No range filtering
    if (filterField === "Sl No" && rangeValues[0] !== "" && rangeValues[1] !== "") {
      const min = parseInt(rangeValues[0], 10);
      const max = parseInt(rangeValues[1], 10);
      filtered = filtered.filter(row => {
        const val = parseInt(row[filterField], 10);  // Ensure "Sl No" is treated as an integer
        return val >= min && val <= max;
      });
    }
    // Handle other range filters (like money)
    else if (fieldTypes.range.includes(filterField)) {
      const [min, max] = rangeValues;
      filtered = filtered.filter(row => {
        const val = parseFloat(row[filterField]) || 0;
        const isMinValid = min !== "" ? val >= parseFloat(min) : true;
        const isMaxValid = max !== "" ? val <= parseFloat(max) : true;
        return isMinValid && isMaxValid;
      });
    }
    // Date range filtering
    else if (fieldTypes.date.includes(filterField)) {
      const from = dateRange.from ? new Date(dateRange.from) : null;
      const to = dateRange.to ? new Date(dateRange.to) : null;

      filtered = filtered.filter(row => {
        const val = new Date(row[filterField]);

        // Check if 'from' and 'to' are set, and filter based on those
        const isAfterFrom = from ? val >= from : true;
        const isBeforeTo = to ? val <= to : true;

        return isAfterFrom && isBeforeTo;
      });
    }
    // Additional filters for numeric and year-based fields
    else {
      filtered = filtered.filter(row =>
        row[filterField]?.toString().toLowerCase().includes(filterValue.toLowerCase())
      );
    }
  }

  setCurrentData(filtered);  // Update currentData with filtered data
  setCurrentPage(1);  // Reset pagination to page 1 after filter
};

const handleClearFilters = () => {
  setFilterField("");
  setFilterValue("");
  setRangeValues(["", ""]);
  setDateRange({ from: "", to: "" });
  setCurrentData(originalData); // 🔥 reset the table back to full data
  setCurrentPage(1);
};



  // Memoized filtered data
const filteredData = useMemo(() => {
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
  const [min, max] = rangeValues;
  filtered = filtered.filter(row => {
    const val = parseFloat(row[filterField]) || 0;
    return (min === "" || val >= parseFloat(min)) &&
           (max === "" || val <= parseFloat(max));
  });
}
 else {
      filtered = filtered.filter(row =>
        row[filterField]?.toString().toLowerCase().includes(filterValue.toLowerCase())
      );
    }
  }
  return filtered;
}, [originalData, filterField, filterValue, rangeValues, dateRange]);


  const paginatedData = useMemo(() => {
  const start = (currentPage - 1) * rowsPerPage;
  return currentData.slice(start, start + rowsPerPage);  // Pagination based on filtered data
}, [currentData, currentPage]);  // Dependency on filtered data

const totalPages = Math.ceil(currentData.length / rowsPerPage);  // Total pages based on filtered data

  if (loading) return <div className="loader">Loading...</div>;

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="leaderboard-container">
      <img src={ongcLogo} alt="ONGC Logo" className="ongc-logo" />

      {!showPreview && (
        <div style={{ marginBottom: "10px" }}>
          {/* Filter Panel */}
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

      {/* Export Buttons */}
      <div className="export-fields-container" style={{ marginBottom: "24px" }}>
        <ExportButtons
          data={currentData}
          headers={headers}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
        />
      </div>

      {/* Data Table and Pagination */}
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