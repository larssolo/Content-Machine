/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  FileText, 
  Linkedin, 
  Mail, 
  Compass, 
  Tag, 
  Image as ImageIcon, 
  Globe, 
  Sliders, 
  Wand2, 
  ArrowRight, 
  Layers, 
  Send,
  ChevronRight,
  Info,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Edit2,
  Volume2,
  Zap,
  Rocket,
  Scissors,
  Sprout,
  Briefcase,
  Search,
  Fingerprint,
  UserCheck,
  Cpu,
  ShieldCheck,
  Trash2,
  Pin,
  Printer,
  UploadCloud,
  BookOpen,
  Palette,
  ChevronDown,
  Sun,
  Moon,
  Download,
  Loader2,
  Clock,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectBrief, BrandSurfaceOutput, PresetBrief, HumanizerResult, ToneAnalysis, VisualDevResult } from './types';
import { buildMarkdown, downloadTextFile, slugify } from './lib/exportMarkdown';
import { downloadHtmlFile } from './lib/exportHtml';
import { downloadDocx } from './lib/exportDocx';
import { ImageGenCard } from './components/ImageGenCard';
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
import { saveSession, loadSession } from './lib/session';
import { loadHistory, pushHistory, clearHistory, type HistoryItem } from './lib/history';

/**
 * Menneskelig fejlbesked ud fra en HTTP-status. En 404 betyder næsten altid at
 * frontend'en serveres uden Express-backenden (forkert port eller en statisk
 * build), så vi guider brugeren i stedet for at vise en rå statuskode.
 */
function httpErrorMessage(status: number, serverMsg?: string): string {
  if (serverMsg) return serverMsg;
  if (status === 404) {
    return 'Backenden svarer ikke (404). Kør appen med "npm run dev" og åbn http://localhost:3000 — ikke en anden port eller en bygget fil.';
  }
  return `Serveren svarede med status ${status}`;
}

const PRESETS: PresetBrief[] = [
  {
    name: "Modaxo Move 2026 (Konference / 3D Maskot)",
    brief: {
      client: "Modaxo",
      project: "Modaxo Move 2026",
      description: "Vi udviklede visuelt indhold til en international konference i København. Vi lavede speaker presentations, dynamiske visuals til LED-skærm, dinner visuals, awards visuals og content til liveoptrædener.",
      details: "350 deltagere fra hele verden, deltagere fra 37 lande, 24x4 meter LED-skærm. Vi var også med til at udvikle Moxi, Modaxos nye lille maskot. Hun blev skabt med udgangspunkt i Modaxos logo og vækket til live som en 3D-karakter.",
      audience: "Virksomheder der holder events, konferencer, messer og keynotes.",
      tone: "Professionel, menneskelig, kreativ, ikke barnlig.",
      language: "Dansk",
      channels: ["Hjemmeside", "LinkedIn", "Nyhedsbrev"],
      notes: "Vi skal fremstå som en kreativ og praktisk samarbejdspartner, der kan løfte visuelle oplevelser i stor skala."
    }
  },
  {
    name: "B&O Beolab Launch (Eksklusiv Event / 3D)",
    brief: {
      client: "Bang & Olufsen",
      project: "Beolab Theatre Launch Event",
      description: "Vi leverede komplet 3D-visualisering og scenekonstruktion til den skandinaviske produktlancering. Vi designede et ultra-high-end digitalt univers, herunder live 3D eksploderede tegninger af produktkomponenter på scenen synkroniseret med lys-show.",
      details: "Afholdt i et historisk teater i København for 150 VIP arkitekter og lyd-anmeldere. Ekstremt luksuriøs finish og fotorealistisk 3D visualisering.",
      audience: "High-end lyd-entusiaster, arkitekter, tech-medier og top-forhandlere.",
      tone: "Sofistikeret, design-fokuseret, eksklusiv, præcis.",
      language: "Dansk",
      channels: ["LinkedIn", "Hjemmeside", "Nyhedsbrev"],
      notes: "Vi skal fremhæves som den præcise kreative teknologiske kraft, der gør det muligt at forstå akustisk storhed visuelt."
    }
  },
  {
    name: "Ørsted Wind Summit (Data / Infografik / Web)",
    brief: {
      client: "Ørsted",
      project: "Green Wind Summit Copenhagen",
      description: "Produktion af digital grafik, interaktive infografikker til touch-screens og en komplet nyhedsbrev-kampagne i forbindelse med det globale vindtopmøde.",
      details: "5 interaktive info-standere på messestanden, 12 animerede infografik-loops. Fokus på vindmølle-teknologiens fremtid på havbunden.",
      audience: "Industrispecialister, investorer, journalister og grønne rådgivere.",
      tone: "Visionær, troværdig, professionel, grøn og skarp.",
      language: "Dansk",
      channels: ["Nyhedsbrev", "LinkedIn"],
      notes: "Vi skal formidle indviklede tekniske klimadata enkelt, visuelt stærkt og inspirerende."
    }
  }
];

