import React, { Component } from "react";
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
import { formHelperTextClasses } from "@mui/material";


export default class DepotsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      reszleg: "",
      Description: "",
      reszlegList: [],
      raktarList: [],
      id: 0,
    };
    this.handleCreateDepot = this.handleCreateDepot.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleReszlegChange = this.handleReszlegChange.bind(this);
    this.fetchRaktarList = this.fetchRaktarList.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
  }

  componentDidMount() {
    // Fetch the existing reszleg from the backend
    fetch('/api/reszleg/')
      .then((response) => response.json())
      .then((data) => this.setState({ reszlegList: data }));

    this.fetchRaktarList();
  }
  handleDescriptionChange(e){
    this.setState({
      Description: e.target.value,
    });
  }

  handleNameChange(e) {
    this.setState({ 
      name: e.target.value,
    });
  }
  
  handleCreateDepot() {
    console.log(this.state.reszleg);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: this.state.name,
        részleg: this.state.reszleg,
      }),
    };
    fetch('/api/raktar/', requestOptions).then((response) => 
      response.json()).then((data) => {console.log(data)
      this.fetchRaktarList();
    });
  }
  handleReszlegChange(e) {
    this.setState({ 
      reszleg: e.target.value,
    });
  }

  fetchRaktarList() {
    fetch('/api/raktar/')
      .then((response) => response.json())
      .then((data) => this.setState({ raktarList: data }));
  }

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
        <FormControl>
          <TextField required={false} type="text" placeholder="Raktár Leírása" onChange={this.handleDescriptionChange}/>
        </FormControl>
      </Grid>
      <Grid item xs={12} align="center">
        <FormControl>
          <InputLabel id="reszleg-label">Reszleg</InputLabel>
          <Select labelId="reszleg-label" value={this.state.reszleg} onChange={this.handleReszlegChange}>
            {this.state.reszlegList.map((reszleg) => (
              <MenuItem key={reszleg.id} value={reszleg.id}>
                {reszleg.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Válassz egy reszleget</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12} align="center">
        <Button color="primary" variant="contained" onClick={this.handleCreateDepot}>
          Raktár létrehozása
        </Button>
      </Grid>
      <Grid item xs={12}>
          <Grid container spacing={2}>
            {this.state.raktarList.map((raktar) => (
              <Grid item xs={12} sm={6} md={3} lg={2} xl={2} key={raktar.id}>
                <Card>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="140"
                      image="/static/images/storrage.png" // Replace with actual image URL
                      alt="Raktár Image"
                      backgroundColor="blue"
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {raktar.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {raktar.Description} {/* Add description if available */}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
    </Grid>;
  }
}