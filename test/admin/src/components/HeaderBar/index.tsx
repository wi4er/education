import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { userContext } from '../../context/UserContext';
import Drawer from '@mui/material/Drawer';
import { MainMenu } from '../MainMenu';

export function HeaderBar() {
  const {user, logout} = React.useContext(userContext);
  const [menu, setMenu] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!user) return null

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{mr: 2}}
          onClick={() => setMenu(prev => !prev)}
        >
          <MenuIcon/>
        </IconButton>

        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
          Test Project
        </Typography>

        <div>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle/>
          </IconButton>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>{user.email}</MenuItem>
            <MenuItem onClick={logout}>Log out</MenuItem>
          </Menu>

          <Drawer open={menu} onClose={() => setMenu(false)}>
            <MainMenu
              onMove={() => setMenu(false)}
            />
          </Drawer>
        </div>
      </Toolbar>
    </AppBar>
  );
}