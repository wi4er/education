import React, { useMemo } from 'react';
import { StatusView } from '../view';
import { getStringValue, Column } from '../../../service/string.service';
import { getPointValue } from '../../../service/point.service';
import { getStatusColumns } from '../../../service/status.service';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Actions } from '../../common/Actions';
import { StatusHeaderCell, StatusCell } from '../../common/StatusCell';
import { IconComponent } from '../../../widget';

export function StatusTable({
  list,
  columns,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  list: Array<StatusView>;
  columns: readonly Column[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, statusId: string) => void;
}) {
  const statusColumns = useMemo(() => getStatusColumns(list, list), [list]);

  function getActions(row: StatusView) {
    return [
      {
        title: 'Edit',
        icon: <EditIcon fontSize="small"/>,
        onClick: () => onEdit(row.id),
      },
      {
        title: 'Delete',
        icon: <DeleteIcon fontSize="small"/>,
        onClick: () => onDelete(row.id),
      },
      ...list.map(status => ({
        title: getStringValue(status, 'name') || status.id,
        icon: <IconComponent name={status.icon} color={status.color}/>,
        onClick: () => onStatusChange?.(row.id, status.id),
      })),
    ];
  }

  return (
    <TableContainer>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            <TableCell key={'actions'} style={{ width: 12 }}/>
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
                <Actions list={getActions(row)}/>
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
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
