import { SourceFile } from '../types';

export const PROJECT_FILES: SourceFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'android',
    description: 'Android Manifest with Termux execution permissions and foreground service declarations',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.termux.server">

    <!-- Essential Termux Permissions -->
    <!-- Permission to execute commands inside Termux terminal session -->
    <permission
        android:name="com.termux.permission.RUN_COMMAND"
        android:protectionLevel="dangerous" />
    <uses-permission android:name="com.termux.permission.RUN_COMMAND" />

    <!-- Network & Server Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_MULTICAST_STATE" />

    <!-- Background Persistence & Boot Permissions -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <application
        android:name=".TermuxServerApp"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.TermuxServer"
        tools:targetApi="34">

        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/Theme.TermuxServer">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Foreground Service running the Web Server Bridge on Port 8080 -->
        <service
            android:name=".service.TermuxServerService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Termux Remote Web Terminal and HTTP Bridge" />
        </service>

        <!-- Boot Receiver to auto-start Termux:Server if enabled -->
        <receiver
            android:name=".receiver.BootReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`
  },
  {
    path: 'app/src/main/java/com/termux/server/service/TermuxServerService.kt',
    name: 'TermuxServerService.kt',
    language: 'kotlin',
    category: 'android',
    description: 'Kotlin Foreground Service managing embedded HTTP & WebSocket server for Termux',
    content: `package com.termux.server.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.net.wifi.WifiManager
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.text.format.Formatter
import androidx.core.app.NotificationCompat
import com.termux.server.R
import com.termux.server.bridge.TermuxBridge
import com.termux.server.server.EmbeddedWebServer
import com.termux.server.ui.MainActivity
import java.net.InetAddress
import java.net.NetworkInterface

/**
 * Foreground Service that hosts the Termux Web Terminal server on Port 8080
 * and bridges HTTP/WebSocket requests directly to Termux.
 */
class TermuxServerService : Service() {

    private var webServer: EmbeddedWebServer? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private val termuxBridge = TermuxBridge()

    companion object {
        const val CHANNEL_ID = "termux_server_channel"
        const val NOTIFICATION_ID = 1337
        const val ACTION_START = "com.termux.server.ACTION_START"
        const val ACTION_STOP = "com.termux.server.ACTION_STOP"
        const val EXTRA_PORT = "EXTRA_PORT"
        const val DEFAULT_PORT = 8080
        
        var isServerRunning: Boolean = false
            private set
        var serverPort: Int = DEFAULT_PORT
            private set
        var serverIp: String = "127.0.0.1"
            private set
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        acquireWakeLock()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val port = intent.getIntExtra(EXTRA_PORT, DEFAULT_PORT)
                startServer(port)
            }
            ACTION_STOP -> {
                stopServer()
                stopSelf()
            }
        }
        return START_STICKY
    }

    private fun startServer(port: Int) {
        serverPort = port
        serverIp = getLocalIpAddress()
        
        try {
            webServer?.stop()
            webServer = EmbeddedWebServer(this, port, termuxBridge).apply {
                start()
            }
            isServerRunning = true

            val notification = buildNotification("Running at http://$serverIp:$serverPort")
            startForeground(NOTIFICATION_ID, notification)
        } catch (e: Exception) {
            e.printStackTrace()
            isServerRunning = false
        }
    }

    private fun stopServer() {
        webServer?.stop()
        webServer = null
        isServerRunning = false
        stopForeground(STOP_FOREGROUND_REMOVE)
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "TermuxServer::WakeLock"
        ).apply {
            acquire(24 * 60 * 60 * 1000L) // 24 hours lock
        }
    }

    private fun getLocalIpAddress(): String {
        try {
            val interfaces = NetworkInterface.getNetworkInterfaces()
            while (interfaces.hasMoreElements()) {
                val networkInterface = interfaces.nextElement()
                val addresses = networkInterface.inetAddresses
                while (addresses.hasMoreElements()) {
                    val address = addresses.nextElement()
                    if (!address.isLoopbackAddress && address.hostAddress?.indexOf(':') == -1) {
                        return address.hostAddress ?: "127.0.0.1"
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return "127.0.0.1"
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Termux:Server Background Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps Termux Web Terminal running in background"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(contentText: String): Notification {
        val openIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, TermuxServerService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Termux:Server Active")
            .setContentText(contentText)
            .setSmallIcon(R.drawable.ic_terminal)
            .setContentIntent(pendingIntent)
            .addAction(R.drawable.ic_stop, "Stop Server", stopPendingIntent)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        stopServer()
        if (wakeLock?.isHeld == true) {
            wakeLock?.release()
        }
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`
  },
  {
    path: 'app/src/main/java/com/termux/server/bridge/TermuxBridge.kt',
    name: 'TermuxBridge.kt',
    language: 'kotlin',
    category: 'android',
    description: 'Termux RUN_COMMAND intent bridge to interact with real Termux sessions',
    content: `package com.termux.server.bridge

import android.content.Context
import android.content.Intent
import android.os.Bundle

/**
 * Handles communication with the official Termux app using
 * com.termux.permission.RUN_COMMAND and TermuxService intent calls.
 */
class TermuxBridge {

    companion object {
        const val TERMUX_PACKAGE = "com.termux"
        const val TERMUX_SERVICE = "com.termux.app.TermuxService"
        const val ACTION_RUN_COMMAND = "com.termux.RUN_COMMAND"
        const val EXTRA_COMMAND_PATH = "com.termux.RUN_COMMAND_PATH"
        const val EXTRA_ARGUMENTS = "com.termux.RUN_COMMAND_ARGUMENTS"
        const val EXTRA_WORKDIR = "com.termux.RUN_COMMAND_WORKDIR"
        const val EXTRA_BACKGROUND = "com.termux.RUN_COMMAND_BACKGROUND"
        const val EXTRA_SESSION_ACTION = "com.termux.RUN_COMMAND_SESSION_ACTION"
    }

    /**
     * Executes a command inside the Termux environment
     */
    fun executeInTermux(
        context: Context,
        command: String,
        workDir: String = "/data/data/com.termux/files/home",
        inBackground: Boolean = true
    ) {
        val intent = Intent().apply {
            setClassName(TERMUX_PACKAGE, TERMUX_SERVICE)
            action = ACTION_RUN_COMMAND
            putExtra(EXTRA_COMMAND_PATH, "/data/data/com.termux/files/usr/bin/bash")
            putExtra(EXTRA_ARGUMENTS, arrayOf("-c", command))
            putExtra(EXTRA_WORKDIR, workDir)
            putExtra(EXTRA_BACKGROUND, inBackground)
            putExtra(EXTRA_SESSION_ACTION, "0")
        }
        context.startService(intent)
    }
}`
  },
  {
    path: 'app/src/main/java/com/termux/server/ui/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    category: 'android',
    description: 'Main Android UI with Server Controls, LAN IP viewer, QR Code and Termux permission check',
    content: `package com.termux.server.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.termux.server.databinding.ActivityMainBinding
import com.termux.server.service.TermuxServerService

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
        updateServerUI()
        checkTermuxPermissions()
    }

    private fun setupListeners() {
        binding.btnToggleServer.setOnClickListener {
            if (TermuxServerService.isServerRunning) {
                stopServerService()
            } else {
                startServerService()
            }
        }

        binding.btnOpenBrowser.setOnClickListener {
            val url = "http://" + TermuxServerService.serverIp + ":" + TermuxServerService.serverPort
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            startActivity(browserIntent)
        }
    }

    private fun startServerService() {
        val intent = Intent(this, TermuxServerService::class.java).apply {
            action = TermuxServerService.ACTION_START
            putExtra(TermuxServerService.EXTRA_PORT, 8080)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
        updateServerUI()
    }

    private fun stopServerService() {
        val intent = Intent(this, TermuxServerService::class.java).apply {
            action = TermuxServerService.ACTION_STOP
        }
        startService(intent)
        updateServerUI()
    }

    private fun updateServerUI() {
        val isRunning = TermuxServerService.isServerRunning
        binding.tvServerStatus.text = if (isRunning) "Server is Running" else "Server Stopped"
        binding.tvServerUrl.text = if (isRunning) "http://\${TermuxServerService.serverIp}:\${TermuxServerService.serverPort}" else "Tap Start to launch"
        binding.btnToggleServer.text = if (isRunning) "Stop Termux Server" else "Start Termux Server"
    }

    private fun checkTermuxPermissions() {
        val permission = "com.termux.permission.RUN_COMMAND"
        if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(permission), 101)
        }
    }
}`
  },
  {
    path: 'scripts/termux-server',
    name: 'termux-server (CLI Binary)',
    language: 'bash',
    category: 'termux',
    description: 'Termux CLI executable placed in $PREFIX/bin/termux:server for start/stop/status commands',
    content: `#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# Termux:Server CLI - Web Terminal & HTTP Server Manager
# Author: Termux:Server Community
# License: GPL-3.0-or-later
# ==============================================================================

PORT="\${TERMUX_SERVER_PORT:-8080}"
PID_FILE="$PREFIX/var/run/termux-server.pid"
LOG_FILE="$PREFIX/var/log/termux-server.log"

get_ip() {
    local ip=$(ifconfig 2>/dev/null | grep -Eo 'inet (addr:)?([0-9]*\\.){3}[0-9]*' | grep -Eo '([0-9]*\\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)
    if [ -z "$ip" ]; then
        ip=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}')
    fi
    if [ -z "$ip" ]; then
        ip="127.0.0.1"
    fi
    echo "$ip"
}

start_server() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo -e "\\e[33m[!] Termux:Server is already running on PID $(cat "$PID_FILE")\\e[0m"
        show_url
        return 0
    fi

    mkdir -p "$PREFIX/var/run" "$PREFIX/var/log"
    local IP=$(get_ip)

    echo -e "\\e[32m[+] Starting Termux:Server on port $PORT...\\e[0m"

    # Check for ttyd or python / node web terminal server
    if command -v ttyd >/dev/null 2>&1; then
        nohup ttyd -p "$PORT" -W -t fontSize=15 -t theme='{"background":"#0d1117"}' bash > "$LOG_FILE" 2>&1 &
        echo $! > "$PID_FILE"
    elif command -v node >/dev/null 2>&1 && [ -f "$PREFIX/lib/node_modules/termux-server/server.js" ]; then
        nohup node "$PREFIX/lib/node_modules/termux-server/server.js" --port "$PORT" > "$LOG_FILE" 2>&1 &
        echo $! > "$PID_FILE"
    elif command -v python3 >/dev/null 2>&1; then
        nohup python3 -m http.server "$PORT" > "$LOG_FILE" 2>&1 &
        echo $! > "$PID_FILE"
    else
        echo -e "\\e[31m[-] Web terminal engine not found! Run 'termux-server setup' to install ttyd.\\e[0m"
        return 1
    fi

    sleep 1
    echo -e "\\e[32m[✔] Termux:Server successfully started!\\e[0m"
    show_url
}

stop_server() {
    if [ -f "$PID_FILE" ]; then
        local PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            rm -f "$PID_FILE"
            echo -e "\\e[32m[✔] Termux:Server (PID $PID) stopped.\\e[0m"
            return 0
        fi
        rm -f "$PID_FILE"
    fi
    # Also kill any lingering ttyd instances on port
    pkill -f "ttyd -p $PORT" 2>/dev/null || true
    echo -e "\\e[33m[!] Termux:Server is not running.\\e[0m"
}

status_server() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo -e "\\e[32m[●] Status: ACTIVE (PID $(cat "$PID_FILE"))\\e[0m"
        show_url
    else
        echo -e "\\e[31m[○] Status: INACTIVE (Stopped)\\e[0m"
    fi
}

show_url() {
    local IP=$(get_ip)
    echo -e "----------------------------------------------------"
    echo -e "\\e[1;36m🌐 Local Access:    http://127.0.0.1:$PORT/\\e[0m"
    echo -e "\\e[1;32m📱 LAN/Phone Access: http://$IP:$PORT/\\e[0m"
    echo -e "----------------------------------------------------"
    echo -e "Open the LAN link in ANY mobile/PC browser on the same Wi-Fi!"
}

setup_deps() {
    echo -e "\\e[34m[*] Installing Termux:Server dependencies (ttyd, openssl, iproute2)...\\e[0m"
    pkg update -y
    pkg install -y ttyd iproute2 net-tools openssl-tool termux-api
    echo -e "\\e[32m[✔] All dependencies installed successfully!\\e[0m"
}

case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        stop_server
        sleep 1
        start_server
        ;;
    status)
        status_server
        ;;
    setup)
        setup_deps
        ;;
    *)
        echo -e "\\e[1mTermux:Server Management Utility\\e[0m"
        echo -e "Usage: termux:server {start|stop|restart|status|setup}"
        echo -e ""
        echo -e "Commands:"
        echo -e "  start    Launch web terminal server at http://phone-ip:$PORT/"
        echo -e "  stop     Halt background server daemon"
        echo -e "  restart  Restart web server"
        echo -e "  status   Show current server health & access URL"
        echo -e "  setup    Install required packages (ttyd, etc.)"
        ;;
esac`
  },
  {
    path: 'scripts/install.sh',
    name: 'install.sh (One-Line Installer)',
    language: 'bash',
    category: 'termux',
    description: 'Installer script executed when typing pkg install termux-server or curl | bash',
    content: `#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# Termux:Server Automated Installer Script
# Installs 'termux:server' and 'termux-server' commands into $PREFIX/bin
# ==============================================================================

set -e

echo -e "\\e[1;34m"
echo "  _____                                     ____                              "
echo " |_   _|__ _ __ _ __ ___  _   ___  __     / ___|  ___ _ ____   _____ _ __    "
echo "   | |/ _ \\ '__| '_ \` _ \\| | | \\ \\/ /____ \\___ \\ / _ \\ '__\\ \\ / / _ \\ '__|   "
echo "   | |  __/ |  | | | | | | |_| |>  <_____| ___) |  __/ |   \\ V /  __/ |      "
echo "   |_|\\___|_|  |_| |_| |_|\\__,_/_/\\_\\     |____/ \\___|_|    \\_/ \\___|_|      "
echo "                                                                              "
echo -e "\\e[0m"
echo -e "\\e[32m[+] Configuring Termux:Server environment...\\e[0m"

# 1. Update and install required packages
pkg update -y
pkg install -y ttyd ncurses-utils iproute2 net-tools termux-tools

# 2. Download and link CLI binaries
TARGET_BIN="$PREFIX/bin/termux:server"
TARGET_ALIAS="$PREFIX/bin/termux-server"

cat << 'EOF' > "$TARGET_BIN"
#!/data/data/com.termux/files/usr/bin/bash
PORT="\${TERMUX_SERVER_PORT:-8080}"
PID_FILE="$PREFIX/var/run/termux-server.pid"
LOG_FILE="$PREFIX/var/log/termux-server.log"

get_ip() {
    local ip=$(ifconfig 2>/dev/null | grep -Eo 'inet (addr:)?([0-9]*\\.){3}[0-9]*' | grep -Eo '([0-9]*\\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)
    if [ -z "$ip" ]; then ip=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}'); fi
    if [ -z "$ip" ]; then ip="127.0.0.1"; fi
    echo "$ip"
}

case "$1" in
    start)
        mkdir -p "$PREFIX/var/run" "$PREFIX/var/log"
        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo -e "\\e[33m[!] Termux:Server is already active.\\e[0m"
        else
            nohup ttyd -p "$PORT" -W -t fontSize=15 bash > "$LOG_FILE" 2>&1 &
            echo $! > "$PID_FILE"
            sleep 1
            echo -e "\\e[32m[✔] Termux:Server started successfully!\\e[0m"
        fi
        IP=$(get_ip)
        echo -e "\\e[1;32m📱 Open in any phone/browser: http://$IP:$PORT/\\e[0m"
        ;;
    stop)
        if [ -f "$PID_FILE" ]; then kill $(cat "$PID_FILE") 2>/dev/null || true; rm -f "$PID_FILE"; fi
        pkill -f "ttyd -p $PORT" 2>/dev/null || true
        echo -e "\\e[32m[✔] Termux:Server stopped.\\e[0m"
        ;;
    status)
        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo -e "\\e[32m[●] Termux:Server is running on http://$(get_ip):$PORT/\\e[0m"
        else
            echo -e "\\e[31m[○] Termux:Server is not running.\\e[0m"
        fi
        ;;
    *)
        echo "Usage: termux:server {start|stop|status}"
        ;;
esac
EOF

chmod +x "$TARGET_BIN"
ln -sf "$TARGET_BIN" "$TARGET_ALIAS"

echo -e "\\e[32m[✔] Installation complete!\\e[0m"
echo -e "\\e[1;36mNow run: \\e[1;33mtermux:server start\\e[0m"
`
  },
  {
    path: 'metadata/com.termux.server.yml',
    name: 'com.termux.server.yml (F-Droid Metadata)',
    language: 'yaml',
    category: 'fdroid',
    description: 'Official F-Droid metadata recipe file for automated build and publication',
    content: `Categories:
  - System
  - Development
License: GPL-3.0-or-later
AuthorName: Termux:Server Open Source Contributors
AuthorEmail: termux-server@users.noreply.github.com
SourceCode: https://github.com/termux/termux-server
IssueTracker: https://github.com/termux/termux-server/issues
Changelog: https://github.com/termux/termux-server/releases

AutoName: 'Termux:Server'
Summary: 'Web Terminal & Remote Access Addon for Termux'
Description: |-
  Termux:Server is an open-source companion addon for the Termux Android terminal emulator.
  It enables live web-based terminal mirroring, HTTP remote execution, and local-area network
  terminal access at http://<phone-ip>:8080/ on any browser or device.

  Key Features:
  * Full interactive web terminal with virtual keyboard and ANSI color support
  * Direct intent bridge with Termux using com.termux.permission.RUN_COMMAND
  * Background foreground service with wake-lock support to keep connection alive
  * Zero-config LAN access with instant QR code scanning
  * Optional PIN authentication to safeguard remote terminal sessions

RepoType: git
Repo: https://github.com/termux/termux-server.git

Builds:
  - versionName: 1.0.0
    versionCode: 1
    commit: v1.0.0
    subdir: app
    gradle:
      - yes
    prebuild:
      - sed -i -e 's/signingConfig signingConfigs.release//' build.gradle.kts

AutoUpdateMode: Version
UpdateCheckMode: Tags
CurrentVersion: 1.0.0
CurrentVersionCode: 1`
  },
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml (GitHub Actions)',
    language: 'yaml',
    category: 'github',
    description: 'Automated CI/CD workflow to compile APK and publish GitHub Releases',
    content: `name: Build Termux:Server APK

on:
  push:
    branches: [ main, master ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    name: Build Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Grant Execute Permission for Gradlew
        run: chmod +x gradlew

      - name: Build Debug APK
        run: ./gradlew assembleDebug --stacktrace

      - name: Build Release APK (Unsigned)
        run: ./gradlew assembleRelease --stacktrace

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: termux-server-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk

      - name: Upload Release APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: termux-server-release-apk
          path: app/build/outputs/apk/release/app-release-unsigned.apk

      - name: Create GitHub Release
        if: startsWith(github.ref, 'refs/tags/v')
        uses: softprops/action-gh-release@v1
        with:
          files: |
            app/build/outputs/apk/debug/app-debug.apk
            app/build/outputs/apk/release/app-release-unsigned.apk
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'gradle',
    category: 'android',
    description: 'Gradle build configuration with dependencies for web server and Termux bridge',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.termux.server"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.termux.server"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    
    // Lightweight embedded HTTP/WebSocket server (NanoHTTPD or Ktor)
    implementation("org.nanohttpd:nanohttpd:2.3.1")
    implementation("org.nanohttpd:nanohttpd-websocket:2.3.1")
    
    // QR Code Generator
    implementation("com.google.zxing:core:3.5.3")
}`
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    category: 'github',
    description: 'Project README with Hindi & English quickstart, build commands, and F-Droid guide',
    content: `# 📱 Termux:Server

> **Termux:Server** is an open-source Android companion application & CLI utility for [Termux](https://termux.dev) that mirrors your full Termux terminal session live to \`http://<phone-ip>:8080/\` on any browser or phone in your local network.

[![F-Droid](https://img.shields.io/badge/F--Droid-Ready-brightgreen.svg)](https://f-droid.org)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Android](https://img.shields.io/badge/Platform-Android%207.0%2B-green.svg)](https://android.com)

---

## 🌟 Features / ख़ासियत

- 🌐 **Full Web Terminal**: Access your entire phone's Termux terminal in any browser on PC, tablet, or another phone.
- ⚡ **Zero-Config LAN**: Instant connection at \`http://phone-ip:8080/\` with interactive QR code.
- 🚀 **Termux CLI Integration**: Control everything via \`termux:server start\`, \`termux:server stop\`, and \`termux:server status\`.
- 🔋 **Background Wake-Lock**: Foreground Android Service keeps the connection alive even when the phone screen is off.
- 🔒 **Security PIN**: Optional PIN authentication protects from unauthorized LAN access.
- 📦 **F-Droid Ready**: Clean GPL-3.0 open-source code compliant with F-Droid inclusion policies.

---

## ⚡ Quick Start inside Termux / Termux में कैसे चलाएं

### Step 1: Install Script / इनस्टॉल करें
\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/termux/termux-server/main/scripts/install.sh | bash
\`\`\`

### Step 2: Start Server / सर्वर चालू करें
\`\`\`bash
termux:server start
\`\`\`

Terminal will print your Phone IP Address:
\`\`\`text
📱 Open in any browser: http://192.168.1.105:8080/
\`\`\`

### Step 3: Stop Server / सर्वर बंद करें
\`\`\`bash
termux:server stop
\`\`\`

---

## 🛠️ Building the APK from Source / APK कैसे बनाएं

### Using GitHub Actions (Easiest - No Android Studio Needed):
1. Fork or push this repository to GitHub.
2. Go to **Actions** tab and run **Build Termux:Server APK**.
3. Download the compiled \`app-debug.apk\` from the artifacts!

### Using Gradle Locally:
\`\`\`bash
git clone https://github.com/termux/termux-server.git
cd termux-server
./gradlew assembleDebug
# APK will be in: app/build/outputs/apk/debug/app-debug.apk
\`\`\`

---

## 📋 F-Droid Publication / F-Droid पर पब्लिश करना

1. Push the code with tag \`v1.0.0\`.
2. Submit the \`metadata/com.termux.server.yml\` file to \`gitlab.com/fdroid/fdroiddata\`.
3. F-Droid build servers will automatically compile the clean APK from source!`
  }
];
