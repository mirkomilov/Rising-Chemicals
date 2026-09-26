import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
// Inter loyiha ichidan yuklanadi (tashqi CDN so'rovisiz) — index.css'dagi
// font-family shunda haqiqatan ham qo'llanadi va shrift almashishidan
// kelib chiqadigan "sakrash" bo'lmaydi.
import "@fontsource-variable/inter";
import "./i18n";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
