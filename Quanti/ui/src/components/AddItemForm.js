import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

const QuoteForm = ({ open, onClose, onSubmit, currentRaktar }) => {
  const [formData, setFormData] = useState({
    name: "",
<<<<<<< HEAD
    raktar: "", // Ez automatikusan lesz beállítva
    mennyiség: "",
    barcode: "",
    description: "",
=======
    Depot: "", // Backend mezőnév
    Mennyiség: "",
    egysegar: "",
    ar: "",
    barcode: "",
    Leirás: "",
>>>>>>> master
  });
  
  const barcodeInputRef = useRef(null);
  
  // Raktár automatikus beállítása
  useEffect(() => {
    if (currentRaktar) {
<<<<<<< HEAD
      setFormData(prev => ({ ...prev, raktar: currentRaktar }));
=======
      setFormData(prev => ({ ...prev, Depot: currentRaktar }));
>>>>>>> master
    }
  }, [currentRaktar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
<<<<<<< HEAD
    setFormData((prev) => ({ ...prev, [name]: value }));
=======
    // Ha Mennyiség vagy egysegar változik, automatikusan számoljuk az árat
    if (name === "Mennyiség" || name === "egysegar") {
      setFormData((prev) => {
        const mennyiseg = name === "Mennyiség" ? value : prev.Mennyiség;
        const egysegar = name === "egysegar" ? value : prev.egysegar;
        const ar = mennyiseg && egysegar ? Number(mennyiseg) * Number(egysegar) : "";
        return { ...prev, [name]: value, ar };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
>>>>>>> master
  };

  const handleBarcodeScanned = (scannedBarcode) => {
    setFormData(prev => ({ ...prev, barcode: scannedBarcode }));
    // Fókusz a következő mezőre szkennelés után
    if (document.activeElement === barcodeInputRef.current) {
      const form = barcodeInputRef.current.form;
      const index = Array.prototype.indexOf.call(form, barcodeInputRef.current);
      form.elements[index + 1]?.focus();
    }
  };

  const handleBarcodeFocus = () => {
    // Vonalkód mező törlése amikor fókuszba kerül
    setFormData(prev => ({ ...prev, barcode: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Új termék</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
<<<<<<< HEAD
            label="Name"
=======
            label="Név"
>>>>>>> master
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
<<<<<<< HEAD
            name="mennyiség"
            label="Mennyiség"
            type="number"
            fullWidth
            value={formData.mennyiség}
            onChange={handleChange}
            required
          />
=======
            name="Mennyiség"
            label="Mennyiség"
            type="number"
            fullWidth
            value={formData.Mennyiség}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="egysegar"
            label="Egységár"
            type="number"
            fullWidth
            value={formData.egysegar}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="ar"
            label="Ár (automatikus)"
            type="number"
            fullWidth
            value={formData.ar}
            InputProps={{ readOnly: true }}
          />
>>>>>>> master
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TextField
              margin="dense"
              name="barcode"
<<<<<<< HEAD
              label="Barcode"
=======
              label="Vonalkód"
>>>>>>> master
              type="text"
              fullWidth
              value={formData.barcode}
              onChange={handleChange}
              onFocus={handleBarcodeFocus}
              inputRef={barcodeInputRef}
              required
              inputProps={{
                pattern: "\\d*",
                onKeyDown: (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleBarcodeScanned(e.target.value);
                  }
                }
              }}
            />
            <IconButton 
              color="primary"
              onClick={() => {
                // Django backend barcode reader meghívása
                fetch('http://localhost:8000/barcode/start-reader/')
                  .then(response => response.json())
                  .then(data => {
                    if (data.barcode) {
                      handleBarcodeScanned(data.barcode);
                    } else if (data.error) {
                      console.error('Barcode reading error:', data.error);
                    }
                  })
                  .catch(err => console.error('Error calling barcode reader:', err));
              }}
            >
              <QrCodeScannerIcon />
            </IconButton>
          </div>
          <TextField
            margin="dense"
<<<<<<< HEAD
            name="description"
            label="Description"
            type="text"
            fullWidth
            value={formData.description}
            onChange={handleChange}
            //required
=======
            name="Leirás"
            label="Leírás"
            type="text"
            fullWidth
            value={formData.Leirás}
            onChange={handleChange}
>>>>>>> master
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Back
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Send
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default QuoteForm;
