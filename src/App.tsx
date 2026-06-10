/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from 'motion/react';
import { WorkingOverlay } from './components/WorkingOverlay';
import { PrintView } from './components/PrintView';
import { HumanizerPanel } from './components/HumanizerPanel';
import { BriefForm } from './components/BriefForm';
import { AppHeader } from './components/AppHeader';
import { Toolbar } from './components/Toolbar';
import { UsageBadge } from './components/UsageBadge';
import { LogoPanel } from './components/LogoPanel';
import { ImagePanel } from './components/ImagePanel';
import { FunnelPanels } from './components/FunnelPanels';
import { BlankState } from './components/BlankState';
import { OutputWorkspace } from './components/OutputWorkspace';
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
    culturalIntel, isScanning, handleCulturalScan, handleClearCulturalIntel,
    strategy,
    isGeneratingStrategy, handleGenerateStrategy, handleClearStrategy,
    campaignPlatform, setCampaignPlatform,
    isGeneratingCampaign, handleGenerateBigIdea,
    selectedTerritory, handleSelectTerritory, handleClearTerritory,
    pressureTest, isSharpening, sharpeningTarget,
    handleSharpenIdea, handleAdoptSharpened, handleClearPressureTest,
    channelMatrix,
    isGeneratingMatrix, handleGenerateChannelMatrix, handleClearChannelMatrix,
    effectiveness, isGeneratingEffectiveness,
    handleGenerateEffectiveness, handleClearEffectiveness,
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
    handleExportDeck,
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
    isOptimizingImagePrompt, handleOptimizeImagePrompt,
    handleExecuteTerminalCommand,
  } = useContentMachine();

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans transition-all duration-300 antialiased selection:bg-orange-500 selection:text-white ${theme === 'light' ? 'light-mode' : ''}`}>

      {/* SCREEN INTERFACE (HIDDEN WHEN PRINTING) */}
      <div className="print:hidden flex flex-col min-h-screen w-full flex-1">

        <WorkingOverlay
          show={
            isGenerating || isRefining || isAnalyzing || isVisualDeveloping || isHumanizing ||
            isAnalyzingCvi || isBrainstorming || isScanning || isGeneratingStrategy ||
            isGeneratingCampaign || isSharpening || isGeneratingMatrix ||
            isGeneratingEffectiveness || isGeneratingLogo || isOptimizingLogoPrompt ||
            isOptimizingImagePrompt
          }
          title={
            isVisualDeveloping ? 'Visuel udvikling' :
            isHumanizing ? 'Humaniserer' :
            isAnalyzingCvi ? 'Analyserer CVI' :
            isBrainstorming ? 'Brainstormer' :
            isScanning ? 'Kulturel scanning' :
            isGeneratingStrategy ? 'Strategi-fundament' :
            isGeneratingCampaign ? 'Den Store Idé' :
            isSharpening ? 'Skærper idé' :
            isGeneratingMatrix ? 'Omni-channel matrix' :
            isGeneratingEffectiveness ? 'Effekt-lag' :
            isGeneratingLogo ? 'Logo' :
            isOptimizingLogoPrompt ? 'Logo-prompt' :
            isOptimizingImagePrompt ? 'Optimerer billed-prompt' :
            isRefining ? 'Forfiner' :
            isAnalyzing ? 'Analyserer' :
            deepMode ? 'Redaktionsmøde' : 'Genererer'
          }
          step={isHumanizing ? 'Omformulerer og gør teksten mere menneskelig …' : generationStep}
          error={errorMsg}
          onDismissError={() => setErrorMsg(null)}
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
            handleCulturalScan={handleCulturalScan}
            isScanning={isScanning}
            hasCulturalIntel={!!culturalIntel}
            handleGenerateStrategy={handleGenerateStrategy}
            isGeneratingStrategy={isGeneratingStrategy}
            hasStrategy={!!strategy}
            handleGenerateBigIdea={handleGenerateBigIdea}
            isGeneratingCampaign={isGeneratingCampaign}
            hasSelectedTerritory={!!selectedTerritory}
            hasPressureTest={!!pressureTest}
            hasChannelMatrix={!!channelMatrix}
            hasEffectiveness={!!effectiveness}
            handleGenerateChannelMatrix={handleGenerateChannelMatrix}
            isGeneratingMatrix={isGeneratingMatrix}
            handleGenerateEffectiveness={handleGenerateEffectiveness}
            isGeneratingEffectiveness={isGeneratingEffectiveness}
            isSharpening={isSharpening}
            onSharpenIdea={() => { if (selectedTerritory) handleSharpenIdea(selectedTerritory); }}
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

            {/* CREATIVE FUNNEL RESULT PANELS */}
            <FunnelPanels
              copiedKey={copiedKey}
              onCopy={handleCopyToClipboard}
              culturalIntel={culturalIntel}
              onClearCulturalIntel={handleClearCulturalIntel}
              strategy={strategy}
              onClearStrategy={handleClearStrategy}
              isGeneratingStrategy={isGeneratingStrategy}
              onGenerateStrategy={handleGenerateStrategy}
              campaignPlatform={campaignPlatform}
              setCampaignPlatform={setCampaignPlatform}
              selectedTerritory={selectedTerritory}
              onSelectTerritory={handleSelectTerritory}
              onClearTerritory={handleClearTerritory}
              onExportDeck={handleExportDeck}
              isGeneratingCampaign={isGeneratingCampaign}
              onGenerateBigIdea={handleGenerateBigIdea}
              pressureTest={pressureTest}
              onPressureTest={handleSharpenIdea}
              isSharpening={isSharpening}
              sharpeningTarget={sharpeningTarget}
              onAdoptSharpened={handleAdoptSharpened}
              onClearPressureTest={handleClearPressureTest}
              channelMatrix={channelMatrix}
              isGeneratingMatrix={isGeneratingMatrix}
              onGenerateChannelMatrix={handleGenerateChannelMatrix}
              onClearChannelMatrix={handleClearChannelMatrix}
              effectiveness={effectiveness}
              isGeneratingEffectiveness={isGeneratingEffectiveness}
              onGenerateEffectiveness={handleGenerateEffectiveness}
              onClearEffectiveness={handleClearEffectiveness}
              brainstormResult={brainstormResult}
              setBrainstormResult={setBrainstormResult}
              brief={brief}
              setBrief={setBrief}
              visualResult={visualResult}
              setVisualResult={setVisualResult}
              generatedImages={generatedImages}
              onAspectChange={handleAspectChange}
              onGenerateImage={handleGenerateImage}
            />

            {/* BLANK STATE OR LOADED OUTPUT WORKSPACE */}
            <AnimatePresence mode="wait">
              {!output ? (
                <motion.div
                  key="blank_state"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <BlankState
                    onLoadPreset={handleLoadPreset}
                    onGenerateAll={handleGenerateAll}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="output_loaded"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                <OutputWorkspace
                  output={output}
                  deepCritique={deepCritique}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  history={history}
                  historyOpen={historyOpen}
                  setHistoryOpen={setHistoryOpen}
                  onClearHistory={handleClearHistory}
                  onLoadHistory={handleLoadHistory}
                  selectedTerritory={selectedTerritory}
                  onExportSection={handleExportSingleSection}
                  onExportMarkdown={handleExportMarkdown}
                  onCopyAllMarkdown={handleCopyAllMarkdown}
                  onExportHtml={handleExportHtml}
                  onExportDeck={handleExportDeck}
                  onExportDocx={handleExportDocx}
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
                  brief={brief}
                  generatedImages={generatedImages}
                  handleAspectChange={handleAspectChange}
                  handleGenerateImage={handleGenerateImage}
                  customRefinementPrompt={customRefinementPrompt}
                  setCustomRefinementPrompt={setCustomRefinementPrompt}
                  isGenerating={isGenerating}
                  isAnalyzing={isAnalyzing}
                  handleTriggerAnalysis={handleTriggerAnalysis}
                />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ASSET GENERATORS (uafhængige af funnel) */}
            <div className="space-y-3">
              <span className="block text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">Assets · kræver ikke funnel</span>

              <ImagePanel
                image={generatedImages.custom}
                onGenerate={(p, model) => handleGenerateImage('custom', p, model)}
                onAspectChange={(r) => handleAspectChange('custom', r)}
                onOptimize={(p, mode) => handleOptimizeImagePrompt(brief, p, mode)}
                isOptimizing={isOptimizingImagePrompt}
              />

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
            </div>

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

            {/* BRANDING FOOTER */}
            <div className="py-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>
                Neura Studio by{' '}
                <a href="https://www.larssohl.dk" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 transition-colors">larssohl.dk</a>
                {' '}&amp; Claude Anthropic &copy; 2026 &middot; v1.20.0
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
