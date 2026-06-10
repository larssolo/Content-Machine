// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvatarPanel } from './AvatarPanel';

const empty = { url: '', loading: false, error: null };
const base = {
  generatedImageUrl: 'http://img',
  speech: empty,
  avatar: empty,
  onGenerateSpeech: () => {},
  onGenerateAvatar: () => {},
};

describe('AvatarPanel', () => {
  it('stemme-dropdown indeholder alle 30 stemmer', () => {
    render(<AvatarPanel {...base} />);
    const select = screen.getByLabelText('Stemme') as HTMLSelectElement;
    expect(select.options.length).toBe(30);
  });

  it('Generér tale kalder onGenerateSpeech med tekst + default-stemme', () => {
    const onGenerateSpeech = vi.fn();
    render(<AvatarPanel {...base} onGenerateSpeech={onGenerateSpeech} />);
    fireEvent.change(screen.getByPlaceholderText(/Skriv hvad avataren skal sige/), { target: { value: 'Hej verden' } });
    fireEvent.click(screen.getByText('Generér tale'));
    expect(onGenerateSpeech).toHaveBeenCalledWith(expect.objectContaining({ prompt: 'Hej verden', voice: 'Kore' }));
  });

  it('Generér avatar er deaktiveret uden genereret tale', () => {
    render(<AvatarPanel {...base} />);
    const btn = screen.getByText('Generér avatar').closest('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('Generér avatar kalder onGenerateAvatar når billede + tale findes', () => {
    const onGenerateAvatar = vi.fn();
    render(<AvatarPanel {...base} speech={{ url: 'http://audio', loading: false, error: null }} onGenerateAvatar={onGenerateAvatar} />);
    fireEvent.click(screen.getByText('Generér avatar'));
    expect(onGenerateAvatar).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: 'http://img', audioUrl: 'http://audio', resolution: '480p' }));
  });
});
