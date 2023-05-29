import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { user } from "reducers/user";
import { styled } from '@mui/material/styles';

//MUI template imports
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box } from '@mui/material';
import { NavBarResponsive } from './NavbarResponsive';

const CustomizedToolBar = styled(Toolbar)`
  padding-right: 0px;
  padding-left: 0px;

  @media (min-width: 600px) and (max-width: 767px) {
    padding-right: 0px;
    padding-left: 0px;
    max-height: 60px;
  }

`;


export const Header = () => {
  const accessToken = useSelector((store) => store.user.accessToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogOut = () => {
    dispatch(user.actions.signOut());
    if(!accessToken) {
        navigate("/login")
    }
}

  return (
    <Box sx={{ flexGrow: 1 }}>
    <AppBar
      position="static"
      sx={{
        background: '#0c6fba66',
        borderRadius: '6px'
      }}>
      <CustomizedToolBar>
          <Typography
            component="div"
            sx={{
              flexGrow: 1,
              paddingLeft: '16px'
               }}>
              <NavLink
                className="logo"
                to="/">
                SECRETS
              </NavLink>
          </Typography>
        {accessToken ? (
          <Button
            type="button"
            onClick={handleLogOut}
            color="inherit"
            sx={{
              textTransform: 'none',
              fontSize: '24px',
              fontWeight: 500,
              paddingRight: '16px'
            }}>
              Log out
          </Button>
        ) : (
          <NavBarResponsive />
        )}
      </CustomizedToolBar>
    </AppBar>
  </Box>
  )
}
