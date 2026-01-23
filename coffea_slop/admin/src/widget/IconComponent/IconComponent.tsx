import React from 'react';
import * as Icons from '@mui/icons-material';

export function IconComponent({ name, color }: { name: string | null; color?: string | null }) {
  if (!name) return null;
  const Icon = (Icons as Record<string, React.ComponentType<{ sx?: object }>>)[name];
  return Icon ? <Icon sx={color ? { color } : undefined}/> : null;
}
