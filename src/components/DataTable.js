import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { Translate, TranslateData } from '../utils';
import useTranslatedData from '../hooks/useTranslatedData';

/**
 * Example DataTable component that demonstrates translation of dynamic data
 * @param {Object} props
 * @param {Array} props.data - The data array to be displayed and translated
 * @param {Array} props.columns - The column definitions
 */
function DataTable({ data = [], columns = [] }) {
  // Use the custom hook to translate column headers
  const translatedColumns = useTranslatedData(columns);
  
  // Use the custom hook to translate the entire data set
  const translatedData = useTranslatedData(data);
  
  return (
    <Table responsive striped bordered hover>
      <thead>
        <tr>
          {translatedColumns.map((column, index) => (
            <th key={index}>
              {/* Use Translate for static column headers */}
              <Translate textKey={column.key} fallback={column.label} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {translatedData.length > 0 ? (
          translatedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {translatedColumns.map((column, colIndex) => (
                <td key={`${rowIndex}-${colIndex}`}>
                  {/* Use TranslateData for cell values */}
                  <TranslateData data={row[column.key]} />
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={translatedColumns.length} className="text-center">
              <Translate textKey="noDataFound" />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default DataTable; 