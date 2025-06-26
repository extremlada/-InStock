import React, { Component } from "react";
import { useParams } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Link } from "react-router-dom";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import QuoteForm from "./AddItemForm";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      anchorEl: null,
      selectedItem: null,
      showQuoteForm: false,
      raktarName: "", // Add raktár name to state
    };
    this.handleMenuOpen = this.handleMenuOpen.bind(this);
    this.handleMenuClose = this.handleMenuClose.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  processItems(data) {
    // Group items by barcode and sum their quantities
    const groupedItems = data.reduce((acc, item) => {
      if (acc[item.barcode]) {
        acc[item.barcode].quantity += item.quantity;
      } else {
        acc[item.barcode] = { 
          ...item,
          id: item.id || item.barcode // ensure each item has an id
        };
      }
      return acc;
    }, {});

    // Convert back to array
    return Object.values(groupedItems);
  }

  componentDidMount() {
    console.log(this.props.params);
    const { id } = this.props.params;
    console.log("uuid", `${id}`);
    // Then fetch items
    fetch(`/api/raktar/${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const processedItems = this.processItems(data);
          this.setState({ items: processedItems });
          console.log("Fetched items:", processedItems);
        } else {
          console.error("Fetched data is not an array:", data);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }
  fetchingraktar() {
    const { uuid } = this.props.params;
    console.log("uuid", uuid);
  }

  handleMenuOpen(event, item) {
    this.setState({ anchorEl: event.currentTarget, selectedItem: item });
  }

  handleMenuClose() {
    this.setState({ anchorEl: null, selectedItem: null });
  }

  handleEdit() {
    const { selectedItem } = this.state;
    // Implement the edit functionality here
    fetch(`/api/item/${selectedItem.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: selectedItem.name,
        description: selectedItem.description,
        quantity: selectedItem.quantity,
        barcode: selectedItem.barcode,
      }),
    })

    console.log("Edit item:", selectedItem);
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
    console.log("Delete item:", selectedItem);
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
      Depot: id,  // Still send UUID to server
      Mennyiség: formData.mennyiség,
      barcode: formData.barcode,
      Leirás: formData.description
    };

    function getCookie(name) {
      let cookie = {};
      document.cookie.split(';').forEach(function(el) {
          let [k,v] = el.split('=');
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
        // Frissítjük a listát
        this.componentDidMount();
      } else {
        response.json().then((errorData) => {
          console.error("Error response data:", errorData);
          alert("Hiba történt a termék hozzáadása során: " + JSON.stringify(errorData));
        });
      }
    })
    .catch((error) => {
      console.error("Error adding item:", error);
      alert("Hiba történt a termék hozzáadása során.");
    });
  }

  addItem() {
    const {selectedItem} = this.state;
    const { uuid } = this.props.params;
    console.log("uuid", uuid);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: this.state.name,
        raktar: uuid,
        description: this.state.description,
        quantity: this.state.quantity,
        barcode: this.state.barcode,
      }),
    };
    fetch('/api/items/', requestOptions).then((response) => 
      response.json()).then((data) => {console.log(data)
      this.fetchItems();
    });
    
  }

  render() {

    const { anchorEl, items, showQuoteForm, raktarName } = this.state;
    const columns = [
      { field: 'name', headerName: 'Name', width: 150 , editable: true,},
      { field: 'Mennyiség', headerName: 'Mennyiség', width: 150 },
      { field: 'Leirás', headerName: 'Description', width: 200 , editable: true,},
      { field: 'quantity', headerName: 'Quantity', width: 150 },
      { field: 'barcode', headerName: 'Barcode', width: 150 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        renderCell: (params) => (
          <IconButton
            aria-label="more"
            aria-controls={`long-menu-${params.row.id}`}
            aria-haspopup="true"
            onClick={(event) => this.handleMenuOpen(event, params.row)}
          >
            <MoreVertIcon />
          </IconButton>
        ),
      },
    ];

    return (
      <div style={{ padding: 20 }}>

<Grid 
  container 
  spacing={3} 
  sx={{ 
    padding: '2rem',
    background: 'linear-gradient(to right, #f5f7fa, #f8f9fb)',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
  }}
>
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
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          background: 'linear-gradient(90deg, #1d4ed8, #2563eb)',
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)'
        }
      }}
    >
      Add Item
    </Button>
  </Grid>
</Grid>  
        
        <div style={{ height: '85vh', width: '100%', paddingTop: 15, marginTop: 20 }}>
          <DataGrid
            rows={items}
            columns={columns}
            pageSize={100}
            rowsPerPageOptions={[100]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </div>

        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={this.handleMenuClose}
        >
          <MenuItem onClick={this.handleEdit}>Edit</MenuItem>
          <MenuItem onClick={this.handleDelete}>Delete</MenuItem>
        </Menu>
        <QuoteForm
          open={showQuoteForm} 
          onClose={this.handleQuoteFormClose} 
          onSubmit={this.handleQuoteFormSubmit}
          currentRaktar={raktarName}  // Changed from uuid to raktarName
        />
      </div>
    );
  }
}

export default function ItemWrapper() {
  const params = useParams();
  return <Item params={params} />;
}