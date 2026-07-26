import React from 'react';

export const LoadingStage = () => {
  return (
    <div id="loading-stage" className="min-h-screen bg-[#030213] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-md mb-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
          <div className="absolute inset-0 bg-white/20 blur-xl group-hover:blur-2xl transition-all duration-500 rounded-full scale-0 group-hover:scale-150" />
          <span className="text-white font-extrabold text-2xl tracking-tighter relative z-10 font-sans">K</span>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="space-y-1.5 text-center">
            <h2 className="text-white text-sm font-bold tracking-[0.2em] uppercase">Knowledge Core</h2>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-medium">A carregar</p>
          </div>
          <div className="flex items-center justify-center w-full max-w-[200px] mt-2">
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/80 rounded-full w-1/3 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] origin-left" style={{ animation: 'progress 2s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { transform: translateX(-100%) }
          50% { transform: translateX(100%) }
          100% { transform: translateX(300%) }
        }
      `}} />
    </div>
  );
};
