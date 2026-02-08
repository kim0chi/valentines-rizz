'use client';

import { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { getAssetPath } from '@/lib/assetPath';

type Stage = 'greeting' | 'photo-request' | 'photo-display' | 'valentine' | 'accepted';

export default function ValentinePage() {
  const [stage, setStage] = useState<Stage>('greeting');
  const [showText, setShowText] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [noPosition, setNoPosition] = useState<{ left: number; top: number } | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [showCameraFlash, setShowCameraFlash] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const bgMusicRef = useRef<HTMLAudioElement>(null);
  const romanticMusicRef = useRef<HTMLAudioElement>(null);
  const shutterAudioRef = useRef<HTMLAudioElement>(null);
  const audienceAudioRef = useRef<HTMLAudioElement>(null);
  const fireworkParticles = useMemo(
    () =>
      [...Array(20)].map((_, i) => {
        const angle = (i * 360) / 20;
        const distance = 200 + Math.random() * 100;
        const tx = Math.cos((angle * Math.PI) / 180) * distance;
        const ty = Math.sin((angle * Math.PI) / 180) * distance;
        const delay = Math.random() * 2;
        return { i, tx, ty, delay };
      }),
    []
  );

  useLayoutEffect(() => {
    // Reset animations when stage changes
    setShowText(false);
    setShowButtons(false);
    
    // Sequence of animations - text first, then buttons
    const textTimer = setTimeout(() => setShowText(true), 100);
    const buttonsTimer = setTimeout(() => setShowButtons(true), 800);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(buttonsTimer);
    };
  }, [stage]);

  useEffect(() => {
    // Stop background music and play romantic music on accepted stage
    if (stage !== 'accepted') return;

    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
    }

    if (romanticMusicRef.current) {
      romanticMusicRef.current.volume = 0.5;
      romanticMusicRef.current.play().catch((error) => {
        console.log('Romantic music play failed:', error);
      });
    }
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
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size must be less than 5MB');
        input.value = '';
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        input.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Trigger camera flash effect
        setShowCameraFlash(true);

        if (shutterAudioRef.current) {
          shutterAudioRef.current.volume = 1.0;
          shutterAudioRef.current.currentTime = 0;
          shutterAudioRef.current.play().catch((error) => {
            console.log('Shutter audio play failed:', error);
          });
        }

        if (audienceAudioRef.current) {
          audienceAudioRef.current.volume = 0.8;
          audienceAudioRef.current.currentTime = 0;
          audienceAudioRef.current.play().catch((error) => {
            console.log('Audience audio play failed:', error);
          });
        }

        setTimeout(() => {
          setUploadedPhoto(reader.result as string);
          setStage('photo-display');
          setShowCameraFlash(false);
          input.value = '';
        }, 1000);
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
        input.value = '';
      };
      reader.readAsDataURL(file);
    } else {
      input.value = '';
    }
  };

  const handlePhotoDisplayNext = () => {
    // Reset animations before stage change
    setShowText(false);
    setShowButtons(false);
    setStage('valentine');
  };

  const handleNoHover = (e?: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    // Prevent default behavior and stop propagation to avoid phantom clicks
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Play Vine Boom sound effect
    if (audioRef.current) {
      audioRef.current.volume = 1.0; // Set volume to maximum
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.log('Audio play failed:', error);
      });
    }

    const button = noButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16;

    const minLeft = padding;
    const maxLeft = viewportWidth - rect.width - padding;
    const minTop = padding;
    const maxTop = viewportHeight - rect.height - padding;

    const clamp = (value: number, min: number, max: number) => {
      if (max <= min) return min;
      return Math.min(Math.max(value, min), max);
    };

    const isMobile = viewportWidth < 768;
    const minStep = isMobile ? 64 : 100;
    const maxStep = isMobile ? 130 : 220;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (maxStep - minStep) + minStep;

    const currentLeft = noPosition ? noPosition.left : rect.left;
    const currentTop = noPosition ? noPosition.top : rect.top;

    const randomLeft = clamp(currentLeft + Math.cos(angle) * distance, minLeft, maxLeft);
    const randomTop = clamp(currentTop + Math.sin(angle) * distance, minTop, maxTop);

    setNoPosition({
      left: Math.round(randomLeft),
      top: Math.round(randomTop),
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
      <audio
        ref={shutterAudioRef}
        src={getAssetPath('/shutter.mp3')}
        preload="auto"
        className="hidden"
      />
      <audio
        ref={audienceAudioRef}
        src={getAssetPath('/audience.mp3')}
        preload="auto"
        className="hidden"
      />
    </>
  );

  // Greeting Stage
  if (stage === 'greeting') {
    return (
      <main className="w-full min-h-dvh bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
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
            className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg text-base md:text-lg transition-colors duration-200 touch-manipulation"
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
      <main className="w-full min-h-dvh bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
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
            id="photo-upload"
            type="file"
            accept="image/*"
            capture="user"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <label
            htmlFor="photo-upload"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-base md:text-lg transition-colors duration-200 flex items-center gap-2 cursor-pointer touch-manipulation select-none"
          >
            <span>📸</span>
            <span>Upload Photo</span>
          </label>
        </div>
      </main>
    );
  }

  // Photo Display Stage
  if (stage === 'photo-display' && uploadedPhoto) {
    return (
      <main className="w-full min-h-dvh bg-black flex flex-col items-center justify-center p-4 overflow-hidden relative">
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
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-base md:text-lg transition-colors duration-200 touch-manipulation"
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
      <main className="w-full min-h-dvh bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
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
          className={`flex flex-col sm:flex-row gap-4 md:gap-6 items-center transition-opacity duration-700 ${
            showButtons ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={handleYes}
            className="px-6 md:px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-base md:text-lg transition-colors duration-200 touch-manipulation"
          >
            OMG, YES!! ❤️
          </button>

          <button
            ref={noButtonRef}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') {
                handleNoHover(e);
              }
            }}
            onPointerDown={(e) => {
              if (e.pointerType !== 'mouse') {
                handleNoHover(e);
              }
            }}
            className={`px-6 md:px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg text-base md:text-lg transition-all duration-200 ${
              noPosition ? 'fixed z-50' : 'relative'
            } touch-manipulation`}
            style={
              noPosition
                ? {
                    left: `${noPosition.left}px`,
                    top: `${noPosition.top}px`,
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
    <div className="relative w-full min-h-dvh bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
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
      
      {fireworkParticles.map(({ i, tx, ty, delay }) => (
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
      ))}
      
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
