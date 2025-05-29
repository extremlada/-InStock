import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const appDiv = document.getElementById("app");
console.log('appDiv:', appDiv); // Debugging line
if (appDiv) {  const root = createRoot(appDiv);
  console.log('Rendering App component'); // Debugging line
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
} else {
  console.error('No element with id "app" found.');
}