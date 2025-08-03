import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Stepper, Step, StepLabel, Card,
  CardContent, Divider, Alert, Chip, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import Sidebar from './sidebar';
import InvoicePDF from './invoicePDF';
import InventoryIcon from '@mui/icons-material/Inventory';


// Számlázz.hu requires specific keys. Let's define a default item structure.
const defaultItem = {
  megnevezes: '',
  mennyiseg: 1,
  mertekegyseg: 'db',
  nettoEgysegar: 0,
  afakulcs: 27,
  nettoErtek: 0,
  afaErtek: 0,
  bruttoErtek: 0,
  depot: '',
  barcode: '',
  // Legacy fields to maintain compatibility
  tipus: 'termek',
  termek_nev: '',
  egysegar: 0,
  afa_kulcs: 27,
  afa_ertek: 0,
  netto_osszeg: 0,
  brutto_osszeg: 0,
};

const steps = ['Számla Alapadatai', 'Partner Adatok', 'Tételek', 'Elkészítés'];

const ItemSaleForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [raktarak, setRaktarak] = useState([]);
  const [availableQuantities, setAvailableQuantities] = useState({});
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  // State structured for Számlázz.hu Számla Agent but maintaining compatibility
  const [invoiceData, setInvoiceData] = useState({
    beallitasok: {
      szamlaagentkulcs: '', // User must provide their Agent Key
    },
    fejlec: {
      szamlaszam: '2025-000001',
      keltDatum: new Date().toISOString().slice(0, 10),
      teljesitesDatum: new Date().toISOString().slice(0, 10),
      fizetesiHataridoDatum: '',
      fizmod: 'Átutalás',
      penznem: 'HUF',
      megjegyzes: '',
    },
    elado: {
      nev: 'Eladó Kft.',
      irsz: '1051',
      telepules: 'Budapest',
      cim: 'Fő utca 1.',
      adoszam: '12345678-1-42',
    },
    vevo: {
      nev: '',
      irsz: '',
      telepules: '',
      cim: '',
      adoszam: '',
    },
    tetelek: [{ ...defaultItem }],
    // Legacy compatibility fields
    szamla_szam: '2025-000001',
    kelt: new Date().toISOString().slice(0, 10),
    fizetesi_mod: 'Átutalás',
    fizetesi_hatarido: '',
    items: [{ ...defaultItem }],
  });

  // --- Your existing logic (unchanged as requested) ---
  useEffect(() => {
    fetch('/api/raktar/', {
      headers: { 'Authorization': `Bearer ${sessionStorage.getItem('access')}` }
    })
    .then(res => res.json())
    .then(data => setRaktarak(data));
  }, []);

  const handleItemBarcodeChange = async (index, value) => {
    const newItems = [...invoiceData.tetelek];
    newItems[index].barcode = value;
    // Legacy compatibility
    const legacyItems = [...invoiceData.items];
    legacyItems[index].barcode = value;
    
    setInvoiceData(prev => ({ 
      ...prev, 
      tetelek: newItems,
      items: legacyItems 
    }));

    if (value && value.length >= 5) {
      try {
        const res = await fetch(`/api/barcode/${value}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('access')}` },
        });
        if (res.ok) {
          const data = await res.json();
          newItems[index].megnevezes = data.name || '';
          newItems[index].nettoEgysegar = data.egysegar || 0;
          // Legacy compatibility
          legacyItems[index].termek_nev = data.name || '';
          legacyItems[index].egysegar = data.egysegar || 0;
          
          setInvoiceData(prev => ({ 
            ...prev, 
            tetelek: newItems,
            items: legacyItems 
          }));
          setAvailableQuantities(prev => ({ ...prev, [index]: data.mennyiseg || 0 }));
          handleItemChange(index, 'nettoEgysegar', data.egysegar || 0); // Recalculate
        }
      } catch (e) { console.error("Barcode fetch error:", e); }
    }
  };

  const handleDepotChange = (index, value) => {
    const newItems = [...invoiceData.tetelek];
    newItems[index].depot = value;
    // Legacy compatibility
    const legacyItems = [...invoiceData.items];
    legacyItems[index].depot = value;
    
    setInvoiceData(prev => ({
      ...prev,
      tetelek: newItems,
      items: legacyItems,
    }));
  };
  // --- End of your existing logic ---

  const calculateTotals = useCallback((items) => {
    return items.map(item => {
      const mennyiseg = parseFloat(item.mennyiseg) || 0;
      const nettoEgysegar = parseFloat(item.nettoEgysegar) || 0;
      const afakulcs = parseFloat(item.afakulcs) || 0;
      const nettoErtek = mennyiseg * nettoEgysegar;
      const afaErtek = nettoErtek * (afakulcs / 100);
      const bruttoErtek = nettoErtek + afaErtek;
      
      // Legacy compatibility
      const egysegar = nettoEgysegar;
      const afa_kulcs = afakulcs;
      const netto_osszeg = nettoErtek;
      const afa_ertek = afaErtek;
      const brutto_osszeg = bruttoErtek;
      
      return { 
        ...item, 
        nettoErtek, 
        afaErtek, 
        bruttoErtek,
        // Legacy fields
        egysegar,
        afa_kulcs,
        netto_osszeg,
        afa_ertek,
        brutto_osszeg
      };
    });
  }, []);

  const handleSimpleChange = (section, field, value) => {
    setInvoiceData(p => ({ 
      ...p, 
      [section]: { ...p[section], [field]: value },
      // Legacy compatibility for simple fields
      ...(section === 'fejlec' && field === 'szamlaszam' && { szamla_szam: value }),
      ...(section === 'fejlec' && field === 'keltDatum' && { kelt: value }),
      ...(section === 'fejlec' && field === 'fizmod' && { fizetesi_mod: value }),
      ...(section === 'fejlec' && field === 'fizetesiHataridoDatum' && { fizetesi_hatarido: value }),
      ...(section === 'fejlec' && field === 'megjegyzes' && { megjegyzes: value }),
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.tetelek];
    newItems[index][field] = value;
    
    // Map new fields to legacy fields
    if (field === 'megnevezes') newItems[index].termek_nev = value;
    if (field === 'nettoEgysegar') newItems[index].egysegar = value;
    if (field === 'afakulcs') newItems[index].afa_kulcs = value;
    
    const calculatedItems = calculateTotals(newItems);
    
    // Legacy compatibility - update items array too
    const legacyItems = calculatedItems.map(item => ({
      ...item,
      tipus: item.tipus || 'termek',
      termek_nev: item.megnevezes || item.termek_nev,
      mennyiseg: item.mennyiseg,
      egysegar: item.nettoEgysegar || item.egysegar,
      afa_kulcs: item.afakulcs || item.afa_kulcs,
    }));
    
    setInvoiceData(prev => ({ 
      ...prev, 
      tetelek: calculatedItems,
      items: legacyItems
    }));
  };

  const addItem = () => setInvoiceData(p => ({ 
    ...p, 
    tetelek: [...p.tetelek, { ...defaultItem }],
    items: [...p.items, { ...defaultItem }]
  }));
  
  const removeItem = (index) => setInvoiceData(p => ({ 
    ...p, 
    tetelek: p.tetelek.filter((_, i) => i !== index),
    items: p.items.filter((_, i) => i !== index)
  }));

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // Updated handleSubmit function with new local transaction logic
const handleSubmit = async () => {
  // 1. Local transaction (KI) - Részletes adatokkal
  try {
    if (!invoiceData?.items) return;
    for (const item of invoiceData.items) {
      const payload = {
        name: item.termek_nev || item.megnevezes,
        barcode: item.barcode,
        Leirás: '',
        Mennyiség: Number(item.mennyiseg),
        muvelet: 'KI',
        egysegar: Number(item.egysegar || item.nettoEgysegar),
        // Új részletes adatok
        mertekegyseg: item.mertekegyseg || 'db',
        afa_kulcs: Number(item.afa_kulcs || item.afakulcs || 27),
      };
      if (item.depot) payload.Depot = item.depot;
      
      const resp = await fetch('/api/items/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('access')}`
        },
        body: JSON.stringify(payload),
      });
      
      if (!resp.ok) throw new Error(`Helyi tranzakció sikertelen - ${item.termek_nev || item.megnevezes}`);
    }
  } catch (e) {
    alert('Helyi tranzakció hiba: ' + e.message);
    return;
  }

  // 2. Számlázz.hu agent call (változatlan)
    try {
      const resp = await fetch('/api/create-szamlazzhu-invoice/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('access')}` },
        body: JSON.stringify(invoiceData)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Számlázz.hu hiba');
      alert('Számla sikeresen elkészült!');
    } catch (e) {
      alert('Számlázz.hu hiba: ' + e.message);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0: // Számla Alapadatai
        return (<Card variant="outlined" sx={{ '&:hover': { transform: 'none' } }}><CardContent>
          <Typography variant="h6" gutterBottom>Számla Alapadatai</Typography>
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12}><TextField label="Számla Agent Kulcs" value={invoiceData.beallitasok.szamlaagentkulcs} onChange={e => handleSimpleChange('beallitasok', 'szamlaagentkulcs', e.target.value)} fullWidth required helperText="A Számlázz.hu fiókból kimásolt egyedi kulcs."/></Grid>
            <Grid item xs={12} sm={6}><TextField label="Számla Sorszám" value={invoiceData.fejlec.szamlaszam} onChange={e => handleSimpleChange('fejlec', 'szamlaszam', e.target.value)} fullWidth helperText="Üresen hagyható, ha a Számlázz.hu generálja."/></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Fizetési mód</InputLabel><Select label="Fizetési mód" value={invoiceData.fejlec.fizmod} onChange={e => handleSimpleChange('fejlec', 'fizmod', e.target.value)}><MenuItem value="Átutalás">Átutalás</MenuItem><MenuItem value="Készpénz">Készpénz</MenuItem><MenuItem value="Bankkártya">Bankkártya</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField label="Kelt" type="date" value={invoiceData.fejlec.keltDatum} onChange={e => handleSimpleChange('fejlec', 'keltDatum', e.target.value)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Teljesítés" type="date" value={invoiceData.fejlec.teljesitesDatum} onChange={e => handleSimpleChange('fejlec', 'teljesitesDatum', e.target.value)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Fizetési határidő" type="date" value={invoiceData.fejlec.fizetesiHataridoDatum} onChange={e => handleSimpleChange('fejlec', 'fizetesiHataridoDatum', e.target.value)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
          </Grid>
        </CardContent></Card>);
      case 1: // Partner Adatok
        return (<Grid container spacing={4}>
          <Grid item xs={12} md={6}><Card variant="outlined" sx={{ '&:hover': { transform: 'none' } }}><CardContent><Typography variant="h6" gutterBottom>Eladó adatai</Typography><TextField label="Név" value={invoiceData.elado.nev} onChange={e => handleSimpleChange('elado', 'nev', e.target.value)} fullWidth margin="normal" /><Grid container spacing={2}><Grid item xs={4}><TextField label="Irányítószám" value={invoiceData.elado.irsz} onChange={e => handleSimpleChange('elado', 'irsz', e.target.value)} fullWidth /></Grid><Grid item xs={8}><TextField label="Település" value={invoiceData.elado.telepules} onChange={e => handleSimpleChange('elado', 'telepules', e.target.value)} fullWidth /></Grid></Grid><TextField label="Cím (utca, házszám)" value={invoiceData.elado.cim} onChange={e => handleSimpleChange('elado', 'cim', e.target.value)} fullWidth margin="normal" /><TextField label="Adószám" value={invoiceData.elado.adoszam} onChange={e => handleSimpleChange('elado', 'adoszam', e.target.value)} fullWidth margin="normal" /></CardContent></Card></Grid>
          <Grid item xs={12} md={6}><Card variant="outlined" sx={{ '&:hover': { transform: 'none' } }}><CardContent><Typography variant="h6" gutterBottom>Vevő adatai</Typography><TextField label="Név" value={invoiceData.vevo.nev} onChange={e => handleSimpleChange('vevo', 'nev', e.target.value)} fullWidth margin="normal" /><Grid container spacing={2}><Grid item xs={4}><TextField label="Irányítószám" value={invoiceData.vevo.irsz} onChange={e => handleSimpleChange('vevo', 'irsz', e.target.value)} fullWidth /></Grid><Grid item xs={8}><TextField label="Település" value={invoiceData.vevo.telepules} onChange={e => handleSimpleChange('vevo', 'telepules', e.target.value)} fullWidth /></Grid></Grid><TextField label="Cím (utca, házszám)" value={invoiceData.vevo.cim} onChange={e => handleSimpleChange('vevo', 'cim', e.target.value)} fullWidth margin="normal" /><TextField label="Adószám" value={invoiceData.vevo.adoszam} onChange={e => handleSimpleChange('vevo', 'adoszam', e.target.value)} fullWidth margin="normal" /></CardContent></Card></Grid>
        </Grid>);
      case 2: // Tételek
        return (<Card variant="outlined" sx={{ '&:hover': { transform: 'none' } }}><CardContent>
          <Typography variant="h6" gutterBottom>Számla Tételek</Typography>
          <TableContainer><Table size="small"><TableHead><TableRow>
            <TableCell>Vonalkód</TableCell><TableCell>Megnevezés</TableCell><TableCell>Raktár</TableCell><TableCell align="right">Mennyiség</TableCell><TableCell>Raktár mennyiség</TableCell><TableCell align="right">Mérték egység</TableCell><TableCell align="right">Nettó Egységár</TableCell><TableCell align="right">ÁFA%</TableCell><TableCell align="right">Bruttó Érték</TableCell><TableCell></TableCell>
          </TableRow></TableHead><TableBody>
            {invoiceData.tetelek.map((item, i) => (<TableRow key={i}>
              <TableCell sx={{width: 150}}><TextField value={item.barcode} onChange={e => handleItemBarcodeChange(i, e.target.value)} variant="standard" size="small" fullWidth/></TableCell>
              <TableCell><TextField value={item.megnevezes} onChange={e => handleItemChange(i, 'megnevezes', e.target.value)} variant="standard" size="small" fullWidth/></TableCell>
              <TableCell sx={{width: 150}}><Select value={item.depot} onChange={e => handleItemChange(i, 'depot', e.target.value)} variant="standard" size="small" fullWidth displayEmpty><MenuItem value="" disabled>Válassz</MenuItem>{raktarak.map(r => (<MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>))}</Select></TableCell>
              <TableCell align="right" sx={{width: 80}}>
                <TextField 
                  type="number" 
                  value={item.mennyiseg} 
                  onChange={e => handleItemChange(i, 'mennyiseg', e.target.value)} 
                  variant="standard" size="small" 
                  fullWidth inputProps={{style: {textAlign: 'right'}}} 
                  error={availableQuantities[i] !== undefined && Number(item.mennyiseg) > availableQuantities[i]} 
                  helperText={availableQuantities[i] !== undefined && Number(item.mennyiseg) > availableQuantities[i] ? `Max: ${availableQuantities[i]}` : ''}/>
              </TableCell>
              {/* Készlet állapot */}
              <TableCell sx={{ width: 80 }}>
                <Tooltip
                  title={
                    item.mennyiseg > item.available_stock
                      ? `Maximális mennyiség: ${item.available_stock} ${item.unit_name || 'db'}`
                      : ''
                  }
                  arrow
                  disableHoverListener={!(item.mennyiseg > item.available_stock)}
                >
                  <Chip
                    label={`${item.available_stock || 0} ${item.unit_name || 'db'}`}
                    size="small"
                    color={item.mennyiseg > item.available_stock ? 'error' : (item.available_stock > 0 ? 'success' : 'default')}
                    icon={<InventoryIcon />}
                  />
                </Tooltip>
                
                {item.mennyiseg > item.available_stock && (
                  <Typography variant="caption" color="error">
                    Max: {item.available_stock} {item.unit_name || 'db'}
                  </Typography>
                )}
              </TableCell>
              <TableCell sx={{width: 80}}>
                <TextField 
                  value={item.mertekegyseg} 
                  onChange={e => handleItemChange(i, 'mertekegyseg', e.target.value)} 
                  variant="standard" size="small" fullWidth/>
              </TableCell>
              <TableCell align="right" sx={{width: 120}}><TextField type="number" value={item.nettoEgysegar} onChange={e => handleItemChange(i, 'nettoEgysegar', e.target.value)} variant="standard" size="small" fullWidth inputProps={{style: {textAlign: 'right'}}}/></TableCell>
              <TableCell align="right" sx={{width: 100}}><Select value={item.afakulcs} onChange={e => handleItemChange(i, 'afakulcs', e.target.value)} variant="standard" size="small"><MenuItem value={0}>0</MenuItem><MenuItem value={5}>5</MenuItem><MenuItem value={18}>18</MenuItem><MenuItem value={27}>27</MenuItem><MenuItem value="TAM">TAM</MenuItem></Select></TableCell>
              <TableCell align="right">{item.bruttoErtek.toFixed(2)}</TableCell>
              <TableCell align="center"><IconButton onClick={() => removeItem(i)} size="small" color="error"><DeleteIcon fontSize="inherit" /></IconButton></TableCell>
            </TableRow>))}
          </TableBody></Table></TableContainer>
          <Button variant="text" onClick={addItem} startIcon={<AddIcon />} sx={{ mt: 2 }}>Új tétel</Button>
        </CardContent></Card>);
        
      case 3: // Elkészítés
        return (<Card variant="outlined" sx={{ '&:hover': { transform: 'none' } }}><CardContent>
            <Typography variant="h5" gutterBottom>Számla Elkészítése</Typography>
            <Alert severity="info" sx={{mb: 2}}>A számla a Számlázz.hu rendszerében jön létre. A művelet nem vonható vissza. Kérjük, ellenőrizze az adatokat!</Alert>
            
            {/* PDF Preview és letöltés gombok */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button 
                variant="outlined" 
                startIcon={<VisibilityIcon />}
                onClick={() => setShowPDFPreview(!showPDFPreview)}
              >
                {showPDFPreview ? 'Előnézet elrejtése' : 'PDF Előnézet'}
              </Button>
              
              <PDFDownloadLink 
                document={<InvoicePDF invoiceData={invoiceData} />} 
                fileName={`szamla-${invoiceData.fejlec.szamlaszam || 'draft'}.pdf`}
                style={{ textDecoration: 'none' }}
              >
                {({ blob, url, loading, error }) => (
                  <Button 
                    variant="outlined" 
                    startIcon={<PictureAsPdfIcon />}
                    disabled={loading}
                  >
                    {loading ? 'PDF készítése...' : 'PDF Letöltés'}
                  </Button>
                )}
              </PDFDownloadLink>
              
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Számla kiállítása és küldése
              </Button>
            </Box>

            {/* PDF Preview ablak */}
            {showPDFPreview && (
              <Paper sx={{ p: 2, mb: 3, border: '1px solid #ccc' }}>
                <Typography variant="h6" gutterBottom>Számla előnézet</Typography>
                <Box sx={{ height: 600, border: '1px solid #ddd' }}>
                  <PDFViewer width="100%" height="100%">
                    <InvoicePDF invoiceData={invoiceData} />
                  </PDFViewer>
                </Box>
              </Paper>
            )}
            
        </CardContent></Card>);
      default: return 'Ismeretlen lépés';
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8' }}>
        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>Számla Kiállítása</Typography>
          <Stepper activeStep={activeStep} sx={{ mb: 5 }}>{steps.map(l => (<Step key={l}><StepLabel>{l}</StepLabel></Step>))}</Stepper>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>Vissza</Button>
            <Button variant="contained" onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Befejezés' : 'Tovább'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ItemSaleForm;