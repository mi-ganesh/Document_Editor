import { io } from "socket.io-client";

export const initSocket = () => {
  const socket = io(
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
    {
      forceNew: true,
      reconnectionAttempts: Infinity,
      timeout: 10000,
      transports: ["websocket"],
    }
  );

  return socket;
};
