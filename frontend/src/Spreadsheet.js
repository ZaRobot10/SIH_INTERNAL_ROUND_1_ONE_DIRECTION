import React, { useEffect, useState, useCallback } from "react";
import { HotTable } from "@handsontable/react";
import { useNavigate } from "react-router-dom";
import "handsontable/dist/handsontable.full.min.css";
import { registerAllModules } from "handsontable/registry";
import axios from "axios";
import { HyperFormula } from "hyperformula";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./compcss/sheetpage.css";
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

const Spreadsheet = () => {
  const navigate = useNavigate();
  const initialRows = 100;
  const initialCols = 26;
  const host = process.env.REACT_APP_BACKEND_URL;
  console.log(host);
  const [data, setData] = useState(
    Array.from({ length: initialRows }, () => Array(initialCols).fill(""))
  );
  const [colHeaders, setColHeaders] = useState(
    generateColumnHeaders(initialCols)
  );
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    const verifyCookie = async () => {
      const { data } = await axios.post(`${host}/protectroute`, {token});
      const { status } = data;
      console.log(status);
      return status
        ? toast("Hello", {
            position: "top-right",
          })
        : (localStorage.removeItem("token"), navigate("/"));
    };
    verifyCookie();
  }, [navigate]);
  const handleAfterChange = useCallback(
    (changes, source) => {
      if (!changes) return;

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

  const handleNew = async () => {
    let x = Math.floor(Math.random() * 100);
    localStorage.setItem("endpoint", `${x}`);
    navigate(`/sheet/${x}`);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("useremail");
    navigate("/");
  };
  return (
    <div className="full-screen-container">
      <div className="buttoncontainer">
        <button className="newbutton" onClick={handleNew}>
          New
        </button>
        <button className="logout" onClick={handleLogout}>
          logout
        </button>
      </div>
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

export default Spreadsheet;
