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
  ToggleButton,
  ToggleButtonGroup,
  Toolbar
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Home() {
  const [items, setItems] = useState([]);
  const [data, setData] = useState({
    nap: {}, honap: {}, ev: {},
    nap_ido: [], honap_ido: [], ev_ido: []
  });
  const [showBevetel, setShowBevetel] = useState(true);

<<<<<<< HEAD
=======
  componentDidMount() {
    this.fetchStatistics();
    this.fetchItems();
  }

  fetchStatistics() {
    fetch(`${window.location.origin}/api/statistics/`)
=======
>>>>>>> 47cea65 (Remove merge conflict markers from Home.js)
  const fetchStatistics = () => {
    fetch('api/statistics/')
      .then(res => res.json())
      .then(data => setData(data));
  };

  const fetchItems = () => {
    axios.get('api/items/')
      .then(res => {
        setItems(res.data);
        // If any of the items have the refresh_statistics flag, update statistics
        if (res.data.some(item => item.refresh_statistics)) {
          fetchStatistics();
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

    const bevetelData = sortedData.map(item => item.bevetel || 0);
    const kiadasData = sortedData.map(item => item.kiadas || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Bevétel',
          data: bevetelData,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Kiadás',
          data: kiadasData,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };
  };

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
    if (quantity <= 10) return '#ffe0b2';
    if (quantity <= 15) return '#e0e0e0';
    return '#f5f5f5';
  };

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

      </Box>
    </Box>
  );
}

export default Home;
