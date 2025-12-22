import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useEffect, useState } from 'react';
import { apiContext } from '../../context/ApiProvider';
import Dialog from '@mui/material/Dialog';
import { AttributeView, AttributeType } from '../../view';
import Snackbar from '@mui/material/Snackbar';
import { StringEdit, StringsByAttr, stringsToGrouped, groupedToStrings } from '../StringEdit';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { DirectoryEdit } from '../DirectoryEdit';
import { StatusEdit } from '../StatusEdit';
import { PointEdit, PointsByAttr, pointsToGrouped, groupedToPoints } from '../PointEdit';

export function AttributeForm(
  {
    onClose,
    edit,
  }: {
    onClose: () => void;
    edit: string | null;
  },
) {
  const [id, setId] = useState('');
  const [type, setType] = useState<AttributeType>(AttributeType.STRING);
  const [asPoint, setAsPoint] = useState<string>('');
  const [status, setStatus] = useState<string[]>([]);
  const [strings, setStrings] = useState<StringsByAttr>({});
  const [points, setPoints] = useState<PointsByAttr>({});
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const {postItem, putItem, getItem} = React.useContext(apiContext);

  useEffect(() => {
    if (edit) {
      getItem<AttributeView>(`attribute/${edit}`)
        .then(data => {
          setId(data.id);
          setType(data.type || AttributeType.STRING);
          setAsPoint(data?.asPoint || '');
          setStatus(data?.status || []);
          setStrings(stringsToGrouped(data.attributes?.strings || []));
          setPoints(pointsToGrouped(data.attributes?.points || []));
        })
        .catch(err => setError(err?.message || 'Failed to load'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edit]);

  const showDirectoryTab = type === AttributeType.POINT || type === AttributeType.COUNTER;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      id,
      type,
      asPoint: showDirectoryTab ? (asPoint || undefined) : undefined,
      status: status.length > 0 ? status : undefined,
      strings: groupedToStrings(strings),
      points: groupedToPoints(points),
    };

    if (edit) {
      putItem<AttributeView>(`attribute/${edit}`, payload)
        .then(() => onClose())
        .catch(err => setError(err?.message || 'Failed to save'));
    } else {
      postItem<AttributeView>('attribute', payload)
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
      <DialogTitle>{edit ? `Edit Attribute ${id}` : 'Create Attribute'}</DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit} id="attribute-form">
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

          <FormControl fullWidth margin="dense" variant="standard">
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              value={type}
              label="Type"
              onChange={event => setType(event.target.value as AttributeType)}
            >
              <MenuItem value={AttributeType.STRING}>String</MenuItem>
              <MenuItem value={AttributeType.POINT}>Point</MenuItem>
              <MenuItem value={AttributeType.COUNTER}>Counter</MenuItem>
              <MenuItem value={AttributeType.DESCRIPTION}>Description</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{borderBottom: 1, borderColor: 'divider', mt: 2}}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              {showDirectoryTab && <Tab label="Directory"/>}
              <Tab label="Status"/>
              <Tab label="Strings"/>
              <Tab label="Points"/>
            </Tabs>
          </Box>

          {showDirectoryTab && tab === 0 && (
            <Box sx={{mt: 2}}>
              <DirectoryEdit value={asPoint} onChange={setAsPoint}/>
            </Box>
          )}

          {(showDirectoryTab ? tab === 1 : tab === 0) && (
            <Box sx={{mt: 2}}>
              <StatusEdit value={status} onChange={setStatus}/>
            </Box>
          )}

          {(showDirectoryTab ? tab === 2 : tab === 1) && (
            <StringEdit strings={strings} onChange={setStrings}/>
          )}

          {(showDirectoryTab ? tab === 3 : tab === 2) && (
            <PointEdit points={points} onChange={setPoints}/>
          )}
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="attribute-form">
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
