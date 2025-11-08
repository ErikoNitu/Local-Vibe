import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './src/pages/AppLayout';
import { ProtectedRoute } from './src/components/ProtectedRoute';
import App from './App';
import Login from './src/pages/Login'
import { ThemeProvider } from './src/contexts/ThemeContext';
import { PreferencesProvider } from './src/contexts/PreferencesContext';
import { LocationProvider } from './src/contexts/LocationContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <PreferencesProvider>
        <LocationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes - will add Login and Register here */}
              <Route path="/login" element={<Login/>} />
              {/* <Route path="/register" element={<div>Register Page - Coming Soon</div>} /> */}
              
              {/* Protected routes */}
              <Route
                path="/"
                element={<AppLayout />}
              />
            </Routes>
          </BrowserRouter>
        </LocationProvider>
      </PreferencesProvider>
    </ThemeProvider>
  </React.StrictMode>
);
