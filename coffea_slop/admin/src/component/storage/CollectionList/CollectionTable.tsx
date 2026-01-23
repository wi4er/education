import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { CollectionView } from '../view';
import { StatusView } from '../../settings/view';
import { apiContext, ApiEntity } from '../../../context/ApiProvider';
import { getStringValue, Column } from '../../../service/string.service';
import { getPointValue } from '../../../service/point.service';
import { getStatusColumns } from '../../../service/status.service';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import { Actions } from '../../common/Actions';
import { StatusHeaderCell, StatusCell } from '../../common/StatusCell';
import { IconComponent } from '../../../widget';

export function CollectionTable({
  list,
  columns,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  list: Array<CollectionView>;
  columns: readonly Column[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, statusId: string) => void;
}) {
  const navigate = useNavigate();
  const { getList } = useContext(apiContext);
  const [statuses, setStatuses] = useState<Array<StatusView>>([]);

  const statusColumns = useMemo(() => getStatusColumns(list, statuses), [list, statuses]);

  useEffect(() => {
    getList<StatusView>(ApiEntity.STATUS)
      .then(({ data }) => setStatuses(data))
      .catch(() => setStatuses([]));
  }, []);

  function getActions(row: CollectionView) {
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
      ...statuses.map(status => ({
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
                <Actions list={getActions(row)}/>
              </TableCell>

              <TableCell key={'view'}>
                <Tooltip title="View" arrow>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/collections/${row.id}`)}
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
                  const value = row[column.id as keyof CollectionView];
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
