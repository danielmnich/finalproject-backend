import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FrontPage } from './components/FrontPage';
import { LogIn } from './components/LogIn';
import { Register } from './components/Register'
import { Secrets } from './components/Secrets'
import { Header } from './components/Header'
import { user } from 'reducers/user';
import { secrets } from 'reducers/secrets';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';



export const App = () => {

  const reducer = combineReducers({
    user: user.reducer,
    secrets: secrets.reducer
  });

  const store = configureStore({reducer})

  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="main-wrapper">
          <Header />
          <Routes>
            <Route path='/login' element={<LogIn/>}></Route>
            <Route path='/register' element={<Register/>}></Route>
            <Route path='/' element={<FrontPage/>}></Route>
            <Route path='/secrets' element={<Secrets/>}></Route>
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
}
