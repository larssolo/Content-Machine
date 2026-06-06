/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FileText,
  Linkedin,
  Mail,
  Edit2,
  Tag,
  Image as ImageIcon,
  Globe,
  Sliders,
  Wand2,
  ArrowRight,
  Check,
  Copy,
  ChevronDown,
  Palette,
  BookOpen,
  Zap,
  Printer,
  Scissors,
  Sprout,
  Briefcase,
  Clock,
  Trash2,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DirectUsableBar } from './components/DirectUsableBar';
import { DeliberationTimeline } from './components/DeliberationTimeline';
import { WorkingOverlay } from './components/WorkingOverlay';
import { VisualDevPanel } from './components/VisualDevPanel';
import { PrintView } from './components/PrintView';
import { ToneAnalysisPanel } from './components/ToneAnalysisPanel';
import { HumanizerPanel } from './components/HumanizerPanel';
import { CaseTab } from './components/tabs/CaseTab';
import { LinkedinTab } from './components/tabs/LinkedinTab';
import { NewsletterTab } from './components/tabs/NewsletterTab';
import { HeadlinesTab } from './components/tabs/HeadlinesTab';
import { KeywordsTab } from './components/tabs/KeywordsTab';
import { PromptsTab } from './components/tabs/PromptsTab';
import { EnglishTab } from './components/tabs/EnglishTab';
import { CviTab } from './components/tabs/CviTab';
import { ProductionTab } from './components/tabs/ProductionTab';
import { BriefForm } from './components/BriefForm';
import { AppHeader } from './components/AppHeader';
import { Toolbar } from './components/Toolbar';
import { UsageBadge } from './components/UsageBadge';
import { BrainstormPanel } from './components/BrainstormPanel';
import { CampaignPanel } from './components/CampaignPanel';
import { StrategyPanel } from './components/StrategyPanel';
import { ChannelMatrixPanel } from './components/ChannelMatrixPanel';
import { LogoPanel } from './components/LogoPanel';
import { useContentMachine, PRESETS } from './hooks/useContentMachine';

