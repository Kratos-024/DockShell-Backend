import { Client } from "ssh2";
import { WebSocketServer } from "ws";
import http from "http";
import { app } from "./app";
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({ server });
console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  console.log("User connected successfully");

  const sshClient = new Client();
  let sshStream: any = null;
  let isSSHConnected = false;

  ws.send("$ ");

  ws.on("message", (message) => {
    const msg = message.toString();

    try {
      const parsed = JSON.parse(msg);

      if (parsed.type === "connect") {
        const { host, port, username, password } = parsed.data;

        sshClient.on("ready", () => {
          console.log("SSH connection established");
          isSSHConnected = true;

          sshClient.shell((err, stream) => {
            if (err) {
              ws.send(`Error starting shell: ${err.message}\r\n$ `);
              return;
            }
            sshStream = stream;

            stream.on("data", (data: Buffer) => ws.send(data.toString()));

            stream.on("close", () => {
              console.log("SSH shell stream closed");
              sshStream = null;
            });

            stream.on("error", (err: any) => {
              console.log("SSH stream error:", err.message);
              ws.send(`\r\nStream error: ${err.message}\r\n$ `);
              sshStream = null;
            });
          });
        });

        sshClient.on("close", () => {
          console.log("SSH connection closed");
          isSSHConnected = false;
          sshStream = null;
          ws.send("\r\nSSH connection closed\r\n$ ");
          ws.send("$ ");
        });

        sshClient.on("error", (err) => {
          console.log("SSH client error:", err.message);
          isSSHConnected = false;
          sshStream = null;
          ws.send(`\r\nSSH error: ${err.message}\r\n$ `);
        });
        sshClient.connect({ host, port, username, password });
        return;
      }
    } catch {
      if (sshStream && isSSHConnected) {
        sshStream.write(msg);
      } else {
        if (msg.trim() === "") {
          ws.send("$ ");
          return;
        }

        if (msg.trim() === "clear") {
          ws.send("\x1B[2J\x1B[H$ ");
          return;
        }

        ws.send(
          "Not connected to SSH. Use 'ssh username@host -p port' first.\r\n$ "
        );
      }
    }

    console.log("User sent:", msg);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    if (sshStream) sshStream.end();
    if (isSSHConnected) sshClient.end();
    ws.send("$ ");
  });
});

process.on("SIGTERM", () => {
  console.log("Shutting down WebSocket server...");
  wss.close();
  server.close();
});

server.listen(PORT, () => {
  console.log(`HTTP server running at http://localhost:${PORT}`);
  console.log(`WebSocket server running at ws://localhost:${PORT}`);
});
