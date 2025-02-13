import React, { Component } from "react";
import { useParams } from "react-router-dom";
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

export default class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      price: 0,
      description: "",
      quantity: "",
      barcode: "",
    };
    this.getIdFromUrl = this.getIdFromUrl.bind(this);
  }

  getIdFromUrl() {
    const uuid = useParams();
    console.log(uuid);
  }

  render() {
    return <div>
      <h1>{this.getIdFromUrl}</h1>
      <p>name: {this.state.name}</p>
      <p>price: {this.state.price}</p>
      <p>description: {this.state.description}</p>
      <p>quantity: {this.state.quantity}</p>
      <p>barcode: {this.state.barcode}</p>
    </div>;
  }
}