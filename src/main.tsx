import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { THEME_STORAGE_KEY } from "./constants";
import AuthProvider from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import ToastProvider from "./context/ToastProvider";
import ADPI18nProvider from "./i18n/ADPI18nProvider";
import { I18nProvider } from "./i18n/i19nProvider";
import "./index.css";
import router from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ADPI18nProvider>
      <I18nProvider>
        <ThemeProvider storageKey={THEME_STORAGE_KEY}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ToastProvider>
                <RouterProvider router={router} />
              </ToastProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </I18nProvider>
    </ADPI18nProvider>
  </StrictMode>,
);
