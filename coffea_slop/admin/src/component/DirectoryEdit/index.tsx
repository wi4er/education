import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { apiContext } from '../../context/ApiProvider';

interface DirectoryView {
  id: string;
}

export function DirectoryEdit(
  {
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  },
) {
  const [directories, setDirectories] = useState<DirectoryView[]>([]);
  const [loading, setLoading] = useState(true);
  const {getList} = React.useContext(apiContext);

  useEffect(() => {
    getList<DirectoryView>('directory')
      .then(dirs => {
        setDirectories(dirs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', py: 3}}>
        <CircularProgress size={24}/>
      </Box>
    );
  }

  if (directories.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{py: 2}}>
        No directories available.
      </Typography>
    );
  }

  return (
    <FormControl>
      <RadioGroup
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <FormControlLabel
          value=""
          control={<Radio/>}
          label="(None)"
        />
        {directories.map(dir => (
          <FormControlLabel
            key={dir.id}
            value={dir.id}
            control={<Radio/>}
            label={dir.id}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
