import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useEffect, useState } from 'react';
import { apiContext } from '../../context/ApiProvider';
import Dialog from '@mui/material/Dialog';
import { StatusView } from '../../view';
import Snackbar from '@mui/material/Snackbar';
import { StringEdit, StringsByAttr, stringsToGrouped, groupedToStrings } from '../StringEdit';
import { PointEdit, PointsByAttr, pointsToGrouped, groupedToPoints } from '../PointEdit';
import { IconSelect } from '../IconSelect';
import { ColorPicker } from '../ColorPicker';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function StatusForm(
  {
    onClose,
    edit,
  }: {
    onClose: () => void;
    edit: string | null;
  },
) {
  const [id, setId] = useState('');
  const [icon, setIcon] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [strings, setStrings] = useState<StringsByAttr>({});
  const [points, setPoints] = useState<PointsByAttr>({});
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const { postItem, putItem, getItem } = React.useContext(apiContext);

  useEffect(() => {
    if (edit) {
      getItem<StatusView>(`status/${edit}`)
        .then(data => {
          setId(data.id);
          setIcon(data.icon);
          setColor(data.color);
          setStrings(stringsToGrouped(data.attributes?.strings || []));
          setPoints(pointsToGrouped(data.attributes?.points || []));
        })
        .catch(err => setError(err?.message || 'Failed to load'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edit]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      id,
      icon,
      color,
      strings: groupedToStrings(strings),
      points: groupedToPoints(points),
    };

    if (edit) {
      putItem<StatusView>(`status/${edit}`, payload)
        .then(() => onClose())
        .catch(err => setError(err?.message || 'Failed to save'));
    } else {
      postItem<StatusView>('status', payload)
        .then(() => onClose())
        .catch(err => setError(err?.message || 'Failed to create'));
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{edit ? `Edit Status ${id}` : 'Create Status'}</DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit} id="status-form">
          <TextField
            autoFocus
            required
            margin="dense"
            name="id"
            label="ID"
            fullWidth
            value={id}
            variant="standard"
            disabled={!!edit}
            onChange={event => setId(event.target.value)}
          />

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Color</Typography>
            <ColorPicker value={color} onChange={setColor}/>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Icon"/>
              <Tab label="Strings"/>
              <Tab label="Points"/>
            </Tabs>
          </Box>

          {tab === 0 && (
            <Box sx={{ mt: 2 }}>
              <IconSelect value={icon} onChange={setIcon}/>
            </Box>
          )}

          {tab === 1 && (
            <StringEdit strings={strings} onChange={setStrings}/>
          )}

          {tab === 2 && (
            <PointEdit points={points} onChange={setPoints}/>
          )}
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="status-form">
          SAVE
        </Button>
      </DialogActions>

      {error ? <Snackbar
        open={!!error}
        autoHideDuration={6000}
        message={error}
        onClose={() => setError('')}
      /> : null}
    </Dialog>
  );
}
