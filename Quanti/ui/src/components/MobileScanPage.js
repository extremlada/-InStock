import React, { useEffect, useRef, useState } from "react";
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
  const [barcode, setBarcode] = useState("");
  const [lastSent, setLastSent] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [raktarList, setRaktarList] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState(null);
  
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
  const canvasRef = useRef(null);

  // Token ellenőrzés és bejelentkezés
  //useEffect(() => {
  //  if (token) {
  //    // Token tárolása sessionStorage-ban
  //    //fetchRaktarok();
  //  } else {
  //    setError("Hiányzó token! Kérjük, használja a QR kódot a bejelentkezéshez.");
  //  }
  //}, [token]);

  //const fetchRaktarok = async () => {
  //  try {
  //    const response = await axios.get('/api/raktar/', {
  //      headers: {
  //        "Authorization": `Bearer ${token || sessionStorage.getItem("access")}`,
  //      }
  //    });
  //    setRaktarList(response.data);
  //  } catch (e) {
  //    console.error("Raktárak betöltési hiba:", e);
  //    setError("Nem sikerült betölteni a raktárakat. Ellenőrizze a jogosultságokat.");
  //  }
  //};

  // Natív kamera használata BrowserMultiFormatReader helyett
  const startCamera = async () => {
    try {
      setIsScanning(true);
      
      // Kamera stream indítása
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", // Hátsó kamera mobilon
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        
        // Vonalkód detektálás indítása
        startBarcodeDetection();
      }
      
    } catch (err) {
      setError("Kamera hozzáférés megtagadva. Engedélyezze a kamera használatát!");
      console.error("Kamera hiba:", err);
    }
  };

  // Vonalkód detektálás natív Barcode Detection API-val vagy fallback
  const startBarcodeDetection = () => {
    if ('BarcodeDetector' in window) {
      // Natív Barcode Detection API (Chrome/Edge támogatja)
      const barcodeDetector = new window.BarcodeDetector({
        formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code']
      });
      
      const detectBarcode = async () => {
        if (!videoRef.current || !isScanning) return;
        
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const detectedBarcode = barcodes[0].rawValue;
            handleBarcodeDetected(detectedBarcode);
            return;
          }
        } catch (err) {
          console.log("Barcode detection error:", err);
        }
        
        // Folyamatos detektálás
        if (isScanning) {
          requestAnimationFrame(detectBarcode);
        }
      };
      
      detectBarcode();
    } else {
      // Fallback: ZXing library dinamikus betöltése
      loadZXingAndStartDetection();
    }
  };

  // ZXing library dinamikus betöltése fallback-ként
  const loadZXingAndStartDetection = async () => {
    try {
      // ZXing library dinamikus importálása
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      
      const codeReader = new BrowserMultiFormatReader();
      
      codeReader.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, err) => {
          if (result && result.getText()) {
            handleBarcodeDetected(result.getText());
          }
          if (err && err.name !== "NotFoundException") {
            console.error("ZXing error:", err);
          }
        }
      );
      
    } catch (err) {
      setError("Vonalkód olvasó betöltése sikertelen. Próbálja újra!");
      console.error("ZXing import error:", err);
    }
  };

  // Vonalkód detektálás kezelése
  const handleBarcodeDetected = (detectedBarcode) => {
    setBarcode(detectedBarcode);
    setIsScanning(false);
    
    // Kamera leállítása
    stopCamera();
    
    // Form megnyitása a beolvasott vonalkóddal
    setFormData(prev => ({
      ...prev,
      barcode: detectedBarcode,
      ar: prev.Mennyiség * prev.egysegar
    }));
    setShowForm(true);
  };

  // Kamera leállítása
  const stopCamera = () => {
    setIsScanning(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Komponens eltávolításakor cleanup
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
        muvelet: 'BE', // Beérkezés
        Mennyiség: Number(formData.Mennyiség),
        egysegar: Number(formData.egysegar),
        ar: Number(formData.ar)
      };

      await axios.post("/api/items/", payload, {
        headers: {
          "Authorization": `Bearer ${token || sessionStorage.getItem("access")}`,
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

  // Token hiány esetén üzenet
  if (!token && !sessionStorage.getItem("access")) {
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
        
        <video 
          ref={videoRef} 
          style={{ 
            width: "100%", 
            height: 250, 
            borderRadius: 8,
            backgroundColor: '#000'
          }}
          playsInline // Fontos iOS-en
          muted
        />
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {!isScanning && !showForm && (
          <Button 
            variant="contained" 
            onClick={startCamera}
            sx={{ mt: 2 }}
            fullWidth
          >
            Kamera Indítása
          </Button>
        )}
        
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
          {isScanning ? 'Irányítsd a kamerát a vonalkódra' : 'Kattints a gombra a szkennelés indításához'}
        </Typography>
      </Paper>

      {/* Termék adatok form dialog - változatlan */}
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