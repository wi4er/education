import React, { useContext, useEffect, useState } from 'react';
import { AttributeEntity } from '../../model/attribute.entity';
import { apiContext } from '../../context/ApiProvider';
import { AttributeForm } from '../AttributeForm';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Actions } from '../../widget/Actions';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  {id: 'id', label: 'ID', minWidth: 170},
  {id: 'created_at', label: 'Create At', minWidth: 170},
  {id: 'updated_at', label: 'Updated At', minWidth: 100},
];

export function AttributeList() {
  const {getData, deleteData} = useContext(apiContext);
  const [list, setList] = useState<Array<AttributeEntity>>([]);
  const [edit, setEdit] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  function refreshData() {
    getData<AttributeEntity>('attributes').then(data => {
      if (data.status) setList(data.data);
    });
  }

  useEffect(() => refreshData(), []);

  return (
    <div>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
        >
          Attributes
        </Typography>

        <Box sx={{flex: 1}}/>

        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setEdit('')}
        >
          <AddIcon/>
        </IconButton>
      </Toolbar>

      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell
                key={'actions'}
                style={{width: 12}}
              />

              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{minWidth: column.minWidth}}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {list.map((row) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  <TableCell key={'actions'}>
                    <Actions list={[{
                      title: 'edit',
                      onClick: () => setEdit(row.id),
                    }, {
                      title: 'delete',
                      onClick: () => {
                        deleteData(`attributes/${row.id}`).then(res => {
                          if (res.status) refreshData();
                        })
                      },
                    }]}/>
                  </TableCell>

                  {columns.map((column) => {
                    const value = row[column.id as keyof AttributeEntity];

                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format && typeof value === 'number'
                          ? column.format(value)
                          : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={list.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event: unknown, newPage: number) => setPage(newPage)}
        onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setRowsPerPage(+event.target.value);
          setPage(0);
        }}
      />

      {edit !== null ? <AttributeForm
        edit={edit}
        onClose={() => {
          refreshData();
          setEdit(null);
        }}
      /> : null}
    </div>
  );
}