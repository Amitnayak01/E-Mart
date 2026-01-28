import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";

import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
import { ChatProvider } from "./context/ChatContext";
import { FavoriteProvider } from "./context/FavoriteContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavoriteProvider>
          <ProductProvider>
            <ChatProvider>
              <App />
              <Toaster position="top-right" />
            </ChatProvider>
          </ProductProvider>
        </FavoriteProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
