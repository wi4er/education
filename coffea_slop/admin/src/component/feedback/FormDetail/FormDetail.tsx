import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FormView } from '../view';
import { apiContext } from '../../../context/ApiProvider';
import { ResultList } from '../ResultList';
import { getStringValue } from '../../../service/string.service';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export function FormDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItem } = useContext(apiContext);
  const [form, setForm] = useState<FormView | null>(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (id) {
      getItem<FormView>(`form/${id}`)
        .then(data => setForm(data))
        .catch(() => setForm(null));
    }
  }, [id]);

  const formName = form ? getStringValue(form, 'NAME') || form.id : id;

  return (
    <div>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="back"
          edge="start"
          onClick={() => navigate('/forms')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon/>
        </IconButton>

        <Typography variant="h6" component="div">
          {formName}
        </Typography>
      </Toolbar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Results"/>
        </Tabs>
      </Box>

      <Box sx={{ pt: 2 }}>
        {tab === 0 && id && (
          <ResultList formId={id}/>
        )}
      </Box>
    </div>
  );
}
