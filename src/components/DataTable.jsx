import React from 'react';

const DataTable = ({ data, headers }) => {

  // Function to format date in yyyy-mm-dd format
  const formatDate = (date) => {
    if (!date) return "-"; // If the date is invalid, return "-"
    const d = new Date(date);
    return d.toLocaleDateString('en-CA'); // 'en-CA' gives yyyy-mm-dd format
  };

  return (
    <div className="table-wrapper overflow-x-auto my-4">
      <table className="min-w-full table-auto border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((h) => (
              <th key={h} className="border px-4 py-2 text-left text-sm font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center py-4">
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                {headers.map((h) => (
                  <td key={h} className="border px-4 py-2 text-sm">
                    {typeof row[h] === 'number'
                      ? row[h].toLocaleString() // For number formatting
                      : (h.includes("Date") ? formatDate(row[h]) : (row[h] || "-"))} {/* Format date columns */}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
