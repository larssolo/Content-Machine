/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComponentProps, Dispatch, SetStateAction } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  FileText, Linkedin, Mail, Edit2, Tag, Image as ImageIcon, Globe, Sliders, Palette,
} from 'lucide-react';
import { BrandSurfaceOutput, CampaignTerritory, ToneAnalysis } from '../types';
import type { HistoryItem } from '../lib/history';
import { DeliberationTimeline } from './DeliberationTimeline';
import { DirectUsableBar } from './DirectUsableBar';
import { ToneAnalysisPanel } from './ToneAnalysisPanel';
import { HistoryMenu } from './HistoryMenu';
import { ExportMenu } from './ExportMenu';
import { RefinementBar } from './RefinementBar';
import { CaseTab } from './tabs/CaseTab';
import { LinkedinTab } from './tabs/LinkedinTab';
import { NewsletterTab } from './tabs/NewsletterTab';
import { HeadlinesTab } from './tabs/HeadlinesTab';
import { KeywordsTab } from './tabs/KeywordsTab';
import { PromptsTab } from './tabs/PromptsTab';
import { EnglishTab } from './tabs/EnglishTab';
import { CviTab } from './tabs/CviTab';
import { ProductionTab } from './tabs/ProductionTab';

// Lån de præcise prop-typer fra børnene, så forwarding er garanteret type-sikkert.
type CaseProps = ComponentProps<typeof CaseTab>;
type PromptsProps = ComponentProps<typeof PromptsTab>;
type CviProps = ComponentProps<typeof CviTab>;
type ToneProps = ComponentProps<typeof ToneAnalysisPanel>;

/**
 * Den indlæste output-arbejdsflade: redaktionsmøde-timeline, "kan bruges direkte",
 * tab-navigationen (med historik + eksport), den aktive tabs indhold og
 * raffinerings-baren — plus tone-/floskel-tjek. Udtrukket fra App.tsx.
 */
interface OutputWorkspaceProps {
  output: BrandSurfaceOutput;
  deepCritique: {
    before: ToneAnalysis;
    after?: ToneAnalysis | null;
    earlyStopped?: boolean;
    synthesisTruncated?: boolean;
  } | null;

  // Tab-navigation
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;

  // Historik
  history: HistoryItem[];
  historyOpen: boolean;
  setHistoryOpen: Dispatch<SetStateAction<boolean>>;
  onClearHistory: () => void;
  onLoadHistory: (item: HistoryItem) => void;

  // Eksport
  selectedTerritory: CampaignTerritory | null;
  onExportSection: (mode: 'all' | 'cvi' | 'case') => void;
  onExportMarkdown: () => void;
  onCopyAllMarkdown: () => void;
  onExportHtml: () => void;
  onExportDeck: () => void;
  onExportDocx: () => void;

  // Fælles tekst-workbench (lånt fra CaseTab så typerne matcher præcist)
  selectedTextKey: CaseProps['selectedTextKey'];
  setSelectedTextKey: CaseProps['setSelectedTextKey'];
  setOutput: CaseProps['setOutput'];
  isRefining: CaseProps['isRefining'];
  isVariating: CaseProps['isVariating'];
  handleRefine: CaseProps['handleRefine'];
  handleUndoRefine: CaseProps['handleUndoRefine'];
  handleGenerateVariants: CaseProps['handleGenerateVariants'];
  handleCopyToClipboard: CaseProps['handleCopyToClipboard'];
  copiedKey: CaseProps['copiedKey'];
  refinementHistory: CaseProps['refinementHistory'];
  revisions: CaseProps['revisions'];
  setRevisions: CaseProps['setRevisions'];
  activeCompareIndex: CaseProps['activeCompareIndex'];
  setActiveCompareIndex: CaseProps['setActiveCompareIndex'];
  setErrorMsg: CaseProps['setErrorMsg'];
  variants: CaseProps['variants'];
  setVariants: CaseProps['setVariants'];
  handleApplyVariant: CaseProps['handleApplyVariant'];
  lockedSections: CaseProps['lockedSections'];
  handleToggleLock: CaseProps['handleToggleLock'];
  handleRegenerateSection: CaseProps['handleRegenerateSection'];
  regeneratingKey: CaseProps['regeneratingKey'];

  // Prompts-tab specifikke
  brief: PromptsProps['brief'];
  generatedImages: PromptsProps['generatedImages'];
  handleAspectChange: PromptsProps['handleAspectChange'];
  handleGenerateImage: PromptsProps['handleGenerateImage'];

  // Refine-bar
  customRefinementPrompt: string;
  setCustomRefinementPrompt: Dispatch<SetStateAction<string>>;
  isGenerating: boolean;

  // Tone-analyse
  isAnalyzing: ToneProps['isAnalyzing'];
  handleTriggerAnalysis: ToneProps['handleTriggerAnalysis'];
}

