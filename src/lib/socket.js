import { io } from "socket.io-client";
import { getApiBaseUrl } from "../config/api";

const API_BASE = getApiBaseUrl();
export const socket = io(API_BASE, { autoConnect: true });
