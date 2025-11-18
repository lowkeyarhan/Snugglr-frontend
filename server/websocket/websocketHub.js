import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

const READY = 1;

class WebSocketHub {
  constructor() {
    this.server = null;
    this.chatRooms = new Map();
    this.notificationRooms = new Map();
  }

  init(httpServer) {
    if (this.server) {
      return this.server;
    }

    this.server = new WebSocketServer({
      server: httpServer,
      path: "/ws",
    });

    this.server.on("connection", (socket, req) => {
      const userId = this.authenticate(req);
      if (!userId) {
        socket.close(4001, "Unauthorized");
        return;
      }

      socket.userId = userId;
      socket.chatRooms = new Set();
      socket.on("message", (raw) => this.handleMessage(socket, raw));
      socket.on("close", () => this.cleanup(socket));
      socket.on("error", () => this.cleanup(socket));

      this.send(socket, { type: "connection:ready" });
    });

    console.log("WebSocket server ready");
    return this.server;
  }

  authenticate(req) {
    try {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      const token =
        url.searchParams.get("token") || req.headers["sec-websocket-protocol"];
      if (!token) return null;
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      return payload.id || payload._id || payload.userId || null;
    } catch (error) {
      console.error(`WS auth failed: ${error.message}`);
      return null;
    }
  }

  handleMessage(socket, raw) {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (data.type) {
      case "joinChat":
        this.joinChat(socket, data.chatId);
        break;
      case "leaveChat":
        this.leaveChat(socket, data.chatId);
        break;
      case "joinNotifications":
        this.joinNotifications(socket);
        break;
      case "leaveNotifications":
        this.leaveNotifications(socket);
        break;
      default:
        break;
    }
  }

  joinChat(socket, chatId) {
    const id =
      typeof chatId === "string" ? chatId : chatId?.toString?.() || null;
    if (!id) return;
    if (!this.chatRooms.has(id)) {
      this.chatRooms.set(id, new Set());
    }
    this.chatRooms.get(id).add(socket);
    socket.chatRooms.add(id);
  }

  leaveChat(socket, chatId) {
    const id =
      typeof chatId === "string" ? chatId : chatId?.toString?.() || null;
    if (!id || !this.chatRooms.has(id)) return;
    const room = this.chatRooms.get(id);
    room.delete(socket);
    if (room.size === 0) {
      this.chatRooms.delete(id);
    }
    socket.chatRooms.delete(id);
  }

  joinNotifications(socket) {
    const userId = socket.userId?.toString();
    if (!userId) return;
    if (!this.notificationRooms.has(userId)) {
      this.notificationRooms.set(userId, new Set());
    }
    this.notificationRooms.get(userId).add(socket);
    socket.listenNotifications = true;
  }

  leaveNotifications(socket) {
    const userId = socket.userId?.toString();
    if (!userId || !this.notificationRooms.has(userId)) return;
    const room = this.notificationRooms.get(userId);
    room.delete(socket);
    if (room.size === 0) {
      this.notificationRooms.delete(userId);
    }
    socket.listenNotifications = false;
  }

  cleanup(socket) {
    if (socket.chatRooms) {
      for (const chatId of socket.chatRooms) {
        this.leaveChat(socket, chatId);
      }
    }
    if (socket.listenNotifications) {
      this.leaveNotifications(socket);
    }
  }

  pushChatMessage(chatId, payload) {
    const id =
      typeof chatId === "string" ? chatId : chatId?.toString?.() || null;
    if (!id || !this.chatRooms.has(id)) return;
    const room = this.chatRooms.get(id);
    const message = JSON.stringify({
      type: "chat:message",
      data: payload,
    });

    room.forEach((socket) => {
      this.sendRaw(socket, message);
    });
  }

  pushNotification(userId, notification) {
    const id = userId?.toString();
    if (!id) return;
    const room = this.notificationRooms.get(id);
    if (!room) return;

    const message = JSON.stringify({
      type: "notification:new",
      data: notification,
    });

    room.forEach((socket) => {
      this.sendRaw(socket, message);
    });
  }

  send(socket, data) {
    this.sendRaw(socket, JSON.stringify(data));
  }

  sendRaw(socket, raw) {
    if (!socket || socket.readyState !== READY) return;
    socket.send(raw);
  }
}

const webSocketHub = new WebSocketHub();
export default webSocketHub;
