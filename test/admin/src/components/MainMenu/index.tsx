import css from './index.module.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import PersonIcon from '@mui/icons-material/Person';
import DraftsIcon from '@mui/icons-material/Drafts';
import { Links, Link } from 'react-router';
import DialogTitle from '@mui/material/DialogTitle';

export function MainMenu(
  {
    onMove,
  }: {
    onMove: () => void;
  },
) {
  return (
    <div className={css.root}>
      <DialogTitle>
        Navigation
      </DialogTitle>

      <List>
        <Link
          to={'/users'}
          onClick={onMove}
        >
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <PersonIcon/>
              </ListItemIcon>

              <ListItemText primary="Users"/>
            </ListItemButton>
          </ListItem>
        </Link>

        <Link
          to={'/products'}
          onClick={onMove}
        >
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <DraftsIcon/>
              </ListItemIcon>
              <ListItemText primary="Products"/>
            </ListItemButton>
          </ListItem>
        </Link>
      </List>
    </div>
  );
}