import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from './HomePage';

export default class App extends Component {
  constructor(props){
    super(props);
  }
  
    render() {
        return (<div>
                <HomePage />
                </div>);
    }
}

const appDiv = document.getElementById("app");
console.log('appDiv:', appDiv); // Debugging line
if (appDiv) {
  const root = createRoot(appDiv);
  root.render(<App />);
} else {
  console.error('No element with id "app" found.');
}