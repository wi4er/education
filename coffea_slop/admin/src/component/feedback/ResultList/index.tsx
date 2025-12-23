import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ResultView } from '../view';
import { apiContext } from '../../../context/ApiProvider';
import { Column } from '../../../service/string.service';
import { ResultForm } from '../ResultForm';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
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
import { AddButton } from '../../common/AddButton';

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const columns: readonly Column[] = [
  { id: 'id', label: 'ID', minWidth: 170 },
  { id: 'createdAt', label: 'Created', minWidth: 150 },
  { id: 'updatedAt', label: 'Updated', minWidth: 150 },
];

export function ResultList(
  {
    formId,
  }: {
    formId?: string;
  },
) {
  const { getList, deleteItem } = useContext(apiContext);
  const [allItems, setAllItems] = useState<Array<ResultView>>([]);
  const [edit, setEdit] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const list = useMemo(() =>
      formId ? allItems.filter(item => item.formId === formId) : allItems,
    [allItems, formId],
  );

  function refreshData() {
    getList<ResultView>('result')
      .then(data => setAllItems(data))
      .catch(() => setAllItems([]));
  }

  useEffect(() => {
    refreshData();
  }, []);

  if (list.length === 0) {
    return (
      <div>
        <Toolbar>
          <Box sx={{ flex: 1 }}/>

          <IconButton
            color="inherit"
            aria-label="add result"
            edge="start"
            onClick={() => setEdit('')}
          >
            <AddIcon/>
          </IconButton>
        </Toolbar>

        <AddButton title="Add result" onClick={() => setEdit('')}/>

        {edit !== null && (
          <ResultForm
            edit={edit}
            defaultFormId={formId}
            onClose={() => {
              refreshData();
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
        <Box sx={{ flex: 1 }}/>

        <IconButton
          color="inherit"
          aria-label="add result"
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
                      deleteItem(`result/${row.id}`)
                        .then(() => refreshData());
                    },
                  }]}/>
                </TableCell>

                {columns.map(column => {
                  let displayValue: string;
                  if (column.id === 'createdAt' || column.id === 'updatedAt') {
                    displayValue = formatDate(row[column.id]);
                  } else {
                    const value = row[column.id as keyof ResultView];
                    displayValue = typeof value === 'object'
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

      {edit !== null ? <ResultForm
        edit={edit}
        defaultFormId={formId}
        onClose={() => {
          refreshData();
          setEdit(null);
        }}
      /> : null}
    </div>
  );
}
