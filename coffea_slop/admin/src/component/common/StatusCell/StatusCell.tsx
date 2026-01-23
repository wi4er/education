import React from 'react';
import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import { IconComponent } from '../../../widget';
import { StatusColumn, getStatusValue } from '../../../service/status.service';

interface WithStatus {
  status?: string[];
}

export function StatusHeaderCell(
  {
    statusColumns,
  }: {
    statusColumns: StatusColumn[];
  },
) {
  if (statusColumns.length === 0) return null;

  return <TableCell key={'status'}/>;
}

export function StatusCell<T extends WithStatus>(
  {
    statusColumns,
    row,
  }: {
    statusColumns: StatusColumn[];
    row: T;
  },
) {
  if (statusColumns.length === 0) return null;

  return (
    <TableCell key={'status'} sx={{width: '1%'}}>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {statusColumns.filter(sc => getStatusValue(row, sc.id.slice(4))).map(sc => (
          <Tooltip key={sc.id} title={sc.id.slice(4)} arrow>
            <Box component="span">
              {sc.icon
                ? <IconComponent name={sc.icon} color={sc.color}/>
                : <Box component="span" sx={sc.color ? { color: sc.color } : undefined}>✓</Box>
              }
            </Box>
          </Tooltip>
        ))}
      </Box>
    </TableCell>
  );
}
