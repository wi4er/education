import React, { useContext, useEffect, useMemo, useState } from 'react';
import { CollectionView } from '../view';
import { apiContext, ApiEntity, Pagination } from '../../../context/ApiProvider';
import { getStringColumns, Column } from '../../../service/string.service';
import { getPointColumns } from '../../../service/point.service';
import { CollectionForm } from '../CollectionForm';
import { CollectionTable } from './CollectionTable';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import AddIcon from '@mui/icons-material/Add';
import TablePagination from '@mui/material/TablePagination';
import { AddButton } from '../../common/AddButton';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const baseColumns: readonly Column[] = [
  { id: 'id', label: 'ID', minWidth: 170 },
];

export function CollectionList() {
  const { getList, deleteItem } = useContext(apiContext);
  const [list, setList] = useState<Array<CollectionView>>([]);
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
    getList<CollectionView>(ApiEntity.COLLECTION, pagination)
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
          Collections
        </Typography>

        <Box sx={{ flex: 1 }}/>

        <IconButton
          color="inherit"
          aria-label="add collection"
          edge="start"
          onClick={() => setEdit('')}
        >
          <AddIcon/>
        </IconButton>
      </Toolbar>

      {list.length === 0 ? (
        <AddButton title="Add collection" onClick={() => setEdit('')}/>
      ) : (
        <>
          <CollectionTable
            list={list}
            columns={columns}
            onEdit={id => setEdit(id)}
            onDelete={id => {
              deleteItem<CollectionView>('collection', id)
                .then(({ data, deletedAt }) => {
                  setSnackbar(`Deleted collection ${data.id} at ${deletedAt}`);
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
        <CollectionForm
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
