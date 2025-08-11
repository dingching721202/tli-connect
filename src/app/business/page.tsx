'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';

export default function BusinessPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    jobtitle: '',
    primaryTraining: '',
    participants: '',
    requirements: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // API endpoint from the original HTML
  const API_ENDPOINT = 'https://n8n-gphufbto.ap-southeast-1.clawcloudrun.com/webhook/to_b_leads';

  // Add hydrated class to body on mount
  useEffect(() => {
    document.body.classList.add('hydrated');
  }, []);

  // Validation functions
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!validateEmail(formData.email.trim())) {
      alert('Please enter a valid email.');
      return;
    }

    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          name: formData.name.trim(),
          email: formData.email.trim(),
          company: formData.company.trim(),
          phone: formData.phone.trim() || '',
          "job title": formData.jobtitle.trim() || '',
          "primary training needs": formData.primaryTraining || '',
          "number of participants": formData.participants || '',
          "brief description of your requirements": formData.requirements.trim() || ''
        }])
      });

      if (response.ok) {
        setShowSuccess(true);
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          jobtitle: '',
          primaryTraining: '',
          participants: '',
          requirements: ''
        });
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Head>
        <title>TLI Connect — Build Your Own Global Talent Community</title>
        <meta name="description" content="TLI Connect — Language × Culture × Business membership. Scenario-based courses, workshops, and a cross‑cultural community backed by TLI since 1956." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
      </Head>

      {/* Critical Header CSS - Prevent Layout Shift */}
      <style jsx>{`
        /* Ensure header starts with correct positioning immediately */
        :global(.site-header) {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          height: 72px !important;
          background: #fff !important;
          z-index: 9998 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 0 100px !important;
          box-sizing: border-box !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        :global(.brand-logo) {
          display: inline-block !important;
          width: 200px !important;
          height: 36px !important;
          min-width: 200px !important;
          max-width: 200px !important;
          min-height: 36px !important;
          max-height: 36px !important;
          flex-shrink: 0 !important;
          flex-grow: 0 !important;
          visibility: visible !important;
          opacity: 1 !important;
          margin: 0 !important;
          padding: 0 !important;
          vertical-align: middle !important;
        }
        
        :global(.brand-logo img) {
          width: 200px !important;
          height: 36px !important;
          min-width: 200px !important;
          max-width: 200px !important;
          min-height: 36px !important;
          max-height: 36px !important;
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          vertical-align: top !important;
          object-fit: contain !important;
        }
        
        
        
        /* Next.js Image component specific fixes */
        :global(.brand-logo span) {
          display: block !important;
          width: 200px !important;
          height: 36px !important;
          min-width: 200px !important;
          max-width: 200px !important;
          min-height: 36px !important;
          max-height: 36px !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          position: relative !important;
        }
        
        :global(.brand-logo span img) {
          width: 200px !important;
          height: 36px !important;
          min-width: 200px !important;
          max-width: 200px !important;
          min-height: 36px !important;
          max-height: 36px !important;
          position: relative !important;
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          object-fit: contain !important;
          vertical-align: top !important;
        }
        
        
        /* Footer Login Button responsive positioning */
        :global(.footer-login-container) {
          position: absolute !important;
          bottom: 16px !important;
          right: 100px !important;
          z-index: 10 !important;
        }
        
        /* Responsive positioning */
        @media (max-width: 960px) {
          :global(.site-header) { padding: 0 24px !important; }
          :global(.footer-login-container) { right: 24px !important; }
        }
        @media (max-width: 600px) {
          :global(.site-header) { padding: 0 16px !important; }
          :global(.footer-login-container) { right: 16px !important; }
        }
      `}</style>

      <style jsx global>{`
        /* Global Tokens */
        :root {
          /* layout */
          --container: 1200px;
          --page-padding: 100px;
          --page-padding-mobile: 16px;

          /* palette */
          --black: #F5F8FC;
          --paper-soft: #F9FBFE;
          --ink: #262626;
          --ink-dim: #4A4A4A;
          --divider: rgba(38, 38, 38, 0.14);

          --cta-gradient-left: #009FB6;
          --cta-gradient-right: #027AB9;
          --cta-gradient-hover-left: #00BEE3;
          --cta-gradient-hover-right: #0286C9;
          --primary: #027AB9;
          --blue-100: #E3F1F8;
          --gold: #F5C04E;
        }

        /* RWD – Auto-adjust padding */
        @media (max-width: 600px) {
          :root { --page-padding: var(--page-padding-mobile); }
        }

        /* Reset & Base */
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        body {
          font-family: Inter, "Noto Sans", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif;
          color: var(--ink);
          background: var(--black);
        }
        a { text-decoration: none; color: #1E60A9; }
        img { max-width: 100%; display: block; }

        /* Layout Helpers */
        .container { max-width: var(--container); margin: 0 auto; }
        body > section, footer { padding-left: var(--page-padding); padding-right: var(--page-padding); }

        h1, h2, h3 { margin: 0 0 16px; font-family: "Plus Jakarta Sans", "Noto Sans TC", Inter, sans-serif; font-weight: 800; color: var(--ink); font-feature-settings: "pnum" 1, "lnum" 1; }
        .h1 { font-size: 56px; line-height: 64px; letter-spacing: -0.015em; }
        .h2 { font-size: 32px; line-height: 42px; letter-spacing: -0.01em; }
        .body-l { font-size: 18px; line-height: 28px; color: var(--ink); }
        .body-m { font-size: 16px; line-height: 26px; color: var(--ink-dim); }
        @media (max-width: 1100px) { .h1 { font-size: 44px; line-height: 52px; } .h2 { font-size: 30px; line-height: 38px; } }

        /* Buttons */
        button, .cta-btn, .secondary-btn { border-radius: 999px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.25s ease-in-out; }

        /* Primary CTA */
        .cta-btn {
          background: linear-gradient(90deg, var(--cta-gradient-left), var(--cta-gradient-right));
          color: #FFFFFF; border: none; padding: 16px 40px; box-shadow: 0 10px 24px rgba(2, 122, 185, 0.22);
        }
        .cta-btn:hover {
          background: linear-gradient(90deg, var(--cta-gradient-hover-left), var(--cta-gradient-hover-right));
          transform: scale(1.04);
          box-shadow: 0 8px 24px rgba(2, 122, 185, 0.32);
        }

        /* Secondary CTA */
        .secondary-btn {
          background: #ffffff; color: var(--primary); border: 2px solid var(--primary); padding: 14px 32px;
          display: inline-flex; align-items: center; gap: 8px; width: auto; white-space: nowrap;
        }
        .secondary-btn:hover {
          background: #F0F9FD; color: var(--primary); transform: scale(1.02); box-shadow: 0 4px 12px rgba(2, 122, 185, 0.12);
        }

        .cta-section .secondary-btn,
        .membership-wrapper .secondary-btn {
          flex: 0 0 auto;
        }

        /* Header */
        :root { --header-padding: 100px; }
        @media (max-width: 960px) { :root { --header-padding: 24px; } }
        @media (max-width: 600px) { :root { --header-padding: 16px; } }
        .site-header { position: fixed; top: 0; left: 0; right: 0; height: 72px; background: #fff; z-index: 9998; display: flex; align-items: center; justify-content: space-between; padding: 0 var(--header-padding); }
        .brand-logo { display: inline-block; width: 200px; }
        .brand-logo img { width: 100%; height: auto; }
        @media (max-width: 767px) { .brand-logo img { height: 30px; } }

        /* Header actions */
        .header-actions { display: flex; align-items: center; gap: 12px; }
        @media (max-width: 600px) { .header-actions { gap: 8px; } }

        header .cta-btn--sm {
          padding: 10px 18px; font-size: 14px; box-shadow: 0 6px 14px rgba(2,122,185,.18);
        }
        header .cta-btn--sm:hover {
          transform: scale(1.02); box-shadow: 0 8px 18px rgba(2,122,185,.24);
        }

        @media (max-width: 768px) {
          header .cta-btn--sm { padding: 8px 14px; font-size: 13px; }
        }

        /* Hero */
        .hero {
          position: relative;
          background: url('https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg') center/cover no-repeat;
          padding: 120px var(--page-padding); text-align: center;
        }
        .hero::after { content: ""; position: absolute; inset: 0; background: rgba(255,255,255,0.2); }
        .hero .container { position: relative; z-index: 1; }

        /* Pain & Solution */
        .pain-solution-section { background: #fff; padding: 72px 0; text-align: center; }
        .pain-card-list { max-width: 1200px; margin: 40px auto 0; display: grid; gap: 24px; grid-template-columns: repeat(auto-fill,minmax(180px,1fr)); padding: 0; list-style: none; }
        @media (min-width: 1024px) { .pain-card-list { grid-template-columns: repeat(5,1fr); } }

        .pain-card { border-radius: 24px; box-shadow: 0 6px 16px rgba(16,35,53,.08); overflow: hidden; display: grid; grid-template-rows: 1fr 1fr; height: 220px; transition: transform .2s, box-shadow .2s; }
        .pain-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(16,35,53,.15); }

        .pain-card .card-title { background: #009FB6; color: #ffffff; font-weight: 700; font-size: 16px; line-height: 1.4; padding: 16px 20px; display: flex; align-items: center; justify-content: center; text-align: center; }
        .pain-card .card-body { background: #ffffff; color: var(--ink); font-size: 14px; line-height: 1.5; padding: 16px 20px; overflow: hidden; }

        /* Third Section (Roles) */
        .third-section { background: #ffffff; padding: 72px 0; text-align: center; }
        .roles-wrapper { max-width: var(--container); margin: 0 auto; display: flex; align-items: center; gap: 56px; }

        .roles-img { flex: 0 0 40%; overflow: visible; }
        .roles-content { flex: 0 0 60%; }

        .roles-img img {
          width: 65%; height: 320px; object-fit: cover; border-radius: 24px;
          box-shadow: 0 16px 36px rgba(16,35,53,.22), 0 6px 14px rgba(16,35,53,.12);
        }

        .third-section .zz-img {
          box-shadow: 0 16px 36px rgba(16,35,53,.22), 0 6px 14px rgba(16,35,53,.12) !important;
          border-radius: 24px;
        }

        /* Accordion */
        .role-accordion { background: #fff; margin: 12px 16px 16px; padding: 16px 20px; }
        .role-accordion details {
          border: 1px solid var(--divider); border-left: 6px solid #262626; border-radius: 16px; overflow: hidden;
          transition: background .2s, border-left-color .2s;
          box-shadow: 0 10px 14px rgba(2,122,185,.1);
        }
        .role-accordion details + details { margin-top: 8px; }
        .role-accordion summary {
          list-style: none; cursor: pointer; padding: 20px 56px 20px 20px; font-weight: 400; font-size: 18px; position: relative;
        }
        .role-accordion summary::-webkit-details-marker { display: none; }
        .role-accordion summary::after {
          content: "›"; position: absolute; right: 20px; top: 50%; transform: translateY(-50%); font-size: 20px; transition: transform .2s;
        }
        .role-accordion details[open] { background: var(--paper-soft); border-left-color: #027AB9; }
        .role-accordion details[open] summary::after { transform: translateY(-50%) rotate(90deg); }
        .role-body { padding: 0 20px 20px; font-size: 16px; line-height: 1.5; font-weight: 400; color: var(--ink); }

        /* Fourth Section (Features) */
        .fourth-section { background: #025F96; padding: 80px 0; }
        .fourth-section .h2 { color: #fff; text-align: center; margin: 0 0 48px; }

        .feature-wrapper {
          max-width: var(--container); margin: 0 auto; display: flex; flex-direction: column; gap: 56px;
          padding: 0 var(--page-padding); box-sizing: content-box;
        }
        .feature-block { display: flex; align-items: center; gap: 56px; }
        .feature-block:nth-child(even) { flex-direction: row-reverse; }
        .feature-text { flex: 0 0 60%; }
        .feature-visual { flex: 0 0 40%; }

        .fourth-section .feature-text,
        .fourth-section .feature-text * { color: #fff; font-weight: 400; }
        .fourth-section .feature-text h3 { font-size: 24px; line-height: 32px; margin: 0 0 16px; }
        .fourth-section .feature-text ul { list-style: none; margin: 0; padding: 0; }
        .fourth-section .feature-text li { margin-bottom: 12px; font-size: 16px; line-height: 1.6; }
        .fourth-section .feature-text li strong { font-weight: 700; display: block; margin-bottom: 6px; }

        .feature-visual {
          height: 260px; border-radius: 24px; background: rgba(255, 255, 255, 0.12);
          display: flex; align-items: center; justify-content: center;
        }
        .feature-visual img {
          width: 100%; height: 100%; object-fit: cover; border-radius: 24px; display: block;
          box-shadow: 0 8px 20px rgba(0,0,0,.12);
        }

        @media (max-width: 960px) {
          .feature-block, .feature-block:nth-child(even) { flex-direction: column; }
          .feature-text, .feature-visual { flex: 0 0 auto; width: 100%; }
        }

        /* Brand Trust */
        .brand-trust-section { background: #fff; padding: 72px var(--page-padding); text-align: center; }
        .trust-list { display: grid; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); gap: 32px; max-width: 960px; margin: 0 auto; }

        .brand-trust-section .filmstrip-vintage {
          margin-left: calc(-1 * var(--page-padding)); margin-right: calc(-1 * var(--page-padding));
          width: calc(100% + 2 * var(--page-padding));
        }
        .brand-trust-section .h2 { margin-bottom: 16px; }
        .brand-trust-section .subtitle { margin: 0 0 32px; }
        .brand-trust-section .filmstrip-vintage { margin-top: 16px; margin-bottom: 32px; }
        .brand-trust-section .trust-list { margin-top: 48px; }

        .filmstrip-row {
          display: grid; grid-template-columns: repeat(5, 1fr); width: 100%; margin: 0; padding: 0; border: none;
        }
        .filmstrip-row img { width: 100%; height: 170px; display: block; margin: 0; padding: 0; border: none; }

        .caption-row {
          display: grid; grid-template-columns: repeat(5, 1fr); margin-top: 8px;
        }
        .caption-row p {
          text-align: center; font-size: 10px; color: #333; line-height: 1.4; margin: 0; padding: 0 4px;
        }

        /* Individual Membership */
        .individual-membership-section {
          background: #fff; padding: 24px 0;
          --edge-x: 32px; --text-right-inset: 24px; --cta-left-inset: 24px; --cta-right-gap: 48px;
        }

        .individual-membership-section .membership-wrapper {
          max-width: var(--container); margin: 0 auto; padding: 40px var(--edge-x);
          background: rgba(0,159,182,.08); border-radius: 24px;
          display: grid; grid-template-columns: 70% 30%; align-items: center; gap: 40px;
        }

        .individual-membership-section .membership-text {
          min-width: 0; padding-right: var(--text-right-inset);
        }

        .individual-membership-section .membership-cta {
          display: flex; justify-content: flex-end; align-items: center;
          padding-left: var(--cta-left-inset); padding-right: var(--cta-right-gap);
        }

        .individual-membership-section .secondary-btn { margin: 0; }

        @media (max-width: 960px) {
          .individual-membership-section .membership-wrapper {
            grid-template-columns: 1fr; gap: 20px; padding: 28px 20px;
          }
          .individual-membership-section .membership-text,
          .individual-membership-section .membership-cta { padding: 0; }
        }

        /* CTA Section */
        .cta-section { background: #fff; padding: 64px 0; }
        .cta-wrapper { max-width: var(--container); margin: 0 auto; display: flex; align-items: stretch; gap: 48px; }

        .cta-form {
          flex: 1 1 560px; background: #FFFFFF; border: 1px solid var(--divider); border-radius: 24px; padding: 28px;
          box-shadow: 0 14px 36px rgba(2, 122, 185, 0.22), 0 4px 12px rgba(2, 122, 185, 0.14);
          border: 1px solid rgba(2, 122, 185, 0.2);
          --row-gap: 20px; --col-gap: 16px;
        }
        .cta-form .h2 { margin: 0 0 8px; }
        .cta-form .subtitle { font-size: 15px; line-height: 22px; color: var(--ink-dim); margin: 0 0 18px; }

        .form-row { display: grid; gap: 12px; margin-bottom: var(--row-gap); }
        .form-row.two { grid-template-columns: repeat(2, 1fr); }
        .form-row.three { grid-template-columns: repeat(3, 1fr); }
        .form-row.four { grid-template-columns: repeat(4, 1fr); }

        .cta-form .form-row.two,
        .cta-form .form-row.three,
        .cta-form .form-row.four { column-gap: var(--col-gap); }

        .field { display: flex; flex-direction: column; gap: 6px; }

        .cta-form label { font-size: 14px; font-weight: 700; letter-spacing: .01em; color: #027AB9; }
        .cta-form label .opt { color: #6A7A8A; font-weight: 700; }

        .cta-form input,
        .cta-form select,
        .cta-form textarea {
          width: 100%; height: 56px; border: 1.5px solid #D7DEE8; border-radius: 18px; background: #FFFFFF;
          font-size: 16px; color: #1F2937; padding: 12px 16px; outline: none;
          transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
          -webkit-appearance: none; appearance: none;
        }
        .cta-form textarea { min-height: 100px; height: auto; line-height: 1.5; resize: vertical; }
        .cta-form ::placeholder { color: #A9B4C2; }

        .cta-form input:focus,
        .cta-form select:focus,
        .cta-form textarea:focus {
          border-color: #027AB9; box-shadow: 0 0 0 3px rgba(2,122,185,.18); background: #FFFFFF;
        }

        .cta-form .cta-btn {
          height: 52px; padding: 0 28px; border: none; border-radius: 999px;
          background: linear-gradient(90deg, #009FB6, #027AB9); color: #fff; font-weight: 800; font-size: 16px;
          line-height: 1; cursor: pointer; box-shadow: 0 10px 24px rgba(2,122,185,.22);
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
          display: block; margin: 12px auto 0;
        }
        .cta-form .cta-btn:hover {
          background: linear-gradient(90deg, #00BEE3, #0286C9);
          transform: translateY(-1px); box-shadow: 0 12px 28px rgba(2,122,185,.28);
        }

        .form-row.four .field.company { grid-column: span 2; }

        @media (max-width: 1200px) {
          .form-row.four { grid-template-columns: repeat(2, 1fr); }
          .form-row.three { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 960px) {
          .cta-wrapper { flex-direction: column; gap: 24px; }
          .form-row.two, .form-row.three, .form-row.four { grid-template-columns: 1fr; }
          .cta-form { padding: 22px; }
        }

        /* Footer */
        footer {
          --footer-bg: #FFFFFF; --footer-link: #1E60A9; --footer-text: #5F7180; --footer-border: #DCE3ED;
          background: var(--footer-bg); color: var(--footer-text); border-top: 1px solid var(--footer-border);
          padding: 24px 0 16px; font-size: 14px;
        }

        footer .container {
          max-width: var(--container, 1200px); margin: 0 auto; padding: 0 24px; text-align: center;
        }

        footer .container > div { margin-bottom: 8px; }
        footer .container > div:last-child { margin-bottom: 0; }

        footer a { color: var(--footer-link); text-decoration: none; }
        footer a:hover { text-decoration: underline; }
        footer a:focus-visible { outline: 2px solid var(--footer-link); outline-offset: 2px; border-radius: 3px; }

        footer .footer-links { margin: 4px 0 8px; line-height: 1.6; color: var(--footer-text); }

        footer .social {
          display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-bottom: 8px;
        }
        footer .social a { color: var(--footer-link); }

        .footer-info-section {
          background: #FFFFFF;
          padding-top: 24px;
          padding-bottom: 16px;
          border-top: 1px solid #DCE3ED;
        }

        .footer-bottom {
          text-align: center;
          font-size: 14px;
          color: #5F7180;
        }

        .footer-bottom .footer-info {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .footer-bottom .links,
        .footer-bottom .social {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .footer-bottom .legal {
          font-size: 13px;
          color: #64798A;
        }

        @media (max-width: 768px) { footer { font-size: 13px; } }

        /* Footer styles */

        @media (max-width: 960px) {
          :root { --page-padding: 24px; }
        }

        .hero { padding: 120px var(--page-padding); }
        @media (max-width: 600px) {
          .hero { padding: 80px var(--page-padding); }
        }

        @media (max-width: 960px) {
          .feature-block, .feature-block:nth-child(even) {
            flex-direction: column !important; gap: 24px;
          }
          .feature-wrapper { gap: 32px; }
          .fourth-section .feature-text li { font-size: 14px; }
        }

        @media (max-width: 600px) {
          .brand-trust-section .filmstrip-row {
            display: grid; grid-auto-flow: column; grid-auto-columns: 80vw; overflow-x: auto;
            scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
          }
          .brand-trust-section .filmstrip-row img { height: 160px; scroll-snap-align: center; }
          .brand-trust-section .caption-row { display: none; }
        }

        @media (max-width: 600px) {
          .h1 { font-size: 36px; line-height: 44px; }
          .h2 { font-size: 24px; line-height: 32px; }
        }

        @media (max-width: 960px) {
          .roles-wrapper { flex-direction: column; gap: 24px; text-align: center; }
          .roles-content { text-align: left; }
        }

        @media (max-width: 960px) {
          .roles-img { 
            max-width: 320px; margin: 0 auto; height: 320px; position: relative;
          }
          .roles-img .zz-img { 
            width: 70%; height: 240px; object-fit: cover; border-radius: 24px;
          }
          .roles-img .zz-img:nth-child(1) { position: relative; top: 0; left: 0; z-index: 3; }
          .roles-img .zz-img:nth-child(2) { position: absolute; top: 20px; left: 28%; z-index: 2; }
          .roles-img .zz-img:nth-child(3) { position: absolute; top: 40px; left: 0; z-index: 1; }
        }

        #roles .subtitle, .roles-content .subtitle { 
          font-size: 20px; line-height: 30px;
        }

        @media (max-width: 960px) {
          .roles-img { display: none; }
          .roles-content { flex: 1 1 100%; width: 100%; }
        }

        /* Success/Error Messages */
        .success-message, .error-message {
          margin-top: 16px; padding: 12px 16px; border-radius: 8px; font-size: 14px;
        }
        .success-message { background: rgba(34, 197, 94, 0.1); color: #16a34a; border: 1px solid rgba(34, 197, 94, 0.2); }
        .error-message { background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.2); }
      `}</style>

      {/* Header */}
      <header className="site-header">
        <a href="/business" className="brand-logo" aria-label="Taipei Language Institute Logo">
          <Image
            src="https://drive.google.com/thumbnail?id=1-eMGYDEmR20U0q9CurC0Z49jW6aTUcgO&sz=w400"
            alt="Taipei Language Institute logo"
            width={200}
            height={36}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block', 
              maxWidth: '200px',
              position: 'relative',
              margin: 0,
              padding: 0,
              border: 'none'
            }}
            sizes="200px"
            priority
            unoptimized={false}
          />
        </a>
        
        {/* Header Buttons - Clean Implementation */}
        <div style={{
          position: 'absolute',
          right: '100px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10
        }}>
          <button 
            onClick={scrollToContact} 
            aria-label="Free Consultation"
            style={{
              background: 'linear-gradient(90deg, #009FB6, #027AB9)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '36px',
              minWidth: '80px',
              whiteSpace: 'nowrap',
              boxShadow: '0 6px 14px rgba(2,122,185,.18)',
              transition: 'all 0.25s ease-in-out',
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 18px rgba(2,122,185,.24)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 14px rgba(2,122,185,.18)';
            }}
          >
            Free Consultation
          </button>
          <a 
            href="/student/login" 
            aria-label="Login"
            style={{
              background: 'linear-gradient(90deg, #009FB6, #027AB9)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '36px',
              minWidth: '80px',
              whiteSpace: 'nowrap',
              boxShadow: '0 6px 14px rgba(2,122,185,.18)',
              transition: 'all 0.25s ease-in-out',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 18px rgba(2,122,185,.24)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 14px rgba(2,122,185,.18)';
            }}
          >
            Login
          </a>
        </div>
      </header>

      {/* Spacer */}
      <div style={{height: '72px'}}></div>

      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="container hero-text" style={{textAlign: 'center'}}>
          <div style={{background: 'rgba(255,255,255,0.8)', padding: '32px 40px', borderRadius: '24px', display: 'block', maxWidth: '720px', width: '100%', margin: '0 auto'}}>
            <h1 className="h1">TLI Connect — Build Your Own Global Talent Community</h1>
            <p className="body-l" style={{fontSize: '20px'}}>Integrated language, culture &amp; business modules — learn anytime, anywhere with global professionals.</p>
            <p className="body-m" style={{marginBottom: '0'}}>Since 1956, TLI has specialized in language education, serving enterprises and academic institutions around the world.</p>
          </div>
          <button
            type="button"
            className="cta-btn"
            aria-label="Free Consultation"
            style={{marginTop: '24px'}}
            onClick={scrollToContact}
          >
            Free Consultation
          </button>
        </div>
      </section>

      {/* Pain & Solution */}
      <section className="pain-solution-section" style={{background: 'rgba(0,159,182,0.08)', padding: '72px 0', textAlign: 'center'}}>
        <h2 className="h2">What Challenges Are You Facing in International Training?</h2>
        <p className="subtitle" style={{fontSize: '20px'}}>As you help employees adapt to diverse cultures and markets, do any of these issues resonate?</p>

        <ul className="pain-card-list">
          <li className="pain-card">
            <div className="card-title">Low communication efficiency</div>
            <div className="card-body">Meetings drag on, presentations fall flat, undermining decisions and persuasion.</div>
          </li>
          <li className="pain-card">
            <div className="card-title">Frequent cultural clashes</div>
            <div className="card-body">Missteps in local customs disrupt team trust and cohesion.</div>
          </li>
          <li className="pain-card">
            <div className="card-title">Slow market roll‑out</div>
            <div className="card-body">Lack of ready‑to‑deploy language and support staff delays your launch schedule.</div>
          </li>
          <li className="pain-card">
            <div className="card-title">Unclear training impact & management burden</div>
            <div className="card-body">Dispersed courses across platforms make tracking progress and ROI nearly impossible.</div>
          </li>
          <li className="pain-card">
            <div className="card-title">Low engagement & weak learning culture</div>
            <div className="card-body">Employees lack motivation and community support, so continuous learning never takes hold.</div>
          </li>
        </ul>
      </section>

      {/* Third Section - Role Scenarios */}
      <section className="third-section" id="roles">
        <div className="roles-wrapper">
          <div className="roles-img" aria-hidden="true" style={{position: 'relative', maxWidth: '350px', margin: '0 auto'}}>
            <Image
              className="zz-img"
              src="https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg"
              alt="Scenario 1"
              width={240}
              height={250}
              style={{
                width: '65%', height: '250px', objectFit: 'cover', borderRadius: '24px',
                boxShadow: '0 8px 24px rgba(16,35,53,.12)', position: 'relative',
                top: '-125px', left: '-15%', zIndex: 1
              }}
            />
            <Image
              className="zz-img"
              src="https://images.unsplash.com/photo-1701980889802-55ff39e2e973?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Scenario 2"
              width={240}
              height={250}
              style={{
                width: '65%', height: '250px', objectFit: 'cover', borderRadius: '24px',
                boxShadow: '0 8px 24px rgba(16,35,53,.12)', position: 'absolute',
                top: '-20px', left: '50%', zIndex: 2
              }}
            />
            <Image
              className="zz-img"
              src="https://images.pexels.com/photos/12437056/pexels-photo-12437056.jpeg"
              alt="Scenario 3"
              width={240}
              height={250}
              style={{
                width: '65%', height: '250px', objectFit: 'cover', borderRadius: '24px',
                boxShadow: '0 8px 24px rgba(16,35,53,.12)', position: 'absolute',
                top: '160px', left: '0%', zIndex: 3
              }}
            />
          </div>
          <div className="roles-content">
            <h2 className="h2">Tailored Training for Every Role on Your Team</h2>
            <p className="subtitle" style={{fontSize: '20px'}}>Whether you&apos;re launching a new project or collaborating day-to-day, we help you bridge departmental divides. We empower your team by building a common language and fostering a shared cultural understanding for smoother collaboration.</p>

            <div className="role-accordion">
              <details open>
                <summary>Expats &amp; New Hires</summary>
                <div className="role-body">Strengthen language skills and local cultural awareness before day one.</div>
              </details>
              <details>
                <summary>Foreign Managers &amp; Technical Experts</summary>
                <div className="role-body">Learn local management styles to reduce onboarding friction.</div>
              </details>
              <details>
                <summary>Sales &amp; Project Teams</summary>
                <div className="role-body">Master cross‑border presentations, proposals, and negotiation tactics.</div>
              </details>
              <details>
                <summary>Customer Support &amp; Service</summary>
                <div className="role-body">Improve client interactions and cultural sensitivity.</div>
              </details>
              <details>
                <summary>Global Project Contributors</summary>
                <div className="role-body">Align training with project milestones to ensure consistent communication quality.</div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Fourth Section - Features */}
      <section className="fourth-section" id="features" style={{background: '#025F96', padding: '80px 0', color: '#fff'}}>
        <h2 className="h2" style={{textAlign: 'center', margin: '0 0 48px'}}>How We Help You Achieve Your Training Goals</h2>

        <div className="feature-wrapper">
          {/* Block A */}
          <div className="feature-block">
            <div className="feature-text">
              <h3 style={{margin: '0 0 16px', fontSize: '24px', lineHeight: '32px', fontWeight: '400'}}>We Create a Learning Experience Your Team Will Love</h3>
              <ul style={{listStyle: 'none', margin: '0', padding: '0'}}>
                <li style={{marginBottom: '12px', fontSize: '16px', lineHeight: '1.6', fontWeight: '400'}}>
                  <strong style={{display: 'block', marginBottom: '6px', fontWeight: '700'}}>Flexible &amp; Cost-Effective Training</strong>
                  <span>Combine a video library, live small-group classes, and in-person workshops to create a blended learning program that fits your team&apos;s schedule and your budget.</span>
                </li>
                <li style={{marginBottom: '12px', fontSize: '16px', lineHeight: '1.6', fontWeight: '400'}}>
                  <strong style={{display: 'block', marginBottom: '6px', fontWeight: '700'}}>A Community to Boost Engagement</strong>
                  <span>A cross-border forum allows learners to ask questions, share insights, and network, building a powerful internal knowledge network for your company.</span>
                </li>
              </ul>
            </div>
            <div className="feature-visual" aria-hidden="true">
              <Image
                src="https://drive.google.com/thumbnail?id=1-2N3ADEgUMbVAVpJMkdNehtAfCWPC8M-&sz=w1600"
                alt="Learning Hub"
                width={400}
                height={260}
                style={{width: '100%', height: '260px', objectFit: 'cover', borderRadius: '24px', display: 'block', boxShadow: '0 8px 20px rgba(0,0,0,.12)'}}
              />
            </div>
          </div>

          {/* Block B */}
          <div className="feature-block" style={{flexDirection: 'row-reverse'}}>
            <div className="feature-text">
              <h3 style={{margin: '0 0 16px', fontSize: '24px', lineHeight: '32px', fontWeight: '400'}}>Streamline Processes &amp; Measure What Matters</h3>
              <ul style={{listStyle: 'none', margin: '0', padding: '0'}}>
                <li style={{marginBottom: '12px', fontSize: '16px', lineHeight: '1.6', fontWeight: '400'}}>
                  <strong style={{display: 'block', marginBottom: '6px', fontWeight: '700'}}>Automated HR &amp; Admin</strong>
                  <span>Cut down on manual work with self-service enrollment, automated reminders, and attendance tracking, reducing administrative burden and paperwork.</span>
                </li>
                <li style={{marginBottom: '12px', fontSize: '16px', lineHeight: '1.6', fontWeight: '400'}}>
                  <strong style={{display: 'block', marginBottom: '6px', fontWeight: '700'}}>Real-Time Progress Tracking</strong>
                  <span>Monitor learning status with dashboard reports and at-a-glance summaries. Easily track team progress and align training with your company&apos;s performance goals.</span>
                </li>
              </ul>
            </div>
            <div className="feature-visual" aria-hidden="true">
              <Image
                src="https://drive.google.com/thumbnail?id=1DJnDUDcbaryrG27Jgb-gt0AWPXr-SKGo&sz=w1600"
                alt="Automation & KPI"
                width={400}
                height={260}
                style={{width: '100%', height: '260px', objectFit: 'cover', borderRadius: '24px', display: 'block', boxShadow: '0 8px 20px rgba(0,0,0,.12)'}}
              />
            </div>
          </div>

          {/* Block C */}
          <div className="feature-block">
            <div className="feature-text">
              <h3 style={{margin: '0 0 16px', fontSize: '24px', lineHeight: '32px', fontWeight: '400'}}>Scale Your Training Across the Globe</h3>
              <ul style={{listStyle: 'none', margin: '0', padding: '0'}}>
                <li style={{marginBottom: '12px', fontSize: '16px', lineHeight: '1.6', fontWeight: '400'}}>
                  <strong style={{display: 'block', marginBottom: '6px', fontWeight: '700'}}>Multi-Language Support for Global Teams</strong>
                  <span>Access content covering language, culture, and key business topics, all available in multiple languages. The platform easily expands to support your new regional markets as you grow.</span>
                </li>
              </ul>
            </div>
            <div className="feature-visual" aria-hidden="true">
              <Image
                src="https://drive.google.com/thumbnail?id=1CTnouKt7sz-z_0CFRuIwk5ROZDBTO3QZ&sz=w1600"
                alt="Global Scale"
                width={400}
                height={260}
                style={{width: '100%', height: '260px', objectFit: 'cover', borderRadius: '24px', display: 'block', boxShadow: '0 8px 20px rgba(0,0,0,.12)'}}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Brand Trust */}
      <section className="brand-trust-section">
        <h2 className="h2">From Language Instruction to Cross-Cultural Collaboration—TLI&apos;s Commitment</h2>
        <p className="subtitle" style={{fontSize: '20px'}}>TLI Connect extends 70 years of TLI&apos;s educational heritage, delivering scalable, governable, and measurable cross-cultural training solutions.</p>
        
        <div className="filmstrip-vintage">
          <div className="filmstrip-row">
            <Image src="https://drive.google.com/thumbnail?id=1ty5zRQX-Na3YIiVVt0-NTLLW-HA-zrc_&sz=w1600" alt="Professor John King Fairbank" width={240} height={170} />
            <Image src="https://drive.google.com/thumbnail?id=12zdFoBZzR6gcRwEBG37IRb85a4Sn00mu&sz=w1600" alt="Mr. James Stapleton Roy" width={240} height={170} />
            <Image src="https://drive.google.com/thumbnail?id=13r0Zn7E9YCj9-waSjb3Wp9uFJ65iBluS&sz=w1600" alt="Mr. Nicholas Kristof and Ms. Sheryl WuDunn" width={240} height={170} />
            <Image src="https://drive.google.com/thumbnail?id=13Q4uM8toWNxVaN9tSzbw9GtWHnjxrBI9&sz=w1600" alt="Mr. Lee Kuan Yew" width={240} height={170} />
            <Image src="https://drive.google.com/thumbnail?id=1co45YrsO_hgKCZnUdYxoz-9ik9WzmZHw&sz=w1600" alt="Mr. Mike Chinoy" width={240} height={170} />
          </div>
          <div className="caption-row">
            <p>Professor John King Fairbank — Harvard University Sinologist</p>
            <p>Mr. James Stapleton Roy — Former U.S. Ambassador to Beijing</p>
            <p>Mr. Nicholas Kristof & Ms. Sheryl WuDunn — Pulitzer Prize Winners for International Reporting</p>
            <p>Mr. Lee Kuan Yew — Former Prime Minister of Singapore</p>
            <p>Mr. Mike Chinoy — Former Asia-Pacific Regional Director, CNN</p>
          </div>
        </div>
        
        <div className="trust-list">
          <div>
            <p style={{fontSize: '48px', fontWeight: '800', color: 'var(--primary)', margin: '0 0 8px 0'}}>1956</p>
            <p style={{color: 'var(--ink)', fontWeight: '200'}}>TLI founded, serving the U.S. State Department&apos;s stationed diplomats and advisors</p>
          </div>
          <div>
            <p style={{fontSize: '48px', fontWeight: '800', color: 'var(--primary)', margin: '0 0 8px 0'}}>80,000+</p>
            <p style={{color: 'var(--ink)', fontWeight: '200'}}>Chinese teachers certified with over 500 teaching materials developed</p>
          </div>
          <div>
            <p style={{fontSize: '48px', fontWeight: '800', color: 'var(--primary)', margin: '0 0 8px 0'}}>400,000+</p>
            <p style={{color: 'var(--ink)', fontWeight: '200'}}>Students trained across Fortune 500 firms, embassies, and institutions</p>
          </div>
        </div>
      </section>

      {/* Individual Membership */}
      <section className="individual-membership-section" id="membership">
        <div className="membership-wrapper">
          <div className="membership-text">
            <h2>Activate Your Individual Membership—Join the Global Learning Community Today</h2>
            <p className="body-l" style={{fontSize: '15px', lineHeight: '18px'}}>
              Choose our flexible 3- or 12-month plan to enjoy curated video courses, live small-group sessions, and exclusive forum interactions—grow alongside learners worldwide.
            </p>
          </div>
          <div className="membership-cta">
            <a href="/" className="secondary-btn" aria-label="View Individual Plans">View Individual Plans</a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="contact">
        <div className="cta-wrapper">
          <div className="cta-form">
            <h2 className="h2">Ready to Kick-Start Corporate Cross-Cultural Training?</h2>
            <p className="subtitle">Tell us what you need, and our consultants will craft a scalable, measurable training roadmap for your team.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row four">
                <div className="field">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="field">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="field company">
                  <label htmlFor="company">Company *</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    placeholder="Your company"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row four">
                <div className="field">
                  <label htmlFor="phone">Phone <span className="opt">(optional)</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+886 912 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="field">
                  <label htmlFor="jobtitle">Job Title <span className="opt">(optional)</span></label>
                  <input
                    type="text"
                    id="jobtitle"
                    name="jobtitle"
                    placeholder="Your job title"
                    value={formData.jobtitle}
                    onChange={(e) => setFormData({...formData, jobtitle: e.target.value})}
                  />
                </div>
                <div className="field">
                  <label htmlFor="primaryTraining">Primary Training Needs <span className="opt">(optional)</span></label>
                  <select
                    id="primaryTraining"
                    name="primaryTraining"
                    value={formData.primaryTraining}
                    onChange={(e) => setFormData({...formData, primaryTraining: e.target.value})}
                  >
                    <option value="" disabled>Select one</option>
                    <option value="language">Language</option>
                    <option value="culture">Culture</option>
                    <option value="business">Business</option>
                    <option value="instructor">Instructor Training</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="participants">Number of Participants <span className="opt">(optional)</span></label>
                  <select
                    id="participants"
                    name="participants"
                    value={formData.participants}
                    onChange={(e) => setFormData({...formData, participants: e.target.value})}
                  >
                    <option value="" disabled>Select one</option>
                    <option value="<50">&lt;50</option>
                    <option value="50-100">50–100</option>
                    <option value="100-300">100–300</option>
                    <option value="300-500">300–500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="requirements">Brief Description of Your Requirements <span className="opt">(optional)</span></label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    placeholder="Describe your requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="cta-btn" disabled={isSubmitting} aria-label="Free Consultation">
                {isSubmitting ? 'Submitting...' : 'Free Consultation'}
              </button>
            </form>

            {showSuccess && (
              <div className="success-message">
                Thank you for your submission! We will contact you soon.
              </div>
            )}

            {showError && (
              <div className="error-message">
                There was an error submitting your form. Please try again or contact us directly at contact@tli1956.com
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-info-section" style={{backgroundColor: '#DFDFDF', position: 'relative', paddingBottom: '60px'}}>
        <div className="container footer-bottom">
          <div className="body-m footer-info">
            <a href="https://tli1956.com/?lang=en" target="_blank" rel="noopener noreferrer">TLI Taipei Language Institute</a><span> | </span>
            <a href="mailto:contact@tli1956.com" style={{color:'#1E60A9'}}>contact@tli1956.com</a>
          </div>
          <div className="social body-m" style={{marginBottom:'8px'}}>
            <a href="https://www.linkedin.com/school/taipei-language-institute/posts/?feedView=all"
               target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LinkedIn</a>
            <a href="https://www.youtube.com/channel/UCCySlsmCXX8Id-m5NSTLCrw"
               target="_blank" rel="noopener noreferrer" aria-label="YouTube">YouTube</a>
            <a href="https://www.instagram.com/learn.chinese.tli/?hl=en"
               target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
            <a href="https://www.facebook.com/tli1956/?locale=zh_TW"
               target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
          </div>
          <div className="legal">© TLI Taipei Language Institute. All rights reserved.</div>
        </div>
        
        {/* Footer Login Button - Clean Implementation */}
        <div className="footer-login-container">
          <a 
            href="/login" 
            aria-label="Login for all roles"
            style={{
              background: 'linear-gradient(90deg, #009FB6, #027AB9)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '36px',
              minWidth: '80px',
              whiteSpace: 'nowrap',
              boxShadow: '0 6px 14px rgba(2,122,185,.18)',
              transition: 'all 0.25s ease-in-out',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 18px rgba(2,122,185,.24)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 14px rgba(2,122,185,.18)';
            }}
          >
            Login
          </a>
        </div>
      </footer>
    </>
  );
}