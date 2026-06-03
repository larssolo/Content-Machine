// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function Boom(): any {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Indhold OK</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Indhold OK')).toBeTruthy();
  });

  it('shows the Danish fallback UI when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Noget gik galt')).toBeTruthy();
    expect(screen.getByText('Genindlæs')).toBeTruthy();
    spy.mockRestore();
  });
});
