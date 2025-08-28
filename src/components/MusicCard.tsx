import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Heart,
  MoreHorizontal,
  Shuffle,
  Repeat
} from 'lucide-react';

interface MusicCardProps {
  title: string;
  artist: string;
  albumArt: string;
  audioSrc: string;
}

const MusicCard: React.FC<MusicCardProps> = ({ title, artist, albumArt, audioSrc }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isLoading) return;
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (x / width) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseInt(e.target.value));
  };

  const handleSkipBack = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    }
  };

  const handleSkipForward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(duration, audio.currentTime + 10);
    }
  };
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-sm mx-auto">
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300">
        {/* Album Art Section */}
        <div className="relative group">
          <div className="aspect-square relative overflow-hidden">
            <img 
              src={albumArt} 
              alt={`${title} by ${artist}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Floating Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handlePlayPause}
                className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200 shadow-lg disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause size={24} className="text-white ml-0.5" />
                ) : (
                  <Play size={24} className="text-white ml-1" />
                )}
              </button>
            </div>

            {/* Top Actions */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/40 transition-colors duration-200"
              >
                <Heart size={16} className={`${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
              </button>
              <button className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/40 transition-colors duration-200">
                <MoreHorizontal size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Music Info & Controls */}
        <div className="p-6 space-y-4">
          {/* Song Info */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-white truncate">{title}</h2>
            <p className="text-gray-400 text-sm truncate">{artist}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div 
              className="w-full h-1 bg-gray-700 rounded-full cursor-pointer group relative"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative transition-all duration-150"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-6">
            <button className="text-gray-400 hover:text-white transition-colors duration-200">
              <Shuffle size={20} />
            </button>
            
            <button 
              onClick={handleSkipBack}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <SkipBack size={24} />
            </button>

            <button
              onClick={handlePlayPause}
              className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={20} className="text-white" />
              ) : (
                <Play size={20} className="text-white ml-0.5" />
              )}
            </button>

            <button 
              onClick={handleSkipForward}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <SkipForward size={24} />
            </button>

            <button className="text-gray-400 hover:text-white transition-colors duration-200">
              <Repeat size={20} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Volume2 size={20} className="text-gray-400 flex-shrink-0" />
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer slider"
              />
              <div 
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none"
                style={{ width: `${volume}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-8 text-right">{volume}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicCard;