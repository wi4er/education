import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useEffect, useState } from 'react';
import { apiContext } from '../../../context/ApiProvider';
import Dialog from '@mui/material/Dialog';
import { ResultView } from '../view';
import Snackbar from '@mui/material/Snackbar';

export function ResultForm(
  {
    onClose,
    edit,
    defaultFormId,
  }: {
    onClose: () => void;
    edit: string | null;
    defaultFormId?: string;
  },
) {
  const [id, setId] = useState('');
  const [formId, setFormId] = useState(defaultFormId || '');
  const [error, setError] = useState('');
  const { postItem, putItem, getItem } = React.useContext(apiContext);

  useEffect(() => {
    if (edit) {
      getItem<ResultView>(`result/${edit}`)
        .then(data => {
          setId(data.id);
          setFormId(data.formId || '');
        })
        .catch(err => setError(err?.message || 'Failed to load'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edit]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      id: edit ? undefined : id || undefined,
      formId: formId || undefined,
    };

    if (edit) {
      putItem<ResultView>(`result/${edit}`, payload)
        .then(() => onClose())
        .catch(err => setError(err?.message || 'Failed to save'));
    } else {
      postItem<ResultView>('result', { ...payload, id: id || undefined })
        .then(() => onClose())
        .catch(err => setError(err?.message || 'Failed to create'));
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{edit ? `Edit Result ${id}` : 'Create Result'}</DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit} id="result-form">
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
            label="Form"
            fullWidth
            value={formId}
            variant="standard"
            disabled
          />
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="result-form">
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
