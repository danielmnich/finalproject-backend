import React from 'react';
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import keyicon from '../assets/icons8-password-key-90.png'

export const FrontPage = () => {
    const navigate = useNavigate();

    const onClickGoToSignIn = () => {
        navigate('/login');
      }

    return (
    <div className="main-container frontpage">
        <h2>The perfect place to store your deepest and darkest secrets</h2>
        <img src={keyicon} alt="key" className="key-icon" />
        <Button type="submit"
            onClick={onClickGoToSignIn}
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, maxWidth: 400 }}
            >
            LOG IN
        </Button>
    </div>
    
    )
}
