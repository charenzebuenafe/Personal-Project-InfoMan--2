# NEU Library Visitor Management System 📚

A digital logbook and analytics platform designed for **New Era University** to track library usage, monitor visitor statistics, and manage facility access via institutional authentication.

**Live Demo:** [https://personal-project-info-man-2.vercel.app](https://personal-project-info-man-2.vercel.app)


---

## 🚀 Project Overview
This system replaces traditional paper logbooks with a secure, cloud-based solution. It allows students and faculty to check in using their institutional credentials and provides administrators with real-time data visualization of library traffic.

### Key Objectives:
* **Automate Data Collection:** Eliminate manual entry errors and physical contact.
* **Institutional Security:** Restrict access to `student ID` Students.
* **Admin Insights:** Provide a dashboard to filter usage by day, week, month, and college.

---

## 🛠️ Tech Stack
* **Frontend:** React.js / Vite (Responsive UI)
* **Backend/Database:** Google Cloud Firestore
* **Authentication:** Firebase Auth (Google OAuth 2.0)
* **Hosting:** Vercel

---

## ✨ Features

### For Students & Faculty (End-Users)
* **Single Sign-On (SSO):** Quick login via Student ID.
* **Quick Check-in:** Simple form to select "Purpose of Visit" and "College/Department."
* **Instant Feedback:** Success modal with a "Welcome to NEU Library" message.

### For Library Staff (Administrators)
* **Analytics Dashboard:** Visual cards showing visitor counts filtered by timeframes.
* **Demographic Breakdown:** Stats categorized by Undergraduate Programs (e.g., Nursing, CS, Engineering).
* **User Management:** * **Search:** Find specific user logs by name or email.
    * **Block/Unblock:** Toggle account status to manage facility access.

---

## 🔮 Future Enhancements (Roadmap)
To further improve the library experience, the following features are planned for future releases:

* **📲 QR Code Integration:** Generate a unique QR code for each student. Instead of manual logging, students simply scan their code at a kiosk for 1-second check-ins.
* **📈 Heatmap Analytics:** A visual "Busy Times" chart to help students see when the library is most crowded before they arrive.
* **🔔 Real-time Capacity Alerts:** Notify administrators when the library reaches its maximum seating capacity.
* **📚 Book Integration:** Connect the visitor log to the library's physical collection, allowing users to see their borrowed books directly in the app.
* **📅 Study Room Booking:** Add a module for students to reserve study pods or group discussion rooms in advance.
* **🌙 Dark Mode Support:** Enhance user experience for late-night study sessions.

---

## 📊 Database Schema (Cloud Firestore)

### `users` Collection
| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | string | Unique Firebase ID |
| `email` | string | @neu.edu.ph or Student ID |
| `role` | string | 'admin' or 'user' |
| `isBlocked` | boolean | Access control status |

### `visits` Collection
| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | string | Reference to the user |
| `college` | string | Selected department |
| `purpose` | string | Reason for visit |
| `timestamp` | timestamp | Date and time of entry |

