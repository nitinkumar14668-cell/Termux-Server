import { TerminalLine, ServerConfig } from '../types';

export interface CommandExecutionResult {
  lines: TerminalLine[];
  updatedConfig?: Partial<ServerConfig>;
  clearScreen?: boolean;
}

export function getInitialTerminalHistory(serverIp: string, port: number): TerminalLine[] {
  return [
    {
      id: 'boot-1',
      type: 'system',
      content: '\x1b[1;36mWelcome to Termux:Server Terminal Emulator\x1b[0m',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'boot-2',
      type: 'info',
      content: 'Device: Android Linux (aarch64) • Termux Native Environment',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'boot-3',
      type: 'system',
      content: `Type '\x1b[1;32mpkg install termux-server\x1b[0m' or '\x1b[1;33mtermux:server start\x1b[0m' to begin.`,
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'boot-4',
      type: 'info',
      content: `Type '\x1b[1mhelp\x1b[0m' to see all available commands.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ];
}

export function executeCommand(
  rawCmd: string,
  config: ServerConfig,
  currentDir: string = '~'
): CommandExecutionResult {
  const trimmed = rawCmd.trim();
  const args = trimmed.split(/\s+/);
  const command = args[0]?.toLowerCase();
  const time = new Date().toLocaleTimeString();

  const createLine = (content: string, type: TerminalLine['type'] = 'output'): TerminalLine => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    content,
    timestamp: time,
  });

  if (!trimmed) {
    return { lines: [] };
  }

  // Handle 'clear'
  if (command === 'clear') {
    return { lines: [], clearScreen: true };
  }

  // Handle 'pkg install termux-server' or 'apt install termux-server'
  if ((command === 'pkg' || command === 'apt') && args[1] === 'install' && args[2]?.includes('termux-server')) {
    return {
      lines: [
        createLine(`\x1b[34m[*] Checking package repository availability...\x1b[0m`),
        createLine(`\x1b[32m[+] Found: termux-server v1.0.0 (aarch64)\x1b[0m`),
        createLine(`Unpacking termux-server (1.0.0) over (none)...`),
        createLine(`Setting up termux-server (1.0.0)...`),
        createLine(`Installing executable to /data/data/com.termux/files/usr/bin/termux:server`),
        createLine(`Symlinking $PREFIX/bin/termux-server -> $PREFIX/bin/termux:server`),
        createLine(`Granting permissions: com.termux.permission.RUN_COMMAND [GRANTED]`, 'success'),
        createLine(`\x1b[1;32m[✔] Installation complete! Run 'termux:server start' to launch web terminal.\x1b[0m`, 'success'),
      ]
    };
  }

  // Handle 'termux:server' or 'termux-server' commands
  if (command === 'termux:server' || command === 'termux-server') {
    const sub = args[1]?.toLowerCase();

    if (sub === 'start') {
      return {
        updatedConfig: { isRunning: true },
        lines: [
          createLine(`\x1b[32m[+] Starting Termux:Server HTTP Web Bridge...\x1b[0m`),
          createLine(`[+] Foreground Service initialized with WakeLock.`),
          createLine(`[+] Listening on 0.0.0.0:${config.port}`),
          createLine(`\x1b[1;32m[✔] Termux:Server successfully started!\x1b[0m`, 'success'),
          createLine(`----------------------------------------------------`),
          createLine(`\x1b[1;36m🌐 Local Access:    http://127.0.0.1:${config.port}/\x1b[0m`),
          createLine(`\x1b[1;32m📱 LAN/Phone Access: http://${config.ipAddress}:${config.port}/\x1b[0m`, 'success'),
          createLine(`----------------------------------------------------`),
          createLine(`Open http://${config.ipAddress}:${config.port}/ on ANY phone or PC browser on this Wi-Fi!`, 'info')
        ]
      };
    }

    if (sub === 'stop') {
      return {
        updatedConfig: { isRunning: false },
        lines: [
          createLine(`\x1b[33m[!] Stopping Termux:Server foreground daemon...\x1b[0m`),
          createLine(`[✔] Server stopped on port ${config.port}.`, 'success')
        ]
      };
    }

    if (sub === 'status') {
      if (config.isRunning) {
        return {
          lines: [
            createLine(`\x1b[1;32m[●] Status: ACTIVE (Foreground Service Running)\x1b[0m`, 'success'),
            createLine(`Port: ${config.port} | IP: ${config.ipAddress}`),
            createLine(`URL: http://${config.ipAddress}:${config.port}/`),
            createLine(`Connected Web Clients: ${config.activeSessions}`)
          ]
        };
      } else {
        return {
          lines: [
            createLine(`\x1b[31m[○] Status: INACTIVE (Stopped)\x1b[0m`, 'warning'),
            createLine(`Run 'termux:server start' to launch.`)
          ]
        };
      }
    }

    if (sub === 'restart') {
      return {
        updatedConfig: { isRunning: true },
        lines: [
          createLine(`[+] Restarting Termux:Server...`),
          createLine(`\x1b[1;32m[✔] Server restarted at http://${config.ipAddress}:${config.port}/\x1b[0m`, 'success')
        ]
      };
    }

    // Default help for termux:server
    return {
      lines: [
        createLine(`\x1b[1mTermux:Server CLI Utility\x1b[0m`),
        createLine(`Usage: termux:server {start|stop|restart|status}`),
        createLine(`  start    Launch web terminal server at http://${config.ipAddress}:${config.port}/`),
        createLine(`  stop     Halt background server daemon`),
        createLine(`  status   Show current server health & access URL`),
        createLine(`  restart  Restart web server bridge`)
      ]
    };
  }

  // Handle standard commands
  switch (command) {
    case 'help':
      return {
        lines: [
          createLine(`\x1b[1;36mTermux:Server Terminal Commands:\x1b[0m`),
          createLine(`  \x1b[1;32mpkg install termux-server\x1b[0m  Install Termux Server CLI`),
          createLine(`  \x1b[1;33mtermux:server start\x1b[0m        Start live web terminal at port ${config.port}`),
          createLine(`  \x1b[1;33mtermux:server stop\x1b[0m         Stop web terminal server`),
          createLine(`  \x1b[1;33mtermux:server status\x1b[0m       Check server status and URL`),
          createLine(`  \x1b[36mneofetch\x1b[0m                   Display Termux & Android system info`),
          createLine(`  \x1b[36mip a / ifconfig\x1b[0m            Display phone Wi-Fi IP address`),
          createLine(`  \x1b[36mls, pwd, cd, cat\x1b[0m           Basic Linux filesystem navigation`),
          createLine(`  \x1b[36mtop / htop\x1b[0m                 Display active system processes`),
          createLine(`  \x1b[36mclear\x1b[0m                      Clear terminal screen`)
        ]
      };

    case 'neofetch':
      return {
        lines: [
          createLine(`\x1b[32m           -o          o-           \x1b[1;36mu0_a245@localhost\x1b[0m`),
          createLine(`\x1b[32m            +hydNNNNdyh+            \x1b[0m-----------------`),
          createLine(`\x1b[32m          +mMMMMMMMMMMMMm+          \x1b[1mOS\x1b[0m: Android 14 (Linux 5.10-android)`),
          createLine(`\x1b[32m        \`dMMm:NMMMMMMN:mMMd\`        \x1b[1mHost\x1b[0m: Android Termux Container`),
          createLine(`\x1b[32m        hMMMMMMMMMMMMMMMMMMh        \x1b[1mKernel\x1b[0m: 5.10.198-android14-9-g8a`),
          createLine(`\x1b[32m        MMMMMMMMMMMMMMMMMMMM        \x1b[1mUptime\x1b[0m: 4 days, 12 hours, 38 mins`),
          createLine(`\x1b[32m        \x1b[0m--== Termux:Server ==--      \x1b[1mPackages\x1b[0m: 142 (dpkg)`),
          createLine(`\x1b[32m        \`hMMMMMMMMMMMMMMMMh\`        \x1b[1mShell\x1b[0m: bash 5.2.26`),
          createLine(`\x1b[32m          :sNMMMMMMMMMMNs:          \x1b[1mTerminal\x1b[0m: termux-server-web-tty`),
          createLine(`\x1b[32m            \`+yddkmmkddy+\`          \x1b[1mCPU\x1b[0m: ARMv8 (8) @ 2.84 GHz`),
          createLine(`\x1b[32m              \`--\`  \`--\`            \x1b[1mMemory\x1b[0m: 3824MiB / 7840MiB`)
        ]
      };

    case 'ifconfig':
    case 'ip':
      return {
        lines: [
          createLine(`wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500`),
          createLine(`        inet \x1b[1;32m${config.ipAddress}\x1b[0m  netmask 255.255.255.0  broadcast 192.168.1.255`),
          createLine(`        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>`),
          createLine(`        ether 02:00:00:00:00:00  txqueuelen 1000  (Ethernet)`),
          createLine(`lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536`),
          createLine(`        inet 127.0.0.1  netmask 255.0.0.0`),
        ]
      };

    case 'whoami':
      return { lines: [createLine('u0_a245')] };

    case 'pwd':
      return { lines: [createLine('/data/data/com.termux/files/home')] };

    case 'uname':
      return { lines: [createLine('Linux localhost 5.10.198-android14-9-g8a #1 SMP PREEMPT aarch64 Android')] };

    case 'ls':
      return {
        lines: [
          createLine(`\x1b[1;34mstorage\x1b[0m   \x1b[1;34mserver\x1b[0m   \x1b[1;32minstall.sh\x1b[0m   \x1b[1;34mprojects\x1b[0m   README.md`)
        ]
      };

    case 'date':
      return { lines: [createLine(new Date().toString())] };

    case 'top':
    case 'htop':
      return {
        lines: [
          createLine(`Tasks: 4 total, 1 running, 3 sleeping, 0 stopped`),
          createLine(`%Cpu(s):  1.2 us,  0.8 sy,  0.0 ni, 98.0 id`),
          createLine(`MiB Mem :   7840.0 total,   3824.0 free,   2412.0 used`),
          createLine(`  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND`),
          createLine(` 1337 u0_a245   20   0   42.4m  14.2m   8.1m S   1.2   0.2   0:04.12 termux:server`),
          createLine(` 1402 u0_a245   20   0   18.1m   5.6m   3.2m S   0.0   0.1   0:00.08 bash`)
        ]
      };

    case 'termux-setup-storage':
      return {
        lines: [
          createLine(`[+] Requesting android.permission.READ_EXTERNAL_STORAGE & WRITE_EXTERNAL_STORAGE...`),
          createLine(`[✔] Storage symlinks created in ~/storage: shared, downloads, dcim, pictures, music.`, 'success')
        ]
      };

    case 'cat':
      if (args[1] === 'README.md') {
        return {
          lines: [
            createLine(`\x1b[1m# Termux:Server\x1b[0m`),
            createLine(`Live web terminal server running on port ${config.port}.`),
            createLine(`Run 'termux:server start' to launch.`)
          ]
        };
      }
      return {
        lines: [
          createLine(`cat: ${args[1] || 'missing file operand'}: No such file or directory`, 'error')
        ]
      };

    default:
      return {
        lines: [
          createLine(`\x1b[31mtermux: command not found: ${command}\x1b[0m`, 'error'),
          createLine(`Type '\x1b[1;36mhelp\x1b[0m' or '\x1b[1;32mpkg install termux-server\x1b[0m' or '\x1b[1;33mtermux:server start\x1b[0m'.`, 'info')
        ]
      };
  }
}
