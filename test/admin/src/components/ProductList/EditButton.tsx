import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import React from 'react';
import { productContext } from './product.context';

export function EditButton(
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
      onClick={() => context.openEdit(id)}
    >
      <EditIcon/>
    </IconButton>
  );
}