import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useState } from 'react';

export function Icons() {
  const [menu, setMenu] = useState(false)


  return (
    <div>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={() => setMenu(true)}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>

      {/*<Menu*/}
      {/*  id="menu-appbar"*/}
      {/*  anchorEl={auth.current}*/}
      {/*  anchorOrigin={{*/}
      {/*    vertical: 'top',*/}
      {/*    horizontal: 'right',*/}
      {/*  }}*/}
      {/*  keepMounted*/}
      {/*  transformOrigin={{*/}
      {/*    vertical: 'top',*/}
      {/*    horizontal: 'right',*/}
      {/*  }}*/}
      {/*  open={Boolean(anchorEl)}*/}
      {/*  onClose={handleClose}*/}
      {/*>*/}
      {/*  <MenuItem onClick={handleClose}>Profile</MenuItem>*/}
      {/*  <MenuItem onClick={handleClose}>My account</MenuItem>*/}
      {/*</Menu>*/}
    </div>
  );
}