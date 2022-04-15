import { useState, useEffect } from "react";
import Modal from "./Modal";
import { loginWithUserID, setSessionListenerCallback } from "../services/auth";
import "../stylesheets/Login.css";

const Login = ({ setSessionID }) => {
  const [userID, setUserID] = useState("");
  useEffect(() => setSessionListenerCallback(setSessionID), []);

  if (localStorage.getItem("session-id")) {
    return <></>;
  }

  return (
    <Modal isOpen={true}>
      <form className="LoginCard" onSubmit={(e) => {e.preventDefault(); loginWithUserID(userID)}}>
        
        <input
          type="text"
          value={userID}
          placeholder="Phone number"
          onChange={event => setUserID(event.target.value)}
        />

        <input type="button" value="Log in" />
      </form>
    </Modal>
  );
}

export default Login;
