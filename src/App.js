import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css'; // Import the main CSS file
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage'; // Import the new HomePage
import ServicesPage from './pages/ServicesPage'; // Import ServicesPage
import ContactPage from './pages/ContactPage'; // Import ContactPage
import FreelanceWebsiteDesignPage from './pages/FreelanceWebsiteDesignPage'; // Import the new service page
import NewUIPage from './pages/NewUIPage'; // Import the new UI page

// Toggle between old and new UI
// Set to true to use the new blank UI, false to use the existing UI
const USE_NEW_UI = true;

function App() {
  // If using new UI, render only the blank page
  if (USE_NEW_UI) {
    return <NewUIPage />;
  }

  // Otherwise, render the existing UI with routing
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/freelance-website-design" element={<FreelanceWebsiteDesignPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* Add other routes here later */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
