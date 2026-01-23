import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { BlockView } from '../view';
import { apiContext } from '../../../context/ApiProvider';
import { ElementList } from '../ElementList';
import { SectionList } from '../SectionList';
import { getStringValue } from '../../../service/string.service';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export function BlockDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItem } = useContext(apiContext);
  const [block, setBlock] = useState<BlockView | null>(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (id) {
      getItem<BlockView>('block', id)
        .then(data => setBlock(data))
        .catch(() => setBlock(null));
    }
  }, [id]);

  const blockName = block ? getStringValue(block, 'NAME') || block.id : id;

  return (
    <div>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="back"
          edge="start"
          onClick={() => navigate('/blocks')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon/>
        </IconButton>

        <Typography variant="h6" component="div">
          {blockName}
        </Typography>
      </Toolbar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Elements"/>
          <Tab label="Sections"/>
        </Tabs>
      </Box>

      <Box sx={{ pt: 2 }}>
        {tab === 0 && id && (
          <ElementList parentId={id}/>
        )}

        {tab === 1 && id && (
          <SectionList parentId={id}/>
        )}
      </Box>
    </div>
  );
}
