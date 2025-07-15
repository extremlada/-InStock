import React from 'react';
import { Box, Button } from '@mui/material';
import { PDFViewer } from '@react-pdf/renderer';
import InvoicePDF from './invoicePDF';
import { useNavigate, useLocation } from 'react-router-dom';

const PreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceData = location.state?.invoiceData;

  // Véglegesítés: minden tételre KI művelet a backend felé
  const handleFinalize = async () => {
    if (!invoiceData?.items) return;
    for (const item of invoiceData.items) {
      const payload = {
        name: item.termek_nev,
        barcode: item.barcode,
        Leirás: '',
        Mennyiség: Number(item.mennyiseg), // csak a tényleges mennyiség!
        muvelet: 'KI',
        egysegar: Number(item.egysegar)
      };
      if (item.depot) payload.Depot = item.depot;
      await fetch('/api/items/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        },
        body: JSON.stringify(payload),
      });
    }
    // Navigálj vissza vagy mutass sikeres üzenetet
    navigate('/eladas', { state: { success: true } });
  };

  // Vissza: vissza az eladás oldalra, az adatokkal
  const handleBack = () => {
    navigate('/eladas', { state: { invoiceData } });
  };

  if (!invoiceData) return <div>Hiányzó adatok!</div>;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, border: '1px solid #ddd', mb: 2 }}>
        <PDFViewer width="100%" height="100%">
          <InvoicePDF invoiceData={invoiceData} />
        </PDFViewer>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
        <Button variant="outlined" onClick={handleBack}>Vissza</Button>
        <Button variant="contained" color="primary" onClick={handleFinalize}>Véglegesítés</Button>
      </Box>
    </Box>
  );
};

export default PreviewPage;