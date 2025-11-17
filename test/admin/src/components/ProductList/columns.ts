import { GridColDef } from '@mui/x-data-grid';
import { UserEntity } from '../../model/User.entity';

export const columns: GridColDef<UserEntity>[] = [
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