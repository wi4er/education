import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { DirectoryView } from '../view';
import { StatusView } from '../../settings/view';
import { apiContext, ApiEntity, Pagination } from '../../../context/ApiProvider';
import { getStringValue, getStringColumns, Column } from '../../../service/string.service';
import { getPointValue, getPointColumns } from '../../../service/point.service';
import { getStatusColumns } from '../../../service/status.service';
import { DirectoryForm } from '../DirectoryForm';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import { Actions } from '../../common/Actions';
import { AddButton } from '../../common/AddButton';
import { StatusHeaderCell, StatusCell } from '../../common/StatusCell';
import Typography from '@mui/material/Typography';

const baseColumns: readonly Column[] = [
  { id: 'id', label: 'ID', minWidth: 170 },
];

export function DirectoryList() {
  const navigate = useNavigate();
  const { getList, deleteItem } = useContext(apiContext);
  const [list, setList] = useState<Array<DirectoryView>>([]);
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

  function refreshData(pagination?: Pagination) {
    getList<DirectoryView>(ApiEntity.DIRECTORY, pagination)
      .then(data => setList(data))
      .catch(() => setList([]));
  }

  useEffect(() => {
    refreshData({ limit: rowsPerPage, offset: page * rowsPerPage });
    getList<StatusView>(ApiEntity.STATUS)
      .then(data => setStatuses(data))
      .catch(() => setStatuses([]));
  }, [page, rowsPerPage]);

  if (list.length === 0) {
    return (
      <div>
        <Toolbar>
          <Typography variant="h6" component="div">
            Registry Directories
          </Typography>

          <Box sx={{ flex: 1 }}/>

          <IconButton
            color="inherit"
            aria-label="add directory"
            edge="start"
            onClick={() => setEdit('')}
          >
            <AddIcon/>
          </IconButton>
        </Toolbar>

        <AddButton title="Add directory" onClick={() => setEdit('')}/>

        {edit !== null && (
          <DirectoryForm
            edit={edit}
            onClose={() => {
              refreshData({ limit: rowsPerPage, offset: page * rowsPerPage });
              setEdit(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <Toolbar>
        <Typography variant="h6" component="div">
          Registry Directories
        </Typography>

        <Box sx={{ flex: 1 }}/>

        <IconButton
          color="inherit"
          aria-label="add directory"
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
              <TableCell key={'actions'} style={{ width: 12 }}/>
              <TableCell key={'view'} style={{ width: 12 }}/>
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
            {list.map(row => (
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
                      deleteItem('directory', row.id)
                        .then(() => refreshData({ limit: rowsPerPage, offset: page * rowsPerPage }));
                    },
                  }]}/>
                </TableCell>

                <TableCell key={'view'}>
                  <Tooltip title="View" arrow>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/directories/${row.id}`)}
                    >
                      <VisibilityIcon fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                </TableCell>

                <StatusCell statusColumns={statusColumns} row={row}/>

                {columns.map(column => {
                  let displayValue: string;
                  if (column.id.startsWith('str:')) {
                    displayValue = getStringValue(row, column.id.slice(4));
                  } else if (column.id.startsWith('pnt:')) {
                    displayValue = getPointValue(row, column.id.slice(4));
                  } else {
                    const value = row[column.id as keyof DirectoryView];
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
            ))}
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

      {edit !== null ? <DirectoryForm
        edit={edit}
        onClose={() => {
          refreshData({ limit: rowsPerPage, offset: page * rowsPerPage });
          setEdit(null);
        }}
      /> : null}
    </div>
  );
}
