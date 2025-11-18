import React from 'react';
import { productContext } from './product.context';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

export function DeleteButton(
  {
    id
  }: {
    id: number;
  }
) {
  const context = React.useContext(productContext);

  return (
    <IconButton
      size="small"
      edge="start"
      color="inherit"
      aria-label="edit"
      sx={{mr: 2}}
      onClick={() => context.deleteItem(id)}
    >
      <DeleteIcon/>
    </IconButton>
  );
}