import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import Sidebar from './sidebar';
import {
  Box,
  Typography,
  Grid,
  Paper,
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

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      data: {
        nap: {}, honap: {}, ev: {},
        nap_ido: [], honap_ido: [], ev_ido: []
      },
      showBevetel: true
    };
    this.navigate = props.navigate; // elmentjük a navigate-et, ha kell navigálni
    this.fetchStatistics = this.fetchStatistics.bind(this);
    this.fetchItems = this.fetchItems.bind(this);
    this.formatDateLabel = this.formatDateLabel.bind(this);
    this.chartData = this.chartData.bind(this);
    this.chartDataIdo = this.chartDataIdo.bind(this);
    this.getBackgroundColor = this.getBackgroundColor.bind(this);
  }

<<<<<<< HEAD
  componentDidMount() {
    this.fetchStatistics();
    this.fetchItems();
  }

  fetchStatistics() {
    fetch(`${window.location.origin}/api/statistics/`)
=======
  const fetchStatistics = () => {
    fetch('api/statistics/')
>>>>>>> 98066153cef0d30b488068c24a54b977594b5fa0
      .then(res => res.json())
      .then(data => this.setState({ data }));
  }

<<<<<<< HEAD
  fetchItems() {
    fetch(`${window.location.origin}/api/items/`)
      .then(res => res.json())
      .then(items => {
        this.setState({ items });
        if (items.some(item => item.refresh_statistics)) {
          this.fetchStatistics();
=======
  const fetchItems = () => {
    axios.get('api/items/')
      .then(res => {
        setItems(res.data);
        // If any of the items have the refresh_statistics flag, update statistics
        if (res.data.some(item => item.refresh_statistics)) {
          fetchStatistics();
>>>>>>> 98066153cef0d30b488068c24a54b977594b5fa0
        }
      });
  }

  formatDateLabel(dateStr, timeKey) {
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
  }

  chartData(title, value) {
    return {
      labels: [this.state.showBevetel ? 'Bevétel' : 'Kiadás'],
      datasets: [
        {
          label: title,
          data: [value],
          backgroundColor: this.state.showBevetel
            ? 'rgba(75, 192, 192, 0.5)'
            : 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };
  }

  chartDataIdo(adatok, timeKey, format) {
    if (!Array.isArray(adatok) || adatok.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }
    const sortedData = [...adatok].sort((a, b) => {
      const dateA = new Date(a[timeKey] || a.month || a.day || a.hour);
      const dateB = new Date(b[timeKey] || b.month || b.day || b.hour);
      return dateB - dateA;
    });
    const labels = sortedData.map(item => {
      const dateStr = item[timeKey] || item.month || item.day || item.hour;
      return this.formatDateLabel(dateStr, timeKey);
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
  }

  getBackgroundColor(quantity) {
    if (quantity <= 5) return '#ffcccc';
    if (quantity <= 10) return '#ffe0b2';
    if (quantity <= 15) return '#e0e0e0';
    return '#f5f5f5';
  }

  render() {
    const { items, data } = this.state;
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
      },
      scales: {
        x: {
          reverse: true,
        }
      }
    };
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ backgroundColor: '#f5f5f5', p: 2 }}>
            {/* Charts */}
            <Grid item size={2} >
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Éves Statisztika</Typography>
                <Bar
                  data={this.chartDataIdo(data.ev_ido, 'year')}
                  options={chartOptions}
                />
              </Paper>
            </Grid>
            <Grid item size={2}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Havi Statisztika</Typography>
                <Bar
                  data={this.chartDataIdo(data.honap_ido, 'day')}
                  options={chartOptions}
                />
              </Paper>
            </Grid>
            <Grid item size={2}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Heti Statisztika</Typography>
                <Bar
                  data={this.chartDataIdo(data.het_ido, 'day', { month: '2-digit', day: '2-digit' })}
                  options={chartOptions}
                />
              </Paper>
            </Grid>
            <Grid item size={2}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Napi Idővonal (Bar chart)</Typography>
                <Bar
                  data={this.chartDataIdo(data.nap_ido, 'hour')}
                  options={chartOptions}
                />
              </Paper>
            </Grid>
          </Grid>
          {/* Low Stock Items */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Alacsony készlet
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
                .map(item => (
                  <Grid item xs={12} sm={6} md={4} key={item.barcode}>
                    <Paper sx={{ p: 2, backgroundColor: this.getBackgroundColor(item.Mennyiség) }}>
                      <Typography variant="subtitle1">{item.name}</Typography>
                      <Typography variant="body2">Mennyiség: {item.Mennyiség}</Typography>
                    </Paper>
                  </Grid>
                ))}
            </Grid>
          </Box>
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
