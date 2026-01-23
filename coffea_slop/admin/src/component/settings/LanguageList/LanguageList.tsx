import React, { useContext, useEffect, useMemo, useState } from 'react';
import { LanguageView } from '../view';
import { apiContext, ApiEntity, Pagination } from '../../../context/ApiProvider';
import { getStringColumns, Column } from '../../../service/string.service';
import { getPointColumns } from '../../../service/point.service';
import { LanguageForm } from '../LanguageForm';
import { LanguageTable } from './LanguageTable';
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
];

export function LanguageList() {
  const { getList, deleteItem } = useContext(apiContext);
  const [list, setList] = useState<Array<LanguageView>>([]);
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
    getList<LanguageView>(ApiEntity.LANGUAGE, pagination)
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

      {list.length === 0 ? (
        <AddButton title="Add language" onClick={() => setEdit('')}/>
      ) : (
        <>
          <LanguageTable
            list={list}
            columns={columns}
            onEdit={id => setEdit(id)}
            onDelete={id => {
              deleteItem<LanguageView>('language', id)
                .then(({ data, deletedAt }) => {
                  setSnackbar(`Deleted language ${data.id} at ${deletedAt}`);
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
        <LanguageForm
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
