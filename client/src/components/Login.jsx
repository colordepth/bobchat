import { useState, useEffect } from "react";
import Modal from "./Modal";
import { loginWithUserID, setSessionListenerCallback } from "../services/auth";

const Login = ({ setSessionID }) => {
  const [userID, setUserID] = useState("");
  useEffect(() => setSessionListenerCallback(setSessionID), []);

  if (localStorage.getItem("session-id")) {
    return <></>;
  }

  return (
    <Modal isOpen={true}>
      <div className="LoginCard">
        <input
          type="text"
          value={userID}
          placeholder="Phone number"
          onChange={event => setUserID(event.target.value)}
        />
        <button onClick={() => loginWithUserID(userID)}>
          Log in
        </button>
      </div>
    </Modal>
  );
}

export default Login;
