import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useEffect, useState } from 'react';
import { apiContext } from '../../context/ApiProvider';
import Dialog from '@mui/material/Dialog';
import { LanguageView } from '../../view';
import Snackbar from '@mui/material/Snackbar';
import { StringEdit, StringsByAttr, stringsToGrouped, groupedToStrings } from '../StringEdit';
import { PointEdit, PointsByAttr, pointsToGrouped, groupedToPoints } from '../PointEdit';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export function LanguageForm(
  {
    onClose,
    edit,
  }: {
    onClose: () => void;
    edit: string | null;
  },
) {
  const [id, setId] = useState('');
  const [strings, setStrings] = useState<StringsByAttr>({});
  const [points, setPoints] = useState<PointsByAttr>({});
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const { postItem, putItem, getItem } = React.useContext(apiContext);

  useEffect(() => {
    if (edit) {
      getItem<LanguageView>(`language/${edit}`)
        .then(data => {
          setId(data.id);
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
      strings: groupedToStrings(strings),
      points: groupedToPoints(points),
    };

    if (edit) {
      putItem<LanguageView>(`language/${edit}`, payload)
        .then(() => onClose())
        .catch(err => setError(err?.message || 'Failed to save'));
    } else {
      postItem<LanguageView>('language', payload)
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
      <DialogTitle>{edit ? `Edit Language ${id}` : 'Create Language'}</DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit} id="language-form">
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

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Strings"/>
              <Tab label="Points"/>
            </Tabs>
          </Box>

          {tab === 0 && (
            <StringEdit strings={strings} onChange={setStrings}/>
          )}

          {tab === 1 && (
            <PointEdit points={points} onChange={setPoints}/>
          )}
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="language-form">
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
