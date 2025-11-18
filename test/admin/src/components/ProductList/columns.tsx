import { GridColDef } from '@mui/x-data-grid';
import { UserEntity } from '../../model/User.entity';
import React from 'react';
import { EditButton } from './EditButton';
import { DeleteButton } from './DeleteButton';

export const columns: GridColDef<UserEntity>[] = [
  {
    field: 'edit',
    headerName: '',
    width: 50,
    renderCell: element => <EditButton id={element.row.id}/>,
  },
  {
    field: 'remove',
    headerName: '',
    width: 50,
    renderCell: element => <DeleteButton id={element.row.id}/>,
  },
  {field: 'id', headerName: 'ID', width: 90},
  {
    field: 'created_at',
    headerName: 'Created',
    width: 200,
    editable: true,
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 150,
    editable: true,
  },
  {
    field: 'description',
    headerName: 'Description',
    width: 150,
    editable: true,
  },
  {
    field: 'price',
    headerName: 'Price',
    width: 150,
    editable: true,
  },
];