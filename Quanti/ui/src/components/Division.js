import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, Grid, Typography, TextField, Paper, Box, Stack, Card, CardContent,
  CardMedia, CardActionArea, InputAdornment, Chip
} from "@mui/material";
import Sidebar from "./sidebar";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add";

class DivisionPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      reszlegList: [],
      isLoading: true,
    };
    this.handleCreateDivisions = this.handleCreateDivisions.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.fetchReszlegList = this.fetchReszlegList.bind(this);
    this.handleCardClikcked = this.handleCardClikcked.bind(this);
  }

  componentDidMount() {
    this.fetchReszlegList();
  }

  handleNameChange(e) {
    this.setState({ name: e.target.value });
  }

  handleCreateDivisions() {
    const requestOptions = {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('access')}` // <-- HOZZÁADVA
      },
      body: JSON.stringify({ name: this.state.name }),
    };
    fetch('/api/reszleg/', requestOptions)
      .then((response) => response.json())
      .then(() => {
        this.setState({ name: "" });
        this.fetchReszlegList();
      });
  }

  fetchReszlegList() {
    this.setState({ isLoading: true });
    fetch('/api/reszleg/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access')}`
      }
    })
      .then(async (response) => {
        if (response.status === 401) {
          // Token lejárt vagy nincs, irányítsd át a loginra!
          window.location.href = "/login";
          return [];
        }
        const data = await response.json();
        // Ha nem tömb, akkor is üres tömböt adj vissza
        if (!Array.isArray(data)) return [];
        return data;
      })
      .then((data) => {
        this.setState({
          reszlegList: data,
          isLoading: false
        });
      })
      .catch(() => this.setState({ isLoading: false }));
  }

  handleCardClikcked(uuid) {
    this.props.navigate(`/reszleg/${uuid}`);
  }

  render() {
    const { name, reszlegList, isLoading } = this.state;

    return (
      <Box sx={{ display: 'flex', background: '#fafafa', minHeight: '100vh' }}>
        <Sidebar />
        <Box sx={{ py: 8, px: { xs: 2, md: 6 }, width: '100%' }}>
          <Grid container spacing={4} justifyContent="center">
            {/* Fejléc */}
            <Grid item xs={12}>
              <Typography
                component='h4'
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1e293b',
                  mb: 1,
                  textAlign: 'center',
                  letterSpacing: 1,
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
                Részlegek
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  textAlign: 'center',
                  color: '#64748b',
                  mb: 4
                }}
              >
                Kezeld és hozz létre új részlegeket
              </Typography>
            </Grid>

            {/* Új részleg létrehozása */}
            <Grid item xs={12} md={6} sx={{ mx: 'auto' }}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  boxShadow: '0 4px 24px rgba(59,130,246,0.07)',
                  background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                  mb: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <AddBusinessIcon sx={{ mr: 1, color: '#3b82f6' }} /> Új részleg létrehozása
                </Typography>
                <Stack spacing={2} sx={{ width: '100%' }}>
                  <TextField
                    required
                    fullWidth
                    label="Részleg neve"
                    placeholder="Részleg neve"
                    variant="outlined"
                    value={name}
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
                        background: '#f1f5f9'
                      },
                      '& .MuiInputLabel-root': {
                        color: '#64748b'
                      }
                    }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={this.handleCreateDivisions}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.18)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(59, 130, 246, 0.22)'
                      }
                    }}
                    startIcon={<AddIcon />}
                  >
                    Részleg létrehozása
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            {/* Részleg lista */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <InventoryIcon sx={{ mr: 1, color: '#3b82f6' }} /> Elérhető részlegek
              </Typography>
              <Grid container spacing={3}>
                {isLoading ? (
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
                        Betöltés...
                      </Typography>
                    </Paper>
                  </Grid>
                ) : reszlegList.length === 0 ? (
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
                        Még nincs létrehozott részleg
                      </Typography>
                    </Paper>
                  </Grid>
                ) : (
                  reszlegList.map((reszleg) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={reszleg.id}>
                      <Card
                        onClick={() => this.handleCardClikcked(reszleg.id)}
                        sx={{
                          borderRadius: 3,
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.07)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-6px) scale(1.03)',
                            boxShadow: '0 12px 24px rgba(59,130,246,0.13)'
                          }
                        }}
                      >
                        <CardActionArea>
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              height="140"
                              image="/static/images/storrage.png"
                              alt={`${reszleg.name} raktár kép`}
                              sx={{
                                filter: 'brightness(0.88)',
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
                                  fontWeight: 700,
                                  textShadow: '0px 1px 2px rgba(0,0,0,0.4)'
                                }}
                              >
                                {reszleg.name}
                              </Typography>
                            </Box>
                          </Box>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOnIcon fontSize="small" sx={{ color: '#64748b', mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {reszleg.id} azonosító
                                </Typography>
                              </Box>
                              <Chip
                                size="small"
                                label="Aktív"
                                sx={{
                                  backgroundColor: 'rgba(34, 197, 94, 0.13)',
                                  color: '#16a34a',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
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

function DivisionPageWrapper() {
  const navigate = useNavigate();
  return <DivisionPage navigate={navigate} />;
}

export default DivisionPageWrapper;