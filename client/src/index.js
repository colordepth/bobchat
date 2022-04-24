import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import store from './app/store';
import App from './app/App';
import Login from './app/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './stylesheets/index.css';

ReactDOM
  .createRoot(document.getElementById('root'))
  .render(
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<Login/>}/>
          <Route path="*" element={<App/>}/>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
