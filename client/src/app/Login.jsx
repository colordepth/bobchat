import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { postLogin, postRegister } from "../services/auth";
import "../stylesheets/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [userID, setUserID] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');

  function loginSubmit() {
    if (!(userID && !isNaN(userID))) return alert("Please enter a phone number");

    postLogin(userID)
      .then(data => {
        sessionStorage.setItem('userID', data.userID);
        sessionStorage.setItem('token', data.token);
        navigate('/');
      })
      .catch(error => {
        alert("User not registered.");
      })
  }

  function registerSubmit() {
    if (!(userID && !isNaN(userID) && name.length && about.length)) return alert("Please enter all details");
    
    postRegister(userID, name, about)
      .then(data => {
        alert("User registered successfully!");
        sessionStorage.setItem('userID', data.userID);
        sessionStorage.setItem('token', data.token);
        navigate('/');
      })
      .catch(error => {
        alert(error.message);
      })
  }

  return (
    <Modal isOpen={true}>
      <form className="LoginCard" onSubmit={event => event.preventDefault()}>
        <input
          type="phone"
          value={userID}
          placeholder="Phone number"
          onChange={event => setUserID(event.target.value)}
        />
        <button onClick={loginSubmit}>Log in</button>
        <div></div>
        <input
          type="phone"
          value={userID}
          placeholder="Phone number"
          onChange={event => setUserID(event.target.value)}
        />
        <input
          type="text"
          value={name}
          placeholder="Name"
          onChange={event => setName(event.target.value)}
        />
        <textarea
          type=""
          value={about}
          placeholder="About"
          onChange={event => setAbout(event.target.value)}
        />
        <button onClick={registerSubmit}>Sign Up</button>
      </form>
    </Modal>
  );
}

export default Login;
