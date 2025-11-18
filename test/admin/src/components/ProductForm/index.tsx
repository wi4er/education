import css from './index.module.css';
import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { FormEvent } from 'react';

export function ProductForm(
  {
    open,
    handleClose,
    productId,
  }: {
    open: boolean;
    handleClose: () => void;
    productId?: number;
  },
) {
  const [id, setId] = React.useState(0);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState(0);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (productId) {
      fetch(`http://localhost:3000/items/${productId}`, {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({name, description, price}),
      }).then(res => res.json()).then(res => {
        if (res.status) handleClose();
      });
    } else {
      fetch('http://localhost:3000/items', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({name, description, price}),
      }).then(res => res.json()).then(res => {
        if (res.status) handleClose();
      });
    }
  };

  React.useEffect(() => {
    if (productId) {
      fetch(`http://localhost:3000/items/${productId}`).then(res => res.json()).then(res => {
        setId(res.data.id);
        setName(res.data.name);
        setDescription(res.data.description);
        setPrice(res.data.price);
      });
    }
  }, [productId])

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>New product</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To subscribe to this website, please enter your email address here. We
          will send updates occasionally.
        </DialogContentText>

        <form onSubmit={handleSubmit} id="subscription-form">
          {productId && <div>
              <TextField
              margin="dense"
              id="id"
              name="id"
              label="ID"
              variant="standard"
              value={id}
              disabled
            />
          </div>}

          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="Name"
            fullWidth
            variant="standard"
            value={name}
            onChange={event => setName(event.target.value)}
          />

          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Descrioption"
            multiline
            fullWidth
            variant="standard"
            value={description}
            onChange={event => setDescription(event.target.value)}
          />

          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Descrioption"
            fullWidth
            type={'number'}
            variant="standard"
            value={price}
            onChange={event => setPrice(+event.target.value)}
          />
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="subscription-form">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}