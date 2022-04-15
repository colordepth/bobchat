import Modal from "./Modal";
import { useState, useEffect } from "react";
import socket from "../services/socket";

function loginWithUserID(userID) {
  socket.auth = { userID };
  socket.connect();
}

function loginWithSessionID(sessionID) {  
  if (!sessionID) {
    return;
  }

  socket.auth = { sessionID };
  socket.connect();
}

const Login = ({setSessionID}) => {
  const [modalIsOpen, setModalIsOpen] = useState(true);
  const [userID, setUserID] = useState('');

  function loginTrigger() {
    setModalIsOpen(false);
    loginWithUserID(userID);
  }

  function activateSessionListener() {
    socket.on("session", ({ sessionID, userID }) => {
      socket.auth = { sessionID };
      socket.userID = userID;
      localStorage.setItem("session-id", sessionID);
      setSessionID(sessionID);
    });

    loginWithSessionID(localStorage.getItem("session-id"));

    return () => socket.off("session");
  }

  useEffect(activateSessionListener, []);

  if (localStorage.getItem("session-id")) {
    return <></>;
  }

  return (
    <>
      <Modal isOpen={modalIsOpen}>
        <div>
          <input
            type="text"
            value={userID}
            placeholder="Phone number"
            onChange={event => setUserID(event.target.value)}
          />
          <button onClick={loginTrigger}>
            Log in
          </button>
        </div>
      </Modal>
    </>
  );
}

export default Login;
