import React, { useState, useCallback, useEffect, useRef } from "react";
import { HotTable } from "@handsontable/react";
import { useNavigate, useParams } from "react-router-dom";
import "handsontable/dist/handsontable.full.min.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from "socket.io-client";
import { registerAllModules } from "handsontable/registry";
import { HyperFormula } from "hyperformula";
import "./compcss/sheetpage.css";
const host=process.env.REACT_APP_BACKEND_URL;
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
  const { id: sheetId } = useParams(); // Renamed `id` to `sheetId` for clarity
  const navigate=useNavigate();
  const initialRows = 100;
  const initialCols = 26;
  const [data, setData] = useState(
    Array.from({ length: initialRows }, () => Array(initialCols).fill(""))
  );
  const [colHeaders, setColHeaders] = useState(
    generateColumnHeaders(initialCols)
  );
  const hotTableRef = useRef(null);
  const socketRef = useRef(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    const verifyCookie = async () => {
      const { data } = await axios.post(`${host}/protectroute`, {token});
      const { status, user } = data;
      console.log(status);
      return status
        ? toast(`Hello ${user}`, {
            position: "top-right",
          })
        : (localStorage.removeItem("token"), navigate("/"));
    };
    verifyCookie();
  }, [navigate]);
  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(`${host}`);

    // Join the specific sheet room
    if (sheetId) {
      socketRef.current.emit("join-sheet", sheetId);
    }

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
  }, [sheetId]);

  const handleAfterChange = useCallback(
    (changes, source) => {
      if (!changes) return;

      changes.map(([row, col, oldValue, value]) => {
        // Update the data state
        setData((prevData) => {
          const newData = [...prevData];
          newData[row][col] = value;
          return newData;
        });

        // Emit the change to the server with the sheetId
        socketRef.current.emit("cell-update", { sheetId, row, col, value });
      });

      // Expand rows or columns if needed
      const currentMaxRows = data.length;
      const currentMaxCols = data[0].length;
      let needsMoreRows = false;
      let needsMoreCols = false;

      changes.map(([row, col]) => {
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
    [data, sheetId]
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
      const res = await axios.post("http://localhost:5001/save", { sheetId, data });
      if (res.data.success) {
        console.log("Successfully saved");
      }
    } catch (error) {
      console.error("Error saving data:", error.message);
    }
  };
  const handleLogout=()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("useremail");
    navigate("/");
  };
  return (
    <div className="full-screen-container">
      <div className="buttoncontainer">
      <button className="savebutton" onClick={handleSave}>
        Save
      </button>
      <button className="logout" onClick={handleLogout}>
        logout
      </button>
      </div>
      <HotTable
        className="fulltable"
        ref={hotTableRef}
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
