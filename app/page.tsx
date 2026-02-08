'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { getAssetPath } from '@/lib/assetPath';

type Stage = 'greeting' | 'photo-request' | 'photo-display' | 'valentine' | 'accepted';

export default function ValentinePage() {
  const [stage, setStage] = useState<Stage>('greeting');
  const [showText, setShowText] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [showCameraFlash, setShowCameraFlash] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const bgMusicRef = useRef<HTMLAudioElement>(null);
  const romanticMusicRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset animations when stage changes
    setShowText(false);
    setShowButtons(false);
    
    // Sequence of animations - text first, then buttons
    const textTimer = setTimeout(() => setShowText(true), 100);
    const buttonsTimer = setTimeout(() => setShowButtons(true), 800);

    // Stop background music and play romantic music on accepted stage
    if (stage === 'accepted') {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
      if (romanticMusicRef.current) {
        romanticMusicRef.current.volume = 0.5;
        romanticMusicRef.current.play().catch((error) => {
          console.log('Romantic music play failed:', error);
        });
      }
    }

    return () => {
      clearTimeout(textTimer);
      clearTimeout(buttonsTimer);
    };
  }, [stage]);

  const handleGreetingResponse = () => {
    // Reset animations before stage change
    setShowText(false);
    setShowButtons(false);
    
    // Enable audio on first interaction
    if (!audioEnabled && bgMusicRef.current) {
      setAudioEnabled(true);
      bgMusicRef.current.volume = 0.5;
      bgMusicRef.current.currentTime = 8; // Start at 8 seconds
      bgMusicRef.current.play().catch((error) => {
        console.log('Background music play failed:', error);
      });
    }
    setStage('photo-request');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Trigger camera flash effect
        setShowCameraFlash(true);
        setTimeout(() => {
          setUploadedPhoto(reader.result as string);
          setStage('photo-display');
          setShowCameraFlash(false);
        }, 1000);
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoDisplayNext = () => {
    // Reset animations before stage change
    setShowText(false);
    setShowButtons(false);
    setStage('valentine');
  };

  const handleNoHover = () => {
    // Play Vine Boom sound effect
    if (audioRef.current) {
      audioRef.current.volume = 1.0; // Set volume to maximum
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.log('Audio play failed:', error);
      });
    }

    const buttonWidth = 120;
    const buttonHeight = 60;
    const padding = 20; // Extra padding from edges

    // Calculate max bounds to keep button fully visible
    const maxX = (window.innerWidth - buttonWidth) / 2 - padding;
    const minX = -(window.innerWidth - buttonWidth) / 2 + padding;
    const maxY = (window.innerHeight - buttonHeight) / 2 - padding;
    const minY = -(window.innerHeight - buttonHeight) / 2 + padding;

    // Generate random position within bounds
    const randomX = Math.random() * (maxX - minX) + minX;
    const randomY = Math.random() * (maxY - minY) + minY;

    setNoPosition({
      x: randomX,
      y: randomY,
    });
  };

  const handleYes = () => {
    setStage('accepted');
  };

  // Render audio elements that persist across all stages
  const audioElements = (
    <>
      {/* Background music - plays on all stages except accepted */}
      {stage !== 'accepted' && (
        <audio 
          ref={bgMusicRef} 
          src={getAssetPath("/Rizz Song (slowed  Reverb)  Edit.mp3")} 
          loop 
          preload="auto" 
          className="hidden"
        />
      )}
      {/* Romantic music - plays only on accepted stage */}
      {stage === 'accepted' && (
        <audio 
          ref={romanticMusicRef} 
          src={getAssetPath("/Romantic music sound effect.mp3")} 
          loop 
          preload="auto" 
          className="hidden"
        />
      )}
    </>
  );

  // Greeting Stage
  if (stage === 'greeting') {
    return (
      <main className="w-full min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
        {audioElements}
        <div
          className={`mb-6 md:mb-8 transition-all duration-700 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Image
            src={getAssetPath("/rizzface.gif")}
            alt="Rizzface"
            width={200}
            height={200}
            unoptimized
            className="rounded-lg w-40 h-40 md:w-52 md:h-52"
          />
        </div>

        <h1
          className={`text-3xl md:text-5xl font-bold text-white text-center mb-8 md:mb-12 transition-all duration-700 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          hey
        </h1>

        <div
          className={`transition-all duration-700 ${
            showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={handleGreetingResponse}
            className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg text-base md:text-lg transition-colors duration-200"
          >
            hey...
          </button>
        </div>
      </main>
    );
  }

  // Photo Request Stage
  if (stage === 'photo-request') {
    return (
      <main className="w-full min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
        {audioElements}
        <div
          className={`mb-6 md:mb-8 transition-all duration-700 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Image
            src={getAssetPath("/wink.gif")}
            alt="Wink"
            width={200}
            height={200}
            unoptimized
            className="rounded-lg w-40 h-40 md:w-52 md:h-52"
          />
        </div>

        <h1
          className={`text-2xl md:text-4xl font-bold text-white text-center mb-8 md:mb-12 max-w-lg transition-all duration-700 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          can u send a picture of u real quick?
        </h1>

        <div
          className={`transition-all duration-700 ${
            showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-base md:text-lg transition-colors duration-200 flex items-center gap-2"
          >
            <span>📸</span>
            <span>Upload Photo</span>
          </button>
        </div>
      </main>
    );
  }

  // Photo Display Stage
  if (stage === 'photo-display' && uploadedPhoto) {
    return (
      <main className="w-full min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden relative">
        {audioElements}
        {/* Camera flash effect */}
        <div
          className={`fixed inset-0 bg-white pointer-events-none transition-opacity duration-500 z-50 ${
            showCameraFlash ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* GIF on top */}
        <div
          className={`mb-4 md:mb-6 transition-all duration-700 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Image
            src={getAssetPath("/cat-mog-mogginf-cat.gif")}
            alt="Cat mogging"
            width={200}
            height={200}
            unoptimized
            className="rounded-lg w-40 h-40 md:w-52 md:h-52"
          />
        </div>

        {/* Text above photo */}
        <h1
          className={`text-2xl md:text-3xl font-bold text-white text-center mb-6 md:mb-8 max-w-2xl px-4 transition-all duration-700 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          sorry i js needed to show santa what i want for christmas 😏
        </h1>

        {/* Uploaded Photo */}
        <div
          className={`mb-8 md:mb-12 transition-all duration-700 relative ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Heart background */}
          <div className="absolute inset-0 flex items-center justify-center text-8xl md:text-9xl opacity-30 pointer-events-none">
            ❤️
          </div>
          <Image
            src={uploadedPhoto}
            alt="Your photo"
            width={250}
            height={250}
            unoptimized
            className="rounded-lg w-52 h-52 md:w-64 md:h-64 object-cover border-4 border-white relative z-10"
          />
        </div>

        <div
          className={`transition-all duration-700 ${
            showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={handlePhotoDisplayNext}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-base md:text-lg transition-colors duration-200"
          >
            aweee, thank you!! <span>😊</span>
          </button>
        </div>
      </main>
    );
  }

  // Valentine Stage
  if (stage === 'valentine') {
    return (
      <main className="w-full min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
        {audioElements}
        <audio ref={audioRef} src={getAssetPath("/Vine Boom sound effect meme.mp3")} preload="auto" />

        <div
          className={`mb-6 md:mb-8 transition-all duration-700 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Image
            src={getAssetPath("/rizz.gif")}
            alt="Rizz"
            width={200}
            height={200}
            unoptimized
            className="rounded-lg w-40 h-40 md:w-52 md:h-52"
          />
        </div>

        <h1
          className={`text-3xl md:text-5xl font-bold text-white text-center mb-8 md:mb-12 max-w-2xl px-4 transition-all duration-700 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          sooo, Will you be my Valentine?
        </h1>

        <div
          className={`flex gap-4 md:gap-6 transition-all duration-700 ${
            showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={handleYes}
            className="px-6 md:px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-base md:text-lg transition-colors duration-200"
          >
            OMG, YES!! ❤️
          </button>

          <button
            ref={noButtonRef}
            onMouseEnter={handleNoHover}
            onTouchStart={handleNoHover}
            className={`px-6 md:px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg text-base md:text-lg transition-all duration-200 ${
              noPosition.x !== 0 || noPosition.y !== 0 ? 'fixed' : 'relative'
            }`}
            style={
              noPosition.x !== 0 || noPosition.y !== 0
                ? {
                    left: `calc(50% + ${noPosition.x}px)`,
                    top: `calc(50% + ${noPosition.y}px)`,
                    transform: 'translate(-50%, -50%)',
                  }
                : {}
            }
          >
            hell nah
          </button>
        </div>
      </main>
    );
  }

  // Accepted Stage
  return (
    <div className="relative w-full min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
      {audioElements}
      
      {/* Heart Fireworks */}
      <style jsx>{`
        @keyframes firework {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(1);
            opacity: 0;
          }
        }
        .heart-firework {
          position: absolute;
          font-size: 2rem;
          animation: firework 2s ease-out infinite;
        }
      `}</style>
      
      {[...Array(20)].map((_, i) => {
        const angle = (i * 360) / 20;
        const distance = 200 + Math.random() * 100;
        const tx = Math.cos((angle * Math.PI) / 180) * distance;
        const ty = Math.sin((angle * Math.PI) / 180) * distance;
        const delay = Math.random() * 2;
        
        return (
          <div
            key={i}
            className="heart-firework"
            style={{
              left: '50%',
              top: '50%',
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
              animationDelay: `${delay}s`,
            } as React.CSSProperties & { '--tx': string; '--ty': string }}
          >
            ❤️
          </div>
        );
      })}
      
      <div
        className={`mb-6 md:mb-8 transition-all duration-700 ${
          showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <Image
          src={getAssetPath("/eminem.gif")}
          alt="Eminem"
          width={250}
          height={250}
          unoptimized
          className="rounded-lg w-52 h-52 md:w-64 md:h-64"
        />
      </div>

      <h1
        className={`text-3xl md:text-4xl font-bold text-white text-center max-w-2xl px-4 transition-all duration-700 ${
          showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        happy valentines shawty, lucky to be your valentine 😉
      </h1>
    </div>
  );
}
