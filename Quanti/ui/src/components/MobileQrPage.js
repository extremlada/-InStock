import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import axios from "axios";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";

export default function MobileQrPage() {
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/get_mobile_session/").then(res => {
      setQrUrl(res.data.url);
      setLoading(false);
    }, {
      headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("access")}`,
        }
    });
  }, []);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Mobil vonalkódolvasó indítása
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Olvasd be ezt a QR kódot a telefonoddal!
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <QRCode value={qrUrl} size={220} />
        )}
        <Typography variant="caption" sx={{ display: "block", mt: 2, color: "#64748b" }}>
          A QR-kód beolvasása után a telefonodon elindul a vonalkódolvasó.
        </Typography>
      </Paper>
    </Box>
  );
}