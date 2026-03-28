import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './Navbar';
import CanvasSequence from './CanvasSequence';
import ScrollSections from './ScrollSections';
import '../../styles/landing.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  return (
    <div className="landing-wrapper">
      <Navbar />
      <CanvasSequence />
      <ScrollSections />
    </div>
  );
}