export default function App() {
  // Input brief state, initialized with Empty template, but prompts user to load a preset
  const [brief, setBrief] = useState<ProjectBrief>({
    client: '',
    project: '',
    description: '',
    details: '',
    audience: 'Virksomheder der holder events, konferencer, messer og keynotes.',
    tone: 'Professionel, menneskelig, kreativ, ikke barnlig.',
    language: 'Dansk',
    channels: ['Hjemmeside', 'LinkedIn', 'Nyhedsbrev'],
    notes: 'Vi skal fremstå som en kreativ og praktisk samarbejdspartner, der kan løfte visuelle oplevelser i stor skala.'
  });

  const [activeTab, setActiveTab] = useState<string>('case'); // Tab keys matching commands
  const [output, setOutput] = useState<BrandSurfaceOutput | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [variants, setVariants] = useState<{ key: string; options: string[] } | null>(null);
  const [isVariating, setIsVariating] = useState<boolean>(false);
  
  // Loading states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  // "Dyb tilstand" (redaktionsmøde) — opt-in multi-AI deliberation
  const [deepMode, setDeepMode] = useState<boolean>(false);
  const [deepCritique, setDeepCritique] = useState<{
    before: ToneAnalysis;
    after?: ToneAnalysis | null;
    earlyStopped?: boolean;
    synthesisTruncated?: boolean;
  } | null>(null);
  const [isVisualDeveloping, setIsVisualDeveloping] = useState<boolean>(false);
  const [visualResult, setVisualResult] = useState<VisualDevResult | null>(null);

  // Refinement states
  const [selectedTextKey, setSelectedTextKey] = useState<string>('shortCaseText'); // which property in BrandSurfaceOutput is chosen for refinement
  const [customRefinementPrompt, setCustomRefinementPrompt] = useState<string>('');
  const [terminalCommand, setTerminalCommand] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refinementHistory, setRefinementHistory] = useState<Array<{ key: string; original: string }>>([]);
  const [revisions, setRevisions] = useState<Record<string, string[]>>({});
  const [activeCompareIndex, setActiveCompareIndex] = useState<Record<string, number | null>>({});

  // Copy success animation states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // External Humanizer state
  const [externalText, setExternalText] = useState<string>('');
  const [humanizerResult, setHumanizerResult] = useState<HumanizerResult | null>(null);
  const [isHumanizing, setIsHumanizing] = useState<boolean>(false);

  // CVI states
  const [cviFileName, setCviFileName] = useState<string | null>(null);
  const [isAnalyzingCvi, setIsAnalyzingCvi] = useState<boolean>(false);

  // PDF Export Print Mode states
  const [printMode, setPrintMode] = useState<'all' | 'cvi' | 'case'>('all');

  // Generated images state mapped by prompt key ('hero', 'detail', 'abstract')
  const [generatedImages, setGeneratedImages] = useState<Record<'hero' | 'detail' | 'abstract', { url: string; loading: boolean; error: string | null; aspectRatio: string }>>({
    hero: { url: '', loading: false, error: null, aspectRatio: '16:9' },
    detail: { url: '', loading: false, error: null, aspectRatio: '1:1' },
    abstract: { url: '', loading: false, error: null, aspectRatio: '16:9' }
  });

  // Application Theme State (Persisted)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('brand_surface_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('brand_surface_theme', theme);
  }, [theme]);

  // Custom presets initialized from localStorage (or defaulting to static PRESETS)
  const [customPresets, setCustomPresets] = useState<PresetBrief[]>(() => {
    const local = localStorage.getItem('brand_surface_presets');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error("Fejl under indlæsning af presets:", e);
      }
    }
    return PRESETS;
  });

  // On mount: restore the saved working session, or fall back to the default preset
  useEffect(() => {
    const saved = loadSession();
    if (saved && (saved.output || saved.brief?.client)) {
      if (saved.brief) setBrief(saved.brief);
      if (saved.output) setOutput(saved.output);
      if (saved.revisions) setRevisions(saved.revisions);
      if (saved.activeCompareIndex) setActiveCompareIndex(saved.activeCompareIndex);
      if (saved.generatedImages) setGeneratedImages(prev => ({ ...prev, ...(saved.generatedImages as any) }));
      if (saved.cviFileName !== undefined) setCviFileName(saved.cviFileName ?? null);
      if (saved.activeTab) setActiveTab(saved.activeTab);
      return;
    }
    if (customPresets && customPresets.length > 0) {
      handleLoadPreset(customPresets[0]);
    } else {
      // If presets were cleared, set a clean blank state
      setBrief({
        client: '',
        project: '',
        description: '',
        details: '',
        audience: '',
        tone: 'Professionel, menneskelig, kreativ',
        language: 'Dansk',
        channels: [],
        notes: '',
        cviManual: null
      });
    }
  }, []);

  // Auto-save the working session so nothing is lost on refresh
  useEffect(() => {
    if (!output && !brief.client) return; // undgå at overskrive med tom start-tilstand
    saveSession({ brief, output, revisions, activeCompareIndex, generatedImages, cviFileName, activeTab });
  }, [brief, output, revisions, activeCompareIndex, generatedImages, cviFileName, activeTab]);

  // Handler to clear all presets
  const handleClearPresets = () => {
    setCustomPresets([]);
    localStorage.setItem('brand_surface_presets', JSON.stringify([]));
    setErrorMsg("Alle presets er nu ryddet. Du kan bygge og pinne dine egne jobs!");
  };

  // Handler to restore defaults
  const handleRestorePresets = () => {
    setCustomPresets(PRESETS);
    localStorage.setItem('brand_surface_presets', JSON.stringify(PRESETS));
    handleLoadPreset(PRESETS[0]);
    setErrorMsg(null);
  };

  // Handler to load CVI manual
  const handleCviUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingCvi(true);
    setCviFileName(file.name);
    setErrorMsg(null);

    const checkCviResult = (base64String: string) => {
      fetch('/api/analyze-cvi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileType: file.type,
          fileContent: base64String,
          fileName: file.name
        })
      })
      .then(async res => {
        if (!res.ok) {
          const text = await res.json().catch(() => ({}));
          throw new Error(httpErrorMessage(res.status, text.error));
        }
        return res.json();
      })
      .then(result => {
        setBrief(prev => ({
          ...prev,
          cviManual: result
        }));
        setErrorMsg(`CVI og designmanual "${file.name}" er scannet og indlæst! Din AI vil nu bruge disse regler.`);
      })
      .catch(err => {
        console.error("CVI error:", err);
        setErrorMsg(`Scanning mislykkedes: ${err.message || 'AI-modellen kunne ikke afkode filen.'}`);
        setCviFileName(null);
      })
      .finally(() => {
        setIsAnalyzingCvi(false);
      });
    };

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        checkCviResult(base64);
      };
      reader.onerror = () => {
        setErrorMsg("Fejl under indlæsning af designmanualen.");
        setIsAnalyzingCvi(false);
        setCviFileName(null);
      };
      reader.readAsDataURL(file);
    } catch(err: any) {
      setErrorMsg(`Filfejl: ${err.message}`);
      setIsAnalyzingCvi(false);
      setCviFileName(null);
    }
  };

  const handleRemoveCvi = () => {
    setBrief(prev => ({
      ...prev,
      cviManual: null
    }));
    setCviFileName(null);
    setErrorMsg("Designmanualen er fjernet.");
  };

  // Handler to pin the current brief as a preset
  const handlePinCurrentBrief = () => {
    if (!brief.client.trim() || !brief.project.trim()) {
      setErrorMsg("Udfyld venligst mindst 'Kunde' og 'Projekt' for at pinne dette job.");
      return;
    }

    const name = `${brief.client} - ${brief.project}`;
    
    // Check if duplicate project name exists in our custom presets
    const exists = customPresets.some(p => p.brief.project.toLowerCase() === brief.project.toLowerCase() && p.brief.client.toLowerCase() === brief.client.toLowerCase());
    if (exists) {
      setErrorMsg("Et job med denne kunde og dette projekt-navn er allerede pined i dine presets.");
      return;
    }

    const newPreset: PresetBrief = {
      name,
      brief: { ...brief }
    };

    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('brand_surface_presets', JSON.stringify(updated));
    setErrorMsg(`Jobbet "${name}" er blevet pined til genveje!`);
  };

  // Sync activeTab to default selectedTextKey
  useEffect(() => {
    if (activeTab === 'case') {
      setSelectedTextKey('shortCaseText');
    } else if (activeTab === 'linkedin') {
      setSelectedTextKey('linkedinPost');
    } else if (activeTab === 'newsletter') {
      setSelectedTextKey('newsletterSection'); // or we edit subject lines differently
    } else if (activeTab === 'english') {
      setSelectedTextKey('englishShortCaseText');
    }
  }, [activeTab]);

  const handleBriefChange = (field: keyof ProjectBrief, value: any) => {
    setBrief(prev => ({ ...prev, [field]: value }));
  };

  const handleChannelToggle = (channel: string) => {
    setBrief(prev => {
      const current = prev.channels;
      if (current.includes(channel)) {
        return { ...prev, channels: current.filter(c => c !== channel) };
      } else {
        return { ...prev, channels: [...current, channel] };
      }
    });
  };

  const handleLoadPreset = (preset: PresetBrief) => {
    setBrief({ ...preset.brief });
    if (preset.brief.cviManual) {
      setCviFileName("Aktive CVI retningslinjer");
    } else {
      setCviFileName(null);
    }
    setErrorMsg(null);
  };

  // Helper to copy text to clipboard
  const handleCopyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }).catch(err => {
      console.warn("Kopiering mislykkedes, fallback:", err);
    });
  };

  // Helper to trigger window print for a specific content mode (and temporarily filter the printable view)
  const handleExportSingleSection = (mode: 'all' | 'cvi' | 'case') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
      // Restore back to default all-view after print window triggers
      setTimeout(() => {
        setPrintMode('all');
      }, 1000);
    }, 150);
  };

  // Export the full content package as Markdown (download or clipboard)
  const handleExportMarkdown = () => {
    if (!output) return;
    const md = buildMarkdown(output, brief);
    downloadTextFile(`${slugify(brief.client || 'brand-surface')}-case.md`, md);
  };

  const handleCopyAllMarkdown = () => {
    if (!output) return;
    handleCopyToClipboard(buildMarkdown(output, brief), 'export_all_md');
  };

  const handleExportHtml = () => {
    if (!output) return;
    downloadHtmlFile(output, brief);
  };

  const handleExportDocx = async () => {
    if (!output) return;
    try {
      await downloadDocx(`${slugify(brief.client || 'brand-surface')}-case.docx`, output, brief);
    } catch (e: any) {
      setErrorMsg(e.message || 'Kunne ikke generere Word-dokument.');
    }
  };

  // Reload a previous generation from the local history
  const handleLoadHistory = (item: HistoryItem) => {
    setBrief(item.brief);
    setOutput(item.output);
    setRevisions({
      shortCaseText: [item.output.shortCaseText],
      longCaseText: [item.output.longCaseText],
      linkedinPost: [item.output.linkedinPost],
      creativeNewsletterSection: item.output.production?.newsletterSection
        ? [item.output.production.newsletterSection]
        : []
    });
    setActiveCompareIndex({ shortCaseText: null, longCaseText: null, linkedinPost: null, creativeNewsletterSection: null });
    setRefinementHistory([]);
    setCviFileName(item.brief.cviManual ? 'Aktive CVI retningslinjer' : null);
    setActiveTab('case');
    setErrorMsg(null);
  };

  const handleClearHistory = () => {
    setHistory(clearHistory());
  };

  // A/B variants for the main text blocks
  const resolveMainText = (key: string): string => {
    if (!output) return '';
    if (key === 'shortCaseText') return output.shortCaseText;
    if (key === 'longCaseText') return output.longCaseText;
    if (key === 'linkedinPost') return output.linkedinPost;
    return '';
  };

  const handleGenerateVariants = async (targetKey: string) => {
    const text = resolveMainText(targetKey);
    if (!text) return;
    setIsVariating(true);
    setErrorMsg(null);
    setVariants({ key: targetKey, options: [] });
    try {
      const res = await fetch('/api/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, count: 2, brief })
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(httpErrorMessage(res.status, e.error));
      }
      const data = await res.json();
      setVariants({ key: targetKey, options: data.variants || [] });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Kunne ikke generere varianter.');
      setVariants(null);
    } finally {
      setIsVariating(false);
    }
  };

  const handleApplyVariant = (targetKey: string, value: string) => {
    const original = resolveMainText(targetKey);
    setRefinementHistory(prev => [...prev, { key: targetKey, original }]);
    setRevisions(prev => {
      const list = [...(prev[targetKey] || [])];
      if (list.length === 0) list.push(original);
      if (list[list.length - 1] !== value) list.push(value);
      return { ...prev, [targetKey]: list };
    });
    setActiveCompareIndex(prev => ({ ...prev, [targetKey]: null }));
    setOutput(prev => {
      if (!prev) return null;
      const u: BrandSurfaceOutput = { ...prev };
      if (targetKey === 'shortCaseText') u.shortCaseText = value;
      else if (targetKey === 'longCaseText') u.longCaseText = value;
      else if (targetKey === 'linkedinPost') u.linkedinPost = value;
      if (targetKey === 'shortCaseText' && u.directUsable) {
        u.directUsable = { ...u.directUsable, bestShortText: value };
      }
      return u;
    });
    setVariants(null);
  };

  const renderVariants = (targetKey: string) => {
    if (!variants || variants.key !== targetKey) return null;
    return (
      <div className="mt-3 bg-slate-950/80 rounded-xl p-4 border border-amber-800/40 space-y-2 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-500 font-bold">A/B Varianter</span>
          <button onClick={() => setVariants(null)} className="text-[11px] text-slate-500 hover:text-white font-mono">Luk</button>
        </div>
        {isVariating && variants.options.length === 0 && (
          <div className="text-[11px] text-slate-400 flex items-center space-x-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Genererer varianter...</span>
          </div>
        )}
        {variants.options.map((opt, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <div className="text-[11px] font-mono text-slate-500 uppercase mb-1">Variant {String.fromCharCode(65 + i)}</div>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{opt}</p>
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => handleApplyVariant(targetKey, opt)}
                className="px-2 py-1 text-[11px] bg-brand-orange-600/20 text-brand-orange-400 border border-brand-orange-500/30 rounded hover:bg-brand-orange-600/30 font-mono"
              >
                Brug denne
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Run the whole generator
  const handleGenerateAll = async () => {
    if (!brief.client || !brief.project || !brief.description) {
      setErrorMsg("Udfyld venligst mindst Kunde, Projekt og Hvad lavede vi for at køre Content Machine.");
      return;
    }

    // Dyb tilstand: kør det fulde redaktionsmøde (multi-AI deliberation) i stedet.
    if (deepMode) {
      return handleGenerateDeep();
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setRefinementHistory([]);
    setDeepCritique(null);

    // Simulate smart step updates for rich UX
    const steps = [
      "Analyserer projekt-brief...",
      "Udtrækker nøgleleverancer...",
      "Udelukker generiske marketing-floskler...",
      "Bygger kort og lang case-tekst...",
      "Skriver professionelt LinkedIn opslag...",
      "Formulerer fængende Mailchimp subject lines...",
      "Designer målrettede AI-billedprompts...",
      "Sammensætter tekniske produktionsforslag...",
      "Færdiggør den engelske oversættelse..."
    ];

    let currentStep = 0;
    setGenerationStep(steps[0]);
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setGenerationStep(steps[currentStep]);
      }
    }, 800);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }

      const data: BrandSurfaceOutput = await response.json();
      setOutput(data);
      setHistory(prev => pushHistory(prev, brief, data));
      if (data) {
        setRevisions({
          shortCaseText: [data.shortCaseText],
          longCaseText: [data.longCaseText],
          linkedinPost: [data.linkedinPost],
          creativeNewsletterSection: data.production?.newsletterSection ? [data.production.newsletterSection] : []
        });
        setActiveCompareIndex({
          shortCaseText: null,
          longCaseText: null,
          linkedinPost: null,
          creativeNewsletterSection: null
        });
      }
      setActiveTab('case');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Der skete en fejl under AI-genereringen.');
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  // Dyb tilstand: multi-AI "redaktionsmøde" via SSE (udkast → kritik → kreativ → syntese → verificér)
  const handleGenerateDeep = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setRefinementHistory([]);
    setDeepCritique(null);
    setGenerationStep('Starter redaktionsmøde …');

    try {
      const response = await fetch('/api/generate-deep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief })
      });

      if (!response.ok || !response.body) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }

      // Consume the SSE stream: phase events update the button label; the final event carries the result.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamErr: string | null = null;
      let finalEvt: any = null;

      while (true) {
        const { value, done: rdDone } = await reader.read();
        if (rdDone) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for (const part of parts) {
          const dataLine = part.split('\n').find(l => l.startsWith('data: '));
          const isErrEvent = part.includes('event: error');
          if (!dataLine) continue;
          const payload = dataLine.slice(6);
          if (payload === '[DONE]') continue;
          try {
            const evt = JSON.parse(payload);
            if (isErrEvent && evt.error) {
              streamErr = evt.error;
            } else if (evt.done && evt.output) {
              finalEvt = evt;
            } else if (evt.phase && typeof evt.label === 'string') {
              setGenerationStep(evt.label);
            }
          } catch {
            /* ignorér ukomplette/uventede linjer */
          }
        }
      }

      if (streamErr) throw new Error(streamErr);
      if (!finalEvt || !finalEvt.output) {
        throw new Error('Redaktionsmødet returnerede intet resultat.');
      }

      const data: BrandSurfaceOutput = finalEvt.output;
      const draft: BrandSurfaceOutput = finalEvt.draft || data;
      setOutput(data);
      setHistory(prev => pushHistory(prev, brief, data));

      // Seed revisions med udkast (Første) → endelig (Nyeste), så sammenligningen viser udviklingen.
      const seed = (a?: string, b?: string): string[] =>
        a && b && a !== b ? [a, b] : b ? [b] : a ? [a] : [];
      setRevisions({
        shortCaseText: seed(draft.shortCaseText, data.shortCaseText),
        longCaseText: seed(draft.longCaseText, data.longCaseText),
        linkedinPost: seed(draft.linkedinPost, data.linkedinPost),
        creativeNewsletterSection: data.production?.newsletterSection ? [data.production.newsletterSection] : []
      });
      setActiveCompareIndex({
        shortCaseText: null,
        longCaseText: null,
        linkedinPost: null,
        creativeNewsletterSection: null
      });

      if (finalEvt.critiqueBefore) {
        setDeepCritique({
          before: finalEvt.critiqueBefore,
          after: finalEvt.critiqueAfter ?? null,
          earlyStopped: !!finalEvt.earlyStopped,
          synthesisTruncated: !!finalEvt.synthesisTruncated
        });
      }
      setActiveTab('case');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Der skete en fejl under redaktionsmødet.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Visuel redaktion: art direction-deliberation via SSE (kun visuelle/billed-idéer)
  const handleVisualDevelop = async () => {
    setIsVisualDeveloping(true);
    setErrorMsg(null);
    setVisualResult(null);
    setGenerationStep('Starter visuel udvikling …');

    try {
      const response = await fetch('/api/visual-deep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief })
      });

      if (!response.ok || !response.body) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamErr: string | null = null;
      let finalEvt: any = null;

      while (true) {
        const { value, done: rdDone } = await reader.read();
        if (rdDone) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for (const part of parts) {
          const dataLine = part.split('\n').find(l => l.startsWith('data: '));
          const isErrEvent = part.includes('event: error');
          if (!dataLine) continue;
          const payload = dataLine.slice(6);
          if (payload === '[DONE]') continue;
          try {
            const evt = JSON.parse(payload);
            if (isErrEvent && evt.error) {
              streamErr = evt.error;
            } else if (evt.done && evt.output) {
              finalEvt = evt;
            } else if (evt.phase && typeof evt.label === 'string') {
              setGenerationStep(evt.label);
            }
          } catch {
            /* ignorér ukomplette linjer */
          }
        }
      }

      if (streamErr) throw new Error(streamErr);
      if (!finalEvt || !finalEvt.output) {
        throw new Error('Den visuelle redaktion returnerede intet resultat.');
      }

      setVisualResult({
        concept: finalEvt.output,
        critiqueBefore: finalEvt.critiqueBefore,
        critiqueAfter: finalEvt.critiqueAfter ?? null,
        earlyStopped: !!finalEvt.earlyStopped,
        synthesisTruncated: !!finalEvt.synthesisTruncated
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Der skete en fejl under den visuelle udvikling.');
    } finally {
      setIsVisualDeveloping(false);
    }
  };

  const handleTriggerAnalysis = async () => {
    if (!output) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: {
            shortCaseText: output.shortCaseText,
            longCaseText: output.longCaseText,
            linkedinPost: output.linkedinPost
          },
          brief
        })
      });

      if (!response.ok) {
        throw new Error(httpErrorMessage(response.status));
      }

      const analysisData = await response.json();
      setOutput(prev => {
        if (!prev) return null;
        return {
          ...prev,
          toneAnalysis: analysisData
        };
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Kunne ikke gennemføre toneanalysen.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleHumanizeText = async () => {
    if (!externalText || !externalText.trim()) {
      setErrorMsg("Indtast eller indsæt venligst en tekst først.");
      return;
    }
    setIsHumanizing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: externalText })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }

      const resData = await response.json();
      setHumanizerResult(resData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Kunne ikke gennemføre humanisering og AI-detektions bypass.');
    } finally {
      setIsHumanizing(false);
    }
  };

  // Local Refinement
  const handleRefine = async (command: string, targetKey: string) => {
    if (!output) return;

    // Resolve what text we are sending
    let textToRefine = "";
    let isEnglishObj = false;
    let isProductionObj = false;

    if (targetKey === 'shortCaseText') textToRefine = output.shortCaseText;
    else if (targetKey === 'longCaseText') textToRefine = output.longCaseText;
    else if (targetKey === 'linkedinPost') textToRefine = output.linkedinPost;
    else if (targetKey === 'englishShortCaseText') {
      textToRefine = output.english?.shortCaseText || "";
      isEnglishObj = true;
    }
    else if (targetKey === 'englishLongCaseText') {
      textToRefine = output.english?.longCaseText || "";
      isEnglishObj = true;
    }
    else if (targetKey === 'englishLinkedinPost') {
      textToRefine = output.english?.linkedinPost || "";
      isEnglishObj = true;
    }
    else if (targetKey === 'creativeHeroVisual') {
      textToRefine = output.production?.heroVisual || "";
      isProductionObj = true;
    }
    else if (targetKey === 'creativeSomeFormat') {
      textToRefine = output.production?.someFormat || "";
      isProductionObj = true;
    }
    else if (targetKey === 'creativeNewsletterSection') {
      textToRefine = output.production?.newsletterSection || "";
      isProductionObj = true;
    }

    if (!textToRefine) {
      setErrorMsg("Kunne ikke finde tekst at raffinere for denne sektion.");
      return;
    }

    setIsRefining(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToRefine,
          command,
          brief
        })
      });

      if (!response.ok || !response.body) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }

      // Live-update helper: skriv den streamede tekst ind i det rigtige output-felt
      const applyLiveText = (value: string) => {
        setOutput(prev => {
          if (!prev) return null;
          const u: BrandSurfaceOutput = {
            ...prev,
            english: prev.english ? { ...prev.english } : prev.english,
            production: prev.production ? { ...prev.production } : prev.production,
            directUsable: prev.directUsable ? { ...prev.directUsable } : prev.directUsable,
          };
          if (targetKey === 'shortCaseText') u.shortCaseText = value;
          else if (targetKey === 'longCaseText') u.longCaseText = value;
          else if (targetKey === 'linkedinPost') u.linkedinPost = value;
          else if (isEnglishObj && u.english) {
            if (targetKey === 'englishShortCaseText') u.english.shortCaseText = value;
            if (targetKey === 'englishLongCaseText') u.english.longCaseText = value;
            if (targetKey === 'englishLinkedinPost') u.english.linkedinPost = value;
          } else if (isProductionObj && u.production) {
            if (targetKey === 'creativeHeroVisual') u.production.heroVisual = value;
            if (targetKey === 'creativeSomeFormat') u.production.someFormat = value;
            if (targetKey === 'creativeNewsletterSection') u.production.newsletterSection = value;
          }
          if (targetKey === 'shortCaseText' && u.directUsable) u.directUsable.bestShortText = value;
          return u;
        });
      };

      // Consume the Server-Sent Events stream from /api/refine
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let acc = '';
      let streamErr: string | null = null;

      while (true) {
        const { value, done: rdDone } = await reader.read();
        if (rdDone) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for (const part of parts) {
          const dataLine = part.split('\n').find(l => l.startsWith('data: '));
          const isErrEvent = part.includes('event: error');
          if (!dataLine) continue;
          const payload = dataLine.slice(6);
          if (payload === '[DONE]') continue;
          try {
            const evt = JSON.parse(payload);
            if (isErrEvent && evt.error) {
              streamErr = evt.error;
            } else if (typeof evt.delta === 'string') {
              acc += evt.delta;
              applyLiveText(acc);
            } else if (evt.done && typeof evt.refinedText === 'string') {
              acc = evt.refinedText;
            }
          } catch {
            /* ignorér ukomplette/uventede linjer */
          }
        }
      }

      if (streamErr) throw new Error(streamErr);
      const refinedText = (acc || textToRefine).trim();

      // Store history for UNDO ability
      setRefinementHistory(prev => [...prev, { key: targetKey, original: textToRefine }]);

      // Update the revisions timeline state
      setRevisions(prev => {
        const currentList = prev[targetKey] || [];
        const updatedList = [...currentList];

        // Ensure the original structure is initialized if it's empty
        if (updatedList.length === 0) {
          updatedList.push(textToRefine);
        }

        // Only append if it's a new unique revision step
        if (updatedList[updatedList.length - 1] !== refinedText) {
          updatedList.push(refinedText);
        }

        return {
          ...prev,
          [targetKey]: updatedList
        };
      });

      // Clear the revision comparison selection for this target key, as we are now viewing the newest active text
      setActiveCompareIndex(prev => ({
        ...prev,
        [targetKey]: null
      }));

      // Update output state safely
      setOutput(prev => {
        if (!prev) return null;
        const updated = { ...prev };

        if (targetKey === 'shortCaseText') updated.shortCaseText = refinedText;
        else if (targetKey === 'longCaseText') updated.longCaseText = refinedText;
        else if (targetKey === 'linkedinPost') updated.linkedinPost = refinedText;
        else if (isEnglishObj && updated.english) {
          if (targetKey === 'englishShortCaseText') updated.english.shortCaseText = refinedText;
          if (targetKey === 'englishLongCaseText') updated.english.longCaseText = refinedText;
          if (targetKey === 'englishLinkedinPost') updated.english.linkedinPost = refinedText;
        }
        else if (isProductionObj && updated.production) {
          if (targetKey === 'creativeHeroVisual') updated.production.heroVisual = refinedText;
          if (targetKey === 'creativeSomeFormat') updated.production.someFormat = refinedText;
          if (targetKey === 'creativeNewsletterSection') updated.production.newsletterSection = refinedText;
        }

        // Also update direct usable best matches if we refine their core text
        if (targetKey === 'shortCaseText' && updated.directUsable) {
          updated.directUsable.bestShortText = refinedText;
        }

        return updated;
      });

      setCustomRefinementPrompt('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Der opstod en fejl under raffinering af teksten.');
    } finally {
      setIsRefining(false);
    }
  };

  // Undo last refine
  const handleUndoRefine = (targetKey: string) => {
    const historicalItem = [...refinementHistory].reverse().find(h => h.key === targetKey);
    if (!historicalItem) return;

    setOutput(prev => {
      if (!prev) return null;
      const updated = { ...prev };

      if (targetKey === 'shortCaseText') updated.shortCaseText = historicalItem.original;
      else if (targetKey === 'longCaseText') updated.longCaseText = historicalItem.original;
      else if (targetKey === 'linkedinPost') updated.linkedinPost = historicalItem.original;
      else if (targetKey === 'englishShortCaseText' && updated.english) updated.english.shortCaseText = historicalItem.original;
      else if (targetKey === 'englishLongCaseText' && updated.english) updated.english.longCaseText = historicalItem.original;
      else if (targetKey === 'englishLinkedinPost' && updated.english) updated.english.linkedinPost = historicalItem.original;
      else if (targetKey === 'creativeHeroVisual' && updated.production) updated.production.heroVisual = historicalItem.original;
      else if (targetKey === 'creativeSomeFormat' && updated.production) updated.production.someFormat = historicalItem.original;
      else if (targetKey === 'creativeNewsletterSection' && updated.production) updated.production.newsletterSection = historicalItem.original;

      if (targetKey === 'shortCaseText' && updated.directUsable) {
        updated.directUsable.bestShortText = historicalItem.original;
      }

      return updated;
    });

    // Remove from history
    setRefinementHistory(prev => {
      const idx = prev.findIndex(h => h.key === targetKey && h.original === historicalItem.original);
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return prev;
    });
  };

  // Generate actual image via express API using the configured image provider (default: Flux/fal.ai)
  const handleGenerateImage = async (key: 'hero' | 'detail' | 'abstract', promptText: string) => {
    setGeneratedImages(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        loading: true,
        error: null
      }
    }));

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          aspectRatio: generatedImages[key]?.aspectRatio || '16:9'
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }

      const data = await response.json();
      if (!data.imageUrl) {
        throw new Error('Forkert svar-format fra API.');
      }

      setGeneratedImages(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          url: data.imageUrl,
          loading: false,
          error: null
        }
      }));
    } catch (err: any) {
      console.error("Fejl i handleGenerateImage:", err);
      setGeneratedImages(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          loading: false,
          error: err.message || 'Der opstod en uventet fejl under billedgenereringen.'
        }
      }));
    }
  };

  const handleAspectChange = (key: 'hero' | 'detail' | 'abstract', ratio: string) => {
    setGeneratedImages(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        aspectRatio: ratio
      }
    }));
  };

  // Helper to render revision selector and split-screen comparison
  const renderRevisionSelector = (targetKey: string, activeValue: string) => {
    const revs = revisions[targetKey] || [];
    if (revs.length <= 1) return null;

    const activeCompareIdx = activeCompareIndex[targetKey];
    const currentRevisionCount = revs.length;

    return (
      <div className="mt-3 bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 text-xs text-slate-350 space-y-3 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              AI-Raffinering Historik & Sammenligning ({currentRevisionCount - 1} omskrivninger)
            </span>
          </div>
          {activeCompareIdx !== null && (
            <button
              type="button"
              onClick={() => {
                setActiveCompareIndex(prev => ({ ...prev, [targetKey]: null }));
              }}
              className="text-[11px] text-brand-orange-500 hover:text-brand-orange-400 font-medium font-mono cursor-pointer"
            >
              [Luk Sammenligning]
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/40">
          {/* Version badge selectors */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-mono">Udgaver:</span>
            {revs.map((revText, index) => {
              const isCurrent = index === revs.length - 1;
              const isSelected = activeCompareIdx === index || (activeCompareIdx === null && isCurrent);
              let label = index === 0 ? "Første" : `#${index}`;
              if (isCurrent) label += " (Nyeste)";

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setActiveCompareIndex(prev => ({
                      ...prev,
                      [targetKey]: isCurrent ? null : index
                    }));
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-orange-500/20 text-brand-orange-400 border border-brand-orange-500/40 font-semibold'
                      : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                  title={isCurrent ? "Aktivt og nyeste omskrevne udkast" : `Omskrivning #${index}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Range Slider for stepping through chronological versions */}
          {revs.length > 2 && (
            <div className="flex items-center space-x-2.5 flex-1 max-w-[180px] sm:ml-auto">
              <span className="text-[11px] text-slate-500 font-mono shrink-0">Hurtig-slider:</span>
              <input
                type="range"
                min="0"
                max={revs.length - 1}
                value={activeCompareIdx !== null ? activeCompareIdx : revs.length - 1}
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  setActiveCompareIndex(prev => ({
                    ...prev,
                    [targetKey]: idx === revs.length - 1 ? null : idx
                  }));
                }}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: '#ff5400' }}
              />
            </div>
          )}
        </div>

        {/* Diff comparison box */}
        {activeCompareIdx !== null && revs[activeCompareIdx] !== undefined && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 mt-1 border-t border-slate-900">
            {/* Version selected visually */}
            <div className="p-3.5 bg-slate-900/90 rounded-lg border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono uppercase text-amber-500 font-bold">
                  <span>HISTORISK UDGAVE: {activeCompareIdx === 0 ? "FØRSTE GENERERING" : `RAF-UDSKRIFT #${activeCompareIdx}`}</span>
                  <span className="bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px] border border-amber-500/25">Revision Arkiv</span>
                </div>
                <div className="text-[11px] text-slate-350 leading-relaxed italic whitespace-pre-wrap mt-2 overflow-y-auto max-h-[160px] font-sans">
                  "{revs[activeCompareIdx]}"
                </div>
              </div>
              <div className="pt-3 border-t border-slate-850/60 mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const selectedText = revs[activeCompareIdx];
                    
                    // Backup active manual edit in the revisions list if it is not already there
                    setRevisions(prev => {
                      const currentList = prev[targetKey] || [];
                      const updatedList = [...currentList];
                      if (!updatedList.includes(activeValue)) {
                        updatedList.push(activeValue);
                      }
                      // Also move the restored one to the top as a new revision step
                      updatedList.push(selectedText);
                      return { ...prev, [targetKey]: updatedList };
                    });

                    // Set as primary active editor text
                    setOutput(prev => {
                      if (!prev) return null;
                      const updated = { ...prev };
                      if (targetKey === 'shortCaseText') updated.shortCaseText = selectedText;
                      else if (targetKey === 'longCaseText') updated.longCaseText = selectedText;
                      else if (targetKey === 'linkedinPost') updated.linkedinPost = selectedText;
                      else if (targetKey === 'creativeNewsletterSection' && updated.production) {
                        updated.production.newsletterSection = selectedText;
                      }
                      return updated;
                    });

                    setActiveCompareIndex(prev => ({ ...prev, [targetKey]: null }));
                    setErrorMsg(`Gendannede udgave "${activeCompareIdx === 0 ? 'Første' : `Ref #${activeCompareIdx}`}" som aktiv tekst til redigering.`);
                  }}
                  className="px-3 py-1.5 bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold font-sans rounded text-[11px] transition-all cursor-pointer shadow-md tracking-wide"
                >
                  Gør denne udgave aktiv
                </button>
              </div>
            </div>

            {/* Current active text */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono uppercase text-emerald-400 font-bold">
                  <span>NUVÆRENDE AKTIVE UDGAVE INKL. EVENTUELLE MANUELLE RETTELSER</span>
                  <span className="bg-emerald-500/15 px-1.5 py-0.5 rounded text-[11px] border border-emerald-500/25 font-semibold">Aktiv nu</span>
                </div>
                <div className="text-[11px] text-slate-200 leading-relaxed whitespace-pre-wrap mt-2 overflow-y-auto max-h-[160px] font-sans">
                  "{activeValue || '(Tom tekst)'}"
                </div>
              </div>
              <div className="pt-3 border-t border-slate-905 mt-4 text-right text-[11px] font-mono text-slate-500">
                Låst til midlertidig sammenligning
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Unified Terminal CLI command simulator
  const handleExecuteTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalCommand.trim()) return;

    const cmd = terminalCommand.trim().toLowerCase();
    setTerminalCommand('');

    // Toggle tabs using / slash commands
    if (cmd === '/case') {
      setActiveTab('case');
    } else if (cmd === '/linkedin') {
      setActiveTab('linkedin');
    } else if (cmd === '/newsletter') {
      setActiveTab('newsletter');
    } else if (cmd === '/headlines') {
      setActiveTab('headlines');
    } else if (cmd === '/keywords') {
      setActiveTab('keywords');
    } else if (cmd === '/prompts') {
      setActiveTab('prompts');
    } else if (cmd === '/english') {
      setActiveTab('english');
    } else if (cmd === '/cvi') {
      setActiveTab('cvi');
    } else if (cmd === '/production' || cmd === '/produktionsforslag') {
      setActiveTab('production');
    } else if (cmd === '/run' || cmd === '/generate') {
      handleGenerateAll();
    } 
    // Refinement commands applied to active selected key
    else if (cmd === '/shorten') {
      handleRefine('/shorten', selectedTextKey);
    } else if (cmd === '/more-human') {
      handleRefine('/more-human', selectedTextKey);
    } else if (cmd === '/more-business') {
      handleRefine('/more-business', selectedTextKey);
    } 
    // Custom instruction
    else if (cmd.startsWith('/') && cmd.length > 2) {
      handleRefine(terminalCommand, selectedTextKey);
    } else {
      // Treat as a direct custom edit prompt
      handleRefine(terminalCommand, selectedTextKey);
    }
  };

  // Helper to check if history exists for a specific key
  const hasHistory = (key: string) => refinementHistory.some(h => h.key === key);

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
      <header id="header_section" className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-brand-orange-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Content Machine
            </span>
            <div className="flex items-center text-[11px] text-slate-500 font-mono mt-0.5">
              <span>v1.5.2</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-6">
          {/* THEME TOGGLER */}
          <button
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 text-slate-350 hover:text-white transition-all text-[11px] font-mono font-medium cursor-pointer active:scale-95"
            title={theme === 'dark' ? "Skift til lyst tema (høj kontrast)" : "Skift til mørkt tema"}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">LYST TEMA</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">MØRKT TEMA</span>
              </>
            )}
          </button>

          <div className="hidden md:flex items-center text-xs bg-slate-850 px-3 py-1.5 rounded-md border border-slate-800 text-slate-350">
            <span>Tone: Autentisk & Konkret</span>
          </div>
          <a
            href="https://www.larssohl.dk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orange-400 hover:text-orange-300 font-mono transition-colors tracking-wide"
          >
            larssohl.dk &rarr;
          </a>
        </div>
      </header>

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
           errorMsg={errorMsg}
           generationStep={generationStep}
         />

        {/* RIGHT COLUMN: PREVIEW & OUTPUT INTERACTION WORKSPACE (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-5">
          
          {/* TOOLBAR / QUICK COMMANDS */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
              <span className="flex items-center space-x-2 font-medium text-slate-300">
                <Sliders className="w-4 h-4 text-slate-500" />
                <span>Værktøjslinje</span>
              </span>
              <span className="text-[11px] text-slate-500" title="Skriv en kommando eller navigér mellem faner">Navigér & forfin</span>
            </div>
            
            <form onSubmit={handleExecuteTerminalCommand} className="flex items-center p-2 bg-slate-900">
              <input
                type="text"
                id="terminal_input"
                value={terminalCommand}
                onChange={(e) => setTerminalCommand(e.target.value)}
                placeholder="Skriv kommando (f.eks. /case, /shorten, /more-human) eller brug knapperne herunder…"
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-xs font-mono text-white placeholder:text-slate-600 px-3 py-1.5"
              />
              <button
                type="submit"
                className="mr-1 p-1 px-3 text-[11px] font-mono bg-slate-800 text-slate-300 hover:text-white rounded-md border border-slate-700 transition-colors"
              >
                Kør
              </button>
            </form>

            {/* Quick buttons bar */}
            <div className="bg-slate-950 border-t border-slate-800 px-3 py-2.5 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-slate-500 mr-1">Gå til:</span>
              {[
                { label: "/case", tab: "case" },
                { label: "/linkedin", tab: "linkedin" },
                { label: "/newsletter", tab: "newsletter" },
                { label: "/headlines", tab: "headlines" },
                { label: "/keywords", tab: "keywords" },
                { label: "/prompts", tab: "prompts" },
                { label: "/english", tab: "english" },
                { label: "/cvi", tab: "cvi" },
                { label: "/production", tab: "production" }
              ].map(c => (
                <button
                  key={c.label}
                  type="button"
                  id={`cmd_btn_${c.tab}`}
                  onClick={() => {
                    if (output) setActiveTab(c.tab);
                    else setErrorMsg("Kør venligst maskinen først for at navigere.");
                  }}
                  className={`px-2 py-1 text-[11px] font-mono rounded-md border transition-all ${
                    activeTab === c.tab && output
                      ? 'bg-orange-500/10 border-orange-500/50 text-orange-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

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
              {' '}&amp; Claude Anthropic &copy; 2026 &middot; v1.5.2
            </span>
            <span>Konkret. Autentisk. Kreativt.</span>
          </div>

        </div>

      </main>
      </div> {/* End of print:hidden screen wrapper */}


      {/* 🖨️ PREMIUM DIGITAL BRAND REVISION RAPPORT / PDF PRINT LAYOUT */}
      <PrintView output={output} brief={brief} printMode={printMode} generatedImages={generatedImages} />

    </div>
  );
}
