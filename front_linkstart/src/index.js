import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, GlobalStyles } from "@mui/material";
import theme from "./theme";
import './fonts.css';

const globalStyles = (
    <GlobalStyles styles={{
        body: {
            margin: 0,
            padding: 0,
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
        },
    }} />
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    {globalStyles}
    <CssBaseline />
    <App />
  </ThemeProvider>
);
