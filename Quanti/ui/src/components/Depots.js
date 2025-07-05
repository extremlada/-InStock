import React, { Component } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import { Box, Stack } from "@mui/material";
import Paper from "@mui/material/Paper";
import Sidebar from "./sidebar";
import InputAdornment from "@mui/material/InputAdornment";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import DescriptionIcon from "@mui/icons-material/Description";
import ApartmentIcon from "@mui/icons-material/Apartment";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add";
import Chip from "@mui/material/Chip";

class DepotsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      reszleg: "",
      Description: "",
      reszlegList: [],
      raktarList: [],
      id: 0,
      showQuoteForm: false,
    };
    this.handleCreateDepot = this.handleCreateDepot.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleReszlegChange = this.handleReszlegChange.bind(this);
    this.fetchRaktarList = this.fetchRaktarList.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleCardClikcked = this.handleCardClikcked.bind(this);
  }

  componentDidMount() {
    // Fetch the existing reszleg from the backend
    fetch('/api/reszleg/')
      .then((response) => response.json())
      .then((data) => this.setState({ reszlegList: data }));

    this.fetchRaktarList();
  }

  componentDidUpdate(prevProps) {
    // Ha változott a location, frissítjük az adatokat
    if (prevProps.location !== this.props.location) {
      this.fetchRaktarList();
    }
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
    fetch('/api/raktar/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access')}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        this.setState({ raktarList: data });
        console.log(data);
      });
  }

  handleCardClikcked(uuid){
    console.log("Card clicked", uuid);
    this.props.navigate(`/raktar/${uuid}`);
  }

  render() {
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box sx={{ py: 10, px: 5 }}>
          <Grid container spacing={3} justifyContent="center"> 
            <Grid item xs={12}>
              <Typography 
                component='h4' 
                variant="h4" 
                sx={{ 
                  fontWeight: 600, 
                  color: '#1e293b',
                  mb: 1,
                  textAlign: 'center',
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 60,
                    height: 4,
                    backgroundColor: '#3b82f6',
                    borderRadius: 2
                  }
                }}
              >
                Raktáraid
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  textAlign: 'center', 
                  color: '#64748b', 
                  mb: 4 
                }}
              >
                Kezeld és hozz létre új raktárakat
              </Typography>
            </Grid>
            
            {/* Create warehouse form */}
            <Grid item xs={12} md={6} sx={{ mx: 'auto' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                  mb: 5
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 500, 
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <AddBusinessIcon sx={{ mr: 1, color: '#3b82f6' }} /> Új raktár létrehozása
                </Typography>
                
                <Stack spacing={3}>
                  <TextField
                    required
                    fullWidth
                    label="Raktár neve"
                    placeholder="Raktár neve"
                    variant="outlined"
                    onChange={this.handleNameChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WarehouseIcon sx={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                        },
                      }
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Raktár leírása"
                    placeholder="Raktár leírása"
                    variant="outlined"
                    multiline
                    rows={3}
                    onChange={this.handleDescriptionChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon sx={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                        },
                      }
                    }}
                  />
                  
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="reszleg-label">Részleg</InputLabel>
                    <Select
                      labelId="reszleg-label"
                      label="Részleg"
                      value={this.state.reszleg}
                      onChange={this.handleReszlegChange}
                      sx={{
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#3b82f6',
                        },
                      }}
                      startAdornment={
                        <InputAdornment position="start">
                          <ApartmentIcon sx={{ color: '#64748b', ml: 2 }} />
                        </InputAdornment>
                      }
                    >
                      {this.state.reszlegList.map((reszleg) => (
                        <MenuItem key={reszleg.id} value={reszleg.id}>
                          {reszleg.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Válassz egy részleget</FormHelperText>
                  </FormControl>
                  
                  <Button 
                    fullWidth
                    variant="contained" 
                    onClick={this.handleCreateDepot}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 500,
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)'
                      }
                    }}
                    startIcon={<AddIcon />}
                  >
                    Raktár létrehozása
                  </Button>
                </Stack>
              </Paper>
            </Grid>
            
            {/* Raktár lista */}
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 500, 
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <InventoryIcon sx={{ mr: 1, color: '#3b82f6' }} /> Elérhető raktárak
              </Typography>
              
              <Grid container spacing={3}>
                {this.state.raktarList.length === 0 ? (
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: 3,
                        border: '1px dashed #cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <WarehouseIcon sx={{ fontSize: 60, color: '#cbd5e1', mb: 2 }} />
                      <Typography sx={{ color: '#64748b' }}>
                        Még nincs létrehozott raktár
                      </Typography>
                    </Paper>
                  </Grid>
                ) : (
                  this.state.raktarList.map((raktar) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={raktar.id}>
                      <Card 
                        onClick={() => this.handleCardClikcked(raktar.id)}
                        sx={{
                          borderRadius: 3,
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                      >
                        <CardActionArea>
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              height="160"
                              image="/static/images/storrage.png"
                              alt={`${raktar.name} raktár kép`}
                              sx={{
                                filter: 'brightness(0.85)',
                                backgroundSize: 'cover'
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                color: 'white',
                                p: 2
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                  fontWeight: 600,
                                  textShadow: '0px 1px 2px rgba(0,0,0,0.4)'
                                }}
                              >
                                {raktar.name}
                              </Typography>
                            </Box>
                          </Box>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOnIcon fontSize="small" sx={{ color: '#64748b', mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {raktar.Description}
                                </Typography>
                              </Box>
                              <Chip 
                                size="small" 
                                label="Aktív" 
                                sx={{ 
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                                  color: '#16a34a',
                                  fontWeight: 500,
                                  fontSize: '0.7rem'
                                }} 
                              />
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }
}

function DepotsPageWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  return <DepotsPage navigate={navigate} location={location} />;
}

export default DepotsPageWrapper;