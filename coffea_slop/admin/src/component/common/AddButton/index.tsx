import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';

export function AddButton(
  {
    title,
    onClick,
  }: {
    title: string;
    onClick: () => void;
  },
) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
      <Tooltip title={title} arrow>
        <IconButton
          onClick={onClick}
          sx={{
            width: 80,
            height: 80,
            border: '2px dashed',
            borderColor: 'grey.400',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
          }}
        >
          <AddIcon sx={{ fontSize: 40 }}/>
        </IconButton>
      </Tooltip>
    </Box>
  );
}
