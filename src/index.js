import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store, persistor } from "./store/redux";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import '../src/css/grid.css'
import '../src/css/login.css'
import '../src/pages/css/public.css'

const container = document.getElementById("root");
const root = createRoot(container);


root.render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
