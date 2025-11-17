import React from 'react';
import css from './index.module.css';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import { UserEntity } from '../../model/User.entity';
import { columns } from './columns';

export function UserList() {
  const [list, setList] = React.useState<Array<UserEntity>>([]);

  React.useEffect(() => {
    fetch('http://localhost:3000/users', {
      method: 'GET',
      credentials: 'include',
    }).then(res  => res.json()).then(res  => {
      setList(res.data)
      console.log(res);
    });
  }, []);

  return (
    <div className={css.root}>
      <Toolbar>
        <Typography variant="h4" component="div" sx={{flexGrow: 1}}>
          User List
        </Typography>

        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{mr: 2}}
          onClick={() => {
          }}
        >
          <AddIcon/>
        </IconButton>

        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{mr: 2}}
          onClick={() => {
          }}
        >
          <DeleteIcon/>
        </IconButton>
      </Toolbar>

      <DataGrid
        rows={list ?? []}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </div>
  );
}