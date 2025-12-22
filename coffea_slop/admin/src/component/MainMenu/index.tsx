import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import ListSubheader from '@mui/material/ListSubheader';
import UserIcon from '@mui/icons-material/Person';
import AttrIcon from '@mui/icons-material/ListAlt';
import LangIcon from '@mui/icons-material/Language';
import StatusIcon from '@mui/icons-material/Flag';
import BlockIcon from '@mui/icons-material/ViewModule';
import ElementIcon from '@mui/icons-material/Widgets';
import SectionIcon from '@mui/icons-material/ViewCarousel';
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
    <Box sx={{ padding: 3 }}>
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

        <ListSubheader>Content</ListSubheader>

        <ListItem disablePadding>
          <ListItemButton onClick={() => {
            onClose();
            navigate('/blocks');
          }}>
            <ListItemIcon>
              <BlockIcon/>
            </ListItemIcon>
            <ListItemText primary="Blocks"/>
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => {
            onClose();
            navigate('/elements');
          }}>
            <ListItemIcon>
              <ElementIcon/>
            </ListItemIcon>
            <ListItemText primary="Elements"/>
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => {
            onClose();
            navigate('/sections');
          }}>
            <ListItemIcon>
              <SectionIcon/>
            </ListItemIcon>
            <ListItemText primary="Sections"/>
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

        <ListItem disablePadding>
          <ListItemButton onClick={() => {
            onClose();
            navigate('/languages');
          }}>
            <ListItemIcon>
              <LangIcon/>
            </ListItemIcon>
            <ListItemText primary="Languages"/>
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => {
            onClose();
            navigate('/statuses');
          }}>
            <ListItemIcon>
              <StatusIcon/>
            </ListItemIcon>
            <ListItemText primary="Statuses"/>
          </ListItemButton>
        </ListItem>

      </List>
    </Box>
  );
}