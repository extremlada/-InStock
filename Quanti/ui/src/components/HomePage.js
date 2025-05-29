import React, { Component } from "react";
import DivisionPage from "./Division";
import DepotsPage from "./Depots";
import ItemsPage from "./Items";
import Home from "./Home";
import { Routes, Route } from "react-router-dom";

export default class HomePage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Routes>
          <Route exact path="/" element={<Home/>} />
          <Route exact path="/reszleg" element={<DivisionPage />} />
          <Route exact path="/raktar" element={<DepotsPage />} />
          <Route path="/raktar/:uuid" element={<ItemsPage />} />
        </Routes>
      </div>
    );
  }
}