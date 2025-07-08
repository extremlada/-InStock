import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import Sidebar from './sidebar';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Toolbar,
  Divider,
  Stack
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
import CalendarWidget from "./CalendarWidget";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      data: {
        nap: {}, honap: {}, ev: {},
        nap_ido: [], honap_ido: [], ev_ido: [], het_ido: []
      },
      showBevetel: true
    };
    this.navigate = props.navigate;
  }

  componentDidMount() {
    this.fetchStatistics();
    this.fetchItems();
  }

  fetchStatistics() {
    fetch(`${window.location.origin}/api/statistics/`)
      .then(res => res.json())
      .then(data => this.setState({ data }));
  }

  fetchItems() {
    fetch(`${window.location.origin}/api/items/`)
      .then(res => res.json())
      .then(items => {
        this.setState({ items });
        if (items.some(item => item.refresh_statistics)) {
          this.fetchStatistics();
        }
      });
  }

  formatDateLabel(dateStr, timeKey) {
    const date = new Date(dateStr);
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
    const bevetelData = sortedData.map(item => item.bevetel || 0);
    const kiadasData = sortedData.map(item => item.kiadas || 0);
    return {
      labels,
      datasets: [
        { label: 'Bevétel', data: bevetelData, backgroundColor: 'rgba(75, 192, 192, 0.6)' },
        { label: 'Kiadás', data: kiadasData, backgroundColor: 'rgba(255, 99, 132, 0.6)' }
      ]
    };
  }

  getBackgroundColor(quantity) {
    if (quantity <= 5) return '#ffcdd2';
    if (quantity <= 10) return '#ffe0b2';
    if (quantity <= 15) return '#e0e0e0';
    return '#f5f5f5';
  }

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

          {/* Két oszlopos elrendezés: balra naptár, jobbra ToDo áttekintő */}
          <Grid container spacing={3} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <ToDoListOverview />
            </Grid>
            <Grid item xs={12} md={6}>
              <CalendarWidget />
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
