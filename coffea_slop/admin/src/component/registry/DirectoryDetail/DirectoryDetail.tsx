import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { DirectoryView } from '../view';
import { apiContext } from '../../../context/ApiProvider';
import { PointList } from '../PointList';
import { getStringValue } from '../../../service/string.service';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export function DirectoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItem } = useContext(apiContext);
  const [directory, setDirectory] = useState<DirectoryView | null>(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (id) {
      getItem<DirectoryView>('directory', id)
        .then(data => setDirectory(data))
        .catch(() => setDirectory(null));
    }
  }, [id]);

  const directoryName = directory ? getStringValue(directory, 'NAME') || directory.id : id;

  return (
    <div>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="back"
          edge="start"
          onClick={() => navigate('/directories')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon/>
        </IconButton>

        <Typography variant="h6" component="div">
          {directoryName}
        </Typography>
      </Toolbar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Points"/>
        </Tabs>
      </Box>

      <Box sx={{ pt: 2 }}>
        {tab === 0 && id && (
          <PointList directoryId={id}/>
        )}
      </Box>
    </div>
  );
}
