import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Box, Typography, Button, Paper, Alert } from "@mui/material";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export default function MobileScanPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [barcode, setBarcode] = useState("");
  const [lastSent, setLastSent] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    codeReader.current.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result, err) => {
        if (result && result.getText()) {
          setBarcode(result.getText());
          codeReader.current.reset(); // csak sikeres olvasás után állítsd le!
        }
        if (err && err.name !== "NotFoundException") {
          setError("Kamera hiba: " + err.message);
        }
      }
    );
    return () => {
      if (codeReader.current) codeReader.current.reset();
    };
  }, []);

  const handleSend = async () => {
    try {
      await axios.post("/api/mobile-barcode/", { token, barcode });
      setLastSent(barcode);
      setBarcode("");
      setError("");
      // Újraindítjuk a szkennert
      codeReader.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, err) => {
          if (result && result.getText()) {
            setBarcode(result.getText());
            codeReader.current.reset();
          }
          if (err && err.name !== "NotFoundException") {
            setError("Kamera hiba: " + err.message);
          }
        }
      );
    } catch (e) {
      setError("Hiba a küldéskor!");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "90vh",
      }}
    >
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          textAlign: "center",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Vonalkód olvasás (ZXing)
        </Typography>
        <video ref={videoRef} style={{ width: "100%", height: 300 }} />
        <Typography sx={{ mt: 2 }}>
          <strong>Beolvasott vonalkód:</strong> {barcode}
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2, width: "100%" }}
          disabled={!barcode}
          onClick={handleSend}
        >
          Küldés a backendnek
        </Button>
        {lastSent && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Elküldve: {lastSent}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}