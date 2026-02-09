import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import {ACTIONS} from "../Actions.js";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";

function EditorPage() {
  const [clients, setClients] = useState([]);
  const codeRef = useRef(null);
  const socketRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  /* =====================
     Socket error handler
  ===================== */
  const handleErrors = (err) => {
    console.error("Socket error:", err);
    toast.error("Socket connection failed. Try again later.");
    navigate("/");
  };

  /* =====================
     Download handler
  ===================== */
  const handleDownload = () => {
    window.open(
      `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/download/${roomId}`,
      "_blank"
    );
  };

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room`);
          }
          setClients(clients);

          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied");
    } catch {
      toast.error("Unable to copy Room ID");
    }
  };

  const leaveRoom = () => {
    navigate("/");
    toast.success("Left the room");
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Sidebar */}
        <aside className="col-md-2 bg-dark text-light d-flex flex-column p-3">
          {/* Logo */}
          <div className="text-center mb-3">
            <img
              src="/panda.png"
              alt="Logo"
              className="img-fluid"
              style={{ maxWidth: "120px" }}
            />
          </div>

          <hr />

          {/* Clients */}
          <div className="flex-grow-1 overflow-auto">
            <h6 className="mb-2">Members</h6>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          <hr />

          {/* Actions */}
          <button
            className="btn btn-success w-100 mb-2"
            onClick={copyRoomId}
          >
            Copy Room ID
          </button>
          <button
            className="btn btn-danger w-100"
            onClick={leaveRoom}
          >
            Leave Room
          </button>
        </aside>

        {/* Editor */}
        <main className="col-md-10 d-flex flex-column p-3">
          <div className="d-flex justify-content-end mb-2">
            <button
              className="btn btn-danger"
              onClick={handleDownload}
            >
              Download File
            </button>
          </div>

          <div className="flex-grow-1">
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={(code) => {
                codeRef.current = code;
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default EditorPage;
