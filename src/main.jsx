import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';

customElements.define('jeep-sqlite', JeepSqlite);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)