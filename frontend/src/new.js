import { HotTable } from "@handsontable/react";
import {useNavigate, useParams} from "react-router-dom";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { useState, useCallback } from "react";
import axios from "axios";
// Register Handsontable's modules
registerAllModules();

// Function to generate Excel-like column headers
const generateColumnHeaders = (numCols) => {
  const columns = [];
  for (let i = 0; i < numCols; i++) {
    let header = "";
    let n = i;
    while (n >= 0) {
      header = String.fromCharCode((n % 26) + 65) + header;
      n = Math.floor(n / 26) - 1;
    }
    columns.push(header);
  }
  return columns;
};

const New = () => {
  // Start with an initial set of rows and columns
  const {id} =useParams();
  const navigate=useNavigate();
  const initialRows = 100;
  const initialCols = 26;
  const [data, setData] = useState(
    Array.from({ length: initialRows }, () => Array(initialCols).fill(""))
  );
  const [colHeaders, setColHeaders] = useState(
    generateColumnHeaders(initialCols)
  );
  console.log(data);
  // Function to handle changes in the table
  const handleAfterChange = useCallback(
    (changes, source) => {
      if (!changes) return;

      // Determine the max row and column currently in use
      const currentMaxRows = data.length;
      const currentMaxCols = data[0].length;

      // Check if we need more rows or columns
      let needsMoreRows = false;
      let needsMoreCols = false;

      changes.forEach(([row, col]) => {
        if (row + 1 >= currentMaxRows) {
          needsMoreRows = true;
        }
        if (col + 1 >= currentMaxCols) {
          needsMoreCols = true;
        }
      });

      // Expand rows if needed
      if (needsMoreRows) {
        setData((prevData) => [
          ...prevData,
          ...Array.from({ length: 100 }, () => Array(currentMaxCols).fill("")), // Add 100 more rows
        ]);
      }

      // Expand columns if needed
      if (needsMoreCols) {
        const newColCount = currentMaxCols + 10; // Expand by 10 more columns
        setData((prevData) =>
          prevData.map((row) => [...row, ...Array(10).fill("")])
        );
        setColHeaders(generateColumnHeaders(newColCount)); // Update column headers
        console.log(data);
      }
    },
    [data]
  );

  // Function to handle selection
  const handleAfterSelection = useCallback(
    (row, col) => {
      const currentMaxCols = data[0].length;
      // Check if the selected column is the last one
      if (col + 1 >= currentMaxCols) {
        const newColCount = currentMaxCols + 10; // Expand by 10 more columns
        setData((prevData) =>
          prevData.map((row) => [...row, ...Array(10).fill("")])
        );
        setColHeaders(generateColumnHeaders(newColCount)); // Update column headers
        console.log(data);
      }
    },
    [data]
  );
  const handleSave = async () => {
    try {
      const res = await axios.post("http://localhost:5001/save", {id,data});

      if (res.data.success) {
        console.log("succesfully saved");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  return (
    <div className="full-screen-container"> 
      <button className="savebutton" onClick={handleSave}>Save</button>     
      <HotTable
        data={data}
        colHeaders={colHeaders}
        rowHeaders={true}
        minSpareRows={1} // Always keep at least one empty row
        minSpareCols={1} // Always keep at least one empty column
        stretchH="all"
        manualColumnResize={true}
        manualRowResize={true}
        contextMenu={true}
        autoWrapRow={true}
        autoWrapCol={true}
        afterChange={handleAfterChange} // Event listener for changes
        afterSelection={handleAfterSelection} // Event listener for selection
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
};

export default New;
