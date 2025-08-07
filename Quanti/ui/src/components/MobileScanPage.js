import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { 
  Box, Typography, Button, Paper, Alert, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControl, 
  InputLabel, Select, MenuItem, Grid, IconButton
} from "@mui/material";
import { Close as CloseIcon, Camera as CameraIcon } from "@mui/icons-material";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export default function MobileScanPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Ez most az access token
  const [barcode, setBarcode] = useState("");
  const [lastSent, setLastSent] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [raktarList, setRaktarList] = useState([]);
  
  // Form adatok
  const [formData, setFormData] = useState({
    name: '',
    Mennyiség: 1,
    Leirás: '',
    barcode: '',
    egysegar: 0,
    ar: 0,
    Depot: '',
    muvelet: 'BE' // Alapértelmezés: bevétel
  });

  const videoRef = useRef(null);
  const codeReader = useRef(null);

  // Token és raktárak betöltése
  useEffect(() => {
    if (token) {
      // Token tárolása sessionStorage-ban
      sessionStorage.setItem("access", token);
      fetchRaktarok();
    } else {
      setError("Hiányzó token! Kérjük, használja a QR kódot a bejelentkezéshez.");
    }
  }, [token]);

  const fetchRaktarok = async () => {
    try {
      console.log('Fetching raktarok with access token...');
      const response = await axios.get('/api/raktar/', {
        headers: {
          "Authorization": `Bearer ${token}`, // ACCESS TOKEN használata
        }
      });
      console.log('Raktarok loaded:', response.data.length);
      setRaktarList(response.data);
    } catch (e) {
      console.error("Raktárak betöltési hiba:", e);
      setError(`Nem sikerült betölteni a raktárakat. Hiba: ${e.response?.data?.detail || e.message}`);
    }
  };

  // Kamera inicializálás
  useEffect(() => {
    if (token && raktarList.length > 0) {
      initializeScanner();
    }
    return () => {
      if (codeReader.current) codeReader.current.reset();
    };
  }, [token, raktarList]);

  const initializeScanner = () => {
    try {
      codeReader.current = new BrowserMultiFormatReader();
      codeReader.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, err) => {
          if (result && result.getText()) {
            const scannedBarcode = result.getText();
            setBarcode(scannedBarcode);
            
            // Form megnyitása a beolvasott vonalkóddal
            setFormData(prev => ({
              ...prev,
              barcode: scannedBarcode,
              ar: prev.Mennyiség * prev.egysegar
            }));
            setShowForm(true);
            
            // Kamera leállítása a form megnyitásakor
            codeReader.current.reset();
          }
          if (err && err.name !== "NotFoundException") {
            setError("Kamera hiba: " + err.message);
          }
        }
      );
    } catch (e) {
      setError("Kamera inicializálása sikertelen: " + e.message);
    }
  };

  // Form mező változtatások kezelése
  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Ár automatikus kiszámítása
      if (field === 'Mennyiség' || field === 'egysegar') {
        newData.ar = (newData.Mennyiség || 0) * (newData.egysegar || 0);
      }
      
      return newData;
    });
  };

  // Form elküldése KÖZVETLENÜL az API/items endpoint-ra
  const handleSubmitForm = async () => {
    try {
      if (!formData.name.trim()) {
        setError("A termék neve kötelező!");
        return;
      }
      if (!formData.Depot) {
        setError("Raktár kiválasztása kötelező!");
        return;
      }

      const payload = {
        name: formData.name,
        barcode: formData.barcode,
        Leirás: formData.Leirás,
        Mennyiség: Number(formData.Mennyiség),
        muvelet: formData.muvelet,
        egysegar: Number(formData.egysegar),
        Depot: formData.Depot
      };

      console.log('Sending to /api/items/ with payload:', payload);

      const response = await axios.post("/api/items/", payload, {
        headers: {
          "Authorization": `Bearer ${token}`, // ACCESS TOKEN használata
          "Content-Type": "application/json"
        }
      });

      console.log('API response:', response.data);
      setLastSent(`${formData.name} (${formData.barcode})`);
      setError("");
      setShowForm(false);
      
      // Form reset és újraindítás
      setFormData({
        name: '',
        Mennyiség: 1,
        Leirás: '',
        barcode: '',
        egysegar: 0,
        ar: 0,
        Depot: '',
        muvelet: 'BE'
      });
      
      setTimeout(() => {
        setBarcode("");
        initializeScanner();
      }, 2000);
      
    } catch (e) {
      console.error('API Error details:', e.response);
      setError("Hiba a termék mentésekor: " + (e.response?.data?.detail || e.message));
    }
  };

  // Form bezárása
  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      name: '',
      Mennyiség: 1,
      Leirás: '',
      barcode: '',
      egysegar: 0,
      ar: 0,
      Depot: '',
      muvelet: 'BE'
    });
    // Kamera újraindítása
    setTimeout(() => {
      setBarcode("");
      initializeScanner();
    }, 500);
  };

  // Token hiány esetén üzenet
  if (!token) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: 2,
          bgcolor: '#f5f5f5'
        }}
      >
        <Paper sx={{ p: 3, textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Hozzáférés megtagadva
          </Typography>
          <Typography variant="body2">
            Kérjük, használja a QR kódot a főoldalról a mobil beolvasó eléréséhez.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 2,
        bgcolor: '#f5f5f5'
      }}
    >
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          textAlign: "center",
          width: "100%",
          maxWidth: 400,
          position: 'relative'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          <CameraIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Mobil Raktár Beolvasó
        </Typography>
        
        {/* Debug információ */}
        <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
          Token: {token ? '✅ Megvan' : '❌ Hiányzik'}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary' }}>
          Raktárak: {raktarList.length} db
        </Typography>
        
        <video 
          ref={videoRef} 
          style={{ 
            width: "100%", 
            height: 250, 
            borderRadius: 8,
            backgroundColor: '#000'
          }}
          playsInline
          muted
        />
        
        {barcode && !showForm && (
          <Typography sx={{ mt: 2, p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
            <strong>Utolsó vonalkód:</strong> {barcode}
          </Typography>
        )}

        {lastSent && (
          <Alert severity="success" sx={{ mt: 2 }}>
            ✅ Sikeresen mentve: {lastSent}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
          Irányítsd a kamerát a vonalkódra
        </Typography>
      </Paper>

      {/* Termék adatok form dialog */}
      <Dialog 
        open={showForm} 
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            m: 2,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          Termék Adatok
          <IconButton 
            onClick={handleCloseForm}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            {/* Vonalkód (readonly) */}
            <Grid item xs={12}>
              <TextField
                label="Vonalkód"
                value={formData.barcode}
                fullWidth
                disabled
                variant="outlined"
                sx={{ bgcolor: '#f5f5f5' }}
              />
            </Grid>

            {/* Termék neve */}
            <Grid item xs={12}>
              <TextField
                label="Termék neve *"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                fullWidth
                variant="outlined"
                required
              />
            </Grid>

            {/* Leírás */}
            <Grid item xs={12}>
              <TextField
                label="Leírás"
                value={formData.Leirás}
                onChange={(e) => handleFormChange('Leirás', e.target.value)}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
              />
            </Grid>

            {/* Művelet típusa */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Művelet</InputLabel>
                <Select
                  value={formData.muvelet}
                  onChange={(e) => handleFormChange('muvelet', e.target.value)}
                  label="Művelet"
                >
                  <MenuItem value="BE">Bevétel (BE)</MenuItem>
                  <MenuItem value="KI">Kiadás (KI)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Mennyiség */}
            <Grid item xs={6}>
              <TextField
                label="Mennyiség *"
                type="number"
                value={formData.Mennyiség}
                onChange={(e) => handleFormChange('Mennyiség', e.target.value)}
                fullWidth
                variant="outlined"
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>

            {/* Egységár */}
            <Grid item xs={12}>
              <TextField
                label="Egységár (Ft)"
                type="number"
                value={formData.egysegar}
                onChange={(e) => handleFormChange('egysegar', e.target.value)}
                fullWidth
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Összesített ár */}
            <Grid item xs={12}>
              <TextField
                label="Összesített ár (Ft)"
                value={formData.ar}
                fullWidth
                disabled
                variant="outlined"
                sx={{ 
                  bgcolor: '#e8f5e8',
                  '& .MuiInputBase-input': {
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }
                }}
              />
            </Grid>

            {/* Raktár kiválasztás */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Raktár *</InputLabel>
                <Select
                  value={formData.Depot}
                  onChange={(e) => handleFormChange('Depot', e.target.value)}
                  label="Raktár *"
                >
                  <MenuItem value="" disabled>
                    Válassz raktárt...
                  </MenuItem>
                  {raktarList.map((raktar) => (
                    <MenuItem key={raktar.id} value={raktar.id}>
                      {raktar.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseForm}
            variant="outlined"
            fullWidth
          >
            Mégse
          </Button>
          <Button 
            onClick={handleSubmitForm}
            variant="contained"
            fullWidth
            disabled={!formData.name.trim() || !formData.Depot}
          >
            Termék Mentése
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}