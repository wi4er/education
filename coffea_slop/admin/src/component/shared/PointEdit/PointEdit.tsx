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
import { apiContext, ApiEntity } from '../../../context/ApiProvider';
import { AttributeView } from '../../settings/view';
import { AttributeType } from '../../common/view';
import { PointView } from '../../registry/view';

export interface PointInput {
  attr: string;
  pnt: string;
}

export interface PointsByAttr {
  [attr: string]: string[];
}

export function PointEdit(
  {
    points,
    onChange,
  }: {
    points: PointsByAttr;
    onChange: (points: PointsByAttr) => void;
  },
) {
  const { getList } = useContext(apiContext);
  const [attributes, setAttributes] = useState<AttributeView[]>([]);
  const [allPoints, setAllPoints] = useState<PointView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getList<AttributeView>(ApiEntity.ATTRIBUTE),
      getList<PointView>(ApiEntity.POINT),
    ])
      .then(([attrsRes, ptsRes]) => {
        setAttributes(attrsRes.data.filter(a => a.type === AttributeType.POINT));
        setAllPoints(ptsRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPointsForAttribute = (attr: AttributeView): PointView[] => {
    if (!attr.asPoint) return allPoints;
    return allPoints.filter(p => p.directoryId === attr.asPoint);
  };

  const handleAddPoint = (attr: string) => {
    const updated = { ...points };
    if (!updated[attr]) updated[attr] = [];
    updated[attr] = [...updated[attr], ''];
    onChange(updated);
  };

  const handleRemovePoint = (attr: string, index: number) => {
    const updated = { ...points };
    updated[attr] = updated[attr].filter((_, i) => i !== index);
    if (updated[attr].length === 0) delete updated[attr];
    onChange(updated);
  };

  const handleChangePoint = (attr: string, index: number, value: string) => {
    const updated = { ...points };
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
        const availablePoints = getPointsForAttribute(attr);
        const attrPoints = points[attr.id] || [];

        return (
          <Box key={attr.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'semibold' }}>
                {attr.id}
              </Typography>

              {attr.asPoint && (
                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                  (from {attr.asPoint})
                </Typography>
              )}

              <Box sx={{ flex: 1 }}/>

              <Button
                variant="text"
                size="small"
                startIcon={<AddIcon/>}
                onClick={() => handleAddPoint(attr.id)}
                disabled={availablePoints.length === 0}
              >
                Add
              </Button>
            </Box>

            {attrPoints.map((pointId, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, mb: 0.5 }}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <Select
                    value={pointId}
                    onChange={e => handleChangePoint(attr.id, index, e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>(Select point)</em>
                    </MenuItem>
                    {availablePoints.map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <IconButton
                  size="small"
                  onClick={() => handleRemovePoint(attr.id, index)}
                >
                  <DeleteIcon fontSize="small"/>
                </IconButton>
              </Box>
            ))}

            {attrPoints.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                No points assigned.
              </Typography>
            )}

            {availablePoints.length === 0 && (
              <Typography variant="body2" color="warning.main" sx={{ ml: 2 }}>
                No points available{attr.asPoint ? ` in directory "${attr.asPoint}"` : ''}.
              </Typography>
            )}
          </Box>
        );
      })}

      {attributes.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No POINT type attributes available.
        </Typography>
      )}
    </Box>
  );
}

export function pointsToGrouped(items: Array<{ attr: string; pnt: string }>): PointsByAttr {
  const grouped: PointsByAttr = {};

  for (const item of items || []) {
    const attr = item.attr;
    if (!grouped[attr]) grouped[attr] = [];
    grouped[attr].push(item.pnt);
  }

  return grouped;
}

export function groupedToPoints(grouped: PointsByAttr): PointInput[] {
  const result: PointInput[] = [];

  for (const attr of Object.keys(grouped)) {
    for (const pnt of grouped[attr]) {
      if (pnt) {
        result.push({ attr, pnt });
      }
    }
  }

  return result;
}
