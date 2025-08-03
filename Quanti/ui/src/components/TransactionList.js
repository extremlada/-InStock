import React, { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import Sidebar from './sidebar';
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
    const token = sessionStorage.getItem("access");
    const res = await axios.get("/api/transaction-types/", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTypes(res.data);
  };

  const fetchTransactions = async (params = {}) => {
    const token = sessionStorage.getItem("access");
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
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8' }}>
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
                <TableCell>Nettó érték</TableCell>
                <TableCell>ÁFA érték</TableCell>
                <TableCell>Bruttó érték</TableCell>
                <TableCell>Művelet</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map(tr => {
                // Frissített összesítő számítások az új mezőkkel
                let totalQty = 0;
                let totalNetto = 0;
                let totalAfa = 0;
                let totalBrutto = 0;
                
                if (tr.items && Array.isArray(tr.items)) {
                  tr.items.forEach(item => {
                    totalQty += parseFloat(item.quantity || 0);
                    totalNetto += parseFloat(item.netto_ertek || item.egysegar * item.quantity || 0);
                    totalAfa += parseFloat(item.afa_ertek || 0);
                    totalBrutto += parseFloat(item.brutto_ertek || item.item_price || 0);
                  });
                }
                
                return (
                  <TableRow key={tr.id}>
                    <TableCell>{tr.unique_number}</TableCell>
                    <TableCell>{tr.transaction_type?.label || tr.transaction_type}</TableCell>
                    <TableCell>{new Date(tr.created_at).toLocaleString('hu-HU')}</TableCell>
                    <TableCell>{tr.user ? (tr.user.username || tr.user.email) : "-"}</TableCell>
                    <TableCell>{tr.source_warehouse ? tr.source_warehouse.name : "-"}</TableCell>
                    <TableCell>{tr.target_warehouse ? tr.target_warehouse.name : "-"}</TableCell>
                    <TableCell>{totalQty}</TableCell>
                    <TableCell>{totalNetto.toLocaleString('hu-HU', { style: 'currency', currency: 'HUF' })}</TableCell>
                    <TableCell>{totalAfa.toLocaleString('hu-HU', { style: 'currency', currency: 'HUF' })}</TableCell>
                    <TableCell>{totalBrutto.toLocaleString('hu-HU', { style: 'currency', currency: 'HUF' })}</TableCell>
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
                  <TableCell colSpan={11} align="center">Nincs találat.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}