<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import Sidebar from './sidebar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import {
  Box,
  Typography,
  Grid,
  Paper,
<<<<<<< HEAD
  ToggleButton,
  ToggleButtonGroup,
  Toolbar
=======
  Toolbar,
  Divider,
  Stack
>>>>>>> 7a1136f (Bemutatóra kész esetleg éles tesztre)
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ToDoListOverview from "./ToDoListOverview";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

<<<<<<< HEAD
function Home() {
  const [items, setItems] = useState([]);
  const [data, setData] = useState({
    nap: {}, honap: {}, ev: {},
    nap_ido: [], honap_ido: [], ev_ido: []
  });
  const [showBevetel, setShowBevetel] = useState(true);
=======
=======
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

>>>>>>> master
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
<<<<<<< HEAD
      data: {
        nap: {}, honap: {}, ev: {},
        nap_ido: [], honap_ido: [], ev_ido: [], het_ido: []
      },
      showBevetel: true
    };
    this.navigate = props.navigate;
  }
>>>>>>> 7a1136f (Bemutatóra kész esetleg éles tesztre)

<<<<<<< HEAD
=======
  componentDidMount() {
    this.fetchStatistics();
    this.fetchItems();
  }

  fetchStatistics() {
    fetch(`${window.location.origin}/api/statistics/`)
<<<<<<< HEAD
=======
>>>>>>> 47cea65 (Remove merge conflict markers from Home.js)
  const fetchStatistics = () => {
    fetch('api/statistics/')
=======
>>>>>>> c7403de (Changes to be committed)
      .then(res => res.json())
      .then(data => setData(data));
  };

<<<<<<< HEAD
  const fetchItems = () => {
    axios.get('api/items/')
      .then(res => {
        setItems(res.data);
        // If any of the items have the refresh_statistics flag, update statistics
        if (res.data.some(item => item.refresh_statistics)) {
          fetchStatistics();
=======
  fetchItems() {
    fetch(`${window.location.origin}/api/items/`)
      .then(res => res.json())
      .then(items => {
        this.setState({ items });
        if (items.some(item => item.refresh_statistics)) {
          this.fetchStatistics();
>>>>>>> c7403de (Changes to be committed)
        }
      });
  };

  useEffect(() => {
    // Initial data fetch
    fetchStatistics();
    fetchItems();
  }, []); // Only run once on mount

  const formatDateLabel = (dateStr, timeKey) => {
    const date = new Date(dateStr);
<<<<<<< HEAD
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    if (timeKey === 'hour') {
      return date.toLocaleTimeString('hu-HU', options);
    } else if (timeKey === 'day') {
      return date.toLocaleDateString('hu-HU', { month: '2-digit', day: '2-digit' });
    } else if (timeKey === 'month') {
      return date.toLocaleDateString('hu-HU', { month: '2-digit' });
    } else {
      return date.getFullYear().toString();
    }
  };

  const chartData = (title, value) => ({
    labels: [showBevetel ? 'Bevétel' : 'Kiadás'],
    datasets: [
      {
        label: title,
        data: [value],
        backgroundColor: showBevetel
          ? 'rgba(75, 192, 192, 0.5)'
          : 'rgba(255, 99, 132, 0.5)',
      },
    ],
  });

  const chartDataIdo = (adatok, timeKey, format) => {
    if (!Array.isArray(adatok) || adatok.length === 0) {
      console.error("Invalid or empty data passed to chartDataIdo:", adatok);
      return {
        labels: [],
        datasets: [],
      };
    }

    // Sort the data by date in descending order
    const sortedData = [...adatok].sort((a, b) => {
      const dateA = new Date(a[timeKey] || a.month || a.day || a.hour);
      const dateB = new Date(b[timeKey] || b.month || b.day || b.hour);
      return dateB - dateA;
    });

    const labels = sortedData.map(item => {
      const dateStr = item[timeKey] || item.month || item.day || item.hour;
      return formatDateLabel(dateStr, timeKey);
    });

=======
    const options = { hour: '2-digit', minute: '2-digit', hour12: false };
    if (timeKey === 'hour') return date.toLocaleTimeString('hu-HU', options);
    if (timeKey === 'day') return date.toLocaleDateString('hu-HU', { month: '2-digit', day: '2-digit' });
    if (timeKey === 'month') return date.toLocaleDateString('hu-HU', { month: '2-digit' });
    return date.getFullYear().toString();
  }

  chartDataIdo(adatok, timeKey) {
    if (!Array.isArray(adatok) || adatok.length === 0) return { labels: [], datasets: [] };
    const sortedData = [...adatok].sort((a, b) => new Date(b[timeKey]) - new Date(a[timeKey]));
    const labels = sortedData.map(item => this.formatDateLabel(item[timeKey], timeKey));
>>>>>>> 7a1136f (Bemutatóra kész esetleg éles tesztre)
    const bevetelData = sortedData.map(item => item.bevetel || 0);
    const kiadasData = sortedData.map(item => item.kiadas || 0);

    return {
      labels,
      datasets: [
        { label: 'Bevétel', data: bevetelData, backgroundColor: 'rgba(75, 192, 192, 0.6)' },
        { label: 'Kiadás', data: kiadasData, backgroundColor: 'rgba(255, 99, 132, 0.6)' }
      ]
    };
  };

<<<<<<< HEAD
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      x: {
        reverse: true, // Display bars from right to left
      }
    }
  };

  const getBackgroundColor = (quantity) => {
    if (quantity <= 5) return '#ffcccc';
=======
  getBackgroundColor(quantity) {
    if (quantity <= 5) return '#ffcdd2';
>>>>>>> 7a1136f (Bemutatóra kész esetleg éles tesztre)
    if (quantity <= 10) return '#ffe0b2';
    if (quantity <= 15) return '#e0e0e0';
    return '#f5f5f5';
  };

<<<<<<< HEAD
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />


        <Box
    component="main"
    sx={{
      flexGrow: 1,
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      p: 4
    }}
  >
    {/* Statisztikai Dashboard */}
    <Typography 
      variant="h4" 
      sx={{ 
        mb: 4, 
        fontWeight: 600, 
        color: '#1e293b',
        borderLeft: '4px solid #3b82f6',
        pl: 2
      }}
    >
      Statisztikai Áttekintés
    </Typography>

    {/* Charts Grid */}
    <Grid 
      container 
      spacing={3} 
      sx={{ 
        mb: 5
      }}
    >
      {/* Éves Statisztika */}
      <Grid item xs={12} md={6} lg={3}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
            }
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontWeight: 500,
              color: '#334155',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <CalendarTodayIcon sx={{ mr: 1, color: '#3b82f6' }} /> Éves Statisztika
          </Typography>
          <Box sx={{ height: 280 }}>
            <Bar
              data={chartDataIdo(data.ev_ido, 'year')}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
                  }
                },
                maintainAspectRatio: false
              }}
            />
          </Box>
        </Paper>
      </Grid>

      {/* Havi Statisztika */}
      <Grid item xs={12} md={6} lg={3}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
            }
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontWeight: 500,
              color: '#334155',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <DateRangeIcon sx={{ mr: 1, color: '#6366f1' }} /> Havi Statisztika
          </Typography>
          <Box sx={{ height: 280 }}>
            <Bar
              data={chartDataIdo(data.honap_ido, 'day')}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
                  }
                },
                maintainAspectRatio: false
              }}
            />
          </Box>
        </Paper>
      </Grid>

      {/* Heti Statisztika */}
      <Grid item xs={12} md={6} lg={3}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
            }
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontWeight: 500,
              color: '#334155',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ViewWeekIcon sx={{ mr: 1, color: '#8b5cf6' }} /> Heti Statisztika
          </Typography>
          <Box sx={{ height: 280 }}>
            <Bar
              data={chartDataIdo(data.het_ido, 'day', { month: '2-digit', day: '2-digit' })}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
                  }
                },
                maintainAspectRatio: false
              }}
            />
          </Box>
        </Paper>
      </Grid>

      {/* Napi Idővonal */}
      <Grid item xs={12} md={6} lg={3}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
            }
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontWeight: 500,
              color: '#334155',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <AccessTimeIcon sx={{ mr: 1, color: '#ec4899' }} /> Napi Idővonal
          </Typography>
          <Box sx={{ height: 280 }}>
            <Bar
              data={chartDataIdo(data.nap_ido, 'hour')}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
                  }
                },
                maintainAspectRatio: false
              }}
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>

    {/* Alacsony készlet */}
    <Box sx={{ mt: 4, p: 3 }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          fontWeight: 600, 
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <WarningIcon sx={{ mr: 1, color: '#f59e0b' }} /> Alacsony készletek
      </Typography>
      
      <Grid container spacing={2}>
        {Object.values(
          items.reduce((acc, item) => {
            if (!acc[item.barcode]) {
              acc[item.barcode] = { ...item, Mennyiség: 0 };
            }
            acc[item.barcode].Mennyiség += item.Mennyiség;
            return acc;
          }, {})
        )
          .filter(item => item.Mennyiség <= 15)
          .sort((a, b) => a.Mennyiség - b.Mennyiség)
          .map(item => {
            // Dinamikus színátmenetek a mennyiség alapján
            const getGradient = (quantity) => {
              if (quantity <= 5) return 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
              if (quantity <= 10) return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
              return 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)';
            };
            
            // Dinamikus ikon a mennyiség alapján
            const getStatusIcon = (quantity) => {
              if (quantity <= 5) return <ErrorOutlineIcon sx={{ color: '#dc2626' }} />;
              if (quantity <= 10) return <ReportProblemIcon sx={{ color: '#d97706' }} />;
              return <InfoOutlinedIcon sx={{ color: '#0284c7' }} />;
            };

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.barcode}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: getGradient(item.Mennyiség),
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {item.name}
                    </Typography>
                    {getStatusIcon(item.Mennyiség)}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Inventory2Icon sx={{ mr: 1, fontSize: '1.2rem', color: '#475569' }} />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: item.Mennyiség <= 5 ? 700 : 500,
                        color: item.Mennyiség <= 5 ? '#b91c1c' : '#475569'
                      }}
                    >
                      Mennyiség: {item.Mennyiség}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
      </Grid>
    </Box>
  </Box>

