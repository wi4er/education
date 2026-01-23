import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AttributeView } from '../view';
import { apiContext, ApiEntity, Pagination } from '../../../context/ApiProvider';
import { getStringColumns, Column } from '../../../service/string.service';
import { getPointColumns } from '../../../service/point.service';
import { AttributeForm } from '../AttributeForm';
import { AttributeTable } from './AttributeTable';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import TablePagination from '@mui/material/TablePagination';
import { AddButton } from '../../common/AddButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const baseColumns: readonly Column[] = [
  { id: 'id', label: 'ID', minWidth: 170 },
  { id: 'type', label: 'Type', minWidth: 100 },
];

export function AttributeList() {
  const { getList, deleteItem } = useContext(apiContext);
  const [list, setList] = useState<Array<AttributeView>>([]);
  const [count, setCount] = useState(0);
  const [edit, setEdit] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const columns = useMemo(() => [
    ...baseColumns,
    ...getStringColumns(list),
    ...getPointColumns(list),
  ], [list]);

  function refreshData(pagination?: Pagination) {
    getList<AttributeView>(ApiEntity.ATTRIBUTE, pagination)
      .then(({ data, count }) => {
        setList(data);
        setCount(count);
      })
      .catch(() => {
        setList([]);
        setCount(0);
      });
  }

  useEffect(() => {
    refreshData({ limit: rowsPerPage, offset: page * rowsPerPage });
  }, [page, rowsPerPage]);

  return (
    <Box>
      <Toolbar>
        <Typography variant="h6" component="div">
          Attributes
        </Typography>

        <Box sx={{ flex: 1 }}/>

        <IconButton
          color="inherit"
          aria-label="add attribute"
          edge="start"
          onClick={() => setEdit('')}
        >
          <AddIcon/>
        </IconButton>
      </Toolbar>

      {list.length === 0 ? (
        <AddButton title="Add attribute" onClick={() => setEdit('')}/>
      ) : (
        <>
          <AttributeTable
            list={list}
            columns={columns}
            onEdit={id => setEdit(id)}
            onDelete={id => {
              deleteItem<AttributeView>('attribute', id)
                .then(({ data, deletedAt }) => {
                  setSnackbar(`Deleted attribute ${data.id} at ${deletedAt}`);
                  refreshData({ limit: rowsPerPage, offset: page * rowsPerPage });
                });
            }}
            onStatusChange={() => refreshData({ limit: rowsPerPage, offset: page * rowsPerPage })}
          />

          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={count}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event: unknown, newPage: number) => setPage(newPage)}
            onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setRowsPerPage(+event.target.value);
              setPage(0);
            }}
          />
        </>
      )}

      {edit !== null && (
        <AttributeForm
          edit={edit}
          onClose={() => {
            refreshData({ limit: rowsPerPage, offset: page * rowsPerPage });
            setEdit(null);
          }}
        />
      )}

      <Snackbar
        open={snackbar !== null}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
      >
        <Alert severity="success" onClose={() => setSnackbar(null)}>
          {snackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
}
