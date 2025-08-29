import { Client, type ConnectConfig } from "ssh2";
import { WebSocket } from "ws";

export class SSHHandler {
  private ws: WebSocket;
  private sshClient: Client;
  private sshStream: any = null;
  private isSSHConnected: boolean = false;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.sshClient = new Client();
    this.setupListeners();
    // this.ws.send("$ ");
  }

  private setupListeners(): void {
    this.sshClient.on("ready", () => {
      this.isSSHConnected = true;
      this.sshClient.shell((err, stream) => {
        if (err) {
          this.ws.send(`\r\nShell error: ${err.message}\r\n$ `);
          return;
        }
        this.sshStream = stream;
        stream.on("data", (data: Buffer) => this.ws.send(data.toString()));
        stream.on("close", () => (this.sshStream = null));
      });
    });
    this.sshClient.on("close", () => {
      this.isSSHConnected = false;
      this.ws.send("\r\nSSH connection closed.\r\n$ ");
    });
    this.sshClient.on("error", (err) => {
      this.isSSHConnected = false;
      this.ws.send(`\r\nSSH error: ${err.message}\r\n$ `);
    });
  }

  public connect(config: ConnectConfig): void {
    this.sshClient.connect(config);
  }

  public write(data: string): void {
    if (this.sshStream && this.isSSHConnected) {
      this.sshStream.write(data);
    } else {
      if (data.trim() === "clear") this.ws.send("\x1B[2J\x1B[H$ ");
      else this.ws.send("\r\nNot connected to SSH.\r\n$ ");
    }
  }

  public close(): void {
    if (this.sshStream) this.sshStream.end();
    if (this.isSSHConnected) this.sshClient.end();
  }
}
