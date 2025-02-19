import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const countryDiv = document.querySelector('.sub-sdg');

if (countryDiv && countryDiv.id) {
  const iso = countryDiv.id;

  ReactDOM.createRoot(document.getElementById(iso) as HTMLElement).render(
    <React.StrictMode>
      <App iso={iso} />
    </React.StrictMode>,
  );
} else {
  console.error('Error: No country div found.');
}
