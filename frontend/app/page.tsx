'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import SustainabilityResults from './components/SustainabilityResults';

// Use dynamic import to avoid SSR issues with Leaflet
const MapSelectionWithNoSSR = dynamic(
  () => import('./components/MapSelection'),
  { ssr: false }
);

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollTimeout, setScrollTimeout] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const sections = useRef<HTMLElement[]>([]);

  // Register sections for scrolling
  const registerSection = (el: HTMLElement | null) => {
    if (el && !sections.current.includes(el)) {
      sections.current.push(el);
    }
  };

  useEffect(() => {
    // Handle scrolling
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Calculate which section is in view
      if (sections.current.length) {
        const viewportHeight = window.innerHeight;
        const scrollMid = scrollPosition + viewportHeight / 2;
        
        for (let i = 0; i < sections.current.length; i++) {
          const section = sections.current[i];
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          
          if (scrollMid >= sectionTop && scrollMid < sectionBottom) {
            setCurrentSection(i);
            break;
          }
        }
      }
    };

    // Add scroll wheel handling for precise snapping control
    const handleWheel = (e: WheelEvent) => {
      // Don't prevent default for the analysis section to allow scrolling the content
      if (currentSection === 2) {
        // Allow normal scrolling in the analysis section
        // Only intercept if we're at the very top or bottom of the section
        const analysisSection = sections.current[2];
        const scrollTop = window.scrollY;
        const sectionTop = analysisSection.offsetTop;
        
        // Check if we're at the top of the section and trying to scroll up
        if (scrollTop <= sectionTop && e.deltaY < 0) {
          e.preventDefault();
          if (scrollTimeout) return;
          scrollToSection(1);
          setScrollTimeout(true);
          setTimeout(() => setScrollTimeout(false), 800);
          return;
        }
        
        return; // Otherwise allow normal scrolling in this section
      }
      
      // For other sections, use the snap behavior
      e.preventDefault();
      
      // Small delay to prevent rapid scrolling
      if (scrollTimeout) return;
      
      const direction = e.deltaY > 0 ? 1 : -1;
      
      // Calculate the next section to scroll to
      const nextSection = Math.min(
        Math.max(0, currentSection + direction),
        sections.current.length - 1
      );
      
      // Scroll to the next section
      if (sections.current[nextSection]) {
        sections.current[nextSection].scrollIntoView({ behavior: 'smooth' });
        setCurrentSection(nextSection);
      }
      
      // Set a timeout to prevent rapid scrolling
      setScrollTimeout(true);
      setTimeout(() => setScrollTimeout(false), 800);
    };
    
    // Set up event listeners
    window.addEventListener('scroll', handleScroll);
    if (mainRef.current) {
      mainRef.current.addEventListener('wheel', handleWheel, { passive: false });
    }

    // Simulate map loading time
    const loadTimer = setTimeout(() => {
      setMapLoaded(true);
    }, 2000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (mainRef.current) {
        mainRef.current.removeEventListener('wheel', handleWheel);
      }
      clearTimeout(loadTimer);
    };
  }, [currentSection, scrollTimeout]);

  // Custom navigation buttons
  const scrollToSection = (index: number) => {
    if (sections.current[index]) {
      sections.current[index].scrollIntoView({ behavior: 'smooth' });
      setCurrentSection(index);
    }
  };

  // Add event listener for custom scrollToSection event
  useEffect(() => {
    const handleScrollToSectionEvent = (e: any) => {
      const sectionIndex = e.detail;
      scrollToSection(sectionIndex);
    };

    window.addEventListener('scrollToSection', handleScrollToSectionEvent);
    
    return () => {
      window.removeEventListener('scrollToSection', handleScrollToSectionEvent);
    };
  }, []);

  return (
    <div className="bg-gradient-to-b from-gray-950 via-purple-950 to-gray-950 text-white min-h-screen">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-sm border-b border-purple-800/50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <Link href="/">
            <h1 className="text-2xl font-light text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400 glow-sm">
              Sustainability AI Platform
            </h1>
          </Link>
          
          {/* Navigation dots - moved to center position */}
          <div className="absolute right-4 sm:right-6 lg:right-8 flex space-x-2">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => scrollToSection(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSection === index ? 'bg-emerald-400 scale-125' : 'bg-gray-600 hover:bg-gray-400'
                }`}
                aria-label={`Go to section ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </header>

      <main ref={mainRef} className="snap-container">
        {/* Intro section - full height */}
        <section 
          ref={(el) => registerSection(el)}
          className="h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 snap-section"
        >
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-thin text-white sm:text-4xl tracking-wide">
              Select Area for Sustainability Analysis
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400 font-extralight">
              Draw a rectangle or circle on the map to analyze the area's sustainability metrics
            </p>
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => scrollToSection(1)} 
                className="animate-bounce w-6 h-10 border-2 border-emerald-400/50 rounded-full flex justify-center relative"
              >
                <span className="animate-scroll-down absolute w-1 h-2 bg-emerald-400 rounded-full"></span>
              </button>
            </div>
          </div>
        </section>

        {/* Map section - full height */}
        <section 
          ref={(el) => registerSection(el)}
          className="h-screen px-4 sm:px-6 lg:px-8 flex items-center snap-section pt-8"
        >
          <div className="w-full max-w-7xl mx-auto">
            <div className="bg-gray-900/60 backdrop-blur-sm shadow-lg overflow-hidden border border-purple-900/50 relative rounded-lg h-[80vh]">
              {!mapLoaded && (
                <div className="absolute inset-0 z-20 bg-gray-950/95 flex flex-col items-center justify-center animate-fade-in">
                  <div className="relative w-40 h-40">
                    <svg className="animate-spin-slow w-full h-full" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <circle 
                        cx="50" cy="50" r="40" 
                        stroke="#1f2937"
                        strokeWidth="6" 
                        fill="none" 
                      />
                      <circle 
                        cx="50" cy="50" r="40" 
                        stroke="url(#gradient)"
                        strokeWidth="6" 
                        strokeDasharray="60 180"
                        fill="none" 
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-28 w-28 rounded-full bg-gradient-to-br from-purple-500/10 to-emerald-500/10 animate-pulse-slow blur-lg"></div>
                    </div>
                  </div>
                  <div className="mt-8 space-y-2 text-center">
                    <h3 className="text-xl font-light text-white">Loading Sustainability Map</h3>
                    <p className="text-gray-400 font-extralight max-w-md">
                      Preparing interactive map for sustainability analysis and area selection
                    </p>
                  </div>
                </div>
              )}
              <div className={`transition-opacity duration-1000 ${mapLoaded ? 'opacity-100' : 'opacity-0'} h-full`}>
                <MapSelectionWithNoSSR />
              </div>
            </div>
          </div>
        </section>

        {/* Sustainability Results section - full height */}
        <section 
          ref={(el) => registerSection(el)}
          className="min-h-screen px-4 sm:px-6 lg:px-8 flex flex-col justify-start py-16 snap-section overflow-y-auto"
        >
          <div className="w-full max-w-7xl mx-auto">
            <SustainabilityResults />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-purple-900/30 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-gray-500 font-light">
            © CoffeeOverflow 2025
          </p>
        </div>
      </footer>
    </div>
  );
}