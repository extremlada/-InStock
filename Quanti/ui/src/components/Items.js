import React, { Component } from "react";
import { useParams } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import QuoteForm from "./AddItemForm";
import Sidebar from "./sidebar";
import { Box, Paper, Modal, FormControl, InputLabel, Select } from "@mui/material";
import * as XLSX from "xlsx";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';

class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      anchorEl: null,
      selectedItem: null,
      showQuoteForm: false,
      raktarName: "",
      importPreview: null, // ideiglenes tároló a beolvasott adatoknak
      importColumns: [],   // oszlopnevek a fájlból
      columnMapping: {},   // felhasználó által választott párosítás
      showImportModal: false
    };
    this.handleMenuOpen = this.handleMenuOpen.bind(this);
    this.handleMenuClose = this.handleMenuClose.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  // Csoportosítja az itemeket vonalkód szerint, mennyiséget összeadja
  processItems(data) {
    const groupedItems = data.reduce((acc, item) => {
      const qty = item.Mennyiség || item.quantity || 0;
      const price = item.egysegar || item.egysegar || 0;
      const ar = item.item_price || (qty * price);
      if (acc[item.barcode]) {
        acc[item.barcode].quantity += qty;
        acc[item.barcode].ar += qty * price;
      } else {
        acc[item.barcode] = {
          ...item,
          id: item.id || item.barcode,
          ar: ar
        };
      }
      return acc;
    }, {});
    return Object.values(groupedItems);
  }

  componentDidMount() {
    const { id } = this.props.params;
    fetch(`/api/raktar/${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const processedItems = this.processItems(data);
          this.setState({ items: processedItems });
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  handleMenuOpen(event, item) {
    this.setState({ anchorEl: event.currentTarget, selectedItem: item });
  }

  handleMenuClose() {
    this.setState({ anchorEl: null, selectedItem: null });
  }

  handleEdit() {
    const { selectedItem } = this.state;
    fetch(`/api/item/${selectedItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: selectedItem.name,
        description: selectedItem.description,
        quantity: selectedItem.quantity,
        barcode: selectedItem.barcode,
      }),
    });
    this.handleMenuClose();
  }

  handleDelete() {
    const { selectedItem } = this.state;
    fetch(`/api/items/${selectedItem.id}/`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          this.setState((prevState) => ({
            items: prevState.items.filter((item) => item.id !== selectedItem.id),
          }));
          alert("Item deleted successfully.");
        } else {
          alert("Failed to delete item.");
        }
      })
      .catch((error) => console.error("Error deleting item:", error));
    this.handleMenuClose();
  }

  handleQuoteFormOpen = () => {
    this.setState({ showQuoteForm: true });
  };

  handleQuoteFormClose = () => {
    this.setState({ showQuoteForm: false });
  };

  handleQuoteFormSubmit = (formData) => {
    const { id } = this.props.params;
    const itemData = {
      name: formData.name,
      Depot: id,
      Mennyiség: formData.Mennyiség,
      barcode: formData.barcode,
      Leirás: formData.description,
      egysegar: formData.egysegar,
      Leirás: formData.description || "",
      muvelet: "BE", // Alapértelmezett művelet,
      // NE küldj item_price-t!
    };

    function getCookie(name) {
      let cookie = {};
      document.cookie.split(';').forEach(function (el) {
        let [k, v] = el.split('=');
        cookie[k.trim()] = v;
      });
      return cookie[name];
    }

    const csrftoken = getCookie('csrftoken');

    fetch("/api/items/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken
      },
      body: JSON.stringify(itemData),
    })
      .then((response) => {
        if (response.ok) {
          alert("Termék sikeresen hozzáadva!");
          this.handleQuoteFormClose();
          this.componentDidMount();
        } else {
          response.json().then((errorData) => {
            alert("Hiba történt a termék hozzáadása során: " + JSON.stringify(errorData));
          });
        }
      })
      .catch(() => {
        alert("Hiba történt a termék hozzáadása során.");
      });
  }

  // CSV/Excel import
  handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // tömb tömbben, első sor: fejléc
      const columns = json[0] || [];
      const rows = json.slice(1).map(rowArr =>
        Object.fromEntries(columns.map((col, idx) => [col, rowArr[idx]]))
      );
      this.setState({
        importPreview: rows,
        importColumns: columns,
        columnMapping: {},
        showImportModal: true
      });
    };
    reader.readAsArrayBuffer(file);
  };

  // CSV/Excel export
  handleExport = () => {
    const { items } = this.state;
    const exportData = items.map(item => ({
      Név: item.name,
      Mennyiség: item.Mennyiség || item.quantity,
      Leirás: item.Leirás || item.description || "",
      barcode: item.barcode
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Termékek");
    XLSX.writeFile(workbook, "raktar_termekek.xlsx");
  };

  render() {
    const { anchorEl, items, showQuoteForm, raktarName, showImportModal, importColumns, columnMapping, importPreview } = this.state;

    // Táblázat oszlopok
    const columns = [
      { field: 'name', headerName: 'Név', width: 180, editable: false },
      { field: 'Mennyiség', headerName: 'Mennyiség', width: 120 },
      { field: 'Leirás', headerName: 'Leírás', width: 200, editable: false },
      { field: 'barcode', headerName: 'Vonalkód', width: 150 },
      { field: 'egysegar', headerName: 'Egységár', width: 150 },
      { field: 'ar', headerName: 'Ár', width: 150 },
      {
        field: 'actions',
        headerName: 'Műveletek',
        width: 100,
        renderCell: (params) => (
          <IconButton
            aria-label="more"
            aria-controls={`long-menu-${params.row.id}`}
            aria-haspopup="true"
            onClick={(event) => this.handleMenuOpen(event, params.row)}
            sx={{ color: '#2563eb' }}
          >
            <MoreVertIcon />
          </IconButton>
        ),
      },
    ];

    const modelFields = [
      { key: "name", label: "Név" },
      { key: "barcode", label: "Vonalkód" },
      { key: "Mennyiség", label: "Mennyiség" },
      { key: "egysegar", label: "Egységár" },
      { key: "ar", label: "Ár" },
      { key: "Leirás", label: "Leírás" }
    ];

    const handleMappingChange = (field, value) => {
      this.setState(prev => ({
        columnMapping: { ...prev.columnMapping, [field]: value }
      }));
    };

    const handleImportConfirm = async () => {
      const { columnMapping, importPreview } = this.state;
      for (const row of importPreview) {
        await fetch("/api/items/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: row[columnMapping.name] || "",
            Depot: this.props.params.id,
            Mennyiség: row[columnMapping.Mennyiség] || 1,
            barcode: row[columnMapping.barcode] || "",
            Leirás: row[columnMapping.Leirás] || "",
            muvelet: "BE"
          }),
        });
      }
      this.setState({ showImportModal: false, importPreview: null, columnMapping: {} });
      this.componentDidMount();
      alert("Import sikeres!");
    };

    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, md: 4 }, background: 'transparent' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#232526', mb: 4 }}>
            Raktár termékek
          </Typography>

          {/* Import/Export gombok */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
              >
                Import (CSV/Excel)
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  hidden
                  onChange={this.handleImport}
                />
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={this.handleExport}
              >
                Export (Excel)
              </Button>
            </Grid>
          </Grid>

          {/* Hozzáadás gomb */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} display="flex" justifyContent="center">
              <Button
                variant="contained"
                onClick={this.handleQuoteFormOpen}
                sx={{
                  background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                  borderRadius: '12px',
                  padding: '12px 28px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1d4ed8, #2563eb)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)'
                  }
                }}
              >
                Termék hozzáadása
              </Button>
            </Grid>
          </Grid>

          {/* Táblázat */}
          <Paper elevation={4} sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: '#fff',
            color: '#232526',
            p: 2,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)'
          }}>
            <div style={{ height: '70vh', width: '100%' }}>
              <DataGrid
                rows={items}
                columns={columns}
                pageSize={20}
                rowsPerPageOptions={[20]}
                sx={{
                  background: '#fff',
                  color: '#232526',
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': {
                    background: '#f5f5f5',
                    color: '#232526',
                    fontWeight: 700,
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #e0e0e0',
                  },
                  '& .MuiDataGrid-row:hover': {
                    background: '#f0f4fa',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    background: '#f5f5f5',
                    color: '#232526',
                  },
                }}
                checkboxSelection
                disableRowSelectionOnClick
              />
            </div>
          </Paper>

          {/* Műveletek menü */}
          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={this.handleMenuClose}
          >
            <MenuItem onClick={this.handleEdit}>Szerkesztés</MenuItem>
            <MenuItem onClick={this.handleDelete}>Törlés</MenuItem>
          </Menu>

          {/* Termék hozzáadás űrlap */}
          <QuoteForm
            open={showQuoteForm}
            onClose={this.handleQuoteFormClose}
            onSubmit={this.handleQuoteFormSubmit}
            currentRaktar={raktarName}
          />

          {/* Importálás oszlopainak párosítása modal */}
          {showImportModal && (
            <Modal open={showImportModal} onClose={() => this.setState({ showImportModal: false })}>
              <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, minWidth: 350
              }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Oszlopok párosítása</Typography>
                {modelFields.map(field => (
                  <FormControl fullWidth sx={{ mb: 2 }} key={field.key}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={columnMapping[field.key] || ""}
                      label={field.label}
                      onChange={e => handleMappingChange(field.key, e.target.value)}
                    >
                      <MenuItem value="">Nincs</MenuItem>
                      {importColumns.map(col => (
                        <MenuItem key={col} value={col}>{col}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Minta az importált adatokból:
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
                  <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
                    <thead>
                      <tr>
                        {importColumns.map(col => (
                          <th key={col} style={{ border: '1px solid #ddd', background: '#f5f5f5', padding: 4 }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(importPreview || []).slice(0, 3).map((row, idx) => (
                        <tr key={idx}>
                          {importColumns.map(col => (
                            <td key={col} style={{ border: '1px solid #eee', padding: 4 }}>
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
                <Button
                  variant="contained"
                  onClick={handleImportConfirm}
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    py: 1.5,
                    background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                    color: '#fff',
                    fontWeight: 500,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #1d4ed8, #2563eb)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)'
                    }
                  }}
                >
                  Importálás megerősítése
                </Button>
              </Box>
            </Modal>
          )}
        </Box>
      </Box>
    );
  }
}

export default (props) => <Item {...props} params={useParams()} />;
