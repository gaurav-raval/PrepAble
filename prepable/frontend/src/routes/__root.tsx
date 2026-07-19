import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AccessibilityProvider } from "../context/AccessibilityContext";
import "../styles.css";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AccessibilityProvider>
          <Outlet />
        </AccessibilityProvider>
        <Scripts />
      </body>
    </html>
  );
}
