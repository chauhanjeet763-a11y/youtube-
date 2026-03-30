import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Video, 
  Sparkles, 
  ChevronRight, 
  Loader2, 
  Copy, 
  Check, 
  Download,
  AlertCircle,
  Play,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { 
  generateScript, 
  optimizeMetadata, 
  generateVideo, 
  getOperationStatus 
} from './services/geminiService';

// --- Types ---

type Tool = 'script' | 'metadata' | 'video';

interface ThumbnailConcept {
  layout: string;
  heroImage: string;
  textOverlay: string;
}

interface MetadataResult {
  titles: string[];
  thumbnailConcepts: ThumbnailConcept[];
  seoDescription: string;
  tags: string[];
}

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-white text-black shadow-sm" 
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
    )}
  >
    <Icon size={20} className={cn(active ? "text-black" : "text-gray-400 group-hover:text-gray-600")} />
    <span className="font-medium">{label}</span>
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="ml-auto"
      >
        <ChevronRight size={16} />
      </motion.div>
    )}
  </button>
);

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white border border-gray-200 rounded-2xl p-6 shadow-sm", className)}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  loading, 
  disabled, 
  variant = 'primary',
  className
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  loading?: boolean, 
  disabled?: boolean,
  variant?: 'primary' | 'secondary' | 'outline',
  className?: string
}) => {
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-200 text-gray-900 hover:bg-gray-50"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : children}
    </button>
  );
};

// --- Sections ---

const ScriptSection = () => {
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const result = await generateScript(topic);
      setScript(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText size={20} />
          Viral Scriptwriter
        </h2>
        <p className="text-gray-500 mb-6">
          Generate high-retention scripts for educational or infotainment videos.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video Topic</label>
            <input
              type="text"
              placeholder="e.g., The Future of AI in 2026"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerate} loading={loading} className="w-full">
            <Sparkles size={18} />
            Generate Script
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {script && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Generated Script</h3>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
              <div className="prose prose-sm max-w-none max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <ReactMarkdown>{script}</ReactMarkdown>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MetadataSection = () => {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<MetadataResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!description) return;
    setLoading(true);
    try {
      const data = await optimizeMetadata(description);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search size={20} />
          Metadata Optimizer
        </h2>
        <p className="text-gray-500 mb-6">
          Increase your CTR with optimized titles, thumbnails, and SEO descriptions.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video Description</label>
            <textarea
              placeholder="Describe what your video is about..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerate} loading={loading} className="w-full">
            <Sparkles size={18} />
            Optimize Metadata
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" />
                  High-CTR Titles
                </h3>
                <ul className="space-y-3">
                  {result.titles.map((title, i) => (
                    <li key={i} className="p-3 bg-blue-50 text-blue-900 rounded-lg text-sm border border-blue-100">
                      {title}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <LayoutDashboard size={18} className="text-purple-500" />
                  Thumbnail Concepts
                </h3>
                <div className="space-y-4">
                  {result.thumbnailConcepts.map((concept, i) => (
                    <div key={i} className="p-3 bg-purple-50 rounded-lg text-sm border border-purple-100">
                      <p className="font-medium text-purple-900 mb-1">Concept {i + 1}</p>
                      <p className="text-purple-700 text-xs"><span className="font-semibold">Hero:</span> {concept.heroImage}</p>
                      <p className="text-purple-700 text-xs"><span className="font-semibold">Text:</span> {concept.textOverlay}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card>
              <h3 className="font-semibold mb-4">SEO Description</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                {result.seoDescription}
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold mb-4">Key Tags</h3>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VideoSection = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setVideoUrl(null);
    setStatus('Initializing generation...');
    
    try {
      let operation = await generateVideo(prompt, aspectRatio);
      
      while (!operation.done) {
        setStatus('Generating video... this may take a few minutes.');
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await getOperationStatus(operation);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setStatus('Fetching video file...');
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.API_KEY || process.env.GEMINI_API_KEY || '',
          },
        });
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
        setStatus('');
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('Requested entity was not found')) {
        setHasKey(false);
        setStatus('API Key error. Please select your key again.');
      } else {
        setStatus('Error generating video. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasKey) {
    return (
      <Card className="text-center py-12">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold">API Key Required</h2>
          <p className="text-gray-500">
            To use the Veo video generation model, you must select a paid Google Cloud API key.
          </p>
          <div className="p-4 bg-gray-50 rounded-xl text-sm text-left">
            <p className="font-medium mb-2">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Click the button below to open the key selector.</li>
              <li>Select a key from a project with billing enabled.</li>
              <li>Ensure the project has the Gemini API enabled.</li>
            </ol>
          </div>
          <Button onClick={handleOpenKeyDialog} className="w-full">
            Select API Key
          </Button>
          <p className="text-xs text-gray-400">
            Learn more about <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline">Gemini API billing</a>.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Video size={20} />
          Veo Video Generator
        </h2>
        <p className="text-gray-500 mb-6">
          Generate high-fidelity cinematic video clips for your YouTube content.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visual Prompt</label>
            <textarea
              placeholder="e.g., A cinematic, wide-angle shot of a futuristic neon city during a rainstorm..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all min-h-[100px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
              >
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
              </select>
            </div>
          </div>
          <Button onClick={handleGenerate} loading={loading} className="w-full">
            <Play size={18} />
            Generate Video
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {(status || videoUrl) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="overflow-hidden p-0">
              {videoUrl ? (
                <div className="space-y-4 p-6">
                  <div className="aspect-video bg-black rounded-xl overflow-hidden relative group">
                    <video 
                      src={videoUrl} 
                      controls 
                      className="w-full h-full object-contain"
                      autoPlay
                      loop
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Generation Complete</p>
                    <a 
                      href={videoUrl} 
                      download="generated-video.mp4"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center space-y-4">
                  <Loader2 className="animate-spin mx-auto text-gray-400" size={48} />
                  <p className="text-lg font-medium">{status}</p>
                  <p className="text-sm text-gray-500">This can take up to 2-3 minutes. Please don't close the app.</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('script');

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Creator Studio AI</h1>
              <p className="text-xs text-gray-500 mt-1">Powered by Gemini & Veo</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-md">v1.0.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-2">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Tools</p>
            <SidebarItem 
              icon={FileText} 
              label="Viral Scriptwriter" 
              active={activeTool === 'script'} 
              onClick={() => setActiveTool('script')} 
            />
            <SidebarItem 
              icon={Search} 
              label="Metadata Optimizer" 
              active={activeTool === 'metadata'} 
              onClick={() => setActiveTool('metadata')} 
            />
            <SidebarItem 
              icon={Video} 
              label="Veo Video Generator" 
              active={activeTool === 'video'} 
              onClick={() => setActiveTool('video')} 
            />
          </aside>

          {/* Content */}
          <div className="min-h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTool}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTool === 'script' && <ScriptSection />}
                {activeTool === 'metadata' && <MetadataSection />}
                {activeTool === 'video' && <VideoSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-8 px-6 text-center text-gray-500 text-sm">
        <p>© 2026 Creator Studio AI. Built for YouTube Growth.</p>
      </footer>
    </div>
  );
}
