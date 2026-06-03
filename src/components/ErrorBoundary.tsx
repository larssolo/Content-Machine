/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface State {
  hasError: boolean;
  message?: string;
}

/** Fanger uventede render-fejl, så hele appen ikke bare bliver en hvid skærm. */
export class ErrorBoundary extends React.Component {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('UI-fejl fanget af ErrorBoundary:', error, info);
  }

  render() {
    if (!this.state.hasError) return (this as any).props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#e2e8f0',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '520px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Noget gik galt
          </h1>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.25rem' }}>
            Der opstod en uventet fejl i grænsefladen. Genindlæs siden for at fortsætte — dit
            arbejde i denne session kan være gået tabt.
          </p>
          {this.state.message && (
            <pre
              style={{
                fontSize: '0.72rem',
                opacity: 0.6,
                whiteSpace: 'pre-wrap',
                marginBottom: '1.25rem',
              }}
            >
              {this.state.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#f97316',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Genindlæs
          </button>
        </div>
      </div>
    );
  }
}
