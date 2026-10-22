import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { GlobalStyles } from "./styles/GlobalStyles";

const queryClient = new QueryClient();
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter basename={routerBasename}>
                <GlobalStyles />
                <App />
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
);
