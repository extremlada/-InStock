import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/app';

const appDiv = document.getElementById("app");
console.log('appDiv:', appDiv); // Debugging line
if (appDiv) {
  const root = createRoot(appDiv);
  console.log('Rendering App component'); // Debugging line
  root.render(<App name="tim" />);
} else {
  console.error('No element with id "app" found.');
}