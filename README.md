# NEU Library Visitor Management System 📚

A digital logbook and analytics platform designed for **New Era University** to track library usage, monitor visitor statistics, and manage facility access via institutional authentication.

**Live Demo:** [https://personal-project-info-man-2.vercel.app](https://personal-project-info-man-2.vercel.app)

---

## 🚀 Project Overview
This system replaces traditional paper logbooks with a secure, cloud-based solution. It allows students and faculty to check in using their institutional credentials and provides administrators with real-time data visualization of library traffic.

### Key Objectives:
* **Automate Data Collection:** Eliminate manual entry errors.
* **Institutional Security:** Restrict access to `@neu.edu.ph` email holders.
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
* **Single Sign-On (SSO):** Quick login via Google Institutional account.
* **Quick Check-in:** Simple form to select "Purpose of Visit" and "College/Department."
* **Instant Feedback:** Success modal with a "Welcome to NEU Library" message.

### For Library Staff (Administrators)
* **Analytics Dashboard:** Visual cards showing visitor counts filtered by timeframes.
* **Demographic Breakdown:** Stats categorized by Undergraduate Programs.
* **User Management:** * Search bar to find specific user logs.
    * **Block/Unblock:** Ability to restrict specific users from logging into the facility.

---

## 📊 Database Schema (Cloud Firestore)

### `users` Collection
| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | string | Unique Firebase ID |
| `email` | string | @neu.edu.ph address |
| `role` | string | 'admin' or 'user' |
| `isBlocked` | boolean | Access control status |

### `visits` Collection
| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | string | Reference to the user |
| `college` | string | Selected department |
| `purpose` | string | Reason for visit |
| `timestamp` | timestamp | Date and time of entry |

---

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/neu-library-app.git](https://github.com/your-username/neu-library-app.git)
