import React, { useEffect, useRef } from 'react';

const FilterPanel = ({
  headers,
  fieldTypes,
  filterField,
  setFilterField,
  filterValue,
  setFilterValue,
  rangeValues,
  setRangeValues,
  dateRange,
  setDateRange,
  onApply,
  onClear
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [filterField]);

  const handleClearInput = () => {
    if (fieldTypes.range.includes(filterField)) {
      setRangeValues(["", ""]);
    } else if (fieldTypes.date.includes(filterField)) {
      setDateRange({ from: "", to: "" });
    } else {
      setFilterValue("");
    }
  };

  const renderInput = () => {
    if (!filterField) return null;

    if (fieldTypes.range.includes(filterField)) {
      return (
        <>
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            step="any"
            placeholder="Min value"
            value={rangeValues[0] || ""}
            onChange={(e) => {
              const val = e.target.value;
              setRangeValues([val === "" ? "" : +val, rangeValues[1]]);
            }}
            className="filter-input"
          />
          <input
            type="number"
            inputMode="numeric"
            step="any"
            placeholder="Max value"
            value={rangeValues[1] || ""}
            onChange={(e) => {
              const val = e.target.value;
              setRangeValues([rangeValues[0], val === "" ? "" : +val]);
            }}
            className="filter-input"
          />
        </>
      );
    }

    if (fieldTypes.date.includes(filterField)) {
      return (
        <>
          <input
            ref={inputRef}
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="filter-input"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="filter-input"
          />
        </>
      );
    }

    if (fieldTypes.yesNo.includes(filterField)) {
      return (
        <select
          ref={inputRef}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="filter-input"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      );
    }

    if (fieldTypes.yearDropdown.includes(filterField)) {
      return (
        <input
          ref={inputRef}
          type="number"
          min={1}
          max={10}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          placeholder="Years"
          className="filter-input"
        />
      );
    }

    return (
      <input
        ref={inputRef}
        type="text"
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        placeholder="Search Item"
        className="filter-input"
      />
    );
  };

  return (
    <div className="filter-panel-row">
      <div className="filter-input-group">
        <select
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="filter-input"
        >
          <option value="">Select Filter</option>
          {headers.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        {renderInput()}
      </div>

      <div className="filter-input-group">
        <button onClick={onApply} className="filter-btn apply">Apply</button>
        <button onClick={handleClearInput} className="filter-btn clear">Clear</button>
      </div>
    </div>
  );
};

export default FilterPanel;
