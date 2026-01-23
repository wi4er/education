import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import ClearIcon from '@mui/icons-material/Clear';
import * as Icons from '@mui/icons-material';
import { ICON_NAMES } from './icons';

const ICONS_PER_PAGE = 48;

const IconComponent = ({ name }: { name: string }) => {
  const Icon = (Icons as Record<string, React.ComponentType>)[name];
  return Icon ? <Icon /> : null;
};

export function IconSelect(
  {
    value,
    onChange,
  }: {
    value: string | null;
    onChange: (value: string | null) => void;
  },
) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filteredIcons = useMemo(() => {
    if (!search) return ICON_NAMES;
    const lower = search.toLowerCase();
    return ICON_NAMES.filter(name => name.toLowerCase().includes(lower));
  }, [search]);

  const pageCount = Math.ceil(filteredIcons.length / ICONS_PER_PAGE);
  const paginatedIcons = useMemo(() => {
    const start = (page - 1) * ICONS_PER_PAGE;
    return filteredIcons.slice(start, start + ICONS_PER_PAGE);
  }, [filteredIcons, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search icons..."
          value={search}
          onChange={handleSearchChange}
          sx={{ flex: 1 }}
        />
        {value && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, bgcolor: 'action.selected', borderRadius: 1 }}>
            <IconComponent name={value} />
            <Typography variant="body2">{value}</Typography>
            <IconButton size="small" onClick={() => onChange(null)}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
        gap: 0.5,
        p: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        minHeight: 200,
      }}>
        {paginatedIcons.map(name => (
          <Tooltip key={name} title={name} placement="top">
            <IconButton
              size="small"
              onClick={() => onChange(name)}
              sx={{
                bgcolor: value === name ? 'primary.main' : 'transparent',
                color: value === name ? 'primary.contrastText' : 'inherit',
                '&:hover': {
                  bgcolor: value === name ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <IconComponent name={name} />
            </IconButton>
          </Tooltip>
        ))}
      </Box>

      {filteredIcons.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          No icons found matching "{search}"
        </Typography>
      )}

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredIcons.length} icons
          </Typography>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, p) => setPage(p)}
            size="small"
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
