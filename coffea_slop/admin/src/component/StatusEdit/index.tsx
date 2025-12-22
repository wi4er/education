import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { apiContext } from '../../context/ApiProvider';
import { StatusView } from '../../view';
import { getStringValue } from '../../service/string.service';
import * as Icons from '@mui/icons-material';

const IconComponent = ({ name, color }: { name: string | null; color?: string | null }) => {
  if (!name) return null;
  const Icon = (Icons as Record<string, React.ComponentType<{ sx?: object }>>)[name];
  return Icon ? <Icon sx={color ? { color } : undefined} /> : null;
};

export function StatusEdit(
  {
    value,
    onChange,
  }: {
    value: string[];
    onChange: (value: string[]) => void;
  },
) {
  const [statuses, setStatuses] = useState<StatusView[]>([]);
  const [loading, setLoading] = useState(true);
  const { getList } = React.useContext(apiContext);

  useEffect(() => {
    getList<StatusView>('status')
      .then(items => {
        setStatuses(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (statusId: string) => {
    if (value.includes(statusId)) {
      onChange(value.filter(id => id !== statusId));
    } else {
      onChange([...value, statusId]);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24}/>
      </Box>
    );
  }

  if (statuses.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No statuses available.
      </Typography>
    );
  }

  return (
    <FormControl component="fieldset">
      <FormGroup>
        {statuses.map(status => (
          <FormControlLabel
            key={status.id}
            control={
              <Checkbox
                checked={value.includes(status.id)}
                onChange={() => handleToggle(status.id)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconComponent name={status.icon} color={status.color} />
                <span>{getStringValue(status, 'label') || status.id}</span>
              </Box>
            }
          />
        ))}
      </FormGroup>
    </FormControl>
  );
}
