import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Header.css'; // Import component-specific CSS

function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation(); // Get current location
    const isFreelancePage = location.pathname.includes('/services');

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    const NavigationLinks = ({ isMobile }) => (
        <>
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleLinkClick}>
                Home
            </NavLink>
            <div className={`nav-item dropdown ${isFreelancePage ? 'freelance-page' : ''}`}>
                <NavLink
                    to="/services/freelance-website-design"
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                    onClick={isMobile ? (e) => e.preventDefault() : handleLinkClick}
                >
                    Services
                </NavLink>
                <div className="dropdown-content">
                    <NavLink to="/services/freelance-website-design" className="dropdown-item" onClick={handleLinkClick}>
                        Freelance Website Design
                    </NavLink>
                    <NavLink to="/services/mobile-app-development" className="dropdown-item" onClick={handleLinkClick}>
                        Mobile App Development
                    </NavLink>
                </div>
            </div>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={handleLinkClick}>
                Contact
            </NavLink>
        </>
    );

    return (
        <header>
            <div className="header-content">
                <div className="left-section">
                    {/* Use the image from the public folder */}
                    <img src="/profile.jpg" alt="Malcolm McDonald" className="profile-image" loading="lazy" />
                </div>
                <div className="center-section">
                    <div className="header-text">
                        <h1>Malcolm McDonald</h1>
                        <p>Developer | San Francisco, CA</p>
                    </div>
                </div>
                <div className="right-section">
                    {/* Desktop Navigation */}
                    <nav className="desktop-nav">
                        <NavigationLinks isMobile={false} />
                    </nav>

                    {/* Mobile Navigation */}
                    <div className={`mobile-nav-container ${isMobileMenuOpen ? 'menu-open' : ''}`}>
                        <button
                            className="burger-menu"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>

                        <nav className="mobile-nav">
                            <NavigationLinks isMobile={true} />
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header; 