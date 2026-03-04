import React from 'react';

/**
 * Grants section layout — passthrough, no forced theme.
 * Inherits the global light/dark mode from the theme provider.
 */
export default function GrantsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
