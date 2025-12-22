import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import ClearIcon from '@mui/icons-material/Clear';

const PRESET_COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
  '#795548', '#9E9E9E', '#607D8B', '#000000',
];

export function ColorPicker(
  {
    value,
    onChange,
  }: {
    value: string | null;
    onChange: (value: string | null) => void;
  },
) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorSelect = (color: string) => {
    onChange(color);
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        onClick={handleClick}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: value || 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        {!value && (
          <Box sx={{ color: 'text.disabled', fontSize: 12 }}>None</Box>
        )}
      </Box>

      <TextField
        size="small"
        placeholder="#000000"
        value={value || ''}
        onChange={e => {
          const val = e.target.value;
          if (val === '' || /^#[0-9A-Fa-f]{0,6}$/.test(val)) {
            onChange(val || null);
          }
        }}
        sx={{ width: 100 }}
      />

      {value && (
        <IconButton size="small" onClick={() => onChange(null)}>
          <ClearIcon fontSize="small" />
        </IconButton>
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 0.5,
          p: 1,
        }}>
          {PRESET_COLORS.map(color => (
            <Box
              key={color}
              onClick={() => handleColorSelect(color)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                backgroundColor: color,
                cursor: 'pointer',
                border: value === color ? '2px solid' : '1px solid',
                borderColor: value === color ? 'primary.main' : 'divider',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            />
          ))}
        </Box>
      </Popover>
    </Box>
  );
}
