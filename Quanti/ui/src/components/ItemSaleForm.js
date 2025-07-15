// InvoiceForm.js
import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import InvoicePDF from './invoicePDF';
import Sidebar from './sidebar';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TextareaAutosize,
  IconButton,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';

const defaultItem = {
  tipus: 'termek',
  termek_nev: '',
  mennyiseg: 1,
  egysegar: 0,
  afa_kulcs: 27,
  afa_ertek: 0,
  netto_osszeg: 0,
  brutto_osszeg: 0,
  depot: '', // ÚJ mező: raktár ID
};

const InvoiceForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState({
    szamla_szam:  '2025-000001', // Kezdő számlaszám
    // A számlaszám formátumát a backend fogja kezelni, itt
    kelt: new Date().toISOString().slice(0, 10),
    elado: {
      nev: 'Eladó Kft.',
      cim: '1051 Budapest, Fő utca 1.',
      adoszam: '12345678-1-42',
    },
    vevo: {
      nev: '',
      cim: '',
      adoszam: '',
    },
    fizetesi_mod: 'Átutalás',
    fizetesi_hatarido: '',
    megjegyzes: '',
    items: [{ ...defaultItem }],
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  // Új state: elérhető mennyiség minden tételhez
  const [availableQuantities, setAvailableQuantities] = useState({});
  const [raktarak, setRaktarak] = useState([]);

  // Raktárak lekérése
  useEffect(() => {
    fetch('/api/raktar/'
      , {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}` // vagy ahol a token van
        }
      }
    )
      .then(res => res.json())
      .then(data => setRaktarak(data));
  }, []);

  useEffect(() => {
    if (location.state?.invoiceData) {
      setInvoiceData(location.state.invoiceData);
    }
  }, [location.state]);

  const handleInputChange = (section, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSimpleChange = (field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;

    const mennyiseg = parseFloat(newItems[index].mennyiseg) || 0;
    const egysegar = parseFloat(newItems[index].egysegar) || 0;
    const afa_kulcs = parseFloat(newItems[index].afa_kulcs) || 0;

    const netto_osszeg = mennyiseg * egysegar;
    const afa_ertek = netto_osszeg * afa_kulcs / 100;
    const brutto_osszeg = netto_osszeg + afa_ertek;

    newItems[index].netto_osszeg = netto_osszeg;
    newItems[index].afa_ertek = afa_ertek;
    newItems[index].brutto_osszeg = brutto_osszeg;

    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
    }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { ...defaultItem }],
    }));
  };

  const removeItem = (index) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Új: barcode változás kezelése
  const handleItemBarcodeChange = async (index, value) => {
    // Frissítsd a barcode-ot
    const newItems = [...invoiceData.items];
    newItems[index].barcode = value;
    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
    }));

    // Ha legalább 5 karakter, próbálj lekérni adatot
    if (value && value.length >= 5) {
      try {
        const res = await fetch(`/api/barcode/${value}`);
        if (res.ok) {
          const data = await res.json();
          // Kitöltjük a többi mezőt
          newItems[index].termek_nev = data.name || '';
          newItems[index].egysegar = data.egysegar || 0;
          // ...további mezők, ha kell...
          setInvoiceData(prev => ({
            ...prev,
            items: newItems,
          }));
          // Elérhető mennyiség eltárolása
          setAvailableQuantities(prev => ({
            ...prev,
            [index]: data.mennyiseg || 0,
          }));
        }
      } catch (e) {
        // Hibakezelés, ha kell
      }
    }
  };

  // Raktár választó mező kezelése
  const handleDepotChange = (index, value) => {
    const newItems = [...invoiceData.items];
    newItems[index].depot = value;
    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
    }));
  };

  const handleSubmit = () => {
    // Ellenőrizzük, hogy minden tételhez ki van-e választva raktár
    const missingDepot = invoiceData.items.some(item => !item.depot);
    if (missingDepot) {
      alert("Minden tételhez ki kell választani a raktárat!");
      return;
    }

    // Itt jöhet a további feldolgozás, pl. API hívás a számla mentésére
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ padding: 3, maxWidth: 900, margin: 'auto', flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          Számla kitöltése
        </Typography>

        {/* Számla alap adatok */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Számla adatok
          </Typography>

          <TextField
            label="Számla sorszám"
            value={invoiceData.szamla_szam}
            onChange={e => handleSimpleChange('szamla_szam', e.target.value)}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Kelt"
            type="date"
            value={invoiceData.kelt}
            onChange={e => handleSimpleChange('kelt', e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="fizetesi-mod-label">Fizetési mód</InputLabel>
            <Select
              labelId="fizetesi-mod-label"
              value={invoiceData.fizetesi_mod}
              label="Fizetési mód"
              onChange={e => handleSimpleChange('fizetesi_mod', e.target.value)}
            >
              <MenuItem value="Átutalás">Átutalás</MenuItem>
              <MenuItem value="Készpénz">Készpénz</MenuItem>
              <MenuItem value="Bankkártya">Bankkártya</MenuItem>
              <MenuItem value="Előre fizetés">Előre fizetés</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Fizetési határidő"
            type="date"
            value={invoiceData.fizetesi_hatarido}
            onChange={e => handleSimpleChange('fizetesi_hatarido', e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth margin="normal">
            <TextareaAutosize
              minRows={3}
              placeholder="Megjegyzés"
              style={{ width: '100%', fontSize: 16, padding: 8, borderRadius: 4, borderColor: '#c4c4c4', fontFamily: 'Roboto, sans-serif' }}
              value={invoiceData.megjegyzes}
              onChange={e => handleSimpleChange('megjegyzes', e.target.value)}
            />
          </FormControl>
        </Paper>

        {/* Eladó adatok */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Eladó adatai
          </Typography>
          <TextField
            label="Név"
            value={invoiceData.elado.nev}
            onChange={e => handleInputChange('elado', 'nev', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Cím"
            value={invoiceData.elado.cim}
            onChange={e => handleInputChange('elado', 'cim', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Adószám"
            value={invoiceData.elado.adoszam}
            onChange={e => handleInputChange('elado', 'adoszam', e.target.value)}
            fullWidth
            margin="normal"
          />
        </Paper>

        {/* Vevő adatok */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Vevő adatai
          </Typography>
          <TextField
            label="Név"
            value={invoiceData.vevo.nev}
            onChange={e => handleInputChange('vevo', 'nev', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Cím"
            value={invoiceData.vevo.cim}
            onChange={e => handleInputChange('vevo', 'cim', e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Adószám"
            value={invoiceData.vevo.adoszam}
            onChange={e => handleInputChange('vevo', 'adoszam', e.target.value)}
            fullWidth
            margin="normal"
          />
        </Paper>

        {/* Termékek / Szolgáltatások */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Termékek / szolgáltatások
          </Typography>
          <TableContainer>
            <Table size="small" aria-label="invoice items">
              <TableHead>
                <TableRow>
                  <TableCell>Típus</TableCell>
                  <TableCell>Raktár</TableCell> {/* ÚJ oszlop */}
                  <TableCell>Megnevezés</TableCell>
                  <TableCell align="right">Mennyiség</TableCell>
                  <TableCell align="right">Egységár (nettó)</TableCell>
                  <TableCell align="right">ÁFA kulcs (%)</TableCell>
                  <TableCell align="right">ÁFA érték</TableCell>
                  <TableCell align="right">Nettó összeg</TableCell>
                  <TableCell align="right">Bruttó összeg</TableCell>
                  <TableCell align="center">Művelet</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceData.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Select
                        value={item.tipus || 'termek'}
                        onChange={e => handleItemChange(i, 'tipus', e.target.value)}
                        variant="standard"
                        size="small"
                        fullWidth
                      >
                        <MenuItem value="termek">Termék</MenuItem>
                        <MenuItem value="szolgaltatas">Szolgáltatás</MenuItem>
                      </Select>
                    </TableCell>
                    {/* Új: Barcode mező */}
                    <TableCell>
                      <TextField
                        value={item.barcode || ''}
                        onChange={e => handleItemBarcodeChange(i, e.target.value)}
                        variant="standard"
                        size="small"
                        label="Vonalkód"
                        inputProps={{ maxLength: 32 }}
                        InputProps={{ style: { fontSize: 14, width: 200 } }} // hosszabb mező
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.depot || ''}
                        onChange={e => handleDepotChange(i, e.target.value)}
                        variant="standard"
                        size="small"
                        displayEmpty
                        fullWidth
                        required
                      >
                        <MenuItem value="" disabled>
                          Válassz raktárat
                        </MenuItem>
                        {raktarak.map(raktar => (
                          <MenuItem key={raktar.id} value={raktar.id}>
                            {raktar.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    {/* Név mező (kitöltődik automatikusan) */}
                    <TableCell>
                      <TextField
                        value={item.termek_nev}
                        onChange={e => handleItemChange(i, 'termek_nev', e.target.value)}
                        variant="standard"
                        fullWidth
                        size="small"
                        label="Megnevezés"
                      />
                    </TableCell>
                    {/* Mennyiség mező, max értékkel */}
                    <TableCell align="right">
                      <TextField
                        type="number"
                        inputProps={{
                          min: 1,
                          max: availableQuantities[i] || undefined
                        }}
                        value={item.mennyiseg}
                        onChange={e => handleItemChange(i, 'mennyiseg', e.target.value)}
                        variant="standard"
                        size="small"
                        label="Mennyiség"
                        error={
                          availableQuantities[i] !== undefined &&
                          Number(item.mennyiseg) > availableQuantities[i]
                        }
                        helperText={
                          availableQuantities[i] !== undefined &&
                          Number(item.mennyiseg) > availableQuantities[i]
                            ? `Max: ${availableQuantities[i]}`
                            : availableQuantities[i] !== undefined
                            ? `Max: ${availableQuantities[i]}`
                            : ''
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        inputProps={{ min: 0, step: 'any' }}
                        value={item.egysegar}
                        onChange={e => handleItemChange(i, 'egysegar', e.target.value)}
                        variant="standard"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Select
                        value={item.afa_kulcs}
                        onChange={e => handleItemChange(i, 'afa_kulcs', e.target.value)}
                        variant="standard"
                        size="small"
                      >
                        <MenuItem value={0}>0</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={18}>18</MenuItem>
                        <MenuItem value={27}>27</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell align="right">{item.afa_ertek.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.netto_osszeg.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.brutto_osszeg.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => removeItem(i)}
                        size="small"
                        color="error"
                        aria-label="Tétel törlése"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box mt={2}>
            <Button variant="outlined" onClick={addItem}>
              Tétel hozzáadása
            </Button>
          </Box>
        </Paper>

         {/* PDF letöltés és előnézet gomb */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <PDFDownloadLink
            document={<InvoicePDF invoiceData={invoiceData} />}
            fileName={`mindegy.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) =>
              loading ? (
                'PDF generálása...'
              ) : (
                <Button variant="contained" color="primary">
                  Számla letöltése PDF-ben
                </Button>
              )
            }
          </PDFDownloadLink>

          <Button
            variant="outlined"
            onClick={() => navigate('/elonezet', { state: { invoiceData } })}
            sx={{ ml: 2 }}
          >
            Előnézet
          </Button>
        </Box>

        {/* Csak akkor rendereljük az előnézetet, ha previewVisible true */}
        {previewVisible && (
          <Box sx={{ width: '100%', height: 600, border: '1px solid #ddd', mt: 2 }}>
            <PDFViewer width="100%" height="100%">
              <InvoicePDF invoiceData={invoiceData} />
            </PDFViewer>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default InvoiceForm;
