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
    field: 'email',
    headerName: 'Email',
    width: 150,
    editable: true,
  },
  {
    field: 'first_name',
    headerName: 'First name',
    width: 150,
    editable: true,
  },
  {
    field: 'last_name',
    headerName: 'Last name',
    width: 150,
    editable: true,
  },
  {
    field: 'role',
    headerName: 'Role',
    type: 'string',
    width: 110,
    editable: true,
  },
];