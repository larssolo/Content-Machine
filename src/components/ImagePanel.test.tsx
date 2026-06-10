// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImagePanel } from './ImagePanel';

const baseImage = { url: '', loading: false, error: null, aspectRatio: '1:1' };

describe('ImagePanel', () => {
  it('renders the prompt textarea', () => {
    render(<ImagePanel image={baseImage} onGenerate={() => {}} onAspectChange={() => {}} onOptimize={() => Promise.resolve(null)} isOptimizing={false} />);
    expect(screen.getByPlaceholderText('Beskriv billedet du vil generere…')).toBeTruthy();
  });

  it('disables the generate button and does not call onGenerate when the prompt is empty', () => {
    const onGenerate = vi.fn();
    render(<ImagePanel image={baseImage} onGenerate={onGenerate} onAspectChange={() => {}} onOptimize={() => Promise.resolve(null)} isOptimizing={false} />);
    const button = screen.getByText('Generer billede').closest('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it('calls onGenerate with the typed prompt', () => {
    const onGenerate = vi.fn();
    render(<ImagePanel image={baseImage} onGenerate={onGenerate} onAspectChange={() => {}} onOptimize={() => Promise.resolve(null)} isOptimizing={false} />);
    fireEvent.change(screen.getByPlaceholderText('Beskriv billedet du vil generere…'), { target: { value: 'en rød kat' } });
    fireEvent.click(screen.getByText('Generer billede'));
    expect(onGenerate).toHaveBeenCalledWith('en rød kat');
  });

  it('kalder onOptimize med translate-mode når Oversæt klikkes', async () => {
    const onOptimize = vi.fn().mockResolvedValue('a translated prompt');
    render(<ImagePanel image={baseImage} onGenerate={() => {}} onAspectChange={() => {}} onOptimize={onOptimize} isOptimizing={false} />);
    fireEvent.change(screen.getByPlaceholderText('Beskriv billedet du vil generere…'), { target: { value: 'en blå bil' } });
    fireEvent.click(screen.getByText('Oversæt til engelsk'));
    expect(onOptimize).toHaveBeenCalledWith('en blå bil', 'translate');
  });
});
