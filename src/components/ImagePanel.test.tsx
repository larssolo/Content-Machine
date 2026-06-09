// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImagePanel } from './ImagePanel';

const baseImage = { url: '', loading: false, error: null, aspectRatio: '1:1' };

describe('ImagePanel', () => {
  it('renders the prompt textarea', () => {
    render(<ImagePanel image={baseImage} onGenerate={() => {}} onAspectChange={() => {}} />);
    expect(screen.getByPlaceholderText('Beskriv billedet du vil generere…')).toBeTruthy();
  });

  it('does not call onGenerate when the prompt is empty (button disabled)', () => {
    const onGenerate = vi.fn();
    render(<ImagePanel image={baseImage} onGenerate={onGenerate} onAspectChange={() => {}} />);
    fireEvent.click(screen.getByText('Generer billede'));
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it('calls onGenerate with the typed prompt', () => {
    const onGenerate = vi.fn();
    render(<ImagePanel image={baseImage} onGenerate={onGenerate} onAspectChange={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Beskriv billedet du vil generere…'), { target: { value: 'en rød kat' } });
    fireEvent.click(screen.getByText('Generer billede'));
    expect(onGenerate).toHaveBeenCalledWith('en rød kat');
  });
});
