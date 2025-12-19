import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AttributeView } from '../../model/attribute.view';
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
}

const baseColumns: readonly Column[] = [
  {id: 'id', label: 'ID', minWidth: 170},
  {id: 'type', label: 'Type', minWidth: 100},
];

function getAttrColumns(list: AttributeView[]): Column[] {
  const attrSet = new Set<string>();
  for (const row of list) {
    for (const s of row.attributes?.strings || []) {
      attrSet.add(s.attr);
    }
  }
  return Array.from(attrSet).sort().map(attr => ({
    id: `attr:${attr}`,
    label: attr,
    minWidth: 120,
  }));
}

function getAttrValue(row: AttributeView, attrId: string): string {
  const strings = row.attributes?.strings || [];
  const values = strings
    .filter(s => s.attr === attrId)
    .map(s => `${s.lang}: ${s.value}`);
  return values.join(', ');
}

export function AttributeList() {
  const {getList, deleteItem} = useContext(apiContext);
  const [list, setList] = useState<Array<AttributeView>>([]);
  const [edit, setEdit] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const columns = useMemo(() => [
    ...baseColumns,
    ...getAttrColumns(list),
  ], [list]);

  function refreshData() {
    getList<AttributeView>('attribute')
      .then(data => setList(data))
      .catch(() => setList([]));
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
                        deleteItem(`attribute/${row.id}`)
                          .then(() => refreshData());
                      },
                    }]}/>
                  </TableCell>

                  {columns.map((column) => {
                    let displayValue: string;
                    if (column.id.startsWith('attr:')) {
                      displayValue = getAttrValue(row, column.id.slice(5));
                    } else {
                      const value = row[column.id as keyof AttributeView];
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