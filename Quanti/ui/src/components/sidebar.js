import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Box, Typography, Divider, IconButton, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRight: '1px solid rgba(203, 213, 225, 0.5)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          padding: '8px'
        },
      }}
    >
      <Toolbar 
        sx={{ 
          minHeight: '70px !important', 
          display: 'flex', 
          justifyContent: 'center',
          mb: 2
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1
          }}
        >
          <DashboardIcon 
            sx={{ 
              fontSize: 28, 
              color: '#3b82f6', 
              mr: 1 
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: '#1e293b',
              letterSpacing: '0.5px'
            }}
          >
            Quanti
          </Typography>
        </Box>
      </Toolbar>
      
      <Divider sx={{ mb: 2, borderColor: 'rgba(203, 213, 225, 0.8)' }} />
      
      <List
        sx={{
          px: 1,
          '& .MuiListItem-root': {
            borderRadius: '12px',
            mb: 1,
            transition: 'all 0.2s ease'
          },
          '& .MuiListItem-root:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)'
          },
          '& .MuiListItemIcon-root': {
            minWidth: '42px'
          },
          '& .Mui-selected': {
            backgroundColor: 'rgba(59, 130, 246, 0.12) !important',
            '&:before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '20%',
              height: '60%',
              width: '4px',
              backgroundColor: '#3b82f6',
              borderRadius: '0 4px 4px 0'
            }
          }
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            px: 3, 
            mb: 1, 
            display: 'block', 
            color: '#64748b',
            fontWeight: 500,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '0.5px'
          }}
        >
          Főmenü
        </Typography>
        <ListItem
          button={true}
          component={Link}
          to="/"
          sx={{
            py: 1.5,
            '&:hover .MuiListItemIcon-root': {
              color: '#3b82f6'
            }
          }}
        >
          <ListItemIcon>
            <DashboardIcon sx={{ color: '#64748b', transition: 'color 0.2s ease' }} />
          </ListItemIcon>
          <ListItemText
            primary="Főoldal"
            primaryTypographyProps={{ 
              fontWeight: 500, 
              color: '#334155' 
            }}
          />
        </ListItem>
        
        <ListItem 
          button={true} 
          component={Link} 
          to="/reszleg" 
          sx={{
            py: 1.5,
            '&:hover .MuiListItemIcon-root': {
              color: '#3b82f6'
            }
          }}
        >
          <ListItemIcon>
            <ApartmentIcon sx={{ color: '#64748b', transition: 'color 0.2s ease' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Részleg" 
            primaryTypographyProps={{ 
              fontWeight: 500, 
              color: '#334155' 
            }}
          />
        </ListItem>
        
        <ListItem 
          button={true} 
          component={Link} 
          to="/raktar" 
          sx={{
            py: 1.5,
            '&:hover .MuiListItemIcon-root': {
              color: '#3b82f6'
            }
          }}
        >
          <ListItemIcon>
            <WarehouseIcon sx={{ color: '#64748b', transition: 'color 0.2s ease' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Raktár"
            primaryTypographyProps={{ 
              fontWeight: 500, 
              color: '#334155' 
            }}
          />
        </ListItem>
        
        <Divider sx={{ my: 2, borderColor: 'rgba(203, 213, 225, 0.8)' }} />
        
        <Typography 
          variant="caption" 
          sx={{ 
            px: 3, 
            mb: 1, 
            display: 'block', 
            color: '#64748b',
            fontWeight: 500,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '0.5px'
          }}
        >
          Egyéb
        </Typography>
        
        <ListItem 
          button={true}
          sx={{
            py: 1.5,
            '&:hover .MuiListItemIcon-root': {
              color: '#3b82f6'
            }
          }}
        >
          <ListItemIcon>
            <SettingsIcon sx={{ color: '#64748b', transition: 'color 0.2s ease' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Beállítások"
            primaryTypographyProps={{ 
              fontWeight: 500, 
              color: '#334155' 
            }}
          />
        </ListItem>
        
        <ListItem 
          button={true}
          sx={{
            py: 1.5,
            '&:hover .MuiListItemIcon-root': {
              color: '#3b82f6'
            }
          }}
        >
          <ListItemIcon>
            <HelpOutlineIcon sx={{ color: '#64748b', transition: 'color 0.2s ease' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Súgó"
            primaryTypographyProps={{ 
              fontWeight: 500, 
              color: '#334155' 
            }}
          />
        </ListItem>
      </List>
      
      {/* Bottom section */}
      <Box sx={{ flexGrow: 1 }} />
      
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          m: 2,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold',
            mr: 1.5
          }}
        >
          FH
        </Avatar>
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: '#334155',
              lineHeight: 1.2
            }}
          >
            Felhasználó
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontSize: '0.75rem'
            }}
          >
            Adminisztrátor
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton size="small">
          <LogoutIcon fontSize="small" sx={{ color: '#64748b' }} />
        </IconButton>
      </Box>
    </Drawer>
  );
}

export default Sidebar;