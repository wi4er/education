import { ReactNode, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Icons } from './Icons';
import Drawer from '@mui/material/Drawer';
import { MainMenu } from '../MainMenu';

export function CommonLayout(
  {
    children,
  }: {
    children: ReactNode
  }
) {
  const [menu, setMenu] = useState(false)

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => setMenu(true)}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Photos
          </Typography>

          <Icons />
        </Toolbar>
      </AppBar>

      <Drawer open={menu} onClose={() => setMenu(prev => !prev)}>
        <MainMenu onClose={() => setMenu(false)}/>
      </Drawer>

      {children}
    </div>
  );
}