export function OutputWorkspace(props: OutputWorkspaceProps) {
  const {
    output, deepCritique, activeTab, setActiveTab,
    history, historyOpen, setHistoryOpen, onClearHistory, onLoadHistory,
    selectedTerritory, onExportSection, onExportMarkdown, onCopyAllMarkdown,
    onExportHtml, onExportDeck, onExportDocx,
    selectedTextKey, setSelectedTextKey, setOutput, isRefining, isVariating,
    handleRefine, handleUndoRefine, handleGenerateVariants, handleCopyToClipboard,
    copiedKey, refinementHistory, revisions, setRevisions, activeCompareIndex,
    setActiveCompareIndex, setErrorMsg, variants, setVariants, handleApplyVariant,
    lockedSections, handleToggleLock, handleRegenerateSection, regeneratingKey,
    brief, generatedImages, handleAspectChange, handleGenerateImage,
    customRefinementPrompt, setCustomRefinementPrompt, isGenerating,
    isAnalyzing, handleTriggerAnalysis,
  } = props;

  return (
    <div className="space-y-6">

      {/* 0. SECTION: REDAKTIONSMØDE (DEEP MODE BEFORE/AFTER) */}
      {deepCritique && (
        <DeliberationTimeline
          critiqueBefore={deepCritique.before}
          critiqueAfter={deepCritique.after}
          earlyStopped={deepCritique.earlyStopped}
          synthesisTruncated={deepCritique.synthesisTruncated}
        />
      )}

      {/* 1. SECTION: KAN BRUGES DIREKTE (PINNED HIGHLIGHTS) */}
      <DirectUsableBar
        directUsable={output.directUsable}
        copiedKey={copiedKey}
        onCopy={handleCopyToClipboard}
      />

      {/* MAIN RICH OUTPUT WORKSPACE WITH NAVIGATION TAB SHEETS */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">

        {/* TAB SWITCHERS BAR */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-2 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 sm:pb-0">
          <div className="flex gap-1 flex-1 overflow-x-auto sm:flex-wrap sm:overflow-x-visible">
            {[
              { id: 'case', label: 'Case-tekst', icon: FileText },
              { id: 'linkedin', label: 'LinkedIn Opslag', icon: Linkedin },
              { id: 'newsletter', label: 'Nyhedsbrev', icon: Mail },
              { id: 'headlines', label: 'Overskrifter', icon: Edit2 },
              { id: 'keywords', label: 'Keywords & CTA', icon: Tag },
              { id: 'prompts', label: 'AI image prompts', icon: ImageIcon },
              { id: 'english', label: 'English version', icon: Globe },
              ...(output.cviSuggestion ? [{ id: 'cvi', label: 'CVI Forslag (AI)', icon: Palette }] : []),
              ...(output.productionProposed ? [{ id: 'production', label: 'Produktions-forslag', icon: Sliders }] : [])
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab_select_${tab.id}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-t-2 cursor-pointer shrink-0 whitespace-nowrap ${
                    active
                      ? 'bg-slate-900 border-brand-orange-500 text-white shadow-md'
                      : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-brand-orange-500' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Project history (saved locally) */}
          <HistoryMenu
            history={history}
            historyOpen={historyOpen}
            setHistoryOpen={setHistoryOpen}
            onClearHistory={onClearHistory}
            onLoadHistory={onLoadHistory}
          />

          {/* PDF / multi-format export */}
          <ExportMenu
            output={output}
            copiedKey={copiedKey}
            selectedTerritory={selectedTerritory}
            onExportSection={onExportSection}
            onExportMarkdown={onExportMarkdown}
            onCopyAllMarkdown={onCopyAllMarkdown}
            onExportHtml={onExportHtml}
            onExportDeck={onExportDeck}
            onExportDocx={onExportDocx}
          />
        </div>

        {/* ACTIVE TAB CONTAINER PANEL */}
        <div className="p-5 bg-slate-900 flex-1 min-h-[350px]">
          <AnimatePresence mode="wait">

            {/* TAB 1: CASE-TEKSTER (KORT & LANG) */}
            {activeTab === 'case' && (
              <CaseTab
                output={output}
                selectedTextKey={selectedTextKey}
                setSelectedTextKey={setSelectedTextKey}
                setOutput={setOutput}
                isRefining={isRefining}
                isVariating={isVariating}
                handleRefine={handleRefine}
                handleUndoRefine={handleUndoRefine}
                handleGenerateVariants={handleGenerateVariants}
                handleCopyToClipboard={handleCopyToClipboard}
                copiedKey={copiedKey}
                refinementHistory={refinementHistory}
                revisions={revisions}
                setRevisions={setRevisions}
                activeCompareIndex={activeCompareIndex}
                setActiveCompareIndex={setActiveCompareIndex}
                setErrorMsg={setErrorMsg}
                variants={variants}
                setVariants={setVariants}
                handleApplyVariant={handleApplyVariant}
                lockedSections={lockedSections}
                handleToggleLock={handleToggleLock}
                handleRegenerateSection={handleRegenerateSection}
                regeneratingKey={regeneratingKey}
              />
            )}

            {/* TAB 2: LINKEDIN */}
            {activeTab === 'linkedin' && (
              <LinkedinTab
                output={output}
                selectedTextKey={selectedTextKey}
                setSelectedTextKey={setSelectedTextKey}
                setOutput={setOutput}
                isRefining={isRefining}
                isVariating={isVariating}
                handleRefine={handleRefine}
                handleUndoRefine={handleUndoRefine}
                handleGenerateVariants={handleGenerateVariants}
                handleCopyToClipboard={handleCopyToClipboard}
                copiedKey={copiedKey}
                refinementHistory={refinementHistory}
                revisions={revisions}
                setRevisions={setRevisions}
                activeCompareIndex={activeCompareIndex}
                setActiveCompareIndex={setActiveCompareIndex}
                setErrorMsg={setErrorMsg}
                variants={variants}
                setVariants={setVariants}
                handleApplyVariant={handleApplyVariant}
                lockedSections={lockedSections}
                handleToggleLock={handleToggleLock}
                handleRegenerateSection={handleRegenerateSection}
                regeneratingKey={regeneratingKey}
              />
            )}

            {/* TAB 3: NEWSLETTER */}
            {activeTab === 'newsletter' && (
              <NewsletterTab
                output={output}
                selectedTextKey={selectedTextKey}
                setSelectedTextKey={setSelectedTextKey}
                setOutput={setOutput}
                isRefining={isRefining}
                handleRefine={handleRefine}
                handleUndoRefine={handleUndoRefine}
                handleCopyToClipboard={handleCopyToClipboard}
                copiedKey={copiedKey}
                refinementHistory={refinementHistory}
                revisions={revisions}
                setRevisions={setRevisions}
                activeCompareIndex={activeCompareIndex}
                setActiveCompareIndex={setActiveCompareIndex}
                setErrorMsg={setErrorMsg}
                lockedSections={lockedSections}
                handleToggleLock={handleToggleLock}
                handleRegenerateSection={handleRegenerateSection}
                regeneratingKey={regeneratingKey}
              />
            )}

            {/* TAB 4: HEADLINES */}
            {activeTab === 'headlines' && (
              <HeadlinesTab output={output} handleCopyToClipboard={handleCopyToClipboard} copiedKey={copiedKey} />
            )}

            {/* TAB 5: KEYWORDS & CTA */}
            {activeTab === 'keywords' && (
              <KeywordsTab output={output} handleCopyToClipboard={handleCopyToClipboard} copiedKey={copiedKey} />
            )}

            {/* TAB 6: PROMPTS */}
            {activeTab === 'prompts' && (
              <PromptsTab
                output={output}
                brief={brief}
                generatedImages={generatedImages}
                copiedKey={copiedKey}
                handleCopyToClipboard={handleCopyToClipboard}
                handleAspectChange={handleAspectChange}
                handleGenerateImage={handleGenerateImage}
              />
            )}

            {/* TAB 7: ENGLISH */}
            {activeTab === 'english' && (
              <EnglishTab
                output={output}
                selectedTextKey={selectedTextKey}
                setSelectedTextKey={setSelectedTextKey}
                handleCopyToClipboard={handleCopyToClipboard}
                copiedKey={copiedKey}
              />
            )}

            {/* TAB 8.5: CVI SUGGESTIONS STYLE BOARD */}
            {activeTab === 'cvi' && output.cviSuggestion && (
              <CviTab
                output={output}
                handleCopyToClipboard={handleCopyToClipboard}
                copiedKey={copiedKey}
                handleExportSingleSection={onExportSection as CviProps['handleExportSingleSection']}
              />
            )}

            {/* TAB 8: PRODUCTION (PRODUKTIONS-FORSLAG) */}
            {activeTab === 'production' && output.production && (
              <ProductionTab output={output} handleCopyToClipboard={handleCopyToClipboard} copiedKey={copiedKey} />
            )}

          </AnimatePresence>
        </div>

        {/* BOTTOM REFINEMENT PROMPT SECTION */}
        <RefinementBar
          selectedTextKey={selectedTextKey}
          customRefinementPrompt={customRefinementPrompt}
          setCustomRefinementPrompt={setCustomRefinementPrompt}
          isRefining={isRefining}
          isGenerating={isGenerating}
          onRefine={handleRefine}
        />

      </div>

      {/* TONE & FLOSKEL-TJEK PANEL */}
      <ToneAnalysisPanel output={output} isAnalyzing={isAnalyzing} handleTriggerAnalysis={handleTriggerAnalysis} />

    </div>
  );
}
