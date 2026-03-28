import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const CanvasSequence = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        // Ensure canvas resolution is high quality (Retina ready)
        function resizeCanvas() {
            canvas.width = window.innerWidth * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            canvas.style.width = window.innerWidth + "px";
            canvas.style.height = window.innerHeight + "px";
            
            // Maintain rendering context quality
            // @ts-ignore
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); // Initial resize

        // Define total frames
        const frameCount = 240;
        const currentFrame = index => (
            `/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
        );

        const images = [];
        const sequence = { frame: 0 };

        // Preload the first image immediately to paint early
        const firstImage = new Image();
        firstImage.src = currentFrame(0);
        firstImage.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawImageScaled(firstImage);
        };

        // Lazy load the rest
        let loadedCount = 0;
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => { loadedCount++; };
            images.push(img);
        }

        // Function to draw image covering the canvas (like object-fit: cover)
        function drawImageScaled(img) {
            if(!img || !img.complete || img.naturalWidth === 0) return;
            
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio  = Math.max(hRatio, vRatio); // Use max for cover
            
            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;  
            
            // Fill with background color to ensure no bad edges
            context.fillStyle = "#050505";
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            context.drawImage(
                img, 
                0, 0, img.width, img.height,
                centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
            );
        }

        let ctx = gsap.context(() => {
            // Scroll animation for frame sequence
            gsap.to(sequence, {
                frame: frameCount - 1,
                snap: "frame",
                ease: "none",
                scrollTrigger: {
                    trigger: ".scroll-content", // The wrapper from ScrollSections
                    start: "top top", // Canvas sticky starts
                    end: "bottom bottom", // Entire length of main content
                    scrub: 0.5, // Smooth interpolation
                    onUpdate: () => drawImageScaled(images[Math.round(sequence.frame)])
                }
            });
        });

        const handleResize = () => drawImageScaled(images[Math.round(sequence.frame)]);
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('resize', handleResize);
            ctx.revert(); // clean up GSAP animations and ScrollTriggers
        };
    }, []);

    return (
        <div className="canvas-container">
            <canvas id="sequence-canvas" ref={canvasRef}></canvas>
        </div>
    );
};

export default CanvasSequence;
