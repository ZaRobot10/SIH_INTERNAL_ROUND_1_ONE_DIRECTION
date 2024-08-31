// frontend/src/App.js
import React from 'react';
import ExampleComponent from './Spreadsheet.js';
import { Route, Routes } from "react-router-dom";
import  New  from './new.js';
function App() {
  return (
    <div className="App">
        <Routes>
          <Route path="/" element={<ExampleComponent />} />
          <Route path="/sheet/:id" element={<New />}/>
        </Routes>
      </div>
  );
}

export default App;
