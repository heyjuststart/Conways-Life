import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { createMuiTheme } from '@material-ui/core';

// Custom theme properties here
const theme = createMuiTheme({});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  document.getElementById('root')
);
