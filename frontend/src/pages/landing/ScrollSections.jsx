import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';

const ScrollSections = () => {
    const mainRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Scoped to this component
        let ctx = gsap.context(() => {
            const steps = gsap.utils.toArray(".step");

            // Iterate through each text section
            steps.forEach((step) => {
                const textContent = step.querySelector('.text-content');
                
                // We want the text to fade in smoothly as it reaches the middle of the viewport
                // and fade out as it leaves.
                gsap.fromTo(
                    textContent,
                    {
                        opacity: 0,
                        y: 50, // Move up by 50px
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: step,
                            start: "top center+=20%", // When top of step hits 20% below center
                            end: "bottom center-=20%", // When bottom of step hits 20% above center
                            toggleActions: "play reverse play reverse", // Play on enter, reverse on leave
                            scrub: false,
                        }
                    }
                );
            });

            // Smooth reveal for individual elements within the text container (Stagger)
            steps.forEach(step => {
                const content = step.querySelectorAll('.text-content > *');
                
                gsap.fromTo(content, 
                    {
                        opacity: 0,
                        y: 20
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.15, // Delay between each element
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: step,
                            start: "top center+=20%",
                            toggleActions: "play reverse play reverse",
                        }
                    }
                );
            });
        }, mainRef);

        return () => ctx.revert(); // clean up GSAP animations and ScrollTriggers
    }, []);

    return (
        <main className="scroll-content" ref={mainRef}>
            {/* 🚀 HERO / CHAOS → CONTROL (0–15%) */}
            <section className="step" id="overview">
                <div className="text-content center">
                    <h1>Campus Mitra</h1>
                    <p>Intelligent Infrastructure With Multi-Agent,Automated Dynamic System</p>
                </div>
            </section>

            {/* ⚙️ CENTRALIZATION (15–35%) */}
            <section className="step" id="architecture">
                <div className="text-content left">
                    <h1>One system. Total control.</h1>
                    <p>All student data unified into a single, secure source of truth.</p>
                </div>
            </section>

            {/* 🧩 ROLE-BASED STRUCTURE (35–60%) */}
            <section className="step" id="access-control">
                <div className="text-content right">
                    <h1>Access, intelligently defined.</h1>
                    <p>Every role sees what it needs—nothing more, nothing less.</p>
                </div>
            </section>

            {/* 📊 DATA INTELLIGENCE (60–80%) */}
            <section className="step" id="insights">
                <div className="text-content left">
                    <h1>From data to insight.</h1>
                    <p>Track performance. Detect patterns. Act with confidence.</p>
                </div>
            </section>

            {/* 🔒 CLARITY & CONTROL (80–100%) */}
            <section className="step final-step" id="security">
                <div className="text-content center">
                    <h1>Clarity in every record.</h1>
                    <h2>Control in every layer.</h2>
                    <div className="cta-group">
                        <button className="primary-btn" onClick={() => navigate('/login')}>Enter the System</button>
                        <button className="secondary-btn">View Architecture</button>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ScrollSections;
