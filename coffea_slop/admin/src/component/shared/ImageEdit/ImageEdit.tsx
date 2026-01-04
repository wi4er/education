import React, { useEffect, useState, useContext, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import UploadIcon from '@mui/icons-material/Upload';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { apiContext } from '../../../context/ApiProvider';
import { CollectionView } from '../../storage/view';
import { FileView } from '../../storage/view';

export function ImageEdit(
  {
    images,
    onChange,
  }: {
    images: string[];
    onChange: (images: string[]) => void;
  },
) {
  const { getList } = useContext(apiContext);
  const [collections, setCollections] = useState<CollectionView[]>([]);
  const [filesByCollection, setFilesByCollection] = useState<Record<string, FileView[]>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    Promise.all([
      getList<CollectionView>('collection'),
      getList<FileView>('file'),
    ])
      .then(([cols, files]) => {
        setCollections(cols);
        const grouped: Record<string, FileView[]> = {};
        for (const file of files) {
          if (!grouped[file.parentId]) grouped[file.parentId] = [];
          grouped[file.parentId].push(file);
        }
        setFilesByCollection(grouped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleImage = (fileId: string) => {
    if (images.includes(fileId)) {
      onChange(images.filter(id => id !== fileId));
    } else {
      onChange([...images, fileId]);
    }
  };

  const handleRemoveImage = (fileId: string) => {
    onChange(images.filter(id => id !== fileId));
  };

  const handleUploadClick = (collectionId: string) => {
    fileInputRefs.current[collectionId]?.click();
  };

  const handleFileChange = async (collectionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(collectionId);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/upload/${collectionId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const uploaded: FileView = await response.json();

      setFilesByCollection(prev => ({
        ...prev,
        [collectionId]: [...(prev[collectionId] || []), uploaded],
      }));

      onChange([...images, uploaded.id]);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(null);
      event.target.value = '';
    }
  };

  const getCollectionName = (collection: CollectionView): string => {
    const nameAttr = collection.attributes?.strings?.find(s => s.attr === 'NAME');
    return nameAttr?.value || collection.id;
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
      {images.length > 0 && (
        <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'semibold' }}>
            Selected Images ({images.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {images.map(imageId => {
              const file = Object.values(filesByCollection)
                .flat()
                .find(f => f.id === imageId);
              return (
                <Chip
                  key={imageId}
                  label={file?.original || imageId}
                  onDelete={() => handleRemoveImage(imageId)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              );
            })}
          </Box>
        </Box>
      )}

      {collections.map(collection => {
        const files = filesByCollection[collection.id] || [];
        const isUploading = uploading === collection.id;

        return (
          <Box key={collection.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'semibold' }}>
                {getCollectionName(collection)}
              </Typography>

              <Box sx={{ flex: 1 }}/>

              <input
                type="file"
                hidden
                ref={el => { fileInputRefs.current[collection.id] = el; }}
                onChange={e => handleFileChange(collection.id, e)}
                accept="image/*"
              />

              <Button
                variant="text"
                size="small"
                startIcon={isUploading ? <CircularProgress size={16}/> : <UploadIcon/>}
                onClick={() => handleUploadClick(collection.id)}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </Box>

            {files.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 2 }}>
                {files.map(file => {
                  const isSelected = images.includes(file.id);
                  return (
                    <Chip
                      key={file.id}
                      label={file.original || file.id}
                      onClick={() => handleToggleImage(file.id)}
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      size="small"
                      sx={{ cursor: 'pointer' }}
                    />
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                No files in this collection.
              </Typography>
            )}
          </Box>
        );
      })}

      {collections.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No collections available. Create a collection first.
        </Typography>
      )}
    </Box>
  );
}
