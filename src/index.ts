import { WebSocketServer } from "ws";
import os from "os";
import { Client } from "ssh2";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server started on ws://localhost:${PORT}`);
console.log(`Platform: ${os.platform()}`);

wss.on("connection", (ws) => {
  console.log("Client connected");

  const sshClient = new Client();
  let sshStream: any = null;
  let isSSHConnected = false; // Track SSH connection state

  ws.send("$ ");

  // ✅ Handle SSH client disconnection properly
  sshClient.on("close", () => {
    console.log("SSH connection closed");
    isSSHConnected = false;
    sshStream = null;
    ws.send("\r\nSSH connection closed\r\n$ "); // Send new local prompt
  });

  sshClient.on("error", (err) => {
    console.log("SSH client error:", err.message);
    isSSHConnected = false;
    sshStream = null;
    ws.send(`\r\nSSH error: ${err.message}\r\n$ `); // Send new local prompt
  });

  ws.on("message", (raw) => {
    const msg = raw.toString();

    try {
      const parsed = JSON.parse(msg);

      // Handle connection config
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

            // ✅ Handle shell stream data
            sshStream.on("data", (data: Buffer) => {
              ws.send(data.toString());
            });

            // ✅ Handle shell stream close (when user types 'exit')
            sshStream.on("close", () => {
              console.log("SSH shell stream closed");
              sshStream = null;
              // Don't send prompt here - let SSH client 'close' event handle it
            });

            sshStream.on("error", (err: any) => {
              console.log("SSH stream error:", err.message);
              ws.send(`\r\nStream error: ${err.message}\r\n$ `);
              sshStream = null;
            });
          });
        });

        sshClient.connect({ host, port, username, password });
        return;
      }
    } catch {
      // Not JSON → must be a terminal command
      if (sshStream && isSSHConnected) {
        // Forward to SSH
        sshStream.write(msg);
      } else {
        // ✅ Handle local commands when not connected to SSH
        if (msg.trim() === "") {
          ws.send("$ ");
          return;
        }

        if (msg.trim() === "clear") {
          ws.send("\x1B[2J\x1B[H$ ");
          return;
        }

        // For any other command when not SSH connected
        ws.send(
          "Not connected to SSH. Use 'ssh username@host -p port' first.\r\n$ "
        );
      }
    }
  });

  // ✅ Clean WebSocket disconnect
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    if (sshStream) {
      sshStream.end();
    }
    if (isSSHConnected) {
      sshClient.end();
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

process.on("SIGTERM", () => {
  console.log("Shutting down WebSocket server...");
  wss.close();
});
