import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SectionView } from '../view';
import { apiContext, ApiEntity, Pagination } from '../../../context/ApiProvider';
import { getStringColumns, Column } from '../../../service/string.service';
import { getPointColumns } from '../../../service/point.service';
import { getDescriptionColumns } from '../../../service/description.service';
import { SectionForm } from '../SectionForm';
import { SectionTable } from './SectionTable';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import AddIcon from '@mui/icons-material/Add';
import TablePagination from '@mui/material/TablePagination';
import { AddButton } from '../../common/AddButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const baseColumns: readonly Column[] = [
  { id: 'id', label: 'ID', minWidth: 170 },
  { id: 'createdAt', label: 'Created', minWidth: 150 },
  { id: 'updatedAt', label: 'Updated', minWidth: 150 },
];

export function SectionList({
  parentId,
}: {
  parentId?: string;
  hideToolbar?: boolean;
}) {
  const { getList, deleteItem } = useContext(apiContext);
  const [allItems, setAllItems] = useState<Array<SectionView>>([]);
  const [count, setCount] = useState(0);
  const [edit, setEdit] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const list = useMemo(() =>
      parentId ? allItems.filter(item => item.parentId === parentId) : allItems,
    [allItems, parentId],
  );

  const columns = useMemo(() => [
    ...(parentId ? [] : baseColumns),
    ...getStringColumns(list),
    ...getDescriptionColumns(list),
    ...getPointColumns(list),
  ], [list, parentId]);

  function refreshData(pagination?: Pagination) {
    getList<SectionView>(ApiEntity.SECTION, pagination)
      .then(({ data, count }) => {
        setAllItems(data);
        setCount(count);
      })
      .catch(() => {
        setAllItems([]);
        setCount(0);
      });
  }

  useEffect(() => {
    refreshData({ limit: rowsPerPage, offset: page * rowsPerPage });
  }, [page, rowsPerPage]);

  return (
    <Box>
      <Toolbar>
        <Box sx={{ flex: 1 }}/>

        <IconButton
          color="inherit"
          aria-label="add section"
          edge="start"
          onClick={() => setEdit('')}
        >
          <AddIcon/>
        </IconButton>
      </Toolbar>

      {list.length === 0 ? (
        <AddButton title="Add section" onClick={() => setEdit('')}/>
      ) : (
        <>
          <SectionTable
            list={list}
            columns={columns}
            onEdit={id => setEdit(id)}
            onDelete={id => {
              deleteItem<SectionView>('section', id)
                .then(({ data, deletedAt }) => {
                  setSnackbar(`Deleted section ${data.id} at ${deletedAt}`);
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
        <SectionForm
          edit={edit}
          defaultParentId={parentId}
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
