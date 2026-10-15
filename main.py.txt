import os
import sys
import shutil
import uuid
import requests
import tkinter as tk
from tkinter import filedialog, messagebox

LICENSE_FILE = "license.key"
LICENSE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz0IbvXLd_94r5GQ1wQXbet27DgWALXavqbHDw1YlCDjazb9gIZBf5wwXS-GkeYUrDQ/exec"


def get_device_id():
    mac = uuid.getnode()
    return hex(mac)


def send_device_id_request():
    def submit():
        username = username_entry.get().strip()
        if not username:
            messagebox.showerror("Input Error", "Please enter a username.")
            return

        try:
            device_id = get_device_id()
            response = requests.post(LICENSE_WEB_APP_URL, data={
                "device_id": device_id,
                "username": username
            })
            if response.status_code != 200:
                raise Exception("Failed to contact server.")

            result = response.text.strip().lower()
            if result == "pending":
                messagebox.showinfo("Pending", "Device ID sent. Waiting for approval.")
            elif result == "approved":
                with open(LICENSE_FILE, "w") as f:
                    f.write(device_id)
                messagebox.showinfo("Approved", "Device approved. You can now press Start.")
            elif result == "rejected":
                messagebox.showerror("Rejected", "This device has been rejected by the admin.")
            else:
                messagebox.showerror("Error", f"Unexpected server response: {result}")
            input_window.destroy()
        except Exception as e:
            messagebox.showerror("Error", f"Error sending device ID.\n\n{e}")

    input_window = tk.Toplevel()
    input_window.title("Enter Username")
    input_window.geometry("300x150")
    input_window.resizable(False, False)

    tk.Label(input_window, text="Enter your username:").pack(pady=10)
    username_entry = tk.Entry(input_window, width=30)
    username_entry.pack(pady=5)

    submit_btn = tk.Button(input_window, text="Send", command=submit)
    submit_btn.pack(pady=10)


def verify_remote_license():
    try:
        device_id = get_device_id()
        if os.path.exists(LICENSE_FILE):
            with open(LICENSE_FILE, "r") as f:
                stored_id = f.read().strip()
                return stored_id == device_id
        else:
            # Try checking approval status from server
            response = requests.post(LICENSE_WEB_APP_URL, data={
                "device_id": device_id,
                "username": "auto-check"
            })
            if response.status_code != 200:
                return False

            result = response.text.strip().lower()
            if result == "approved":
                with open(LICENSE_FILE, "w") as f:
                    f.write(device_id)
                return True
            else:
                return False
    except Exception as e:
        messagebox.showerror("License Error", f"Could not verify license.\n\n{e}")
        return False



def show_device_id():
    device_id = get_device_id()
    root = tk.Tk()
    root.withdraw()
    root.clipboard_clear()
    root.clipboard_append(device_id)
    messagebox.showinfo("Device ID", f"Device ID copied to clipboard:\n{device_id}")
    root.destroy()


def copy_images(src_folder, dst_folder):
    if not os.path.exists(dst_folder):
        os.makedirs(dst_folder)
    count = 0
    for filename in os.listdir(src_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif')):
            try:
                shutil.copy2(os.path.join(src_folder, filename),
                             os.path.join(dst_folder, filename))
                count += 1
            except Exception as e:
                messagebox.showerror("Copy Error", f"{filename}: {e}")
    messagebox.showinfo("Done", f"{count} images copied successfully.")


def start_process():
    source_folder = filedialog.askdirectory(title="Select source image folder")
    if not source_folder:
        return

    destination_folder = filedialog.askdirectory(title="Select destination folder")
    if not destination_folder:
        return

    copy_images(source_folder, destination_folder)


def create_main_gui():
    root = tk.Tk()
    root.title("Image Copy Tool")
    root.geometry("300x200")
    root.resizable(False, False)

    label = tk.Label(root, text="Welcome", font=("Arial", 12))
    label.pack(pady=20)

    start_button = tk.Button(root, text="Start Copy", font=("Arial", 12), command=start_process)
    start_button.pack(pady=10)

    root.mainloop()


def create_start_window():
    def on_start_click():
        if verify_remote_license():
            start_root.destroy()
            create_main_gui()
        else:
            messagebox.showinfo("Access Denied", "This device is not approved yet.")

    def on_send_request_click():
        send_device_id_request()

    def on_show_id_click():
        show_device_id()

    start_root = tk.Tk()
    start_root.title("License Check")
    start_root.geometry("300x300")
    start_root.resizable(False, False)

    label = tk.Label(start_root, text="Select an option", font=("Arial", 12))
    label.pack(pady=20)

    start_btn = tk.Button(start_root, text="Start", font=("Arial", 12), command=on_start_click)
    start_btn.pack(pady=10)

    request_btn = tk.Button(start_root, text="Send Request", font=("Arial", 12), command=on_send_request_click)
    request_btn.pack(pady=10)

    id_btn = tk.Button(start_root, text="Show Device ID", font=("Arial", 12), command=on_show_id_click)
    id_btn.pack(pady=10)

    start_root.mainloop()


if __name__ == "__main__":
    create_start_window()