export default function App() {
  const {
    brief, setBrief,
    activeTab, setActiveTab,
    output, setOutput,
    history, historyOpen, setHistoryOpen,
    variants, setVariants, isVariating,
    isGenerating, isRefining, isAnalyzing, isHumanizing, isVisualDeveloping, isAnalyzingCvi,
    generationStep,
    deepMode, setDeepMode, deepCritique,
    visualResult, setVisualResult,
    selectedTextKey, setSelectedTextKey,
    customRefinementPrompt, setCustomRefinementPrompt,
    terminalCommand, setTerminalCommand,
    errorMsg, setErrorMsg,
    refinementHistory,
    revisions, setRevisions,
    activeCompareIndex, setActiveCompareIndex,
    copiedKey,
    externalText, setExternalText,
    humanizerResult, setHumanizerResult,
    cviFileName,
    printMode,
    generatedImages,
    theme, setTheme,
    customPresets,
    lastUsage,
    lockedSections, handleToggleLock,
    regeneratingKey, handleRegenerateSection,
    brainstormResult, setBrainstormResult,
    isBrainstorming, handleBrainstorm,
    strategy,
    isGeneratingStrategy, handleGenerateStrategy, handleClearStrategy,
    campaignPlatform, setCampaignPlatform,
    isGeneratingCampaign, handleGenerateBigIdea,
    selectedTerritory, handleSelectTerritory, handleClearTerritory,
    channelMatrix,
    isGeneratingMatrix, handleGenerateChannelMatrix, handleClearChannelMatrix,
    logoResult, setLogoResult,
    isGeneratingLogo, handleGenerateLogo,
    isOptimizingLogoPrompt, handleOptimizeLogoPrompt,
    handleBriefChange,
    handleChannelToggle,
    handleLoadPreset,
    handleClearPresets,
    handleRestorePresets,
    handlePinCurrentBrief,
    handleCviUpload,
    handleRemoveCvi,
    handleCopyToClipboard,
    handleExportSingleSection,
    handleExportMarkdown,
    handleCopyAllMarkdown,
    handleExportHtml,
    handleExportDocx,
    handleLoadHistory,
    handleClearHistory,
    handleGenerateVariants,
    handleApplyVariant,
    handleGenerateAll,
    handleVisualDevelop,
    handleTriggerAnalysis,
    handleHumanizeText,
    handleRefine,
    handleUndoRefine,
    handleGenerateImage,
    handleAspectChange,
    handleExecuteTerminalCommand,
  } = useContentMachine();

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans transition-all duration-300 antialiased selection:bg-orange-500 selection:text-white ${theme === 'light' ? 'light-mode' : ''}`}>

      {/* SCREEN INTERFACE (HIDDEN WHEN PRINTING) */}
      <div className="print:hidden flex flex-col min-h-screen w-full flex-1">

      <WorkingOverlay
        show={isGenerating || isVisualDeveloping || isHumanizing}
        title={isVisualDeveloping ? 'Visuel udvikling' : isHumanizing ? 'Humaniserer' : deepMode ? 'Redaktionsmøde' : 'Genererer'}
        step={isHumanizing ? 'Omformulerer og gør teksten mere menneskelig …' : generationStep}
      />


       {/* BRAND HEADER */}
       <AppHeader theme={theme} setTheme={setTheme} />


      {/* WORKSPACE & PANELS */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">


         {/* LEFT COLUMN: BRIEF ENTRY (4 cols) */}
         <BriefForm
           brief={brief}
           setBrief={setBrief}
           output={output}
           isGenerating={isGenerating}
           isVisualDeveloping={isVisualDeveloping}
           deepMode={deepMode}
           setDeepMode={setDeepMode}
           cviFileName={cviFileName}
           isAnalyzingCvi={isAnalyzingCvi}
           customPresets={customPresets}
           PRESETS={PRESETS}
           handleBriefChange={handleBriefChange}
           handleChannelToggle={handleChannelToggle}
           handleLoadPreset={handleLoadPreset}
           handleCviUpload={handleCviUpload}
           handleRemoveCvi={handleRemoveCvi}
           handlePinCurrentBrief={handlePinCurrentBrief}
           handleClearPresets={handleClearPresets}
           handleRestorePresets={handleRestorePresets}
           handleGenerateAll={handleGenerateAll}
           handleVisualDevelop={handleVisualDevelop}
           handleBrainstorm={handleBrainstorm}
           isBrainstorming={isBrainstorming}
           handleGenerateStrategy={handleGenerateStrategy}
           isGeneratingStrategy={isGeneratingStrategy}
           hasStrategy={!!strategy}
           handleGenerateBigIdea={handleGenerateBigIdea}
           isGeneratingCampaign={isGeneratingCampaign}
           hasSelectedTerritory={!!selectedTerritory}
           handleGenerateChannelMatrix={handleGenerateChannelMatrix}
           isGeneratingMatrix={isGeneratingMatrix}
           errorMsg={errorMsg}
           generationStep={generationStep}
         />

        {/* RIGHT COLUMN: PREVIEW & OUTPUT INTERACTION WORKSPACE (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-5">

           {/* TOOLBAR / QUICK COMMANDS */}
           <Toolbar
             output={output}
             activeTab={activeTab}
             setActiveTab={setActiveTab}
             setErrorMsg={setErrorMsg}
             terminalCommand={terminalCommand}
             setTerminalCommand={setTerminalCommand}
             handleExecuteTerminalCommand={handleExecuteTerminalCommand}
           />


          {/* STRATEGY FOUNDATION PANEL (Strategi-fundament) */}
          {strategy && (
            <StrategyPanel
              strategy={strategy}
              onClose={handleClearStrategy}
              onGenerateBigIdea={handleGenerateBigIdea}
              isGeneratingCampaign={isGeneratingCampaign}
              copiedKey={copiedKey}
              onCopy={handleCopyToClipboard}
            />
          )}

          {/* CAMPAIGN PLATFORM PANEL (Den Store Idé) */}
          {campaignPlatform && (
            <CampaignPanel
              platform={campaignPlatform}
              selectedTerritory={selectedTerritory}
              onSelectTerritory={handleSelectTerritory}
              onClearTerritory={handleClearTerritory}
              onClose={() => setCampaignPlatform(null)}
              copiedKey={copiedKey}
              onCopy={handleCopyToClipboard}
            />
          )}

          {/* OMNI-CHANNEL MATRIX PANEL (Fase 3) */}
          {channelMatrix && (
            <ChannelMatrixPanel
              matrix={channelMatrix}
              onClose={handleClearChannelMatrix}
              onRegenerate={handleGenerateChannelMatrix}
              isGenerating={isGeneratingMatrix}
              copiedKey={copiedKey}
              onCopy={handleCopyToClipboard}
            />
          )}

          {/* BRAINSTORM RESULT PANEL */}
          {brainstormResult && (
            <BrainstormPanel
              result={brainstormResult}
              onClose={() => setBrainstormResult(null)}
              onAddNote={(text) => {
                const sep = brief.notes.trim() ? '\n\n' : '';
                setBrief(prev => ({ ...prev, notes: prev.notes.trim() + sep + text }));
              }}
              copiedKey={copiedKey}
              onCopy={handleCopyToClipboard}
            />
          )}

          {/* VISUAL DEVELOPMENT RESULT (visuel redaktion) */}
          {visualResult && (
            <VisualDevPanel
              result={visualResult}
              images={generatedImages}
              copiedKey={copiedKey}
              clientName={brief.client}
              onCopyPrompt={handleCopyToClipboard}
              onAspectChange={handleAspectChange}
              onGenerateImage={handleGenerateImage}
              onClose={() => setVisualResult(null)}
            />
          )}

          {/* IF NO OUTPUT YET: BLANK STATE INSTRUCTIONS */}
          <AnimatePresence mode="wait">
            {!output ? (
              <motion.div
                key="blank_state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-950 border border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                  <FileText className="w-8 h-8 text-brand-orange-500" />
                </div>

                <div className="max-w-md space-y-2">
                  <h3 className="font-display font-medium text-lg text-white">Content Machine klar</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Indlæs et test-brief fra listen til venstre (Modaxo Move 2026 er klar som standard), redigér eventuelt værdierne, og tryk derefter på
                    <span className="font-bold text-orange-400"> "Generér indhold" </span>
                    for at generere brandindhold, SoMe og produktionsstrategier på ét sekund.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => handleLoadPreset(PRESETS[0])}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-xs font-mono text-slate-350 border border-slate-800 flex items-center space-x-1.5 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Genindlæs Modaxo Test</span>
                  </button>
                  <button
                    onClick={handleGenerateAll}
                    id="btn_blank_generate"
                    className="px-4 py-2 bg-brand-orange-600 hover:bg-brand-orange-500 rounded-lg text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Generér indhold</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="output_loaded"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >

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
                    <div className="relative mb-2 sm:mb-0 mr-2">
                      <button
                        type="button"
                        onClick={() => setHistoryOpen(o => !o)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-bold font-mono rounded-lg transition-all active:scale-95"
                        title="Tidligere genereringer (gemt lokalt i din browser)"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>HISTORIK ({history.length})</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {historyOpen && (
                        <div className="absolute right-0 top-full mt-1.5 bg-slate-950 border border-slate-800 rounded-lg shadow-lg z-30 w-72 p-1 text-left font-mono max-h-80 overflow-y-auto">
                          <div className="flex items-center justify-between px-2.5 py-1 bg-slate-900/40 rounded border-b border-slate-900/60 mb-1">
                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Tidligere genereringer</span>
                            {history.length > 0 && (
                              <button
                                onClick={handleClearHistory}
                                className="text-[11px] text-red-400 hover:text-red-300 flex items-center space-x-1"
                                title="Ryd historik"
                              >
                                <Trash2 className="w-3 h-3" /><span>Ryd</span>
                              </button>
                            )}
                          </div>
                          {history.length === 0 ? (
                            <div className="px-2.5 py-3 text-[11px] text-slate-500">Ingen gemte genereringer endnu.</div>
                          ) : history.map(item => (
                            <button
                              key={item.id}
                              onClick={() => { handleLoadHistory(item); setHistoryOpen(false); }}
                              className="w-full text-left px-2.5 py-2 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors border-t border-slate-900/60 first:border-t-0"
                            >
                              <div className="font-bold text-slate-200 truncate">{item.client} — {item.project}</div>
                              <div className="text-[11px] text-slate-500">{new Date(item.ts).toLocaleString('da-DK')}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* PDF Export Action Button & Template Selection Aligned Right */}
                    <div className="relative group/export mb-2 sm:mb-0 mr-2 flex items-stretch">
                      <button
                        onClick={() => handleExportSingleSection('all')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-orange-600 hover:bg-brand-orange-500 text-white text-[11px] font-semibold rounded-l-lg transition-all shadow-sm cursor-pointer active:scale-95"
                        title="Generer pænt formateret kundemateriale med alt indhold som PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-white" />
                        <span>Eksportér til PDF</span>
                      </button>

                      <div className="relative flex items-stretch">
                        <button
                          type="button"
                          className="flex items-center justify-center px-1.5 bg-brand-orange-600 hover:bg-brand-orange-500 text-white text-[11px] rounded-r-lg shadow-sm cursor-pointer transition-all border-l border-white/10 active:scale-95"
                          title="Vælg specifik PDF eksport skabelon"
                        >
                          <ChevronDown className="w-3.5 h-3.5 text-white" />
                        </button>

                        {/* Dropdown Options List displayed on hover as a rich interactive popover */}
                        <div className="absolute right-0 top-full mt-1.5 bg-slate-950 border border-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all duration-150 z-30 w-52 p-1 text-left font-mono">
                          <div className="px-2.5 py-1 bg-slate-900/40 rounded border-b border-slate-900/60 mb-1">
                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest block">PDF Skabeloner</span>
                          </div>

                          <button
                            onClick={() => handleExportSingleSection('all')}
                            className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2"
                          >
                            <FileText className="w-3.5 h-3.5 text-brand-orange-500 shrink-0" />
                            <span>Fuld rapport (Alt)</span>
                          </button>

                          {output.cviSuggestion && (
                            <button
                              onClick={() => handleExportSingleSection('cvi')}
                              className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2 border-t border-slate-900"
                            >
                              <Palette className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="font-bold text-amber-400">Kun Brand CVI-ark</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleExportSingleSection('case')}
                            className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2 border-t border-slate-900"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>Kun Case-tekster</span>
                          </button>

                          <div className="px-2.5 py-1 bg-slate-900/40 rounded border-y border-slate-900/60 my-1">
                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest block">Markdown</span>
                          </div>

                          <button
                            onClick={handleExportMarkdown}
                            className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Download som Markdown (.md)</span>
                          </button>

                          <button
                            onClick={handleCopyAllMarkdown}
                            className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2 border-t border-slate-900"
                          >
                            {copiedKey === 'export_all_md'
                              ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              : <Copy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            <span>Kopiér alt (Markdown)</span>
                          </button>

                          <div className="px-2.5 py-1 bg-slate-900/40 rounded border-y border-slate-900/60 my-1">
                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest block">HTML</span>
                          </div>

                          <button
                            onClick={handleExportHtml}
                            className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2"
                          >
                            <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>Download som HTML (.html)</span>
                          </button>

                          <div className="px-2.5 py-1 bg-slate-900/40 rounded border-y border-slate-900/60 my-1">
                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest block">Word</span>
                          </div>

                          <button
                            onClick={handleExportDocx}
                            className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>Download som Word (.docx)</span>
                          </button>
                        </div>
                      </div>
                    </div>
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
                           handleExportSingleSection={handleExportSingleSection}
                         />
                       )}

                       {/* TAB 8: PRODUCTION (PRODUKTIONS-FORSLAG) */}
                       {activeTab === 'production' && output.production && (
                         <ProductionTab output={output} handleCopyToClipboard={handleCopyToClipboard} copiedKey={copiedKey} />
                       )}

                    </AnimatePresence>
                  </div>

                  {/* BOTTOM REFINEMENT PROMPT SECTION */}
                  <div className="p-4 bg-slate-950/90 border-t border-slate-850 text-slate-400 font-sans text-xs space-y-3.5">

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                      <div className="space-y-1 text-left">
                        <span className="text-[11px] font-mono font-bold tracking-wider text-slate-200 flex items-center space-x-1.5 uppercase">
                          <Wand2 className="w-3.5 h-3.5 text-orange-500" />
                          <span>Hurtig-Raffinering af valgt blok</span>
                        </span>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Valgt felt: <span className="text-orange-400 font-bold">{selectedTextKey}</span>
                        </div>
                      </div>

                      {/* Commands panel */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRefine('/shorten', selectedTextKey)}
                          disabled={isRefining || isGenerating}
                          id="refine_shorten_cli_active"
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-lg border border-slate-800 text-[11px] flex items-center space-x-1.5 transition-all"
                          title="Forkort den valgte tekst"
                        >
                          <Scissors className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>/shorten</span>
                        </button>
                        <button
                          onClick={() => handleRefine('/more-human', selectedTextKey)}
                          disabled={isRefining || isGenerating}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-lg border border-slate-800 text-[11px] flex items-center space-x-1.5 transition-all"
                          title="Gør den mere levende og menneskelig"
                        >
                          <Sprout className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>/more-human</span>
                        </button>
                        <button
                          onClick={() => handleRefine('/more-business', selectedTextKey)}
                          disabled={isRefining || isGenerating}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-lg border border-slate-800 text-[11px] flex items-center space-x-1.5 transition-all"
                          title="Gør den mere erhvervsmæssig og skarp"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>/more-business</span>
                        </button>
                      </div>
                    </div>

                    {/* Custom text refine prompt entry */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        id="custom_refine_input"
                        value={customRefinementPrompt}
                        onChange={(e) => setCustomRefinementPrompt(e.target.value)}
                        placeholder="Eller skriv din egen instruktion her... (f.eks. 'skriv på fynsk' eller 'fokusér mere på maskotten')"
                        className="flex-1 bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-brand-orange-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 transition-all font-sans"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customRefinementPrompt.trim()) {
                            handleRefine(customRefinementPrompt, selectedTextKey);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleRefine(customRefinementPrompt, selectedTextKey)}
                        disabled={isRefining || !customRefinementPrompt.trim()}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] disabled:bg-slate-900 disabled:text-slate-600 disabled:active:scale-100 disabled:border-slate-850 text-orange-400 hover:text-orange-300 font-semibold text-xs rounded-lg transition-all border border-slate-700"
                      >
                        {isRefining ? 'Raffinerer...' : 'Kør omskrivning'}
                      </button>
                    </div>

                  </div>

                </div>

                {/* TONE & FLOSKEL-TJEK PANEL */}
                <ToneAnalysisPanel output={output} isAnalyzing={isAnalyzing} handleTriggerAnalysis={handleTriggerAnalysis} />

              </motion.div>
            )}
          </AnimatePresence>

          {/* LOGO GENERATOR PANEL */}
          <LogoPanel
            brief={brief}
            logoResult={logoResult}
            isGeneratingLogo={isGeneratingLogo}
            handleGenerateLogo={handleGenerateLogo}
            isOptimizingLogoPrompt={isOptimizingLogoPrompt}
            handleOptimizeLogoPrompt={handleOptimizeLogoPrompt}
            onClearResult={() => setLogoResult(null)}
            copiedKey={copiedKey}
            onCopy={handleCopyToClipboard}
          />

          {/* AI HUMANIZER & DETECTOR BYPASS PANEL */}
          <HumanizerPanel
            externalText={externalText}
            setExternalText={setExternalText}
            humanizerResult={humanizerResult}
            setHumanizerResult={setHumanizerResult}
            isHumanizing={isHumanizing}
            handleHumanizeText={handleHumanizeText}
            handleCopyToClipboard={handleCopyToClipboard}
            copiedKey={copiedKey}
          />

          {/* SYSTEM STATS OR ABOUT (No telemetry data as requested, just a clean branding footer) */}
          <div className="py-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>
              Content Machine by{' '}
              <a href="https://www.larssohl.dk" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 transition-colors">larssohl.dk</a>
              {' '}&amp; Claude Anthropic &copy; 2026 &middot; v1.11.1
            </span>
            <div className="flex items-center space-x-4">
              {lastUsage && <UsageBadge usage={lastUsage} />}
              <span>Konkret. Autentisk. Kreativt.</span>
            </div>
          </div>

        </div>

      </main>
      </div> {/* End of print:hidden screen wrapper */}


      {/* PREMIUM DIGITAL BRAND REVISION RAPPORT / PDF PRINT LAYOUT */}
      <PrintView output={output} brief={brief} printMode={printMode} generatedImages={generatedImages} />

    </div>
  );
}
