import React, { useRef, useEffect, useState } from 'react';
import { HotTable, HotColumn } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';

// Register Handsontable's modules
registerAllModules();

// Renderer components
const ScoreRenderer = (props) => {
  const { value } = props;
  const color = value > 60 ? '#2ECC40' : '#FF4136';
  return <span style={{ color }}>{value}</span>;
};

const PromotionRenderer = (props) => {
  const { value } = props;
  return <span>{value ? '✔️' : '❌'}</span>;
};

// Initial data
const initialData = [
  { id: 1, name: 'Alex', score: 10, isPromoted: false },
  { id: 2, name: 'Adam', score: 55, isPromoted: false },
  { id: 3, name: 'Kate', score: 61, isPromoted: true },
  { id: 4, name: 'Max', score: 98, isPromoted: true },
  { id: 5, name: 'Lucy', score: 59, isPromoted: false },
];

const ExampleComponent = () => {
  const hotTableComponent = useRef(null);
  const [data, setData] = useState(initialData);
  const [headers, setHeaders] = useState(['id', 'name', 'score', 'isPromoted']);

  // Load spreadsheet data from server (optional)
  useEffect(() => {
    fetch('http://localhost:5001/load/your-spreadsheet-id-here')
      .then(response => response.json())
      .then(fetchedData => {
        if (fetchedData.length > 0) {
          setData(fetchedData);
          setHeaders(Object.keys(fetchedData[0])); // Set headers from the keys of the first row
        }
      })
      .catch(error => console.error('Error loading spreadsheet data:', error));
  }, []);

  // Save spreadsheet data to server
  const saveData = () => {
    fetch('http://localhost:5001/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(savedData => {
        console.log('Success:', savedData);
      })
      .catch(error => console.error('Error saving spreadsheet data:', error));
  };

  // Function to add a new column
  const addColumn = () => {
    const newColIndex = headers.length;
    const newColHeader = `New Column ${newColIndex + 1}`;
    
    // Update data with a new column
    setData(data.map(row => ({ ...row, [newColHeader]: '' })));
    
    // Update headers
    setHeaders([...headers, newColHeader]);
  };

  return (
    <div>
      <HotTable
        ref={hotTableComponent}
        data={data}
        colHeaders={headers}
        licenseKey="non-commercial-and-evaluation"
        height="auto"
        autoRowSize={true}
        autoColumnSize={true}
      >
        {headers.map((header, index) => (
          <HotColumn key={index} data={header}>
            {header === 'score' ? <ScoreRenderer hot-renderer /> : null}
            {header === 'isPromoted' ? <PromotionRenderer hot-renderer /> : null}
          </HotColumn>
        ))}
      </HotTable>
      <button onClick={addColumn}>Add Column</button>
      <button onClick={saveData}>Save Data</button>
    </div>
  );
};

export default ExampleComponent;
