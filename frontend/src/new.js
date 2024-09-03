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
import { saveAs } from 'file-saver';
import { read, utils } from "xlsx";
const host=process.env.REACT_APP_BACKEND_URL;
const socketip=process.env.SOCKET_URL;

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
  const { id: sheetId } = useParams();
  const navigate = useNavigate();
  const initialRows = 100;
  const initialCols = 26;
  const fileInputRef=useRef(null);
  const [data, setData] = useState(
    Array.from({ length: initialRows }, () => Array(initialCols).fill(""))
  );
  const [activeUsers, setActiveUsers] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [colHeaders, setColHeaders] = useState(generateColumnHeaders(initialCols));
  const hotTableRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    const verifyCookie = async () => {
      const { data } = await axios.post(`${host}/protectroute`, { token });
      const { status, user } = data;
      console.log(status);
      return status
        ? toast(`Hello`, {
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
      socketRef.current.emit("join-sheet", {
        sheetId,
        user: localStorage.getItem("username"),
      });
    }

    // Listen for active users
    socketRef.current.on("active-users", (users) => {
      setActiveUsers(users);
    });

    // Listen for cell updates from the server
    socketRef.current.on("cell-update", ({ row, col, value, user }) => {
      setData((prevData) => {
        const newData = [...prevData];
        newData[row][col] = value;
        return newData;
      });
      setEditingCell({ row, col, user });
      setTimeout(() => setEditingCell(null), 1000);
    });

    // Handle disconnection
    socketRef.current.on("user-disconnected", (user) => {
      setActiveUsers((prevUsers) => prevUsers.filter((u) => u !== user));
    });

    // Cleanup on component unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [sheetId]);
  const handleExportCSV = () => {
    try {
      // Convert the spreadsheet data into a CSV format
      const csvContent = data.map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
      // Use FileSaver to trigger a download of the CSV file
      saveAs(blob, `spreadsheet-${sheetId}.csv`);
  
      toast.success("CSV exported successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error.message);
      toast.error("An error occurred while exporting CSV. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  
  
  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: "array" });
  
      // Assume we're interested in the first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      // Convert sheet to array of arrays
      const importedData = utils.sheet_to_json(sheet, { header: 1 });
  
      // Update state with imported data
      setData(importedData);
      setColHeaders(generateColumnHeaders(importedData[0].length));
    };
    reader.readAsArrayBuffer(file);
  };
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

        // Emit the change to the server with the sheetId
        socketRef.current.emit("cell-update", {
          sheetId,
          row,
          col,
          value,
          user: localStorage.getItem("username"),
        });
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
      const res = await axios.post(`${host}/save`, {
        sheetId,
        data,
      });
      if (res.data.success) {
        console.log("Successfully saved");
      }
    } catch (error) {
      console.error("Error saving data:", error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    // Notify server of user disconnection
    socketRef.current.emit("user-disconnect", localStorage.getItem("username"));
  };

  return (
    <div className="full-screen-container">
      <div className="buttoncontainer">
      <button className="savebutton" onClick={handleExportCSV}>Export CSV</button>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleImportExcel}
        ref={fileInputRef}
        style={{ marginBottom: "10px" }}
      />
        <button className="savebutton" onClick={handleSave}>
          Save
        </button>
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
        <div className="user-icons">
          {activeUsers.map((user, index) => (
            <div key={index} className="user-icon">
              {user}
            </div>
          ))}
        </div>
      </div>
      <HotTable
        className={`fulltable ${editingCell ? "editing-cell" : ""}`}
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
