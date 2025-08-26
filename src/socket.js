import { io } from "socket.io-client";

const API_BASE = "https://hurryup-express-server-1.onrender.com";

export const socket = io(API_BASE, { autoConnect: true });
