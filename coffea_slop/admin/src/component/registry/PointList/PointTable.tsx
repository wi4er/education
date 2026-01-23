import React, { useContext, useEffect, useMemo, useState } from 'react';
import { PointView } from '../view';
import { StatusView } from '../../settings/view';
import { apiContext, ApiEntity } from '../../../context/ApiProvider';
import { getStringValue, Column } from '../../../service/string.service';
import { getPointValue } from '../../../service/point.service';
import { getStatusColumns } from '../../../service/status.service';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Actions } from '../../common/Actions';
import { StatusHeaderCell, StatusCell } from '../../common/StatusCell';

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

export function PointTable({
  list,
  columns,
  onEdit,
  onDelete,
}: {
  list: Array<PointView>;
  columns: readonly Column[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { getList } = useContext(apiContext);
  const [statuses, setStatuses] = useState<Array<StatusView>>([]);

  const statusColumns = useMemo(() => getStatusColumns(list, statuses), [list, statuses]);

  useEffect(() => {
    getList<StatusView>(ApiEntity.STATUS)
      .then(({ data }) => setStatuses(data))
      .catch(() => setStatuses([]));
  }, []);

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

              <StatusCell statusColumns={statusColumns} row={row}/>

              {columns.map(column => {
                let displayValue: string;
                if (column.id.startsWith('str:')) {
                  displayValue = getStringValue(row, column.id.slice(4));
                } else if (column.id.startsWith('pnt:')) {
                  displayValue = getPointValue(row, column.id.slice(4));
                } else if (column.id === 'createdAt' || column.id === 'updatedAt') {
                  displayValue = formatDate(row[column.id]);
                } else {
                  const value = row[column.id as keyof PointView];
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
