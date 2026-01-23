import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CollectionView } from '../view';
import { apiContext } from '../../../context/ApiProvider';
import { FileList } from '../FileList';
import { getStringValue } from '../../../service/string.service';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItem } = useContext(apiContext);
  const [collection, setCollection] = useState<CollectionView | null>(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (id) {
      getItem<CollectionView>('collection', id)
        .then(data => setCollection(data))
        .catch(() => setCollection(null));
    }
  }, [id]);

  const collectionName = collection ? getStringValue(collection, 'NAME') || collection.id : id;

  return (
    <div>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="back"
          edge="start"
          onClick={() => navigate('/collections')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon/>
        </IconButton>

        <Typography variant="h6" component="div">
          {collectionName}
        </Typography>
      </Toolbar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Files"/>
        </Tabs>
      </Box>

      <Box sx={{ pt: 2 }}>
        {tab === 0 && id && (
          <FileList parentId={id}/>
        )}
      </Box>
    </div>
  );
}
