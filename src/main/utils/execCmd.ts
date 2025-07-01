import { spawn } from "child_process";
import { openApp } from "open";
import os from "os";

export async function execCommand(command: string): Promise<void> {
  try {
    const platform = process.platform;
    let app: string;
    let args: string[] = [];

    switch (platform) {
      case 'darwin':
        app = 'osascript';
        const escapedCommandForMac = command.replace(/"/g, '\\"');
        args = [
          '-e',
          `tell application "Terminal"
               activate
               do script "${escapedCommandForMac}"
             end tell`,
        ];

        await openApp(app, { arguments: args });
        break;

      case 'linux':
        app = 'x-terminal-emulator';
        const escapedCommandForLinux = command.replace(/"/g, '\\"');
        args = ['-e', `bash -c "${escapedCommandForLinux}; exec bash"`];

        await openApp(app, { arguments: args });
        break;

      case 'win32':
        spawn('cmd.exe', ['/k', command], { shell: true, detached: true, cwd: os.homedir() });
        break;

      default:
        return;
    }
  } catch (error) {
    console.error('Run command error:', error);
  }
}