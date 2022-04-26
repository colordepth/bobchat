import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { postLogin } from "../services/auth";
import "../stylesheets/Login.css";

const Login = () => {
  const navigate = useNavigate();

  function loginSubmit(event) {
    event.preventDefault();

    postLogin(event.target.userID.value)
      .then(data => {
        localStorage.setItem('userID', data.userID);
        localStorage.setItem('token', data.token);
        navigate('/');
      })
      .catch(error => {
        alert("User not registered.");
      })
  }

  return (
    <Modal isOpen={true}>
      <form className="LoginCard" onSubmit={loginSubmit}>
        <input
          type="text"
          name="userID"
          // value={userID}
          placeholder="Phone number"
          // onChange={event => setUserID(event.target.value)}
        />

        <input type="submit" value="Log in" />
      </form>
    </Modal>
  );
}

export default Login;
