import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoadingProvider } from './context/LoadingContext';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "598862793311-694upm2m7o2npmuit59mo2uq7ffub4s0.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
