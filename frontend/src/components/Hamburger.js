import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';

//MUI template imports
import { 
  IconButton,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  Stack } from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';


export const Hamburger = () => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

 const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

    const prevOpen = useRef(open);

    useEffect(() => {
      if (prevOpen.current === true && open === false) {
        anchorRef.current.focus();
      }
  
      prevOpen.current = open;
    }, [open]);


  return (
    <Stack
      direction="row"
      spacing={2}>
      <div>
        <IconButton
          ref={anchorRef}
          id="composition-button"
          aria-controls={open ? 'composition-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          size="large"
          edge="start"
          color="inherit"
          aria-label="open drawer"
          sx={{ 
            mr: 3, 
            margin: 0,
            padding: '16px 16px 16px 0'
          }}
        >
          <MenuIcon
            sx={{ fontSize: '2rem'}}
          />
        </IconButton>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          placement="bottom-start"
          transition
          disablePortal
          sx={{ zIndex: '1'}}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom-start' ? 'left top' : 'left bottom',
              }}
            >
              <Paper sx={{ background: '#0c6fba66'}}>
                <ClickAwayListener
                 onClickAway={handleClose}
                 >
                  <MenuList
                    autoFocusItem={open}
                    id="composition-menu"
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                  >
                    <MenuItem
                      sx={{ 
                        padding: '15px 33px'
                      }}>
                      <NavLink
                        className="nav-link"
                        to="/register">
                          Sign up
                      </NavLink>
                    </MenuItem>
                    <MenuItem
                      sx={{ 
                        padding: '15px 33px 20px 33px'
                      }}>
                    <NavLink
                        className="nav-link"
                        to="/login">
                          Log in
                      </NavLink>
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </Stack>
  )
}
