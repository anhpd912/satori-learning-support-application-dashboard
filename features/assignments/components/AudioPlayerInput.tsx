import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerInputProps {
    className?: string;
    onAudioChange?: (file: File | null) => void;
}

export default function AudioPlayerInput({ className = '', onAudioChange }: AudioPlayerInputProps) {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // States for audio player
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAudioFile(file);
            if (onAudioChange) onAudioChange(file);

            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            const newUrl = URL.createObjectURL(file);
            setAudioUrl(newUrl);
            setIsPlaying(false);
            setCurrentTime(0);
        }
    };

    const handleRemove = () => {
        setAudioFile(null);
        if (onAudioChange) onAudioChange(null);
        
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setIsPlaying(false);
        setCurrentTime(0);
        
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    // Cleanup URL on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    return (
        <div className={`w-full ${className}`}>
            <input 
                type="file" 
                accept="audio/mp3,audio/wav" 
                className="hidden" 
                ref={inputRef}
                onChange={handleFileChange}
            />
            
            {audioFile ? (
                <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
                    <audio 
                        ref={audioRef}
                        src={audioUrl || ''}
                        preload="auto"
                        onTimeUpdate={() => {
                            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                        }}
                        onLoadedMetadata={() => {
                            if (audioRef.current) setDuration(audioRef.current.duration);
                        }}
                        onEnded={() => setIsPlaying(false)}
                    />
                    
                    <button 
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                    >
                        {isPlaying ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        )}
                    </button>
                    
                    <div 
                        className="flex-1 h-1.5 bg-gray-100 rounded-full relative cursor-pointer group/progress"
                        onClick={(e) => {
                            if (audioRef.current && duration) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const clickRatio = (e.clientX - rect.left) / rect.width;
                                audioRef.current.currentTime = clickRatio * duration;
                            }
                        }}
                    >
                        <div 
                            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-100" 
                            style={{ width: `${(currentTime / duration || 0) * 100}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow-md scale-0 group-hover/progress:scale-100 transition-transform"></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-gray-400 tabular-nums">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                        
                        <button 
                            onClick={handleRemove}
                            className="text-gray-300 hover:text-red-500 transition-all p-1"
                            title="Xóa âm thanh"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-end">
                    <button 
                        onClick={() => inputRef.current?.click()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-200/50 shadow-sm active:scale-95"
                    >
                        Upload MP3
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </button>
                </div>
            )}
        </div>
    );
}
