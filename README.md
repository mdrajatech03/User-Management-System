# 🛡️ User Management & Digital Identity System

A secure, responsive, and modern full-stack web application designed for managing user profiles and generating professional digital identity cards.


## 🌐 Demo Of Project 

[Click Here](https://mdrajatech03.github.io/User-Management-System/)

## ✨ Features

- **🔐 Secure Authentication:** User login and registration powered by Firebase Auth.
- **🖥️ Admin Dashboard:** Role-based access to manage user data and view registrations.
- **🪪 Digital ID Generation:** Real-time ID card generation with precise dimensions ($2.125" \times 3.375"$).
- **📄 PDF Export:** Seamlessly download the generated ID cards as high-quality PDFs.
- **🎨 Glassmorphic UI:** A beautiful, dark-themed interface with modern CSS effects.
- **📱 Fully Responsive:** Optimized for mobile, tablet, and desktop views.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Flexbox/Grid), JavaScript (ES6+)
* **Backend/Database:** Firebase (Authentication & Firestore)
* **Libraries:** [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) for PDF generation.
    * Google Fonts (Segoe UI / Inter).

## 📁 File Structure

├── admin.html       # Admin Panel interface
├── admin.js         # Logic for admin operations & Firebase rules
├── auth.js          # Authentication logic (Login/Signup)
├── index.html       # Landing/Auth page
├── portfolio.html   # Main User Profile & ID Card view
├── portfolio.js     # ID Card generation & PDF logic
└── style.css        # Global styles & Glassmorphism UI

## 🚀 Getting Started

**1. Clone the Repository:**

   **git clone**
   
   [https://github.com/mdrajatech03/User-Management-System.git](https://github.com/mdrajatech03/User-Management-System.git)

**2. Firebase Setup:**

  • Create a Firebase project at [console.firebase.google.com.](console.firebase.google.com.)
  • Enable Authentication and Firestore Database.
  • Copy your Firebase Config and update it in auth.js and admin.js.

**3. Deploy:**
   
  • This project is ready for GitHub Pages or Netlify Drop. Simply drag and drop the folder.

## 📸 Screenshots

**Login Page**

[](screenshot1.jpg)


**ID Card Preview**

[](screenshot1.jpg)


## 🤝 Contributing

Contributions are welcome! Feel free to open an Issue or submit a Pull Request.


## 📄 License

This project is licensed under the [MIT License.](MIT.License.)
Developed with ❤️ by [Md Raja](md.raja)
