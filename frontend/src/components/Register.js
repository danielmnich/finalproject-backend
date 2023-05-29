import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { user } from "reducers/user";
import { API_URL } from "utils/urls";


//MUI template imports
import { 
CssBaseline, 
Container, 
Typography, 
Box,  
TextField, 
Button, 
Grid } from '@mui/material';
import { LoaderSmall } from "./LoaderSmall";

export const Register = () => {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const mode = "register"
    const accessToken = useSelector(store => store.user.accessToken);
    useEffect(() => {
        if(accessToken) {
            navigate("/secrets")
        }
    }, [accessToken]);

    const onFormSubmit = (event) => {
        event.preventDefault();
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username: username, password: password})
        }
        fetch(API_URL(mode), options)
          .then(data => data.json())
            .then(data => {
                if(data.success) {
                    console.log(data)
                    dispatch(user.actions.setAccessToken(data.response.accessToken));
                    dispatch(user.actions.setUsername(data.response.username));
                    dispatch(user.actions.setUserId(data.response.id));
                    dispatch(user.actions.setError(null));
                    setLoginError(false);
                } else {
                    dispatch(user.actions.setAccessToken(null));
                    dispatch(user.actions.setUsername(null));
                    dispatch(user.actions.setUserId(null));
                    dispatch(user.actions.setError(data.response))
                    setLoginError(true);
                }
            })
            .finally(() => {
              setTimeout(() => setLoading(false), 2000)
          })
    };

    return(
      <div className="main-container">
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h5" sx={{
              paddingTop: 3,
              marginBottom: 1
            }}>
              Register
            </Typography>
            <Box component="form" noValidate onSubmit={onFormSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                error={loginError}
                helperText={loginError ? mode==='login' ? 'Wrong username' : 'Name Taken' : ''} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)} 
                autoComplete="current-password"
                error={loginError}
                helperText={loginError ? mode === 'login' ? 'Credentials do not match' : '': ''} />
                </Grid>
            <Typography variant="body1" color="red" textTransform={'uppercase'} margin={'5px auto'}> 
            </Typography>
            </Grid>
            {!loading &&
            <Button
              type="signin"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}>
                Submit
            </Button>}
          <Grid container>
          </Grid>
        </Box>
        {loading &&
          <LoaderSmall />
        }
      </Box>
    </Container>
    </div>
  );
};
