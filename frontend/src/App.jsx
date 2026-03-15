// src/App.jsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { PopupProvider } from "./context/PopupContext";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <PopupProvider>
        <Router>
          <AppRoutes />
        </Router>
      </PopupProvider>
    </AuthProvider>
  );
}

export default App;
