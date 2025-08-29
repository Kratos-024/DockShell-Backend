import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { SSHHandler } from "./SSH";
import { StreamingChatHandler } from "./OpenRouter";

export class WebSocketManager {
  private wss: WebSocketServer;

  constructor(server: http.Server, private openaiApiKey: string) {
    if (!openaiApiKey) {
      throw new Error("OpenAI API key must be provided to WebSocketManager.");
    }
    this.wss = new WebSocketServer({ server });
    this.setupConnectionHandling();
  }

  private setupConnectionHandling(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("Client connected. Initializing handlers.");

      const sshHandler = new SSHHandler(ws);
      const chatHandler = new StreamingChatHandler(ws, this.openaiApiKey);

      ws.on("message", async (message) => {
        const msg = message.toString();
        try {
          const parsed = JSON.parse(msg);
          switch (parsed.type) {
            case "connect-ssh":
              sshHandler.connect(parsed.data);
              break;
            case "chat":
              await chatHandler.streamChat(parsed.data);
              break;
            default:
              sshHandler.write(msg);
          }
        } catch (e) {
          sshHandler.write(msg);
        }
      });

      ws.on("close", () => {
        console.log("Client disconnected. Cleaning up SSH handler.");
        sshHandler.close();
      });

      ws.on("error", (err) => {
        console.error("WebSocket error:", err);
        sshHandler.close();
      });
    });

    console.log("WebSocketManager is listening for connections.");
  }
}
