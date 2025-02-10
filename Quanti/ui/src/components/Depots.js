import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import { Link } from "react-router-dom";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";


export default class DepotsPage extends Component {
  constructor(props) {
    super(props);
    this.handleCreateDepot = this.handleCreateDepot.bind(this);
  }

  handleNameChange(e) {
    this.setState({ name: e.target.value });
  }
  
  handleCreateDepot() {}

  render() {
    return <Grid container spacing={1}> 
      <Grid item xs={12} align="center">
        <Typography component='h4' variant="h4">
          Raktáraid
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <FormControl>
          <TextField required={true} type="text" placeholder="Raktár neve" onChange={this.handleNameChange}/>
        </FormControl>
      </Grid>
      <Grid item xs={12} align="center">
        <Button color="primary" variant="contained" onClick={this.handleCreateDepot}>
          Raktár létrehozása
        </Button>
      </Grid>
    </Grid>;
  }
}