# WiQr - The Ultimate Conversion & QR Hub

Welcome to WiQr, a modern, all-in-one web platform for universal file conversion and smart QR code generation. This project aims to provide a seamless, powerful, and beautiful user experience, free from the usual restrictions of similar online tools.

## Vision

Our goal is to create a single destination for two key tasks:

1.  **Universal File Converter:** Convert any file to any other format. Drag, drop, and convert. No sign-ups, no file size limits. The tool is designed to work offline after the initial load for maximum convenience.
2.  **Smart QR Code Generator:** Create dynamic, editable QR codes for a variety of uses, from WiFi access to business cards. Track scan analytics, perform A/B tests, and bulk-generate codes with ease.

The entire experience is wrapped in a stunning, interactive interface powered by Three.js, setting a new standard for what a utility website can be.

## Technology Stack

- **Frontend:**
  - **Framework:** [React](https://reactjs.org/) (with [Vite](https://vitejs.dev/))
  - **3D Graphics:** [Three.js](https://threejs.org/) (with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber))
  - **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  - **Drag & Drop:** [React Dropzone](https://react-dropzone.js.org/)

- **Backend:**
  - **Framework:** [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
  - **Database:** [MongoDB](https://www.mongodb.com/) (for QR code data)
  - **File Conversion:** Libraries such as `fluent-ffmpeg`, `sharp`, and others will be used.

- **Architecture:**
  - A **monorepo** structure is used to manage the `client` and `server` applications in one place.

## Project Structure

```
/
├── client/         # React Frontend
├── server/         # Node.js Backend
├── package.json    # Root package.json for monorepo scripts
└── README.md
```

## Getting Started

To get the project running locally, follow these steps:

1.  **Install Root Dependencies:**
    ```bash
    npm install
    ```

2.  **Install Client Dependencies:**
    ```bash
    cd client
    npm install
    cd ..
    ```

3.  **Install Server Dependencies:**
    ```bash
    cd server
    npm install
    cd ..
    ```

4.  **Run the Development Servers:**
    ```bash
    npm run dev
    ```

This will start both the client and server concurrently. The client will be available at `http://localhost:5173` and the server will be running on `http://localhost:3000`.
