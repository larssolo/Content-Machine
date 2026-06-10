// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPanel } from './VideoPanel';

const baseVideo = { url: '', loading: false, error: null };

describe('VideoPanel', () => {
  it('deaktiverer generér uden prompt (selv med et genereret billede)', () => {
    render(<VideoPanel generatedImageUrl="http://img" video={baseVideo} onGenerate={() => {}} />);
    const btn = screen.getByText('Generér video').closest('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('kalder onGenerate med billede + prompt + default-params', () => {
    const onGenerate = vi.fn();
    render(<VideoPanel generatedImageUrl="http://img" video={baseVideo} onGenerate={onGenerate} />);
    fireEvent.change(screen.getByPlaceholderText('Beskriv bevægelsen / scenen…'), { target: { value: 'bølger ruller' } });
    fireEvent.click(screen.getByText('Generér video'));
    expect(onGenerate).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: 'http://img', prompt: 'bølger ruller', duration: '5' }));
  });

  it('er deaktiveret når der hverken er genereret billede eller URL', () => {
    render(<VideoPanel generatedImageUrl="" video={baseVideo} onGenerate={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Beskriv bevægelsen / scenen…'), { target: { value: 'noget' } });
    const btn = screen.getByText('Generér video').closest('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
