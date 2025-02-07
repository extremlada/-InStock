import React, { Component } from "react";
import YourDepotPage from "./YourDepot";
import DepotsPage from "./Depots";
import { BrowserRouter as Router, Route, Routes, link, redirect } from "react-router-dom";

export default class HomePage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <Routes>
            <Route exact path="/" element={<h1> Home </h1>}/>
            <Route path="/reszleg" element={<YourDepotPage />} />
            <Route path="/raktar" element={<DepotsPage />} />
        </Routes>
      </Router>
    );
  }
}