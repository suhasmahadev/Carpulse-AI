import React, { useEffect, useState } from 'react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        // Initial check
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav id="navbar" className={scrolled ? "scrolled" : ""}>
            <div className="nav-brand">Academic Intelligence System</div>
            <div className="nav-links">
                {/* <a href="#overview">Overview</a> */}
                {/* <a href="#architecture">Architecture</a>
                <a href="#access-control">Access Control</a>
                <a href="#insights">Insights</a>
                <a href="#security">Security</a> */}
            </div>
            <div className="nav-cta">
                <button>Explore System</button>
            </div>
        </nav>
    );
};

export default Navbar;
