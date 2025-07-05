const DataTable = ({ data, headers }) => {
  return (
    <div className="overflow-auto my-4">
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
                      ? row[h].toLocaleString()
                      : row[h] || "-"}
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
