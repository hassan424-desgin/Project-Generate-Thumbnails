import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Upload, 
  Youtube, 
  Facebook, 
  Briefcase, 
  Download, 
  RefreshCcw, 
  Sparkles,
  Image as ImageIcon,
  Type,
  Palette,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'fiverr', name: 'Fiverr', icon: Briefcase, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
];

const STYLES = [
  { id: 'vibrant', name: 'Vibrant & Bold', description: 'High contrast, saturated colors' },
  { id: 'minimalist', name: 'Minimalist', description: 'Clean, simple, focused' },
  { id: 'professional', name: 'Professional', description: 'Corporate, clean, trustworthy' },
  { id: 'gaming', name: 'Gaming', description: 'Dark, neon, high energy' },
];

export default function App() {
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0].id);
  const [topic, setTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateThumbnail = async () => {
    if (!image) {
      setError('Please upload an image first.');
      return;
    }
    if (!topic) {
      setError('Please enter a topic or title.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Extract base64 data and mime type
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const platformName = PLATFORMS.find(p => p.id === selectedPlatform)?.name;
      const styleName = STYLES.find(s => s.id === selectedStyle)?.name;

      const prompt = `Create a professional, high-click-through-rate (CTR) video thumbnail for ${platformName}. 
      The topic is: "${topic}". 
      The style should be: ${styleName}.
      Use the provided image as the main subject/focal point. 
      Add bold, readable text that summarizes the topic. 
      Include eye-catching graphics, vibrant colors, and professional lighting effects. 
      Make it look like a top-tier ${platformName} thumbnail.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setGeneratedImage(`data:image/png;base64,${base64EncodeString}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error('No image was generated. Please try again.');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate thumbnail. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `thumbnail-${selectedPlatform}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Thumbnail Pro AI</h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
            <span>Powered by Gemini</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Controls */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              {/* Platform Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map((platform) => {
                    const Icon = platform.icon;
                    const isActive = selectedPlatform === platform.id;
                    return (
                      <button
                        key={platform.id}
                        onClick={() => setSelectedPlatform(platform.id)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200",
                          isActive 
                            ? cn("border-blue-600 bg-blue-50 shadow-sm", platform.color)
                            : "border-gray-100 hover:border-gray-200 text-gray-500"
                        )}
                      >
                        <Icon className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-bold uppercase">{platform.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic Input */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Type className="w-3 h-3" /> Video Topic / Title
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 10 Life Hacks for Developers"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-24 text-sm"
                />
              </div>

              {/* Style Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Palette className="w-3 h-3" /> Visual Style
                </label>
                <div className="space-y-2">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border transition-all duration-200 group",
                        selectedStyle === style.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-sm font-semibold",
                          selectedStyle === style.id ? "text-blue-600" : "text-gray-700"
                        )}>
                          {style.name}
                        </span>
                        {selectedStyle === style.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{style.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateThumbnail}
                disabled={isGenerating || !image || !topic}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                  isGenerating || !image || !topic
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98]"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Thumbnail
                  </>
                )}
              </button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                  {error}
                </div>
              )}
            </section>
          </div>

          {/* Main Preview Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Preview Canvas</span>
                {generatedImage && (
                  <button 
                    onClick={downloadImage}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-3 h-3" /> Download
                  </button>
                )}
              </div>
              
              <div className="flex-1 p-8 flex flex-col items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                <AnimatePresence mode="wait">
                  {!image ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center space-y-4"
                    >
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 bg-white border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center mx-auto cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
                      >
                        <Upload className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-gray-700">Upload your image</p>
                        <p className="text-sm text-gray-400">Drag and drop or click to browse</p>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full max-w-2xl space-y-6"
                    >
                      <div className="relative group">
                        <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-2xl relative">
                          {isGenerating && (
                            <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest animate-pulse">Designing your thumbnail...</p>
                            </div>
                          )}
                          <img 
                            src={generatedImage || image} 
                            alt="Thumbnail" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        
                        {!isGenerating && (
                          <div className="absolute -top-3 -right-3 flex gap-2">
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="p-2 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors text-gray-600"
                              title="Change Image"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                            {generatedImage ? 'Generated Result' : 'Original Image'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tips Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'High Contrast', desc: 'Use vibrant styles for better visibility.' },
                { title: 'Readable Text', desc: 'Keep titles short and punchy.' },
                { title: 'Face Focus', desc: 'Upload clear photos for best results.' }
              ].map((tip, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border border-gray-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{tip.title}</h3>
                  <p className="text-xs text-gray-600">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}
