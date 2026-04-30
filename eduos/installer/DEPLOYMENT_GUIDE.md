# 🚀 EduOS Deployment Walkthrough (v1.0.0)

This guide covers the installation of the **EduOS** ecosystem on the **Luckfox Pico Ultra (SSPH-01)** hardware.

## 🛠️ Step 1: Prepare the Installation Media
1.  **Insert SD Card**: Use a high-quality (Class 10) SD card with at least 8GB of space.
2.  **Run Build**: Ensure your latest software changes are compiled:
    ```powershell
    .\eduos\build-eduos.ps1
    ```
3.  **Run Installer**: Use the new deployment tool to flash your SD card:
    ```powershell
    .\eduos\installer\deploy-to-sd.ps1
    ```

## 🔐 Step 2: Setting up the Identity Gate (School Station)
The **Identity Gate** acts as the face-recognition entry point for the school.
1.  **Hardware**: Wall-mounted Luckfox Pico Ultra + Wide-Angle MIPI Camera.
2.  **Configuration**: Set the device to `ROLE=GATE` in the `manifest.json`.
3.  **Boot**: The device will automatically boot into the **FaceID + QR Generation** mode.

## 🎓 Step 3: Deploying Student Hubs
1.  **Flashing**: Repeat the SD card installation for every student device.
2.  **Hardware Binding**: Upon first boot, the hub will ask to "Bind to Profile". Use the **Admin Provisioning Tool** to link the device's MAC address to a student ID.
3.  **Kiosk Mode**: The hubs will automatically enter **Lockdown Mode**, showing only the EduPortal login screen.

## 👁️ Step 4: Activating 'God-Mode' Monitoring
Once the hubs are online, teachers can monitor the classroom:
1.  **Login**: Access the **Teacher Dashboard** via a browser.
2.  **Live Grid**: The **Live Monitor Grid** will automatically populate as student hubs send their heartbeats.
3.  **Remote Control**: Test the **Lock Screen** and **Push URL** features to ensure real-time command latency is < 2s.

## 🌐 Step 5: Final Verification
*   [ ] **FaceID Handshake**: Does the Gate recognize the student and show a QR?
*   [ ] **QR Login**: Does scanning the Gate QR log the student into their Hub?
*   [ ] **Offline Check**: Disconnect the Wi-Fi. Does the dashboard still load from the 7-day Nginx cache?
*   [ ] **AI Proctoring**: Does the Hub flag the student if they look away during a quiz?

---
**Build Signature**: `1.0.0-SSPH01` | **Target**: `RV1106 ARM-v8`
