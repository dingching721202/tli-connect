'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [heroForm, setHeroForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [footerForm, setFooterForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState({
    hero: false,
    footer: false
  });

  const [showSuccess, setShowSuccess] = useState({
    hero: false,
    footer: false
  });

  const [showError, setShowError] = useState({
    hero: false,
    footer: false
  });

  // API endpoint from the original HTML
  const API_ENDPOINT = 'https://n8n-gphufbto.ap-southeast-1.clawcloudrun.com/webhook/to_c_leads';

  // Add hydrated class to body on mount
  useEffect(() => {
    document.body.classList.add('hydrated');
  }, []);

  // Validation functions
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Scroll to footer form function
  const scrollToFooterForm = () => {
    document.querySelector('#footerForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Create consultation record
  const createConsultationRecord = async (formData: { name: string; email: string; phone: string }) => {
    try {
      await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'individual',
          contactName: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || '',
          source: 'individual_form'
        }),
      });
    } catch (error) {
      console.error('Failed to create consultation record:', error);
      // Don't fail the main submission if this fails
    }
  };

  // Form submission handler
  const handleSubmit = (formType: 'hero' | 'footer') => async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = formType === 'hero' ? heroForm : footerForm;
    const setForm = formType === 'hero' ? setHeroForm : setFooterForm;

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setShowError({...showError, [formType]: true});
      return;
    }

    if (!validateEmail(formData.email.trim())) {
      setShowError({...showError, [formType]: true});
      return;
    }

    // Reset states
    setShowSuccess({...showSuccess, [formType]: false});
    setShowError({...showError, [formType]: false});
    setIsSubmitting({...isSubmitting, [formType]: true});

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || ''
        })
      });

      if (response.ok) {
        // Original API call succeeded, now create consultation record
        await createConsultationRecord(formData);
        
        setShowSuccess({...showSuccess, [formType]: true});
        setForm({ name: '', email: '', phone: '' });
        setTimeout(() => {
          setShowSuccess({...showSuccess, [formType]: false});
        }, 5000);
      } else {
        setShowError({...showError, [formType]: true});
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setShowError({...showError, [formType]: true});
    } finally {
      setIsSubmitting({...isSubmitting, [formType]: false});
    }
  };

  return (
    <>
      <Head>
        <title>TLI Connect — Break Language Barriers</title>
        <meta name="description" content="TLI Connect — Language × Culture × Business membership. Scenario‑based courses, workshops, and a cross‑cultural community backed by TLI since 1956." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Fonts */}
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
        :root{
          /* Layout */
          --container: 1200px;
          --r32: 32px;

          /* Palette — 輕藍 × 黃 */
          /* Page backgrounds */
          --black: #F5F8FC;          /* 原做為整頁底色，改成極淺藍 */
          --black-900: #103A63;      /* 深藍，用於 filmstrip 區塊底 */
          --paper: #FFFFFF;          /* 主要卡片／Hero 底色 */
          --paper-soft: #F9FBFE;     /* 柔和卡片底 */

          /* Text */
          --ink: #262626;            /* 主要文字深藍灰 */
          --ink-dim: #6A7A8A;        /* 次要文字 */

          /* Lines */
          --divider: rgba(16,35,53,.14);

          /* Accents */
          --gold: #027AB9;           /* 主 CTA 與重點*/
          --gold-strong: #026AA7;    /* hover */

          /* States */
          --error: #D54848;
          --success: #1CA87A;

          /* 補充（若需） */
          --blue-500: #027AB9;       /* 行銷文案標色／強調 */
          --blue-100: #E9F2FF;       /* 很淺的藍色背景 */
        }
        *,*::before,*::after{box-sizing:border-box}
        html,body{margin:0;padding:0}
        body{font-family:Inter, "Noto Sans", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif; color:var(--ink); background:var(--black)}
        a{text-decoration:none; color:#1E60A9}
        img{max-width:100%; display:block}
        .container{max-width:var(--container); margin:0 auto; padding:0 24px}
        .section{padding:88px 0}
        @media (max-width:767px){.section{padding:64px 0}}

        h1,h2,h3{margin:0 0 16px; color:var(--ink); font-family:"Plus Jakarta Sans", "Noto Sans TC", Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-feature-settings:"pnum" 1, "lnum" 1; font-weight:800}
        .h1{font-size:48px; line-height:64px; font-weight:800; letter-spacing:-0.015em}
        .h2{font-size:34px; line-height:42px; font-weight:800; letter-spacing:-0.01em}
        .h3{font-size:20px; line-height:30px; font-weight:300; letter-spacing:-0.01em}
        .body-l{font-size:18px; line-height:28px; color:var(--ink)}
        .body-m{font-size:16px; line-height:26px; color:var(--ink-dim)}
        .label{font-size:14px; line-height:20px; font-weight:600; color:#027AB9}
        .caption{font-size:12px; line-height:18px; color:var(--ink-dim)}
        @media (max-width:1100px){.h1{font-size:44px; line-height:52px} .h2{font-size:30px; line-height:38px}}

        /* Header */
        :root { --header-padding: 100px; }
        @media (max-width: 960px) { :root { --header-padding: 24px; } }
        @media (max-width: 600px) { :root { --header-padding: 16px; } }
        .site-header{position:fixed; top:0; left:0; right:0; height:72px; background:#fff; z-index:9998; display:flex; align-items:center; justify-content:space-between; padding:0 var(--header-padding)}
        .brand-logo{display:inline-block; width:200px}
        .brand-logo img{width:100%; height:auto}
        @media (max-width:767px){.brand-logo img{height:30px}}
        
        /* CTA Button Styles */
        .cta-btn{background:linear-gradient(90deg,#009FB6,#027AB9);color:#fff;border:none;padding:16px 40px;border-radius:999px;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.25s ease-in-out;box-shadow:0 10px 24px rgba(2,122,185,0.22);text-decoration:none;display:inline-block}
        .cta-btn:hover{background:linear-gradient(90deg,#00BEE3,#0286C9);transform:scale(1.04);box-shadow:0 8px 24px rgba(2,122,185,0.32)}
        .cta-btn--sm{padding:10px 18px;font-size:14px;box-shadow:0 6px 14px rgba(2,122,185,.18)}
        .cta-btn--sm:hover{transform:scale(1.02);box-shadow:0 8px 18px rgba(2,122,185,.24)}
        @media (max-width:768px){.cta-btn--sm{padding:8px 14px;font-size:13px}}
        .brand{font-weight:800; letter-spacing:.01em; color:var(--ink)}
        
        /* Header actions */
        .header-actions{display:flex; align-items:center; gap:12px}
        @media (max-width:600px){.header-actions{gap:8px}}

        /* HERO：標題左、表單右 */
        .hero{background:linear-gradient(180deg, #FFFFFF 0%, #F7FAFE 60%, #F5F8FC 100%)}
        .hero-grid{display:block}
        .hero-inline{display:grid; grid-template-columns:minmax(0,1fr) 440px; gap:32px; align-items:start}
        @media (max-width:992px){.hero-inline{grid-template-columns:1fr; gap:28px}}
        .hero-copy .tagline{color:#7FA8D8}
        .badge {
          display: inline-block;
          padding: 6px 12px;
          border: 1px solid #009FB6;
          border-radius: 999px;
          font-size: 14px;
          color: #009FB6;
          margin: 20px 0;
          background: #ffffff;
        }
        .hero-bullets{margin-top:24px}
        @media (max-width:1200px){.hero-grid{grid-template-columns:1fr; gap:32px}}

        /* Form */
        .card-form{background:var(--paper); border:1px solid var(--divider); border-radius: 24px; box-shadow:0 10px 30px rgba(16,58,99,.06); padding:32px}
        .form-grid{display:grid; grid-template-columns:1fr; gap:16px}
        input[type="text"],input[type="email"],input[type="tel"]{height:52px; border:1px solid var(--divider); border-radius:12px; padding:0 16px; font-size:16px; color:var(--ink); background:#FFFFFF; outline:none}
        input::placeholder{color:#98A6B3}
        input:focus{border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(46,110,182,.18)}
        .btn{height:56px; border:none; border-radius:999px; background:linear-gradient(90deg, #009FB6, #027AB9); color:#FFFFFF; font-size:16px; font-weight:700; cursor:pointer; box-shadow:0 10px 24px rgba(242,193,78,.22)}
        .btn:hover{background:linear-gradient(90deg, #009FB6, #026AA7)}
        .error-msg{display:none; color:var(--error); font-size:12px; margin-top:6px}
        .success{border-left:4px solid var(--success); background:rgba(28,168,122,.08); color:#0F7F5F; padding:12px 16px; border-radius:12px; margin-top:16px; font-size:14px}
        .success.hide{display:none}
        .fail{border-left:4px solid var(--error); background:rgba(213,72,72,.08); color:#B04343; padding:12px 16px; border-radius:12px; margin-top:16px; font-size:14px}
        .fail.hide{display:none}

        /* Filmstrip */
        .filmstrip{height:200px; background:#ffffff; overflow:hidden; border-top:20px solid #ffffff; border-bottom:1px solid #ffffff}
        .filmstrip .row{display:grid; grid-template-columns:repeat(4, 1fr); gap:0; height:100%; width:100vw; margin-left:calc(50% - 50vw)}
        .tile{position:relative; overflow:hidden}
        .tile img{width:100%; height:100%; object-fit:cover; filter:grayscale(6%) contrast(1.03) saturate(0.96)}
        .tile > span{display: block !important; width:100% !important; height:100% !important;}
        .tile > span > img{width:100% !important; height:100% !important; object-fit:cover !important; position:relative !important; filter:grayscale(6%) contrast(1.03) saturate(0.96) !important;}
        .tile::after{content:""; position:absolute; inset:0; background:linear-gradient(0deg, rgba(16,35,53,.18), rgba(16,35,53,.18)); z-index:1; pointer-events:none;}
        @media (max-width:767px){.filmstrip{height:140px}}

        /* Numbers */
        .numbers{background:#FFFFFF}
        .num-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:24px; text-align:center}
        .filmstrip-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr); /* 五格，完全對齊 */
          width: 100%;
          margin: 0;
          padding: 0;
          border: none;
        }

        .filmstrip-row img {
          width: 100%;
          height: 180px; /* 一致高度 */
          display: block;
          margin: 0;
          padding: 0;
          border: none;
        }

        .caption-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr); /* 對齊圖片 */
          margin-top: 8px;
        }

        .caption-row p {
          text-align: center;
          font-size: 10px;
          color: #333;
          line-height: 1.4;
          margin: 0;
          padding: 0 4px;
        }

        .num {
          font-size: 32px;
          color: #027AB9;
          font-weight: bold;
          line-height: 1.2;
        }

        /* Why */
        .why{background:#FFFFFF}
        .why-rows{display:grid; gap:24px; margin-top:40px}
        .why-item{display:grid; grid-template-columns:1fr 1fr; gap:24px; border:1px solid var(--divider); border-radius:24px; background:#FFFFFF; padding:28px}
        .why-tag{display:inline-block; font-size:12px; letter-spacing:.04em; text-transform:uppercase; border-radius:999px; padding:4px 10px; margin-bottom:12px}
        .why-tag.pain{background:#009FB6; color:#ffffff; font-weight:500}
        .why-tag.solution{background:var(--gold); color:#ffffff; font-weight:800}
        @media (max-width:1024px){.why-item{grid-template-columns:1fr}}

        /* Topics */
        .topics{background:linear-gradient( to bottom, #F6F9FE, #F2F6FB)}
        .topics-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:40px; margin-top:24px}
        .topic-card{display:flex; flex-direction:column; gap:12px}
        .topic-icon{width:56px; height:56px; border-radius:16px; background:#FFFFFF; border:1px solid var(--divider); display:grid; place-items:center; box-shadow:0 6px 16px rgba(16,58,99,.06)}
        .topic-title{font-size:30px; line-height:32px; font-weight:700; color:var(--ink)}
        .topic-desc{font-size:16px; line-height:26px; color:var(--ink-dim)}
        @media (max-width:1024px){.topics-grid{grid-template-columns:1fr}}
        .stroke{stroke:#2E6EB6;} .fill{fill:#2E6EB6;}

        .small-img {
          transform: scale(0.98);          /* 整體等比例縮小到 90% */
          transform-origin: center center;
          display: block;
          margin: 0 auto;
        }

        .topic-label {
          font-size: 20px;        /* 建議值：18px～22px */
          font-weight: 600;       /* 或 500/700 看視覺層級 */
          color: #027AB9;         /* 主色或自訂 */
          margin-bottom: 16px;    /* 與卡片間距 */
          margin-top: 48px;
          font-family: 'Inter', sans-serif;
        }

        .topic-cards {
          display: flex;
          flex-direction: row;
          gap: 90px; /* 調整這個 gap 即可控制左右寬度貼齊 */
          flex-wrap: wrap;
          justify-content: center;
        }

        .course-card {
          display: flex;
          flex-direction: column;
          width: 320px;
          background: #fff;
          border-radius: 24px;
          border: 1px solid #EDF1F8;
          box-shadow: 0 4px 18px rgba(30,60,120,.09);
          overflow: hidden;
          cursor: default;
        }

        .course-card-imgbox {
          width: 100%;
          height: 180px;
          background-color: #F3F6F9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .course-card-imgbox img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .course-card-imgbox > span {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
        }
        .course-card-imgbox > span > img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          position: relative !important;
        }

        .course-card-content {
          padding: 14px 18px 18px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 8px;
        }

        .course-tag {
          background: #e6f7fb; /* 比 F0F6FF 更貼近你現在的主色漸層 */
          color: #027AB9;
          font-size: 13px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 8px;
          width: fit-content;
          white-space: nowrap;
        }
        .course-title {
          font-size: 18px;
          font-weight: 700;
          color: #14263F;
          line-height: 1.5;
          white-space: normal;
          overflow-wrap: break-word;
        }

        .course-desc {
          font-size: 14px;
          color: #6A7A8A;
          line-height: 1.4;
          white-space: normal;
          overflow-wrap: break-word;
        }

        @media (max-width: 768px) {
          .topic-cards {
            gap: 20px;
          }
          .course-card {
            width: 100%;
          }
        }

        /* Person grid for filmstrip */
        .filmstrip-vintage {
          width: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        .person-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
          grid-gap: 0;
          width: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          border: none;
          line-height: 0;
          font-size: 0;
        }

        .person-item {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
          padding: 0 !important;
          margin: 0 !important;
          border: none !important;
          gap: 0 !important;
          line-height: 0;
        }

        .person-item img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          object-position: center top;
          display: block;
          margin: 0;
          padding: 0;
          border: none;
          max-width: 100%;
          min-height: 180px;
          max-height: 180px;
        }
        .person-item > span {
          display: block !important;
          width: 100% !important;
          height: 180px !important;
          flex-shrink: 0;
          flex-grow: 0;
          min-height: 180px !important;
          max-height: 180px !important;
          position: relative;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          box-sizing: border-box !important;
          vertical-align: top !important;
          line-height: 0 !important;
        }
        .person-item > span > img {
          width: 100% !important;
          height: 180px !important;
          object-fit: cover !important;
          object-position: center top !important;
          position: relative !important;
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
          min-height: 180px !important;
          max-height: 180px !important;
          vertical-align: top !important;
          line-height: 0 !important;
        }

        /* 更具體的選擇器來確保沒有間隙 */
        .person-grid .person-item > span,
        .person-grid .person-item > span > img {
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          outline: 0 !important;
        }
        
        .filmstrip-vintage .person-grid .person-item {
          margin: 0 !important;
          padding: 0 !important;
          gap: 0 !important;
        }

        /* 強制所有子元素無間隙 */
        .person-grid * {
          margin: 0;
          padding: 0;
          border: 0;
        }
        
        /* 針對 Next.js Image 的額外重置 */
        .person-item img[style*="color"] {
          margin: 0 !important;
          padding: 0 !important;
        }

        .person-item p {
          text-align: center;
          font-size: 10px;
          color: #333;
          line-height: 1.4;
          margin: 8px 0 0 0;
          padding: 0 4px;
          width: 100%;
          flex-shrink: 0;
        }

        /* 平板版 */
        @media (max-width: 1024px) {
          .person-grid { grid-template-columns: repeat(3, 1fr); gap: 0; }
          .person-item img { 
            height: 150px; 
            min-height: 150px;
            max-height: 150px;
          }
          .person-item > span { 
            height: 150px !important; 
            min-height: 150px !important;
            max-height: 150px !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .person-item > span > img { 
            height: 150px !important; 
            min-height: 150px !important;
            max-height: 150px !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }

        /* 手機版 - 單欄顯示確保一對一對應 */
        @media (max-width: 640px) {
          .person-grid { 
            grid-template-columns: 1fr; 
            gap: 8px;
            max-width: 360px;
            margin: 0 auto;
          }
          .person-item img { 
            height: 180px !important; 
            width: 100% !important;
            min-height: 180px !important;
            max-height: 180px !important;
            border-radius: 8px;
            margin: 0 auto;
          }
          .person-item > span { 
            height: 180px !important; 
            width: 100% !important;
            min-height: 180px !important;
            max-height: 180px !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .person-item > span > img { 
            height: 180px !important; 
            width: 100% !important;
            min-height: 180px !important;
            max-height: 180px !important;
            border-radius: 8px !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .person-item p {
            font-size: 12px;
            margin: 16px 0;
            padding: 0 12px;
            line-height: 1.5;
          }
        }

        /* Redirect & Footer */
        .redirect{background:#ffffff; color:var(--ink); border-top:1px solid var(--divider); border-bottom:1px solid var(--divider); position:relative}
        .redirect::before{content:""; position:absolute; inset:0; background:radial-gradient(90% 140% at 0% 50%, rgba(46,110,182,.15), rgba(255,255,255,0) 55%), radial-gradient(90% 140% at 100% 50%, rgba(242,193,78,.12), rgba(255,255,255,0) 55%); pointer-events:none}
        .redirect .container{display:flex; align-items:center; justify-content:space-between; gap:24px; padding:40px 24px}
        .redirect h3{margin:0; font-weight:800; letter-spacing:-.01em; font-size:28px; line-height:34px}
        .redirect p{margin:6px 0 0; color:#49647B}
        .redirect-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 28px;
          border-radius: 999px;
          background: linear-gradient(90deg, #009FB6, #027AB9);
          color: #FFFFFF;
          font-weight: 800;
          box-shadow: 0 10px 24px rgba(2, 122, 185, 0.22);
          border: none;
        }

        .redirect-cta svg{flex:none}
        @media (max-width:768px){.redirect .container{flex-direction:column; align-items:flex-start; gap:20px} .redirect h3{font-size:24px; line-height:30px}}

        .redirect-cta.secondary {
          background: #ffffff;
          color: #027AB9;
          border: 2px solid #027AB9;
        }
        .redirect-cta.secondary:hover {
          background: #F0F9FD;                      /* 淺藍底 */
          color: #027AB9;                           /* 保持主色 */
          border-color: #027AB9;
          transform: scale(1.02);                   /* 輕微放大就好 */
          box-shadow: 0 4px 12px rgba(2, 122, 185, 0.12); /* 微陰影 */
          transition: all 0.2s ease-in-out;
        }

        .footer-cta-section {
          background: #F7FAFE;
          padding: 96px 60px;
          border-top: 1px solid var(--divider);
        }

        .footer-cta-section .container {
          padding: 0;  /* 移除 container 的預設 padding，讓它跟 hero section 一致 */
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .footer-copy {
          margin-bottom: 20px;
          max-width: 600px;
        }

        /* 確保下面表單的寬度跟上面一致 */
        #footerForm.horizontal-form.center-form{
          max-width: 100% !important;            /* 解除原本 900px 限制 */
          display: grid !important;               /* 強制改用 grid */
          grid-template-columns:
            minmax(220px,1fr)                     /* Name */
            minmax(220px,1fr)                     /* Email */
            minmax(220px,1fr)                     /* Phone */
            minmax(160px,auto);                   /* Button */
          column-gap: 12px;
          row-gap: 12px;
          align-items: end;
          padding: 0;
          border: 0;
          box-shadow: none;
        }

        /* 修掉舊 flex 設定的副作用（邊距/對齊） */
        #footerForm .h-field{ min-width: 0; margin: 0; }
        #footerForm .btn{
          align-self: end !important;             /* 置底對齊 */
          height: 52px;
          white-space: nowrap;
        }

        /* 1180px 以下：改成兩欄輸入，按鈕獨佔一列滿版 */
        @media (max-width: 1180px){
          #footerForm.horizontal-form.center-form{
            grid-template-columns: minmax(220px,1fr) minmax(220px,1fr);
          }
          #footerForm .btn{
            grid-column: 1 / -1;
            justify-self: stretch;
          }
        }

        /* 768px 以下：單欄直排，按鈕滿版 */
        @media (max-width: 768px){
          #footerForm.horizontal-form.center-form{ grid-template-columns: 1fr; }
          #footerForm .btn{ grid-column: 1 / -1; width: 100%; }
        }

        .footer-cta-section .hero-form-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
          border: 1px solid #E9EFFB;
          padding: 16px;
          max-width: 1120px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: box-shadow .2s;
          position: relative;
          top: 0;
          margin-top: 12px;
          overflow: hidden;
        }

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

        /* Hero styles that match designer version exactly */
        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: url('https://drive.google.com/thumbnail?id=1dqPrlDGVMgKHbwcRm2Ww8TcuSjkoJF-F&sz=w3200') ;
          background-size: cover;
          background-position: 70% 60%;
          pointer-events: none;
          transition: background 0.5s;
        }

        /* Hero 區塊使用與 Footer 相同的結構和樣式 */
        #hero .container {
          padding: 0;
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: left;
        }
        
        .hero-text-box {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.5);
          padding: 20px 16px;
          border-radius: 16px;
          text-align: left;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          margin-bottom: 20px;
          max-width: 600px;
          align-self: flex-start;
          margin-left: max(0px, calc(50% - 560px));
        }

        /* Hero 表單卡片與 Footer 完全一致 */
        #hero .hero-form-card {
          margin-top: 0;
          z-index: 2;
          position: relative;
          align-self: center;
        }

        .hero-form-card {
          background: #fff;
          border-radius: 999px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
          border: 1px solid #E9EFFB;
          padding: 10px 20px;
          max-width: 1120px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: box-shadow .2s;
          position: relative;
          top: 40px;
        }

        .horizontal-form.center-form {
          display: flex;
          justify-content: center;
          gap: 18px;
          background: transparent;
          border-radius: 999px;
          box-shadow: none;
          border: none;
          padding: 0;
          align-items: center;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }

        .h-field {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 160px;
          flex: 1 1 180px;
          margin: 0 4px;
        }

        .h-label {
          font-size: 13px;
          color: #027AB9;
          font-weight: 700;
          margin-bottom: 2px;
          padding-left: 2px;
          letter-spacing: 0.01em;
        }

        .h-input {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 16px;
          outline: none;
          padding: 0 10px;
          height: 46px;
        }

        .h-input:focus {
          background: #F0F6FF;
          border-radius: 12px;
        }

        .horizontal-form .btn {
          height: 52px;
          padding: 0 24px;
          font-size: 16px;
          font-weight: 700;
          line-height: 1;
          border: none;
          border-radius: 999px;
          background: linear-gradient(90deg, #009FB6, #027AB9);
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(2,122,185,0.16);
          cursor: pointer;
          align-self: flex-end;
        }

        .horizontal-form .btn:hover {
          background: linear-gradient(90deg, #00BEE3, #0286C9);
          transform: scale(1.04);
          box-shadow: 0 8px 24px rgba(2, 122, 185, 0.32);
          transition: all 0.25s ease-in-out;
        }

        /* 卡片不要上移＋圓角回正常，避免內容被裁 */
        #hero .hero-form-card{
          top: 0;
          margin-top: 12px;
          padding: 16px;
          border-radius: 20px;
          overflow: hidden;
        }

        /* 用 Grid（不是 flex）排版：桌機 3 欄輸入 + 1 欄按鈕 */
        #heroForm.horizontal-form.center-form{
          max-width: 100% !important;            /* 解除原本 900px 限制 */
          display: grid !important;               /* 強制改用 grid */
          grid-template-columns:
            minmax(220px,1fr)                     /* Name */
            minmax(220px,1fr)                     /* Email */
            minmax(220px,1fr)                     /* Phone */
            minmax(160px,auto);                   /* Button */
          column-gap: 12px;
          row-gap: 12px;
          align-items: end;
          padding: 0;
          border: 0;
          box-shadow: none;
        }

        /* 修掉舊 flex 設定的副作用（邊距/對齊） */
        #heroForm .h-field{ min-width: 0; margin: 0; }
        #heroForm .btn{
          align-self: end !important;             /* 置底對齊 */
          height: 52px;
          white-space: nowrap;
        }

        /* 1180px 以下：改成兩欄輸入，按鈕獨佔一列滿版 */
        @media (max-width: 1180px){
          #heroForm.horizontal-form.center-form{
            grid-template-columns: minmax(220px,1fr) minmax(220px,1fr);
          }
          #heroForm .btn{
            grid-column: 1 / -1;
            justify-self: stretch;
          }
        }

        /* 900px 以下：卡片縮小內距 */
        @media (max-width: 900px){
          #hero .hero-form-card{ padding: 14px; border-radius: 16px; }
        }

        /* 768px 以下：單欄直排，按鈕滿版 */
        @media (max-width: 768px){
          #hero{ padding: 64px 16px !important; }
          #heroForm.horizontal-form.center-form{ grid-template-columns: 1fr; }
          #heroForm .btn{ grid-column: 1 / -1; width: 100%; }
        }

        /* 極小螢幕：避免 placeholder 撐寬、避免 iOS 放大 */
        #heroForm .h-input{ min-width: 0; font-size:16px; height:46px; }
        #heroForm .h-label{ font-size:12px; }

        /* 手機上方文字卡片收斂一下 */
        @media (max-width: 768px){
          #hero .container { align-items: flex-start; }
          .hero-text-box{ 
            padding: 12px 8px; 
            border-radius: 12px; 
            margin-left: 0 !important; 
            align-self: stretch; 
            max-width: none !important; 
          }
          .h1{ font-size: 30px; line-height: 38px; }
          #hero .hero-form-card { align-self: stretch; }
        }
        
        /* Responsive adjustments */
        @media (max-width: 767px) {
          #hero { padding: 72px 16px !important; }
          #hero .container { align-items: flex-start; }
          .hero-text-box { 
            padding: 12px 8px; 
            border-radius: 12px; 
            margin-left: 0 !important; 
            align-self: stretch; 
            max-width: none !important; 
          }
          .h1 { font-size: 32px; line-height: 40px; }
          .hero-bg { background-position: 50% 35%; }
        }

        /* 4) Numbers 三欄收斂 */
        @media (max-width: 900px)  { .num-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px)  {
          .num-grid { grid-template-columns: 1fr; text-align: left; }
          .num { font-size: 28px; }
        }

        /* 5) Topics 標籤間距在手機不要那麼高 */
        @media (max-width: 768px) { .topic-label { margin-top: 28px; } }

        /* 6) 保險擋掉水平捲動（filmstrip 等計算誤差） */
        body { overflow-x: hidden; }

        /* 7) 超小螢幕標題換行 */
        @media (max-width: 360px) { .h1, .h2 { overflow-wrap: anywhere; word-break: break-word; } }

        /* 8) Redirect 文字顏色與底色分離，避免對比問題（若保留 inline color 可加 !important） */
        .redirect { color: #14263F; }
        .redirect h3 { color: #14263F; }
        .redirect p  { color: #49647B; }
        @media (max-width: 768px) { .redirect .container { padding: 28px 24px; } }

        /* Footer styles */
        .footer-info-section {
          position: relative;
        }
      `}</style>

      {/* ===== Sticky Top Bar ===== */}
      <header className="site-header">
        <Link href="/" className="brand-logo" aria-label="Taipei Language Institute Logo">
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
        </Link>
        
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
            onClick={scrollToFooterForm}
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
          <Link 
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
          </Link>
        </div>
      </header>

      {/* Spacer to compensate fixed header */}
      <div style={{height: '72px'}}></div>

      <section className="hero section" id="hero" style={{padding: '96px 60px', position: 'relative'}}>
        <div className="hero-bg"></div>

        <div className="container hero-cta">
          <div className="hero-text-box">
            <span className="badge">Membership | 3‑Month / 1‑Year Plans</span>
            <h1 className="h1">Break Language Barriers. Unlock Asian Markets.</h1>
            <p className="body-l tagline">
              Language × Culture × Business —<br />
              Sharpen your skills alongside professionals worldwide and<br />
              become the next generation of international leaders.
            </p>
          </div>
          <div className="hero-form-card">
            <form id="heroForm" className="horizontal-form center-form" onSubmit={handleSubmit('hero')} noValidate>
              <div className="h-field">
                <label htmlFor="hName" className="h-label">Name<span style={{color:'var(--gold)'}}>*</span></label>
                <input 
                  id="hName" 
                  name="name" 
                  type="text" 
                  placeholder="Your name" 
                  required 
                  aria-required="true" 
                  className="h-input"
                  value={heroForm.name}
                  onChange={(e) => setHeroForm({...heroForm, name: e.target.value})}
                />
              </div>
              <div className="h-field">
                <label htmlFor="hEmail" className="h-label">Email<span style={{color:'var(--gold)'}}>*</span></label>
                <input 
                  id="hEmail" 
                  name="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  required 
                  aria-required="true" 
                  className="h-input"
                  value={heroForm.email}
                  onChange={(e) => setHeroForm({...heroForm, email: e.target.value})}
                />
              </div>
              <div className="h-field">
                <label htmlFor="hPhone" className="h-label">Phone <span className="caption" aria-hidden="true">(optional)</span></label>
                <input 
                  id="hPhone" 
                  name="phone" 
                  type="tel" 
                  placeholder="+886 912 345 678" 
                  className="h-input"
                  value={heroForm.phone}
                  onChange={(e) => setHeroForm({...heroForm, phone: e.target.value})}
                />
              </div>
              <button 
                className="btn" 
                type="submit" 
                aria-label="Submit contact form"
                disabled={isSubmitting.hero}
              >
                {isSubmitting.hero ? 'Sending...' : 'Free Consultation'}
              </button>
            </form>
            <div className="caption" style={{margin: '12px 0 0 0', textAlign:'center'}}>
              We&apos;ll get back to you within 1–2 business days.<br />Your information is kept strictly confidential.
            </div>
            <div className={`success ${showSuccess.hero ? '' : 'hide'}`}>
              Thank you for your submission! We&apos;ll be in touch within 1–2 business days.
            </div>
            <div className={`fail ${showError.hero ? '' : 'hide'}`}>
              Sorry, something went wrong. Please try again later.
            </div>
          </div>
        </div>
      </section>

      {/* Filmstrip */}
      <div className="filmstrip" aria-hidden="true">
        <div className="row">
          <div className="tile">
            <Image src="https://images.unsplash.com/photo-1699443218794-589f8bdd48e4?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Learning experience" width={400} height={200} style={{width: 'auto', height: 'auto'}} />
          </div>
          <div className="tile">
            <Image src="https://images.unsplash.com/photo-1515168833906-d2a3b82b302a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Business communication" width={400} height={200} style={{width: 'auto', height: 'auto'}} />
          </div>
          <div className="tile">
            <Image src="https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Cultural connection" width={400} height={200} style={{width: 'auto', height: 'auto'}} />
          </div>
          <div className="tile">
            <Image src="https://images.unsplash.com/photo-1548684133-8739f016b2ac?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Professional development" width={400} height={200} style={{width: 'auto', height: 'auto'}} />
          </div>
        </div>
      </div>

      {/* Why */}
      <section className="why section" id="why" aria-labelledby="why-title">
        <div className="container">
          <h2 className="h2" id="why-title">Why Do You Need a Cross‑Cultural Learning Community?</h2>
          <div className="why-rows">
            <div className="why-item">
              <div>
                <span className="why-tag pain" aria-hidden="true">Common Challenge</span>
                <h3 className="h3">&ldquo;I need flexibility, but I also want real connection—not just watching videos alone.&rdquo;</h3>
              </div>
              <div>
                <span className="why-tag solution" aria-hidden="true">Solution</span>
                <p>We&apos;re more than a classroom—it&apos;s a curated community. Connect with like-minded professionals in Taiwan and worldwide to exchange ideas, practice Mandarin, and build meaningful networks that support both your language journey and your career growth.</p>
              </div>
            </div>
            <div className="why-item">
              <div>
                <span className="why-tag pain" aria-hidden="true">Common Challenge</span>
                <h3 className="h3">&ldquo;I feel like an outsider, unable to connect with Chinese colleagues or clients.&rdquo;</h3>
              </div>
              <div>
                <span className="why-tag solution" aria-hidden="true">Solution</span>
                <p>We focus on cultural immersion and practical language application, helping you build trust, credibility, and confidence in both formal and informal settings.</p>
              </div>
            </div>
            <div className="why-item">
              <div>
                <span className="why-tag pain" aria-hidden="true">Common Challenge</span>
                <h3 className="h3">&ldquo;I&apos;ve already studied Chinese before, but I&apos;m losing touch—and I need to keep it sharp to maintain client relationships.&rdquo;</h3>
              </div>
              <div>
                <span className="why-tag solution" aria-hidden="true">Solution</span>
                <p>With advanced-level classes, industry-specific workshops, and a global professional community, we help you sustain and expand your Mandarin fluency for ongoing professional impact.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="topics section" id="topics" aria-labelledby="topics-title">
        <div className="container">
          <h2 className="h2" id="topics-title">Language, Culture & Business — All in One Membership</h2>
          <p className="body-m" style={{margin:'8px 0 32px 0', color:'#49647B'}}>
            Membership term: 3‑month or 1‑year. Same benefits — choose your pace.
          </p>

          {/* 三大主題分組 */}
          <div className="topic-block">

            {/* Chinese Proficiency */}
            <div className="topic-section">
              <div className="topic-label">Chinese Proficiency</div>
              <div className="topic-cards">
                <div className="course-card">
                  <div className="course-card-imgbox">
                    <Image
                      className="small-img"
                      src="https://drive.google.com/thumbnail?id=1_NyugcIq2A1IxVae0oqbbmOF7S_tbDuc&sz=w1200"
                      alt="Practical Real Life Based Essentials"
                      width={320}
                      height={180}
                      style={{width: 'auto', height: 'auto'}}
                    />
                  </div>
                  <div className="course-card-content">
                    <div className="course-tag">Video Library</div>
                    <div className="course-title">Practical Real Life Based Essentials</div>
                    <div className="course-desc">Self-pace, Anytime, Anywhere</div>
                  </div>
                </div>
                <div className="course-card">
                  <div className="course-card-imgbox">
                    <Image src="https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg" alt="Daily Life & Business Communication" width={320} height={180} style={{width: 'auto', height: 'auto'}} />
                  </div>
                  <div className="course-card-content">
                    <div className="course-tag">Live Mini‑Classes</div>
                    <div className="course-title">Daily Life & Business Communication</div>
                    <div className="course-desc">Interactive, Small group, Themed</div>
                  </div>
                </div>
                <div className="course-card">
                  <div className="course-card-imgbox">
                    <Image src="https://drive.google.com/thumbnail?id=1hFq0oBzJvJm3isL3ElTvnnNy7NZ8Z6_l&sz=w1200" alt="Mandarin Lounge" width={320} height={180} style={{width: 'auto', height: 'auto'}} />
                  </div>
                  <div className="course-card-content">
                    <div className="course-tag">Live speaking arena</div>
                    <div className="course-title">Mandarin Lounge</div>
                    <div className="course-desc">Stress-free practice</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cultural Insight */}
            <div className="topic-section">
              <div className="topic-label">Cultural Insight</div>
              <div className="topic-cards">
                <div className="course-card">
                  <div className="course-card-imgbox">
                    <Image src="https://drive.google.com/thumbnail?id=1V_1-zTB0N-Eq0PvvDFpP3MHycN-OtO1B&sz=w1200" alt="Local Folk Culture Experience" width={320} height={180} style={{width: 'auto', height: 'auto'}} />
                  </div>
                  <div className="course-card-content">
                    <div className="course-tag">Events</div>
                    <div className="course-title">Local Folk Culture Experience</div>
                    <div className="course-desc">Immersive, Cultural deep-dive</div>
                  </div>
                </div>
                <div className="course-card">
                  <div className="course-card-imgbox">
                    <Image src="https://drive.google.com/thumbnail?id=19QrdateU5N8G0RS-dtmpx43rRd2hIiJc&sz=w1200" alt="Yoga Martial Home Fitness Series" width={320} height={180} style={{width: 'auto', height: 'auto'}} />
                  </div>
                  <div className="course-card-content">
                    <div className="course-tag">Workshops</div>
                    <div className="course-title">Yoga Martial Home Fitness Series</div>
                    <div className="course-desc">Wellness, Monthly</div>
                  </div>
                </div>
                <div className="course-card">
                  <div className="course-card-imgbox">
                    <Image src="https://images.unsplash.com/photo-1672826980330-93ae1ac07b41?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Global Etiquette" width={320} height={180} style={{width: 'auto', height: 'auto'}} />
                  </div>
                  <div className="course-card-content">
                    <div className="course-tag">Events & Workshops</div>
                    <div className="course-title">Global Etiquette</div>
                    <div className="course-desc">Member exclusive</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Industry Firepower */}
            <div className="topic-section">
              <div className="topic-label">Industry Firepower</div>
              <div className="topic-cards">
                <div className="course-card">
                  <div className="course-card-imgbox">
                    <Image src="https://drive.google.com/thumbnail?id=1Dr3O7I80LIGirmqxreB5fnqrRtxEJOBx&sz=w1200" alt="Regenerative medicine & Longevity: Reverse Aging with Science" width={320} height={180} style={{width: 'auto', height: 'auto'}} />
                  </div>
                  <div className="course-card-content">
                    <div className="course-tag">Expert Channels</div>
                    <div className="course-title">Regenerative medicine & Longevity: Reverse Aging with Science</div>
                    <div className="course-desc">Expert guest, Industry insights</div>
                  </div>
                </div>
                <div className="course-card">
                  <div className="course-card-imgbox">
                    <Image src="https://drive.google.com/thumbnail?id=1flasExlMfa01xbwSr1Uf_yfOcL2-GAS4&sz=w1200" alt="Networking for Conscious Entrepreneurs and Investors" width={320} height={180} style={{width: 'auto', height: 'auto'}} />
                  </div>
                  <div className="course-card-content">
                    <div className="course-tag">Expert Channels</div>
                    <div className="course-title">Networking for Conscious Entrepreneurs and Investors</div>
                    <div className="course-desc">Expand horizons, Networking</div>
                  </div>
                </div>
                <div className="course-card">
                  <div className="course-card-imgbox">
                    <Image src="https://drive.google.com/thumbnail?id=1xM0bM-uYXYkcRyGQQ5b9K_pJyMpbBG_Z&sz=w1200" alt="Kickstarting Global Impact: A Martial Artist's Journey in Business and Cross-Cultural Leadership" width={320} height={180} style={{width: 'auto', height: 'auto'}} />
                  </div>
                  <div className="course-card-content">
                    <div className="course-tag">Expert Channels</div>
                    <div className="course-title">Kickstarting Global Impact: A Martial Artist&apos;s Journey in Business and Cross-Cultural Leadership</div>
                    <div className="course-desc">Hands-on, Cross-culture</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="numbers section" aria-labelledby="num-title" style={{paddingBottom:'72px'}} >
        <div className="container">
          <h2 id="num-title" className="h2">
            TLI Connect — Building on 70 Years of TLI Language Excellence to Launch a Global Learning Community
          </h2>
        </div>

        {/* Filmstrip row: images and captions separated */}
        <div className="filmstrip-vintage">
          <div className="person-grid">
            <div className="person-item">
              <Image src="https://drive.google.com/thumbnail?id=1ty5zRQX-Na3YIiVVt0-NTLLW-HA-zrc_&sz=w1600" alt="Professor John King Fairbank" width={240} height={180} style={{width: 'auto', height: 'auto'}} />
              <p>Professor John King Fairbank — Harvard University Sinologist</p>
            </div>
            <div className="person-item">
              <Image src="https://drive.google.com/thumbnail?id=12zdFoBZzR6gcRwEBG37IRb85a4Sn00mu&sz=w1600" alt="Mr. James Stapleton Roy" width={240} height={180} style={{width: 'auto', height: 'auto'}} />
              <p>Mr. James Stapleton Roy — Former U.S. Ambassador to Beijing</p>
            </div>
            <div className="person-item">
              <Image src="https://drive.google.com/thumbnail?id=13r0Zn7E9YCj9-waSjb3Wp9uFJ65iBluS&sz=w1600" alt="Mr. Nicholas Kristof and Ms. Sheryl WuDunn" width={240} height={180} style={{width: 'auto', height: 'auto'}} />
              <p>Mr. Nicholas Kristof & Ms. Sheryl WuDunn — Pulitzer Prize Winners for International Reporting</p>
            </div>
            <div className="person-item">
              <Image src="https://drive.google.com/thumbnail?id=13Q4uM8toWNxVaN9tSzbw9GtWHnjxrBI9&sz=w1600" alt="Mr. Lee Kuan Yew" width={240} height={180} style={{width: 'auto', height: 'auto'}} />
              <p>Mr. Lee Kuan Yew — Former Prime Minister of Singapore</p>
            </div>
            <div className="person-item">
              <Image src="https://drive.google.com/thumbnail?id=1co45YrsO_hgKCZnUdYxoz-9ik9WzmZHw&sz=w1600" alt="Mr. Mike Chinoy" width={240} height={180} style={{width: 'auto', height: 'auto'}} />
              <p>Mr. Mike Chinoy — Former Asia-Pacific Regional Director, CNN</p>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="num-grid" style={{marginTop: '40px'}}>
            <div>
              <div className="num">Established<br />1956</div>
              <p className="body-m">TLI is Taiwan&apos;s pioneer language institute.</p>
            </div>
            <div>
              <div className="num">600k+<br />Learners</div>
              <p className="body-m">We have served learners across business, academia, and NGOs.</p>
            </div>
            <div>
              <div className="num">Global +<br />Digital</div>
              <p className="body-m">We deliver the same quality standard both on-campus and online.</p>
            </div>
          </div>
        </div>
      </section> 

      {/* Redirect */}
      <section className="redirect" aria-label="Corporate redirect" style={{backgroundColor: 'rgba(0, 159, 182, 0.1)'}}>
        <div className="container">
          <div>
            <h3>Need a Customized Corporate Training Solution?</h3>
            <p>Tailored team training programs with management tools and performance tracking.</p>
          </div>
          <Link className="redirect-cta secondary" href="/corporate" aria-label="Explore Corporate Plans">
            <span>Explore Corporate Plans</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="#1E2328" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer Call-to-Action (Form 區塊) */}
      <section className="footer-cta-section section" id="footer-cta">
        <div className="container footer-cta">
          <div className="footer-copy">
            <h2 className="h2" id="footer-title">Ready to Join TLI Connect?</h2>
            <p className="body-m">Leave your info and we&apos;ll send you full plan details within one business day.</p>
          </div>
          <div className="hero-form-card">
            <form id="footerForm" className="horizontal-form center-form" onSubmit={handleSubmit('footer')} noValidate>
              <div className="h-field">
                <label htmlFor="fName" className="h-label">Name<span style={{color:'var(--gold)'}}>*</span></label>
                <input 
                  id="fName" 
                  name="name" 
                  type="text" 
                  placeholder="Your name" 
                  required 
                  aria-required="true" 
                  className="h-input"
                  value={footerForm.name}
                  onChange={(e) => setFooterForm({...footerForm, name: e.target.value})}
                />
              </div>
              <div className="h-field">
                <label htmlFor="fEmail" className="h-label">Email<span style={{color:'var(--gold)'}}>*</span></label>
                <input 
                  id="fEmail" 
                  name="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  required 
                  aria-required="true" 
                  className="h-input"
                  value={footerForm.email}
                  onChange={(e) => setFooterForm({...footerForm, email: e.target.value})}
                />
              </div>
              <div className="h-field">
                <label htmlFor="fPhone" className="h-label">Phone <span className="caption" aria-hidden="true">(optional)</span></label>
                <input 
                  id="fPhone" 
                  name="phone" 
                  type="tel" 
                  placeholder="+886 912 345 678" 
                  className="h-input"
                  value={footerForm.phone}
                  onChange={(e) => setFooterForm({...footerForm, phone: e.target.value})}
                />
              </div>
              <button 
                className="btn" 
                type="submit" 
                aria-label="Submit contact form"
                disabled={isSubmitting.footer}
              >
                {isSubmitting.footer ? 'Sending...' : 'Free Consultation'}
              </button>
            </form>
            <div className="caption" style={{margin: '12px 0 0 0', textAlign:'center'}}>
              We&apos;ll get back to you within 1–2 business days.<br />Your information is kept strictly confidential.
            </div>
            <div className={`success ${showSuccess.footer ? '' : 'hide'}`}>
              Thanks! We&apos;ll contact you within 1–2 business days.
            </div>
            <div className={`fail ${showError.footer ? '' : 'hide'}`}>
              Sorry, something went wrong. Please try again later.
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info（最底部資訊）*/}
      <footer className="footer-info-section" style={{backgroundColor: '#DFDFDF', position: 'relative', paddingBottom: '60px'}}>
        <div className="container footer-bottom">
          <div className="body-m footer-info">
            <a href="https://tli1956.com/?lang=tc" target="_blank" rel="noopener noreferrer">TLI Taipei Language Institute</a><span> | </span>
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
          <Link 
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
          </Link>
        </div>
      </footer>
    </>
  );
}