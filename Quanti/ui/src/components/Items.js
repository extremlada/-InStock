import React, { Component, useState } from "react";
import {useParams} from "react-router-dom"
import { BrowserRouter as Router, Route, Routes, link, redirect } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import { Link } from "react-router-dom";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";


function Item() {
  const { uuid } = useParams();

  const [state, setState] = useState({
    name: "",
    price: 0,
    description: "",
    quantity: "",
    barcode: "",
  });

  

  return (
    <div>
      <h1>{uuid}</h1>
      <p>name: {state.name}</p>
      <p>price: {state.price}</p>
      <p>description: {state.description}</p>
      <p>quantity: {state.quantity}</p>
      <p>barcode: {state.barcode}</p>
    </div>
  );
}

export default Item;