=======
  render() {
    const { items, data } = this.state;
    const chartOptions = {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: { x: { reverse: true } }
    };

    const charts = [
      { title: 'Éves Statisztika', data: this.chartDataIdo(data.ev_ido, 'year') },
      { title: 'Havi Statisztika', data: this.chartDataIdo(data.honap_ido, 'day') },
      { title: 'Heti Statisztika', data: this.chartDataIdo(data.het_ido, 'day') },
      { title: 'Napi Idővonal', data: this.chartDataIdo(data.nap_ido, 'hour') }
    ];

    return (
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#fafafa' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
          <Toolbar />
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Statisztikák áttekintése</Typography>

          <Grid container spacing={3}>
            {charts.map((chart, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>{chart.title}</Typography>
                  <Bar data={chart.data} options={chartOptions} />
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" gutterBottom>Alacsony készlet</Typography>
          <Grid container spacing={2}>
            {Object.values(items.reduce((acc, item) => {
              if (!acc[item.barcode]) acc[item.barcode] = { ...item, Mennyiség: 0 };
              acc[item.barcode].Mennyiség += item.Mennyiség;
              return acc;
            }, {}))
              .filter(item => item.Mennyiség <= 15)
              .sort((a, b) => a.Mennyiség - b.Mennyiség)
              .map(item => (
                <Grid item xs={12} sm={6} md={4} key={item.barcode}>
                  <Paper elevation={2} sx={{ p: 2, backgroundColor: this.getBackgroundColor(item.Mennyiség) }}>
                    <Typography variant="subtitle1">{item.name}</Typography>
                    <Typography variant="body2">Mennyiség: {item.Mennyiség}</Typography>
                  </Paper>
                </Grid>
              ))}
          </Grid>

          {/* ÚJ: ToDoBoard áttekintő */}
          <ToDoListOverview />
        </Box>
>>>>>>> 7a1136f (Bemutatóra kész esetleg éles tesztre)
      </Box>
    </Box>
  );
}

export default Home;
=======
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
>>>>>>> master
