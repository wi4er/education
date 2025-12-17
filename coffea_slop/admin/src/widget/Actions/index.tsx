import React from 'react';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export interface ActionsItem {

  title: string;
  onClick: () => void;

}

export function Actions(
  {
    list = [],
  }: {
    list?: Array<ActionsItem>;
  },
) {
    const node = React.useRef(null);
    const [open, setOpen] = React.useState(false);

    return (
      <>
        <IconButton
          aria-label="expand row"
          size="small"
          ref={node}
          onClick={() => setOpen(true)}
        >
          <MenuIcon/>
        </IconButton>

        <Menu
          id="basic-menu"
          anchorEl={node.current}
          open={open}
          onClose={() => setOpen(false)}
        >
          {list.map(item => (
            <MenuItem
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              key={item.title}
            >{item.title}</MenuItem>
          ))}
        </Menu>
      </>
    );
}