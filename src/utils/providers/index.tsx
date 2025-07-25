import { AuthProvider } from "./auth-provider";
import { ReactQueryClientProvider } from "./react-query-provider";
import { ThemeProvider } from "./theme-provider";
export function Providers({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
