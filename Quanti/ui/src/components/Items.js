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
import { Box, Paper } from "@mui/material";

class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      anchorEl: null,
      selectedItem: null,
      showQuoteForm: false,
      raktarName: "",
    };
    this.handleMenuOpen = this.handleMenuOpen.bind(this);
    this.handleMenuClose = this.handleMenuClose.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  // Csoportosítja az itemeket vonalkód szerint, mennyiséget összeadja
  processItems(data) {
    const groupedItems = data.reduce((acc, item) => {
      if (acc[item.barcode]) {
        acc[item.barcode].quantity += item.quantity;
      } else {
        acc[item.barcode] = {
          ...item,
          id: item.id || item.barcode // minden itemnek legyen id-ja
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
      Mennyiség: formData.mennyiség,
      barcode: formData.barcode,
      Leirás: formData.description
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

  render() {
    const { anchorEl, items, showQuoteForm, raktarName } = this.state;

    // Táblázat oszlopok
    const columns = [
      { field: 'name', headerName: 'Név', width: 180, editable: true },
      { field: 'Mennyiség', headerName: 'Mennyiség', width: 120 },
      { field: 'Leirás', headerName: 'Leírás', width: 200, editable: true },
      { field: 'quantity', headerName: 'Quantity', width: 120 },
      { field: 'barcode', headerName: 'Vonalkód', width: 150 },
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

    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, md: 4 }, background: 'transparent' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#232526', mb: 4 }}>
            Raktár termékek
          </Typography>

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
        </Box>
      </Box>
    );
  }
}

// Wrapper, hogy a useParams hookot class komponenshez is használhasd
export default function ItemWrapper() {
  const params = useParams();
  return <Item params={params} />;
}