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
    raktar: "", // Ez automatikusan lesz beállítva
    mennyiség: "",
    barcode: "",
    description: "",
  });
  
  const barcodeInputRef = useRef(null);
  
  // Raktár automatikus beállítása
  useEffect(() => {
    if (currentRaktar) {
      setFormData(prev => ({ ...prev, raktar: currentRaktar }));
    }
  }, [currentRaktar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            label="Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="mennyiség"
            label="Mennyiség"
            type="number"
            fullWidth
            value={formData.mennyiség}
            onChange={handleChange}
            required
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TextField
              margin="dense"
              name="barcode"
              label="Barcode"
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
            name="description"
            label="Description"
            type="text"
            fullWidth
            value={formData.description}
            onChange={handleChange}
            //required
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
