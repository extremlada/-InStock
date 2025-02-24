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

class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      anchorEl: null,
      selectedItem: null,
    };
    this.handleMenuOpen = this.handleMenuOpen.bind(this);
    this.handleMenuClose = this.handleMenuClose.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  componentDidMount() {
    const { uuid } = this.props.params;
    console.log("uuid", uuid);

    fetch(`/api/items/${uuid}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          this.setState({ items: data });
        } else {
          console.error("Fetched data is not an array:", data);
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
    // Implement the edit functionality here
    console.log("Edit item:", selectedItem);
    this.handleMenuClose();
  }

  handleDelete() {
    const { selectedItem } = this.state;
    // Implement the delete functionality here
    console.log("Delete item:", selectedItem);
    this.handleMenuClose();
  }

  render() {
    const { anchorEl, items } = this.state;

    const columns = [
      { field: 'name', headerName: 'Name', width: 150 },
      { field: 'Mennyiség', headerName: 'Mennyiség', width: 150 },
      { field: 'Leirás', headerName: 'Description', width: 200 },
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
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={items}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
        />
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
      </div>
    );
  }
}

export default function ItemWrapper() {
  const params = useParams();
  return <Item params={params} />;
}