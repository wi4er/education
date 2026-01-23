import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, {useEffect, useState} from 'react';
import {apiContext} from '../../../context/ApiProvider';
import Dialog from '@mui/material/Dialog';
import {ElementView} from '../view';
import Snackbar from '@mui/material/Snackbar';
import {StringEdit, StringsByAttr, stringsToGrouped, groupedToStrings} from '../../shared/StringEdit';
import {PointEdit, PointsByAttr, pointsToGrouped, groupedToPoints} from '../../shared/PointEdit';
import {
  DescriptionEdit,
  DescriptionsByAttr,
  descriptionsToGrouped,
  groupedToDescriptions,
} from '../../shared/DescriptionEdit';
import {FileEdit, FilesByAttr, filesToGrouped, groupedToFiles} from '../../shared/FileEdit';
import {ImageEdit} from '../../shared/ImageEdit';
import {StatusEdit} from '../../shared/StatusEdit';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import {Container} from '@mui/material';

export function ElementForm(
  {
    onClose,
    edit,
    defaultParentId,
  }: {
    onClose: () => void;
    edit: string | null;
    defaultParentId?: string;
  },
) {
  const [id, setId] = useState('');
  const [parentId, setParentId] = useState(defaultParentId || '');
  const [status, setStatus] = useState<string[]>([]);
  const [strings, setStrings] = useState<StringsByAttr>({});
  const [points, setPoints] = useState<PointsByAttr>({});
  const [descriptions, setDescriptions] = useState<DescriptionsByAttr>({});
  const [files, setFiles] = useState<FilesByAttr>({});
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const { postItem, putItem, getItem } = React.useContext(apiContext);

  useEffect(() => {
    if (edit) {
      getItem<ElementView>(`element/${edit}`)
        .then(data => {
          setId(data.id);
          setParentId(data.parentId || '');
          setStatus(data?.status || []);
          setStrings(stringsToGrouped(data.attributes?.strings || []));
          setPoints(pointsToGrouped(data.attributes?.points || []));
          setDescriptions(descriptionsToGrouped(data.attributes?.descriptions || []));
          setFiles(filesToGrouped(data.attributes?.files || []));
          setImages(data?.images || []);
        })
        .catch(err => setError(err?.message || 'Failed to load'));
    }
  }, [edit]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      id: edit ? undefined : id || undefined,
      parentId: parentId || undefined,
      status: status.length > 0 ? status : undefined,
      strings: groupedToStrings(strings),
      points: groupedToPoints(points),
      descriptions: groupedToDescriptions(descriptions),
      files: groupedToFiles(files),
      images: images.length > 0 ? images : undefined,
    };

    if (edit) {
      putItem<ElementView>(`element/${edit}`, payload)
        .then(() => onClose())
        .catch(err => setError(err?.message || 'Failed to save'));
    } else {
      postItem<ElementView>('element', { ...payload, id: id || undefined })
        .then(() => onClose())
        .catch(err => setError(err?.message || 'Failed to create'));
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{edit ? `Edit Element ${id}` : 'Create Element'}</DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit} id="element-form">
          <Box style={{display: 'flex', gap: 12}}>
            <TextField
              autoFocus
              margin="dense"
              name="id"
              label="ID (optional)"
              fullWidth
              value={id}
              variant="standard"
              disabled={!!edit}
              onChange={event => setId(event.target.value)}
            />

            <TextField
              margin="dense"
              label="Block"
              fullWidth
              value={parentId}
              variant="standard"
              disabled
            />
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Status"/>
              <Tab label="Strings"/>
              <Tab label="Descriptions"/>
              <Tab label="Points"/>
              <Tab label="Files"/>
              <Tab label="Images"/>
            </Tabs>
          </Box>

          {tab === 0 && (
            <StatusEdit value={status} onChange={setStatus}/>
          )}

          {tab === 1 && (
            <StringEdit strings={strings} onChange={setStrings}/>
          )}

          {tab === 2 && (
            <DescriptionEdit descriptions={descriptions} onChange={setDescriptions}/>
          )}

          {tab === 3 && (
            <PointEdit points={points} onChange={setPoints}/>
          )}

          {tab === 4 && (
            <FileEdit files={files} onChange={setFiles}/>
          )}

          {tab === 5 && (
            <ImageEdit images={images} onChange={setImages}/>
          )}
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="element-form">
          SAVE
        </Button>
      </DialogActions>

      {error ? <Snackbar
        open={!!error}
        autoHideDuration={6000}
        message={error}
        onClose={() => setError('')}
      /> : null}
    </Dialog>
  );
}
