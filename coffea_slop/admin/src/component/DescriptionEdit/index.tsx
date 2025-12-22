import React, { useEffect, useState, useContext } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import { apiContext } from '../../context/ApiProvider';
import { AttributeView, AttributeType, LanguageView } from '../../view';
import Button from '@mui/material/Button';

export interface DescriptionInput {
  attr: string;
  lang?: string;
  value?: string;
}

export interface DescriptionsByAttr {
  [attr: string]: {
    [lang: string]: string[];
  };
}

interface DescriptionEditProps {
  descriptions: DescriptionsByAttr;
  onChange: (descriptions: DescriptionsByAttr) => void;
}

export function DescriptionEdit({descriptions, onChange}: DescriptionEditProps) {
  const {getList} = useContext(apiContext);
  const [attributes, setAttributes] = useState<AttributeView[]>([]);
  const [languages, setLanguages] = useState<LanguageView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getList<AttributeView>('attribute'),
      getList<LanguageView>('language'),
    ])
      .then(([attrs, langs]) => {
        setAttributes(attrs.filter(a => a.type === AttributeType.DESCRIPTION));
        setLanguages(langs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddValue = (attr: string, lang: string) => {
    const updated = {...descriptions};
    if (!updated[attr]) updated[attr] = {};
    if (!updated[attr][lang]) updated[attr][lang] = [];
    updated[attr][lang] = [...updated[attr][lang], ''];
    onChange(updated);
  };

  const handleRemoveValue = (attr: string, lang: string, index: number) => {
    const updated = {...descriptions};
    updated[attr][lang] = updated[attr][lang].filter((_, i) => i !== index);
    if (updated[attr][lang].length === 0) delete updated[attr][lang];
    if (Object.keys(updated[attr]).length === 0) delete updated[attr];
    onChange(updated);
  };

  const handleChangeValue = (attr: string, lang: string, index: number, value: string) => {
    const updated = {...descriptions};
    updated[attr][lang] = updated[attr][lang].map((v, i) => i === index ? value : v);
    onChange(updated);
  };

  if (loading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
        <CircularProgress size={24}/>
      </Box>
    );
  }

  const allLangs = ['', ...languages.map(l => l.id)];

  return (
    <Box sx={{mt: 3}}>
      {attributes.map(attr => (
        <Box key={attr.id} sx={{mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1}}>
          <Box sx={{mb: 1, display: 'flex', alignItems: 'center'}}>
            <Typography variant="subtitle2" sx={{fontWeight: 'semibold'}}>
              {attr.id}
            </Typography>

            <Box sx={{flex: 1}}/>

            {allLangs.map(lang => (
              <Button
                key={lang}
                variant="text"
                size="small"
                startIcon={<AddIcon/>}
                onClick={() => handleAddValue(attr.id, lang)}
              >
                {lang || 'no lang'}
              </Button>
            ))}
          </Box>

          {allLangs.map(lang => {
            const values = descriptions[attr.id]?.[lang] || [];
            if (values.length === 0) return null;

            const langLabel = lang || '(No language)';

            return (
              <Box key={lang} sx={{ml: 2, mb: 1}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
                  <Typography variant="body2" sx={{minWidth: 100, color: 'text.secondary'}}>
                    {langLabel}:
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={() => handleAddValue(attr.id, lang)}
                    title={`Add value for ${attr.id} (${langLabel})`}
                  >
                    <AddIcon fontSize="small"/>
                  </IconButton>
                </Box>

                {values.map((value, index) => (
                  <Box key={index} sx={{display: 'flex', alignItems: 'flex-start', gap: 1, ml: 2, mb: 1}}>
                    <TextField
                      size="small"
                      value={value}
                      onChange={e => handleChangeValue(attr.id, lang, index, e.target.value)}
                      sx={{flex: 1}}
                      placeholder="Description"
                      multiline
                      minRows={3}
                      maxRows={10}
                    />

                    <IconButton
                      size="small"
                      onClick={() => handleRemoveValue(attr.id, lang, index)}
                    >
                      <DeleteIcon fontSize="small"/>
                    </IconButton>
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>
      ))}

      {attributes.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No DESCRIPTION type attributes available.
        </Typography>
      )}
    </Box>
  );
}

export function descriptionsToGrouped(items: Array<{lang: string; attr: string; value: string}>): DescriptionsByAttr {
  const grouped: DescriptionsByAttr = {};
  for (const desc of items || []) {
    const attr = desc.attr;
    const lang = desc.lang || '';
    if (!grouped[attr]) grouped[attr] = {};
    if (!grouped[attr][lang]) grouped[attr][lang] = [];
    grouped[attr][lang].push(desc.value);
  }
  return grouped;
}

export function groupedToDescriptions(grouped: DescriptionsByAttr): DescriptionInput[] {
  const result: DescriptionInput[] = [];
  for (const attr of Object.keys(grouped)) {
    for (const lang of Object.keys(grouped[attr])) {
      for (const value of grouped[attr][lang]) {
        result.push({
          attr,
          lang: lang || undefined,
          value,
        });
      }
    }
  }
  return result;
}
