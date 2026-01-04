import React, { useEffect, useState, useContext } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { apiContext } from '../../../context/ApiProvider';
import { AttributeView } from '../../settings/view';
import { AttributeType } from '../../common/view';
import { FileView } from '../../storage/view';

export interface FileInput {
  attr: string;
  file: string;
}

export interface FilesByAttr {
  [attr: string]: string[];
}

export function FileEdit(
  {
    files,
    onChange,
  }: {
    files: FilesByAttr;
    onChange: (files: FilesByAttr) => void;
  },
) {
  const { getList } = useContext(apiContext);
  const [attributes, setAttributes] = useState<AttributeView[]>([]);
  const [allFiles, setAllFiles] = useState<FileView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getList<AttributeView>('attribute'),
      getList<FileView>('file'),
    ])
      .then(([attrs, fls]) => {
        setAttributes(attrs.filter(a => a.type === AttributeType.FILE));
        setAllFiles(fls);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFilesForAttribute = (): FileView[] => {
    return allFiles;
  };

  const handleAddFile = (attr: string) => {
    const updated = { ...files };
    if (!updated[attr]) updated[attr] = [];
    updated[attr] = [...updated[attr], ''];
    onChange(updated);
  };

  const handleRemoveFile = (attr: string, index: number) => {
    const updated = { ...files };
    updated[attr] = updated[attr].filter((_, i) => i !== index);
    if (updated[attr].length === 0) delete updated[attr];
    onChange(updated);
  };

  const handleChangeFile = (attr: string, index: number, value: string) => {
    const updated = { ...files };
    updated[attr] = updated[attr].map((v, i) => i === index ? value : v);
    onChange(updated);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <CircularProgress size={24}/>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      {attributes.map(attr => {
        const availableFiles = getFilesForAttribute();
        const attrFiles = files[attr.id] || [];

        return (
          <Box key={attr.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'semibold' }}>
                {attr.id}
              </Typography>

              <Box sx={{ flex: 1 }}/>

              <Button
                variant="text"
                size="small"
                startIcon={<AddIcon/>}
                onClick={() => handleAddFile(attr.id)}
                disabled={availableFiles.length === 0}
              >
                Add
              </Button>
            </Box>

            {attrFiles.map((fileId, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, mb: 0.5 }}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <Select
                    value={fileId}
                    onChange={e => handleChangeFile(attr.id, index, e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>(Select file)</em>
                    </MenuItem>
                    {availableFiles.map(f => (
                      <MenuItem key={f.id} value={f.id}>
                        {f.original || f.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <IconButton
                  size="small"
                  onClick={() => handleRemoveFile(attr.id, index)}
                >
                  <DeleteIcon fontSize="small"/>
                </IconButton>
              </Box>
            ))}

            {attrFiles.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                No files assigned.
              </Typography>
            )}

            {availableFiles.length === 0 && (
              <Typography variant="body2" color="warning.main" sx={{ ml: 2 }}>
                No files available.
              </Typography>
            )}
          </Box>
        );
      })}

      {attributes.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No FILE type attributes available.
        </Typography>
      )}
    </Box>
  );
}

export function filesToGrouped(items: Array<{ attr: string; file: string }>): FilesByAttr {
  const grouped: FilesByAttr = {};

  for (const item of items || []) {
    const attr = item.attr;
    if (!grouped[attr]) grouped[attr] = [];
    grouped[attr].push(item.file);
  }

  return grouped;
}

export function groupedToFiles(grouped: FilesByAttr): FileInput[] {
  const result: FileInput[] = [];

  for (const attr of Object.keys(grouped)) {
    for (const file of grouped[attr]) {
      if (file) {
        result.push({ attr, file });
      }
    }
  }

  return result;
}
