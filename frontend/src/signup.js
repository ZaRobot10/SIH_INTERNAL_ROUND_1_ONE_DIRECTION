import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./compcss/signup.css";

const Signup = () => {
  const host = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: ""
  });
  const { email, password} = inputValue;
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
    });
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-right",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5001/signup", {
        ...inputValue,
      });

      const { success, message } = data;
      if (success) {
        localStorage.setItem("token", data.token);
        handleSuccess(message);
        setTimeout(() => {
          navigate("/sheet");
        }, 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      console.log(error);
    }
    setInputValue({
      ...inputValue,
      email: "",
      password: "",
      username: "",
    });
  };

  return (
    <div className="signupfull">
      
      <div className="form_container">
        <h2>Signup Account</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="email" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={handleOnChange}
            />
          </div>
          
          <div>
            <label className="email" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={handleOnChange}
            />
          </div>
          <button className="sub" type="submit">
            Submit
          </button>
          <span>
            Already have an account? <Link to={"/"}>Login</Link>
          </span>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Signup;
