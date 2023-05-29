import React from 'react';
import { useMediaQuery } from 'react-responsive'
import { NavLink } from 'react-router-dom';

//MUI template imports
import { 
  Button } from '@mui/material';
import { Hamburger } from './Hamburger'


export const NavBarResponsive = () => {
  const isMobile = useMediaQuery({ query: '(max-width: 767px)'})
  return (
    <>
      {isMobile ? (
        <Hamburger />
      ) : (
        <>
          <Button
            color="inherit"
            sx={{ textTransform: 'none' }}>
            <NavLink
              className="nav-link"
              to="/register">
                Sign up
            </NavLink>
          </Button>
          <Button color="inherit" sx={{ textTransform: 'none' }}>
            <NavLink
              className="nav-link"
              to="/login">
              Log in
            </NavLink>
          </Button>
        </>
      )}
    </>
  )
}
