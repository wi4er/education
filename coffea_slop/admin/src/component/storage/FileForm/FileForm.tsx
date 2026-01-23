import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useEffect, useState } from 'react';
import { apiContext } from '../../../context/ApiProvider';
import Dialog from '@mui/material/Dialog';
import { FileView } from '../view';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { StringEdit, StringsByAttr, stringsToGrouped, groupedToStrings } from '../../shared/StringEdit';
import { PointEdit, PointsByAttr, pointsToGrouped, groupedToPoints } from '../../shared/PointEdit';
import { StatusEdit } from '../../shared/StatusEdit';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export function FileForm(
  {
    onClose,
    edit,
    parentId,
  }: {
    onClose: () => void;
    edit: string | null;
    parentId: string;
  },
) {
  const [id, setId] = useState('');
  const [path, setPath] = useState('');
  const [original, setOriginal] = useState('');
  const [status, setStatus] = useState<string[]>([]);
  const [strings, setStrings] = useState<StringsByAttr>({});
  const [points, setPoints] = useState<PointsByAttr>({});
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const { postItem, putItem, getItem } = React.useContext(apiContext);

  useEffect(() => {
    if (edit) {
      getItem<FileView>('file', edit)
        .then(data => {
          setId(data.id);
          setPath(data.path || '');
          setOriginal(data.original || '');
          setStatus(data?.status || []);
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
      id: edit ? undefined : id || undefined,
      parentId,
      path: path || undefined,
      original: original || undefined,
      status: status.length > 0 ? status : undefined,
      strings: groupedToStrings(strings),
      points: groupedToPoints(points),
    };

    if (edit) {
      putItem<FileView>('file', edit, payload)
        .then(() => onClose())
        .catch(err => setError(err?.message || 'Failed to save'));
    } else {
      postItem<FileView>('file', { ...payload, id: id || undefined })
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
      <DialogTitle>{edit ? `Edit File ${id}` : 'Create File'}</DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit} id="file-form">
          {!edit && (
            <TextField
              autoFocus
              margin="dense"
              name="id"
              label="ID (optional)"
              fullWidth
              value={id}
              variant="standard"
              onChange={event => setId(event.target.value)}
            />
          )}

          <TextField
            margin="dense"
            label="Path"
            fullWidth
            value={path}
            variant="standard"
            onChange={event => setPath(event.target.value)}
          />

          <TextField
            margin="dense"
            label="Original filename"
            fullWidth
            value={original}
            variant="standard"
            onChange={event => setOriginal(event.target.value)}
          />

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Status"/>
              <Tab label="Strings"/>
              <Tab label="Points"/>
            </Tabs>
          </Box>

          {tab === 0 && (
            <StatusEdit value={status} onChange={setStatus}/>
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
        <Button type="submit" form="file-form">
          SAVE
        </Button>
      </DialogActions>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        message={error}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
