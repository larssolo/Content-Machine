// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProcessStepper } from './ProcessStepper';

const baseProps = {
  isGenerating: false, deepMode: false, generationStep: '',
  isScanning: false, isGeneratingStrategy: false, isGeneratingCampaign: false,
  isGeneratingMatrix: false, isGeneratingEffectiveness: false,
  hasCulturalIntel: false, hasStrategy: false, hasCampaignPlatform: false, hasSelectedTerritory: false,
  hasPressureTest: false, hasChannelMatrix: false, hasEffectiveness: false,
  isSharpening: false, onSharpenIdea: () => {},
  onCulturalScan: () => {}, onGenerateStrategy: () => {}, onGenerateBigIdea: () => {},
  onGenerateChannelMatrix: () => {}, onGenerateEffectiveness: () => {}, onGenerateAll: () => {},
};

describe('ProcessStepper', () => {
  it('renders all funnel steps and the primary CTA', () => {
    render(<ProcessStepper {...baseProps} />);
    expect(screen.getByText('Skan kultur & marked')).toBeTruthy();
    expect(screen.getByText('Byg strategi-fundament')).toBeTruthy();
    expect(screen.getByText('Find Den Store Idé')).toBeTruthy();
    expect(screen.getByText('Skærp idé')).toBeTruthy();
    expect(screen.getByText('Omni-channel matrix')).toBeTruthy();
    expect(screen.getByText('Effekt-lag')).toBeTruthy();
    expect(screen.getByText('Generér indhold')).toBeTruthy();
  });

  it('fires the matching handler when an active step is clicked', () => {
    const onGenerateStrategy = vi.fn();
    render(<ProcessStepper {...baseProps} onGenerateStrategy={onGenerateStrategy} />);
    fireEvent.click(screen.getByText('Byg strategi-fundament'));
    expect(onGenerateStrategy).toHaveBeenCalledOnce();
  });

  it('switches the CTA label in deep mode', () => {
    const { rerender } = render(<ProcessStepper {...baseProps} deepMode={false} />);
    expect(screen.getByText('Generér indhold')).toBeTruthy();
    rerender(<ProcessStepper {...baseProps} deepMode={true} />);
    expect(screen.getByText('Kør redaktionsmøde')).toBeTruthy();
  });

  it('derives step status from progress flags', () => {
    render(<ProcessStepper {...baseProps} hasCulturalIntel={true} hasSelectedTerritory={true} />);
    const dataStatus = (label: string) =>
      screen.getByText(label).closest('[data-status]')?.getAttribute('data-status');
    expect(dataStatus('Skan kultur & marked')).toBe('done');
    expect(dataStatus('Omni-channel matrix')).toBe('ready');
    expect(dataStatus('Byg strategi-fundament')).toBe('ready');
  });

  it('locks territory-dependent steps until an idea is selected', () => {
    const onGenerateChannelMatrix = vi.fn();
    render(<ProcessStepper {...baseProps} hasSelectedTerritory={false} onGenerateChannelMatrix={onGenerateChannelMatrix} />);
    expect(screen.getByText('Omni-channel matrix').closest('[data-status]')?.getAttribute('data-status')).toBe('locked');
    fireEvent.click(screen.getByText('Omni-channel matrix'));
    expect(onGenerateChannelMatrix).not.toHaveBeenCalled();
  });

  it('does not fire a step handler while that step is busy', () => {
    const onCulturalScan = vi.fn();
    render(<ProcessStepper {...baseProps} isScanning={true} onCulturalScan={onCulturalScan} />);
    fireEvent.click(screen.getByText('Skan kultur & marked'));
    expect(onCulturalScan).not.toHaveBeenCalled();
  });

  it('fires onSharpenIdea when step 4 is clicked and an idea is selected', () => {
    const onSharpenIdea = vi.fn();
    render(<ProcessStepper {...baseProps} hasSelectedTerritory={true} onSharpenIdea={onSharpenIdea} />);
    fireEvent.click(screen.getByText('Skærp idé'));
    expect(onSharpenIdea).toHaveBeenCalledOnce();
  });

  it('does not fire onSharpenIdea when no idea is selected (step 4 locked)', () => {
    const onSharpenIdea = vi.fn();
    render(<ProcessStepper {...baseProps} hasSelectedTerritory={false} onSharpenIdea={onSharpenIdea} />);
    fireEvent.click(screen.getByText('Skærp idé'));
    expect(onSharpenIdea).not.toHaveBeenCalled();
  });
});
