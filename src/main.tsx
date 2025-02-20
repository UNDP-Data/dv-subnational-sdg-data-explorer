import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const countryDiv = document.querySelector('.sub-sdg');

if (countryDiv && countryDiv.id) {
  const iso3 = countryDiv.id;

  ReactDOM.createRoot(document.getElementById(iso3) as HTMLElement).render(
    <React.StrictMode>
      <App iso3={iso3} />
    </React.StrictMode>,
  );
} else {
  console.error('Error: No country div found.');
}
