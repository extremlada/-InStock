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
  const token = searchParams.get("token");
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
    Depot: ''
  });

  const videoRef = useRef(null);
  const codeReader = useRef(null);

  // Raktárak betöltése
  useEffect(() => {
    fetchRaktarok();
  }, []);

  const fetchRaktarok = async () => {
    try {
      const response = await axios.get('/api/raktar/', {
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
        }
      });
      setRaktarList(response.data);
    } catch (e) {
      console.error("Raktárak betöltési hiba:", e);
    }
  };

  // Kamera inicializálás
  useEffect(() => {
    startCamera();
    return () => {
      if (codeReader.current) codeReader.current.reset();
    };
  }, []);

  const startCamera = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    
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
            ar: prev.Mennyiség * prev.egysegar // Ár kiszámítása
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

  // Form elküldése
  const handleSubmitForm = async () => {
    try {
      // Validáció
      if (!formData.name.trim()) {
        setError("A termék neve kötelező!");
        return;
      }
      if (!formData.Depot) {
        setError("Raktár kiválasztása kötelező!");
        return;
      }

      const payload = {
        ...formData,
        token,
        muvelet: 'BE', // Beérkezés
        Mennyiség: Number(formData.Mennyiség),
        egysegar: Number(formData.egysegar),
        ar: Number(formData.ar)
      };

      await axios.post("/api/items/", payload, {
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
          "Content-Type": "application/json"
        }
      });

      setLastSent(`${formData.name} (${formData.barcode})`);
      setError("");
      setShowForm(false);
      
      // Form reset
      setFormData({
        name: '',
        Mennyiség: 1,
        Leirás: '',
        barcode: '',
        egysegar: 0,
        ar: 0,
        Depot: ''
      });
      
      // Kamera újraindítása
      setTimeout(() => {
        startCamera();
      }, 1000);
      
    } catch (e) {
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
      Depot: ''
    });
    // Kamera újraindítása
    setTimeout(() => {
      startCamera();
    }, 500);
  };

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
        
        <video 
          ref={videoRef} 
          style={{ 
            width: "100%", 
            height: 250, 
            borderRadius: 8,
            backgroundColor: '#000'
          }} 
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

            {/* Mennyiség és Egységár */}
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

            <Grid item xs={6}>
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