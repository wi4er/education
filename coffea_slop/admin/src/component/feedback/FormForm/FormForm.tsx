import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useEffect, useState } from 'react';
import { apiContext } from '../../../context/ApiProvider';
import Dialog from '@mui/material/Dialog';
import { FormView } from '../view';
import Snackbar from '@mui/material/Snackbar';
import { StringEdit, StringsByAttr, stringsToGrouped, groupedToStrings } from '../../shared/StringEdit';
import { PointEdit, PointsByAttr, pointsToGrouped, groupedToPoints } from '../../shared/PointEdit';
import { DescriptionEdit, DescriptionsByAttr, descriptionsToGrouped, groupedToDescriptions } from '../../shared/DescriptionEdit';
import { FileEdit, FilesByAttr, filesToGrouped, groupedToFiles } from '../../shared/FileEdit';
import { StatusEdit } from '../../shared/StatusEdit';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export function FormForm(
  {
    onClose,
    edit,
  }: {
    onClose: () => void;
    edit: string | null;
  },
) {
  const [id, setId] = useState('');
  const [status, setStatus] = useState<string[]>([]);
  const [strings, setStrings] = useState<StringsByAttr>({});
  const [points, setPoints] = useState<PointsByAttr>({});
  const [descriptions, setDescriptions] = useState<DescriptionsByAttr>({});
  const [files, setFiles] = useState<FilesByAttr>({});
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const { postItem, putItem, getItem } = React.useContext(apiContext);

  useEffect(() => {
    if (edit) {
      getItem<FormView>(`form/${edit}`)
        .then(data => {
          setId(data.id);
          setStatus(data?.status || []);
          setStrings(stringsToGrouped(data.attributes?.strings || []));
          setPoints(pointsToGrouped(data.attributes?.points || []));
          setDescriptions(descriptionsToGrouped(data.attributes?.descriptions || []));
          setFiles(filesToGrouped(data.attributes?.files || []));
        })
        .catch(err => setError(err?.message || 'Failed to load'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edit]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      id: edit ? undefined : id,
      status: status.length > 0 ? status : undefined,
      strings: groupedToStrings(strings),
      points: groupedToPoints(points),
      descriptions: groupedToDescriptions(descriptions),
      files: groupedToFiles(files),
    };

    if (edit) {
      putItem<FormView>(`form/${edit}`, payload)
        .then(() => onClose())
        .catch(err => setError(err?.message || 'Failed to save'));
    } else {
      postItem<FormView>('form', { ...payload, id })
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
      <DialogTitle>{edit ? `Edit Form ${id}` : 'Create Form'}</DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit} id="form-form">
          {!edit && (
            <TextField
              autoFocus
              margin="dense"
              name="id"
              label="ID (optional)"
              fullWidth
              value={id}
              variant="standard"
              onChange={event => setId(event.target.value)}
            />
          )}

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Status"/>
              <Tab label="Strings"/>
              <Tab label="Descriptions"/>
              <Tab label="Points"/>
              <Tab label="Files"/>
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
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="form-form">
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
