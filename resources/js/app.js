import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

const el = document.getElementById('app');

if (el) {
    createRoot(el).render(React.createElement(App));
}
