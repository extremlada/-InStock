import React, { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import axios from "axios";

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [types, setTypes] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    user: "",
    source_warehouse: "",
    target_warehouse: "",
    date_from: "",
    date_to: ""
  });

  useEffect(() => {
    fetchTypes();
    fetchTransactions();
  }, []);

  const fetchTypes = async () => {
    const token = sessionStorage.getItem("token"); // vagy ahonnan az auth token jön
    const res = await axios.get("/api/transaction-types/", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTypes(res.data);
  };

  const fetchTransactions = async (params = {}) => {
    const token = sessionStorage.getItem("token");
    const res = await axios.get("/api/transactions/", {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    setTransactions(res.data.results || res.data);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTransactions(filters);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Bizonylatok / Tranzakciók</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleFilterSubmit} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Típus</InputLabel>
            <Select
              name="type"
              value={filters.type}
              label="Típus"
              onChange={handleFilterChange}
            >
              <MenuItem value="">Mind</MenuItem>
              {types.map(t => (
                <MenuItem key={t.code} value={t.code}>{t.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="user"
            label="Felhasználó"
            value={filters.user}
            onChange={handleFilterChange}
          />
          <TextField
            name="source_warehouse"
            label="Forrás raktár"
            value={filters.source_warehouse}
            onChange={handleFilterChange}
          />
          <TextField
            name="target_warehouse"
            label="Cél raktár"
            value={filters.target_warehouse}
            onChange={handleFilterChange}
          />
          <TextField
            name="date_from"
            label="Dátumtól"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.date_from}
            onChange={handleFilterChange}
          />
          <TextField
            name="date_to"
            label="Dátumig"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.date_to}
            onChange={handleFilterChange}
          />
          <Button type="submit" variant="contained" sx={{ alignSelf: "center" }}>Szűrés</Button>
        </form>
      </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bizonylat sorszám</TableCell>
              <TableCell>Típus</TableCell>
              <TableCell>Dátum</TableCell>
              <TableCell>Felhasználó</TableCell>
              <TableCell>Forrás raktár</TableCell>
              <TableCell>Cél raktár</TableCell>
              <TableCell>Összes mennyiség</TableCell>
              <TableCell>Összes ár</TableCell>
              <TableCell>Művelet</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(tr => {
              // Összes mennyiség és ár kiszámítása, profit is
              let totalQty = 0;
              let totalBevetel = 0;
              let totalKiadas = 0;
              if (tr.items && Array.isArray(tr.items)) {
                tr.items.forEach(item => {
                  const qty = item.quantity || item.Mennyiség || 0;
                  const price = item.ar || (item.egysegar * qty) || 0;
                  totalQty += qty;
                  if (item.muvelet === "BE") {
                    totalBevetel += price;
                  } else if (item.muvelet === "KI") {
                    totalKiadas += price;
                  }
                });
              }
              const profit = totalBevetel - totalKiadas;
              return (
                <TableRow key={tr.id}>
                  <TableCell>{tr.unique_number}</TableCell>
                  <TableCell>{tr.transaction_type.label}</TableCell>
                  <TableCell>{new Date(tr.created_at).toLocaleString()}</TableCell>
                  <TableCell>{tr.user ? (tr.user.username || tr.user.email) : "-"}</TableCell>
                  <TableCell>{tr.source_warehouse ? tr.source_warehouse.name : "-"}</TableCell>
                  <TableCell>{tr.target_warehouse ? tr.target_warehouse.name : "-"}</TableCell>
                  <TableCell>{totalQty}</TableCell>
                  <TableCell>{totalBevetel.toLocaleString('hu-HU', { style: 'currency', currency: 'HUF' })}</TableCell>
                  <TableCell>{totalKiadas.toLocaleString('hu-HU', { style: 'currency', currency: 'HUF' })}</TableCell>
                  <TableCell>{profit.toLocaleString('hu-HU', { style: 'currency', currency: 'HUF' })}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      href={`/api/transactions/${tr.id}/pdf/`}
                      target="_blank"
                    >
                      PDF letöltés
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">Nincs találat.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}