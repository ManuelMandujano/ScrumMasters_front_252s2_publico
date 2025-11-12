import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/styles/index.css';
import Routing from './Routing.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ActiveMatchProvider } from './context/ActiveMatchContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ActiveMatchProvider>
      <AuthProvider>
        <Routing />
      </AuthProvider>
    </ActiveMatchProvider>
  </StrictMode>
);
