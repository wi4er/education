import { useContext, useEffect, useState } from 'react';
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
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate } from 'react-router';
import { apiContext } from '../../../context/ApiProvider';
import { BlockView } from '../../content/view';
import { DirectoryView } from '../../registry/view';
import { FormView } from '../../feedback/view';
import { getStringValue } from '../../../service/string.service';
import CategoryIcon from '@mui/icons-material/Category';
import PlaceIcon from '@mui/icons-material/Place';
import FeedbackIcon from '@mui/icons-material/Feedback';
import AssignmentIcon from '@mui/icons-material/Assignment';

export function MainMenu(
  {
    onClose,
  }: {
    onClose: () => void,
  },
) {
  const navigate = useNavigate();
  const { getList } = useContext(apiContext);
  const [blocks, setBlocks] = useState<BlockView[]>([]);
  const [directories, setDirectories] = useState<DirectoryView[]>([]);
  const [forms, setForms] = useState<FormView[]>([]);

  useEffect(() => {
    getList<BlockView>('block')
      .then(data => setBlocks(data))
      .catch(() => setBlocks([]));
    getList<DirectoryView>('directory')
      .then(data => setDirectories(data))
      .catch(() => setDirectories([]));
    getList<FormView>('form')
      .then(data => setForms(data))
      .catch(() => setForms([]));
  }, []);

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

        {blocks.map(block => (
          <ListItem key={block.id} disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() => {
                onClose();
                navigate(`/blocks/${block.id}`);
              }}
            >
              <ListItemIcon>
                <FolderIcon fontSize="small"/>
              </ListItemIcon>
              <ListItemText primary={getStringValue(block, 'NAME') || block.id}/>
            </ListItemButton>
          </ListItem>
        ))}

        <ListSubheader>Registry</ListSubheader>

        <ListItem disablePadding>
          <ListItemButton onClick={() => {
            onClose();
            navigate('/directories');
          }}>
            <ListItemIcon>
              <CategoryIcon/>
            </ListItemIcon>
            <ListItemText primary="Directories"/>
          </ListItemButton>
        </ListItem>

        {directories.map(directory => (
          <ListItem key={directory.id} disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() => {
                onClose();
                navigate(`/directories/${directory.id}`);
              }}
            >
              <ListItemIcon>
                <PlaceIcon fontSize="small"/>
              </ListItemIcon>
              <ListItemText primary={getStringValue(directory, 'NAME') || directory.id}/>
            </ListItemButton>
          </ListItem>
        ))}

        <ListSubheader>Feedback</ListSubheader>

        <ListItem disablePadding>
          <ListItemButton onClick={() => {
            onClose();
            navigate('/forms');
          }}>
            <ListItemIcon>
              <FeedbackIcon/>
            </ListItemIcon>
            <ListItemText primary="Forms"/>
          </ListItemButton>
        </ListItem>

        {forms.map(form => (
          <ListItem key={form.id} disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() => {
                onClose();
                navigate(`/forms/${form.id}`);
              }}
            >
              <ListItemIcon>
                <AssignmentIcon fontSize="small"/>
              </ListItemIcon>
              <ListItemText primary={getStringValue(form, 'NAME') || form.id}/>
            </ListItemButton>
          </ListItem>
        ))}

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
