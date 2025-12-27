import React from 'react';
import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import * as Icons from '@mui/icons-material';
import { StatusColumn, getStatusValue } from '../../../service/status.service';

const IconComponent = ({ name, color }: { name: string | null; color?: string | null }) => {
  if (!name) return null;
  const Icon = (Icons as Record<string, React.ComponentType<{ sx?: object }>>)[name];
  return Icon ? <Icon sx={color ? { color } : undefined}/> : null;
};

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
    <TableCell key={'status'}>
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
