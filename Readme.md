# Device-Based License Management System 🔐

A robust, hardware-locked license verification system built with Python and Google Apps Script. This project demonstrates how to securely manage desktop application access using a centralized cloud database (Google Sheets) and machine-specific identifiers (MAC Addresses).

## 💡 Project Overview
The primary goal of this system is to prevent unauthorized distribution and access to a desktop application. Instead of traditional passwords, the system reads the physical MAC address of the user's device and cross-references it with a cloud-based approval list.

## ⚙️ Key Features
* **Hardware-Locked Access:** Generates a unique Device ID based on the system's MAC address (`uuid.getnode()`).
* **Cloud Database Integration:** Uses Google Sheets as a lightweight, real-time database to track, approve, and reject user requests.
* **REST API Communication:** Utilizes Google Apps Script (Web App) to handle POST requests from the Python client.
* **Local Caching Mechanism:** Once approved, the system generates a local `license.key` file. This minimizes unnecessary API calls to the server and speeds up the verification process on subsequent launches.
* **Automated Email Notifications:** The server automatically dispatches an email to the admin whenever a new device requests access.

## 🛠️ Technologies & Tools Used
* **Backend / API:** Google Apps Script, Google Sheets API.
* **Client Application:** Python 3.
* **GUI Framework:** Tkinter (for request forms and user feedback).
* **Libraries:** `requests`, `os`, `uuid`, `shutil`.

## 📂 System Architecture
1. **The Client (`CODE.py`):** 
   - A Python desktop app that extracts the hardware ID.
   - Allows new users to submit a request (Device ID + Username) to the server.
   - Checks the local `license.key` before making an HTTP request to ensure optimal performance.
2. **The Server (`Script.gs`):** 
   - A Google Apps Script that acts as a webhook/API.
   - Receives the Device ID, checks it against the Google Sheet, and returns the status (`approved`, `pending`, or `rejected`).
   - Appends new, unrecognized devices to the database automatically for admin review.

## 🚀 How It Works (Workflow)
1. **Unregistered User:** Opens the app, clicks "Start", and gets an "Access Denied" message. They must click "Send Request" and enter their username.
2. **Admin Verification:** The server logs the request in Google Sheets as `pending` and sends an email alert to the admin. The admin manually changes the status to `approved`.
3. **Approved User:** The user clicks "Start" again. The app contacts the server, reads the `approved` status, creates a local `license.key`, and grants access to the main application interface.