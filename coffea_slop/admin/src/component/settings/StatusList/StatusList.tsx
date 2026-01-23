import React, { useContext, useEffect, useMemo, useState } from 'react';
import { StatusView } from '../view';
import { apiContext, ApiEntity, Pagination } from '../../../context/ApiProvider';
import { getStringValue, getStringColumns, Column } from '../../../service/string.service';
import { getPointValue, getPointColumns } from '../../../service/point.service';
import { getStatusColumns } from '../../../service/status.service';
import { StatusForm } from '../StatusForm';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Actions } from '../../common/Actions';
import { StatusHeaderCell, StatusCell } from '../../common/StatusCell';
import * as Icons from '@mui/icons-material';

const IconComponent = ({ name, color }: { name: string | null; color?: string | null }) => {
  if (!name) return null;
  const Icon = (Icons as Record<string, React.ComponentType<{ sx?: object }>>)[name];
  return Icon ? <Icon sx={color ? { color } : undefined} /> : null;
};

const baseColumns: readonly Column[] = [
  { id: 'id', label: 'ID', minWidth: 170 },
  { id: 'color', label: 'Color', minWidth: 50 },
  { id: 'icon', label: 'Icon', minWidth: 50 },
];

export function StatusList() {
  const { getList, deleteItem } = useContext(apiContext);
  const [list, setList] = useState<Array<StatusView>>([]);
  const [edit, setEdit] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const statusColumns = useMemo(() => getStatusColumns(list, list), [list]);

  const columns = useMemo(() => [
    ...baseColumns,
    ...getStringColumns(list),
    ...getPointColumns(list),
  ], [list]);

  function refreshData(pagination?: Pagination) {
    getList<StatusView>(ApiEntity.STATUS, pagination)
      .then(data => setList(data))
      .catch(() => setList([]));
  }

  useEffect(() => refreshData({ limit: rowsPerPage, offset: page * rowsPerPage }), [page, rowsPerPage]);

  return (
    <div>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
        >
          Statuses
        </Typography>

        <Box sx={{ flex: 1 }}/>

        <IconButton
          color="inherit"
          aria-label="add status"
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
                style={{ width: 12 }}
              />
              <StatusHeaderCell statusColumns={statusColumns}/>

              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {list.map(row => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  <TableCell key={'actions'}>
                    <Actions list={[{
                      title: 'Edit',
                      icon: <EditIcon fontSize="small"/>,
                      onClick: () => setEdit(row.id),
                    }, {
                      title: 'Delete',
                      icon: <DeleteIcon fontSize="small"/>,
                      onClick: () => {
                        deleteItem('status', row.id)
                          .then(() => refreshData({ limit: rowsPerPage, offset: page * rowsPerPage }));
                      },
                    }]}/>
                  </TableCell>

                  <StatusCell statusColumns={statusColumns} row={row}/>

                  {columns.map(column => {
                    if (column.id === 'color') {
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {row.color && (
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: 1,
                                backgroundColor: row.color,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            />
                          )}
                        </TableCell>
                      );
                    }

                    if (column.id === 'icon') {
                      return (
                        <TableCell key={column.id} align={column.align}>
                          <IconComponent name={row.icon} color={row.color} />
                        </TableCell>
                      );
                    }

                    let displayValue: string;
                    if (column.id.startsWith('str:')) {
                      displayValue = getStringValue(row, column.id.slice(4));
                    } else if (column.id.startsWith('pnt:')) {
                      displayValue = getPointValue(row, column.id.slice(4));
                    } else {
                      const value = row[column.id as keyof StatusView];
                      displayValue = value instanceof Date
                        ? value.toLocaleString()
                        : typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value ?? '');
                    }

                    return (
                      <TableCell key={column.id} align={column.align}>
                        {displayValue}
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

      {edit !== null ? <StatusForm
        edit={edit}
        onClose={() => {
          refreshData({ limit: rowsPerPage, offset: page * rowsPerPage });
          setEdit(null);
        }}
      /> : null}
    </div>
  );
}
