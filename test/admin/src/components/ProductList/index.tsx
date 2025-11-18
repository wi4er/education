import css from './index.module.css';
import React from 'react';
import { UserEntity } from '../../model/User.entity';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import { columns } from './columns';
import { ProductForm } from '../ProductForm';
import { productContext } from './product.context';

export function ProductList() {
  const [list, setList] = React.useState<Array<UserEntity>>([]);
  const [edit, setEdit] = React.useState<boolean>(false);
  const [editProduct, setEditProduct] = React.useState<number>(0);

  async function fetchProductList() {
    fetch('http://localhost:3000/items', {
      method: 'GET',
      credentials: 'include',
    }).then(res => res.json()).then(res => {
      setList(res.data);
    });
  }

  React.useEffect(() => {
    fetchProductList();
  }, []);

  return (
    <productContext.Provider value={{
      openEdit: (id: number) => {
        setEdit(true);
        setEditProduct(id);
      },
      deleteItem: (id: number) => {
        fetch(`http://localhost:3000/items/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        }).then(res => res.json()).then(res => {
          if (res.status) fetchProductList();
        });
      },
    }}>
      <Toolbar>
        <Typography variant="h4" component="div" sx={{flexGrow: 1}}>
          Product List
        </Typography>

        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{mr: 2}}
          onClick={() => setEdit(true)}
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
              pageSize: 20,
            },
          },
        }}
        pageSizeOptions={[5]}
      />

      <ProductForm
        open={edit}
        productId={editProduct}
        handleClose={() => {
          setEdit(false);
          fetchProductList();
        }}
      />
    </productContext.Provider>
  );
}