import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useEffect } from 'react';
import { apiContext } from '../../context/ApiProvider';
import { AttributeInput } from '../../model/attribute.input';
import Dialog from '@mui/material/Dialog';
import { AttributeEntity } from '../../model/attribute.entity';
import Snackbar from '@mui/material/Snackbar';

interface AttributeData {
  id: string;
  error: string;
}

type AttributeAction = {
  type: 'SET',
  field: 'id';
  value: string
} | {
  type: 'ERROR',
  value: string;
} | {
  type: 'INIT',
  data: AttributeEntity;
};

const authReducer = (state: AttributeData, action: AttributeAction): AttributeData => {
  const update = {...state};

  switch (action.type) {
    case 'SET':

      update[action.field] = action.value;
      update.error = '';
      return update;

    case 'ERROR':
      update.error = action.value;

      return update;

    case 'INIT':
      update.id = action.data.id;
      update.error = '';

      return update;
  }

  return {
    id: '',
    error: '',
  };
};

export function AttributeForm(
  {
    onClose,
    edit,
  }: {
    onClose: () => void;
    edit: string | null;
  },
) {
  const [{id, error}, dispatch] = React.useReducer(authReducer, {id: ''} as AttributeData);
  const {postData, putData, getItem} = React.useContext(apiContext);

  useEffect(() => {
    if (edit) {
      getItem<AttributeEntity>(`attributes/${edit}`).then(res => {
        if (res.status) {
          dispatch({type: 'INIT', data: res.data});
        } else {
          dispatch({type: 'ERROR', value: res.error})
        }
      });
    }
  }, []);

  return (
    <Dialog
      open={true}
      onClose={onClose}
    >
      <DialogTitle>Create Attribute</DialogTitle>

      <DialogContent>
        <form onSubmit={event => {
          event.preventDefault();

          if (edit) {
            putData<AttributeInput>(`attributes/${edit}`, {item: {id}}).then(res => {
              if (res.status) onClose();
              else dispatch({type: 'ERROR', value: res.error});
            });
          } else {
            postData<AttributeInput>('attributes', {item: {id}}).then(res => {
              if (res.status) onClose();
              else dispatch({type: 'ERROR', value: res.error});
            });
          }
        }} id="subscription-form">
          <TextField
            autoFocus
            required
            margin="dense"
            name="id"
            label="ID"
            fullWidth
            value={id}
            variant="standard"
            onChange={event => dispatch({
              type: 'SET',
              field: 'id',
              value: event.target.value,
            })}
          />
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="subscription-form">
          SAVE
        </Button>
      </DialogActions>

      {error ? <Snackbar
        open={!!error}
        autoHideDuration={6000}
        message={error}
        onClose={() => dispatch({type: 'ERROR', value: ''})}
      /> : null}
    </Dialog>
  );
}