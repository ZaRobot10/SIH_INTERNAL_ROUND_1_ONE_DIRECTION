import React, { useState, useCallback, useEffect, useRef } from "react";
import { HotTable } from "@handsontable/react";
import { useParams } from "react-router-dom";
import "handsontable/dist/handsontable.full.min.css";
import axios from "axios";
import io from "socket.io-client";
import { registerAllModules } from "handsontable/registry";
import { HyperFormula } from "hyperformula";

// Register Handsontable's modules
registerAllModules();

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
  const { id } = useParams();
  const initialRows = 100;
  const initialCols = 26;
  const [data, setData] = useState(
    Array.from({ length: initialRows }, () => Array(initialCols).fill(""))
  );
  const [colHeaders, setColHeaders] = useState(generateColumnHeaders(initialCols));
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://10.100.208.164:5001");

    // Listen for cell updates from the server
    socketRef.current.on("cell-update", ({ row, col, value }) => {
      setData((prevData) => {
        const newData = [...prevData];
        newData[row][col] = value;
        return newData;
      });
    });

    // Cleanup on component unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleAfterChange = useCallback(
    (changes, source) => {
      if (!changes) return;

      changes.forEach(([row, col, oldValue, value]) => {
        // Update the data state
        setData((prevData) => {
          const newData = [...prevData];
          newData[row][col] = value;
          return newData;
        });

        // Emit the change to the server
        socketRef.current.emit("cell-update", { row, col, value });
      });

      // Expand rows or columns if needed
      const currentMaxRows = data.length;
      const currentMaxCols = data[0].length;
      let needsMoreRows = false;
      let needsMoreCols = false;

      changes.forEach(([row, col]) => {
        if (row + 1 >= currentMaxRows) needsMoreRows = true;
        if (col + 1 >= currentMaxCols) needsMoreCols = true;
      });

      if (needsMoreRows) {
        setData((prevData) => [
          ...prevData,
          ...Array.from({ length: 100 }, () => Array(currentMaxCols).fill("")),
        ]);
      }

      if (needsMoreCols) {
        const newColCount = currentMaxCols + 10;
        setData((prevData) =>
          prevData.map((row) => [...row, ...Array(10).fill("")])
        );
        setColHeaders(generateColumnHeaders(newColCount));
      }
    },
    [data]
  );

  const handleAfterSelection = useCallback(
    (row, col) => {
      const currentMaxCols = data[0].length;
      if (col + 1 >= currentMaxCols) {
        const newColCount = currentMaxCols + 10;
        setData((prevData) =>
          prevData.map((row) => [...row, ...Array(10).fill("")])
        );
        setColHeaders(generateColumnHeaders(newColCount));
      }
    },
    [data]
  );

  const handleSave = async () => {
    try {
      const res = await axios.post("http://localhost:5001/save", { id, data });
      if (res.data.success) {
        console.log("Successfully saved");
      }
    } catch (error) {
      console.error("Error saving data:", error.message);
    }
  };

  return (
    <div className="full-screen-container">
      <button className="savebutton" onClick={handleSave}>Save</button>
      <HotTable
        data={data}
        colHeaders={colHeaders}
        rowHeaders={true}
        minSpareRows={1}
        minSpareCols={1}
        stretchH="all"
        manualColumnResize={true}
        manualRowResize={true}
        contextMenu={true}
        autoWrapRow={true}
        autoWrapCol={true}
        afterChange={handleAfterChange}
        afterSelection={handleAfterSelection}
        formulas={{
          engine: HyperFormula,
        }}
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
};

export default New;
