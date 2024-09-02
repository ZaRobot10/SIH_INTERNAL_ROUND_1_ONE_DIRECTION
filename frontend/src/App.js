// frontend/src/App.js
import React from 'react';
import ExampleComponent from './Spreadsheet.js';
import { Route, Routes } from "react-router-dom";
import  New  from './new.js';
import Login from './login.js';
import Signup from './signup.js';
function App() {
  return (
    <div className="App">
        <Routes>
          <Route path="/sheet" element={<ExampleComponent />} />
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/sheet/:id" element={<New />}/>
        </Routes>
      </div>
  );
}

export default App;
