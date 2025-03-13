import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './auth/AuthProvider';


import '/src/styles/index.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
