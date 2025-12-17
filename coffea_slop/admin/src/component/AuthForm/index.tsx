import React from 'react';
import { userContext } from '../../context/UserProvider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

interface AuthData {
  login: string;
  password: string;
  error: any;
}


type AuthAction = {
  type: 'SET',
  field: 'login' | 'password' | 'error';
  value: string
} | {
  type: 'INIT',
};

const authReducer = (state: AuthData, action: AuthAction): AuthData => {

  console.log(action.type);

  switch (action.type) {
    case 'SET':
      const update = {...state};

      update[action.field] = action.value;
      return  update;

    case 'INIT':
      break;
  }

  return {
    login: '',
    password: '',
    error: null,
  };
};

export function AuthForm() {
  const {user ,logIn} = React.useContext(userContext);
  const [{login, password, error}, dispatch] = React.useReducer(authReducer, {login: '333@ukr.net', password: 'qwerty', error: null});

  return (
    <Dialog
      open={user === null}
      onSubmit={event => {
        event.preventDefault();

        logIn(login, password);
      }}
    >
      <DialogTitle>Authorization</DialogTitle>

      <DialogContent>
        <DialogContentText>
          Admin panel available only for admin users. Please provide login and password for enter.
        </DialogContentText>

        <form id="subscription-form">
          <TextField
            autoFocus
            required
            margin="dense"
            name="login"
            label="Login"
            fullWidth
            variant="standard"
            value={login}
            onChange={event => dispatch({
              type: 'SET',
              field: 'login',
              value: event.target.value,
            })}
            error={error}
            helperText={error}
          />

          <TextField
            required
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            value={password}
            onChange={event => dispatch({
              type: 'SET',
              field: 'password',
              value: event.target.value,
            })}
          />
        </form>
      </DialogContent>

      <DialogActions>
        <Button type="submit" form="subscription-form">
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}