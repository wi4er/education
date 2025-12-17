import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import Box from '@mui/material/Box';
import DialogTitle from '@mui/material/DialogTitle';
import ListSubheader from '@mui/material/ListSubheader';
import UserIcon from '@mui/icons-material/Person';
import AttrIcon from '@mui/icons-material/ListAlt';
import { useNavigate } from 'react-router';

export function MainMenu(
  {
    onClose,
  }: {
    onClose: () => void,
  },
) {
  const navigate = useNavigate();

  return (
    <Box sx={{padding: 3}}>
      {/*<DialogTitle >*/}
      {/*  Main Menu*/}
      {/*</DialogTitle>*/}
      <List>
        <ListSubheader>Personal</ListSubheader>

        <ListItem disablePadding>
          <ListItemButton onClick={() => {
            onClose();
            navigate('/users');
          }}>
            <ListItemIcon>
              <UserIcon/>
            </ListItemIcon>
            <ListItemText primary="Users"/>
          </ListItemButton>
        </ListItem>

        <ListSubheader>Settings</ListSubheader>

        <ListItem disablePadding>
          <ListItemButton onClick={() => {
            onClose();
            navigate('/attributes');
          }}>
            <ListItemIcon>
              <AttrIcon/>
            </ListItemIcon>
            <ListItemText primary="Attributes"/>
          </ListItemButton>
        </ListItem>


      </List>
    </Box>
  );
}