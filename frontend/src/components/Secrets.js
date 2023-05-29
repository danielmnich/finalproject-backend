import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { secrets } from "reducers/secrets";
import { API_URL } from "utils/urls";
import { Button, TextField, Typography, IconButton } from '@mui/material';
import { Clear } from '@mui/icons-material';
import { EmptyState } from "./EmptyState"
import { Loader } from './Loader'

export const Secrets = () => {
    const [message, setMessage] = useState("");
    const [Loading, setLoading] = useState(false);
    const secretItems = useSelector((store)  => store.secrets.items);
    const accessToken = useSelector((store) => store.user.accessToken);
    const username = useSelector((store) => store.user.username);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if(!accessToken) {
            navigate("/login")
        }
    }, [accessToken]);

    useEffect(() => {
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": accessToken
            }
        }
        fetch(API_URL("secrets"), options)
            .then(data => data.json())
            .then(data => {
                if(data.success) {
                    console.log('data:', data)
                    console.log('secretItems', secretItems)
                    dispatch(secrets.actions.setError(null));
                    dispatch(secrets.actions.setItems(data.response));
                } else {
                    dispatch(secrets.actions.setError(response));
                    dispatch(secrets.actions.setItems([]));
                }
            })
            .catch((error) => console.log(error))
            .finally(() => {
                setTimeout(() => setLoading(false), 2000)
            })
    }, []);

    const handleSubmit = async () => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": accessToken
            },
            body: JSON.stringify({ message })
        };

        try {
            const response = await fetch(API_URL("secrets"), options);
            const data = await response.json();

            if (data.success) {
                // Update secretItems with the new secret
                const updatedSecretItems = [...secretItems, data.response];
                dispatch(secrets.actions.setError(null));
                dispatch(secrets.actions.setItems(updatedSecretItems));
            } else {
                dispatch(secrets.actions.setError(data.response));
            }
        } catch (error) {
            console.log("Error:", error);
        }
        setTimeout(() => setLoading(false), 2000)
    };

    const onSecretDelete = (index) => {
        dispatch(secrets.actions.deleteItem(index));
    };

    return (
        <div className="main secrets">
            <div className="secret-wrapper">
                <div className="secret-form">
                    <Typography
                        variant="overline"
                        sx={{
                            fontSize: '2em',
                            lineHeight: 1.5,
                            fontWeight:500,
                            color: '#2d2d2d',
                            margin: 0,
                            textAlign: 'center'
                        }} 
                        gutterBottom
                    >
                        Hello {username}
                    </Typography>
                    <TextField
                        id="outlined-multiline-static"
                        label="Write you secret here..."
                        multiline
                        rows={2}
                        defaultValue="Default Value"
                        margin="normal"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            width: '180px',
                            alignSelf: 'center',
                            background: '#d3acff',
                            fontWeight: 700
                        }} size="large"
                    >
                        Post Secret
                    </Button>
                </div>
                {Loading 
                ? (
                    <div className="secret-posts loading">
                        <Loader />
                    </div>             
                ) : (
                    <div
                        className="secret-posts"
                        style={secretItems.length === 0
                            ? {
                                padding: '0 20px'
                            } : {
                                padding: '20px' 
                            }}
                        >
                    {secretItems.length > 0 
                        && secretItems.map((item, secretIndex) => {
                            return (
                            <div
                                className="post"
                                key={secretIndex}
                                style={secretIndex % 2 === 0
                                ? {
                                    alignSelf: "flex-start"
                                } : {
                                    alignSelf: "flex-end" 
                                }}
                            >
                                <p>{item.message}</p>
                                <IconButton
                                    onClick={() => onSecretDelete(secretIndex)}>
                                    <Clear
                                        sx={{
                                            fontSize: '16px',
                                            color: 'black'
                                        }}
                                    />
                                </IconButton>
                            </div>
                            );
                            })}
                        {secretItems.length === 0
                        && (
                            <EmptyState />
                        )}
                    </div>
                ) }

            </div>
        </div>
    )
}
