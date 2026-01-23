import React from 'react';
import { ResultView } from '../view';
import { Column } from '../../../service/string.service';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Actions } from '../../common/Actions';

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

export function ResultTable({
  list,
  columns,
  onEdit,
  onDelete,
}: {
  list: Array<ResultView>;
  columns: readonly Column[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
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
                  onClick: () => onEdit(row.id),
                }, {
                  title: 'Delete',
                  icon: <DeleteIcon fontSize="small"/>,
                  onClick: () => onDelete(row.id),
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
  );
}
