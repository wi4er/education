import React, { useContext, useEffect, useMemo, useState } from 'react';
import { LanguageView, StatusView } from '../view';
import { apiContext } from '../../../context/ApiProvider';
import { getStringValue, getStringColumns, Column } from '../../../service/string.service';
import { getPointValue, getPointColumns } from '../../../service/point.service';
import { getStatusColumns } from '../../../service/status.service';
import { LanguageForm } from '../LanguageForm';
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

const baseColumns: readonly Column[] = [
  { id: 'id', label: 'ID', minWidth: 170 },
];

export function LanguageList() {
  const { getList, deleteItem } = useContext(apiContext);
  const [list, setList] = useState<Array<LanguageView>>([]);
  const [statuses, setStatuses] = useState<Array<StatusView>>([]);
  const [edit, setEdit] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const statusColumns = useMemo(() => getStatusColumns(list, statuses), [list, statuses]);

  const columns = useMemo(() => [
    ...baseColumns,
    ...getStringColumns(list),
    ...getPointColumns(list),
  ], [list]);

  function refreshData() {
    getList<LanguageView>('language')
      .then(data => setList(data))
      .catch(() => setList([]));
  }

  useEffect(() => {
    refreshData();
    getList<StatusView>('status')
      .then(data => setStatuses(data))
      .catch(() => setStatuses([]));
  }, []);

  return (
    <div>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
        >
          Languages
        </Typography>

        <Box sx={{ flex: 1 }}/>

        <IconButton
          color="inherit"
          aria-label="add language"
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
                        deleteItem(`language/${row.id}`)
                          .then(() => refreshData());
                      },
                    }]}/>
                  </TableCell>

                  <StatusCell statusColumns={statusColumns} row={row}/>

                  {columns.map(column => {
                    let displayValue: string;
                    if (column.id.startsWith('str:')) {
                      displayValue = getStringValue(row, column.id.slice(4));
                    } else if (column.id.startsWith('pnt:')) {
                      displayValue = getPointValue(row, column.id.slice(4));
                    } else {
                      const value = row[column.id as keyof LanguageView];
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

      {edit !== null ? <LanguageForm
        edit={edit}
        onClose={() => {
          refreshData();
          setEdit(null);
        }}
      /> : null}
    </div>
  );
}
