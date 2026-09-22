/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MarketingLayout } from './layouts/MarketingLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { Home } from './pages/Home';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { NotFound } from './pages/NotFound';
import { SharedNote } from './pages/SharedNote';
import { Onboarding } from './pages/Onboarding';
import { AllNotes } from './pages/AllNotes';
import { AppProvider } from './store/AppContext';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing Routes */}
        <Route path="/" element={<MarketingLayout />}>
          <Route index element={<Home />} />
          <Route path="features" element={<Features />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>

        {/* Onboarding Routes */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Dashboard Routes */}
          <Route
            path="/dashboard/note/:noteId"
            element={<DashboardLayout />}
          />
          <Route
            path="/dashboard/all-notes"
            element={<DashboardLayout />}
          />

                    <Route
            path="/dashboard/all-groups"
            element={<DashboardLayout />}
          />

          <Route
            path="/dashboard/group/:groupId"
            element={<DashboardLayout />}
          />
          
          <Route
            path="/share/:shareId"
            element={
              <AppProvider>
                <SharedNote />
              </AppProvider>
            }
          />

          <Route
            path="/dashboard/*"
            element={<DashboardLayout />}
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

