import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Theme>
      <App />
    </Theme>
  </React.StrictMode>,
);
