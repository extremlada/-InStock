import React, { Component } from 'react';
import Sidebar from './sidebar';
import {
  Box, Typography, Grid, Paper, Avatar, Chip, Stack, Button, Switch, FormControlLabel, Divider
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ToDoListOverview from "./ToDoListOverview";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';

function isAdmin() {
  return localStorage.getItem('is_superuser') === 'true';
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      monthlyStats: [],
      yearlyStats: [],
      sales: [],
      showDark: localStorage.getItem('theme') === 'dark',
      showProfit: true,
      chartType: 'bar', // vagy 'line'
      sidebarOpen: true,
    };
    this.navigate = props.navigate;
  }

  componentDidMount() {
    this.fetchStats();
    this.fetchItems();
    this.fetchSales();
    if (localStorage.getItem('theme') === 'dark') {
      document.body.style.background = '#18181b';
    } else {
      document.body.style.background = '#f8fafc';
    }
  }

  fetchStats() {
    fetch(`/api/statistics/`)
      .then(res => res.json())
      .then(monthlyStats => {
        this.setState({ monthlyStats });
      });
    fetch(`/api/yearly-stats/`)
      .then(res => res.json())
      .then(yearlyStats => {
        this.setState({ yearlyStats });
      });
  }

  fetchItems() {
    fetch(`/api/items/`)
      .then(res => res.json())
      .then(items => {
        this.setState({ items });
      });
  }

  fetchSales() {
    fetch(`/api/transactions/?type=KI&limit=10`)
      .then(res => res.json())
      .then(data => {
        this.setState({ sales: Array.isArray(data.results) ? data.results : data });
      });
  }

  handleThemeChange = (e) => {
    const showDark = e.target.checked;
    this.setState({ showDark });
    localStorage.setItem('theme', showDark ? 'dark' : 'light');
    document.body.style.background = showDark ? '#18181b' : '#f8fafc';
  };

  handleChartTypeChange = (e) => {
    this.setState({ chartType: e.target.checked ? 'line' : 'bar' });
  };

  handleProfitToggle = (e) => {
    this.setState({ showProfit: e.target.checked });
  };

  render() {
    const { items, monthlyStats, yearlyStats, sales, showDark, chartType, showProfit } = this.state;

    // Fő statisztikák
    const totalRevenue = monthlyStats.reduce((sum, row) => sum + (row.net_revenue || 0), 0);
    const totalExpense = monthlyStats.reduce((sum, row) => sum + (row.net_expense || 0), 0);
    const totalProfit = monthlyStats.reduce((sum, row) => sum + (row.profit || 0), 0);

    // Havi diagram adat
    const monthlyData = monthlyStats.map(row => ({
      name: row.month,
      Bevétel: row.net_revenue,
      Kiadás: row.net_expense,
      Profit: row.profit,
    }));

    // Éves diagram adat
    const yearlyData = yearlyStats.map(row => ({
      name: row.year,
      Bevétel: row.net_revenue,
      Kiadás: row.net_expense,
      Profit: row.profit,
    }));

    // Alacsony készletű termékek
    const lowStockItems = Object.values(items.reduce((acc, item) => {
      if (!acc[item.barcode]) acc[item.barcode] = { ...item, Mennyiség: 0 };
      acc[item.barcode].Mennyiség += item.Mennyiség;
      return acc;
    }, {}))
      .filter(item => item.Mennyiség <= 15)
      .sort((a, b) => a.Mennyiség - b.Mennyiség);

    // Legutóbbi 10 eladás (KI)
    const recentSales = (sales || []).slice(0, 10);

    return (
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: showDark ? '#18181b' : '#f8fafc',
        color: showDark ? '#fff' : '#232526',
        width: '100%'

      }}>
        <Sidebar />
        <Box component="main" sx={{
          flexGrow: 1,
          px: { xs: 1, md: 4 },
          py: 4,
          width: '100%',
          bgcolor: showDark ? '#18181b' : '#f8fafc',
          color: showDark ? '#fff' : '#232526'
        }}>
          <Grid container spacing={4} sx={{ justifyContent: 'center', width: '100%', m: 0 ,  }}>
            {/* Bal oldali fő statisztika és grafikonok */}
            <Grid item xs={12} md={8} lg={9} sx={{}}>
              {/* Fő statisztika kártyák */}
              <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={3} sx={{
                    p: 3, borderRadius: 4, bgcolor: showDark ? '#232526' : '#e0f7fa', display: 'flex', alignItems: 'center', gap: 2
                  }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      <MonetizationOnIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" color={showDark ? "#fff" : "text.secondary"}>Bevétel</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: showDark ? "#fff" : "#232526" }}>
                        {totalRevenue.toLocaleString('hu-HU')} Ft
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={3} sx={{
                    p: 3, borderRadius: 4, bgcolor: showDark ? '#232526' : '#fff3e0', display: 'flex', alignItems: 'center', gap: 2
                  }}>
                    <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                      <TrendingDownIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" color={showDark ? "#fff" : "text.secondary"}>Kiadás</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: showDark ? "#fff" : "#232526" }}>
                        {totalExpense.toLocaleString('hu-HU')} Ft
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={3} sx={{
                    p: 3, borderRadius: 4, bgcolor: showDark ? '#232526' : '#e8f5e9', display: 'flex', alignItems: 'center', gap: 2
                  }}>
                    <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" color={showDark ? "#fff" : "text.secondary"}>Profit</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: showDark ? "#fff" : "#232526" }}>
                        {totalProfit.toLocaleString('hu-HU')} Ft
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Paper elevation={3} sx={{
                p: 3, mb: 4, borderRadius: 4, bgcolor: showDark ? '#232526' : '#fff'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: showDark ? "#fff" : "#232526" }}>
                  Legutóbbi eladások
                </Typography>
                <Stack spacing={2}>
                  {recentSales.length === 0 && (
                    <Typography color="text.secondary">Nincs eladás.</Typography>
                  )}
                  {recentSales.map((tr, idx) => (
                    <Box key={tr.id || idx} sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 2,
                      background: showDark ? '#18181b' : '#f8fafc'
                    }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {tr.unique_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(tr.created_at).toLocaleString('hu-HU')}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: '#22c55e', fontSize: 18 }}>
                        {tr.items && tr.items.length > 0
                          ? tr.items.reduce((sum, item) => sum + (item.egysegar * item.quantity), 0).toLocaleString('hu-HU')
                          : 0} Ft
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>


              {/* Alacsony készlet figyelmeztetés */}
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, mt: 4, color: showDark ? "#fff" : "#232526" }}>
                Alacsony készletű termékek
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {lowStockItems.length === 0 ? (
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center', color: showDark ? "#fff" : "text.secondary", bgcolor: showDark ? "#232526" : "#fff" }}>
                      Minden termékből elegendő készlet van.
                    </Paper>
                  </Grid>
                ) : (
                  lowStockItems.map(item => (
                    <Grid item xs={12} sm={6} md={4} key={item.barcode}>
                      <Paper elevation={2} sx={{
                        p: 2,
                        backgroundColor: item.Mennyiség <= 5 ? '#fee2e2'
                          : item.Mennyiség <= 10 ? '#fef9c3'
                            : '#e0f2fe',
                        display: 'flex', alignItems: 'center', gap: 2
                      }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">Vonalkód: {item.barcode}</Typography>
                          <Chip
                            label={`Mennyiség: ${item.Mennyiség}`}
                            color={item.Mennyiség <= 5 ? "error" : item.Mennyiség <= 10 ? "warning" : "info"}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))
                )}
              </Grid>

              {/* ToDo visszahelyezve */}
              <Paper elevation={3} sx={{
                p: 3, borderRadius: 4, bgcolor: showDark ? '#232526' : '#fff'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: showDark ? "#fff" : "#232526" }}>
                  Feladatok
                </Typography>
                <ToDoListOverview />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }
}

import { useNavigate } from 'react-router-dom';
function HomePageWrapper() {
  const navigate = useNavigate();
  return <Home navigate={navigate} />;
}

export default HomePageWrapper;
