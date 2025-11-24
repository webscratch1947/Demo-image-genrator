import React, { useState } from 'react';
import { generateOrEditImage } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { AspectRatio, LoadingState } from './types';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoadingState({ status: 'loading' });
    setGeneratedImage(null);

    try {
      // Small artificial delay for UX so the user sees the transition
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = await generateOrEditImage(prompt, sourceImage, aspectRatio);
      setGeneratedImage(result);
      setLoadingState({ status: 'success' });
    } catch (error: any) {
      setLoadingState({ 
        status: 'error', 
        message: error.message || "An unexpected error occurred." 
      });
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `nanogen-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              NanoGen
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-medium text-indigo-400">
                Powered by Gemini 2.5 Flash
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Intro Text */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Create & Edit</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate stunning visuals from text, or upload an image and use a prompt to edit it magically.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
              
              {/* Image Uploader */}
              <ImageUploader 
                selectedImage={sourceImage} 
                onImageSelect={setSourceImage}
                disabled={loadingState.status === 'loading'}
              />

              {/* Aspect Ratio (Only show for pure generation or if model supports it during edit - we leave it available) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400">
                  Aspect Ratio
                </label>
                <AspectRatioSelector 
                  selected={aspectRatio} 
                  onChange={setAspectRatio}
                  disabled={loadingState.status === 'loading'}
                />
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <label htmlFor="prompt" className="block text-sm font-medium text-slate-400">
                  {sourceImage ? 'Editing Prompt' : 'Creation Prompt'}
                </label>
                <div className="relative">
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={sourceImage ? "e.g., Make it look like a cyberpunk city, add neon lights..." : "e.g., A futuristic robot playing chess in a park, photorealistic, 8k..."}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none h-32"
                    disabled={loadingState.status === 'loading'}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                    {prompt.length} chars
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={!prompt.trim() || loadingState.status === 'loading'}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all duration-300
                  flex items-center justify-center gap-2
                  ${!prompt.trim() || loadingState.status === 'loading'
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/25 transform hover:-translate-y-0.5'}
                `}
              >
                {loadingState.status === 'loading' ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {sourceImage ? (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit Image</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span>Generate Image</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 min-h-[500px] flex flex-col relative overflow-hidden shadow-2xl">
              
              {/* Background pattern for empty state */}
              {!generatedImage && loadingState.status !== 'loading' && (
                <div className="absolute inset-0 opacity-10" 
                     style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '32px 32px' 
                     }}
                ></div>
              )}

              <div className="flex-1 flex items-center justify-center p-8">
                {loadingState.status === 'loading' && <LoadingSpinner />}
                
                {loadingState.status === 'error' && (
                  <div className="text-center max-w-md animate-fade-in">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                       <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                       </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Generation Failed</h3>
                    <p className="text-slate-400">{loadingState.message}</p>
                    <button 
                      onClick={() => setLoadingState({status: 'idle'})}
                      className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {loadingState.status === 'idle' && !generatedImage && (
                  <div className="text-center text-slate-500 max-w-sm">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-slate-400 mb-2">Ready to Imagine</p>
                    <p className="text-sm">Your generated or edited masterpieces will appear here in high quality.</p>
                  </div>
                )}

                {generatedImage && loadingState.status === 'success' && (
                  <div className="relative group w-full h-full flex items-center justify-center">
                    <img 
                      src={generatedImage} 
                      alt="Generated result" 
                      className="max-w-full max-h-[600px] object-contain rounded-lg shadow-2xl animate-fade-in"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] rounded-lg">
                       <button
                         onClick={handleDownload}
                         className="px-6 py-3 bg-white text-slate-900 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                       >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                         </svg>
                         Download Image
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;