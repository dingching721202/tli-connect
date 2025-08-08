'use client';

import Navigation from "@/components/Navigation";
import { useState } from "react";
import Image from "next/image";

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
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [success, setSuccess] = useState('');

  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validPhone = (v: string) => !v || /^[0-9+\-()\s]+$/.test(v);

  const handleSubmit = (formType: string, formData: { name: string; email: string; phone: string }) => async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name.';
    if (!validEmail(formData.email.trim())) newErrors.email = 'Please enter a valid email address.';
    if (!validPhone(formData.phone.trim())) newErrors.phone = 'Please enter numbers only or include + / - / ( ).';

    setErrors({...errors, [formType]: newErrors});

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch('/api/consultations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'individual',
            contactName: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            message: `來自首頁${formType === 'hero' ? '主要' : '頁尾'}聯絡表單的諮詢`,
            source: `homepage_${formType}`
          }),
        });

        const result = await response.json();

        if (result.success) {
          setSuccess(formType);
          if (formType === 'hero') setHeroForm({ name: '', email: '', phone: '' });
          if (formType === 'footer') setFooterForm({ name: '', email: '', phone: '' });
          setTimeout(() => setSuccess(''), 5000);
        } else {
          console.error('Failed to submit consultation:', result.error);
          setErrors({...errors, [formType]: { submit: 'Failed to submit. Please try again.' }});
        }
      } catch (error) {
        console.error('Error submitting consultation:', error);
        setErrors({...errors, [formType]: { submit: 'Network error. Please try again.' }});
      }
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
        
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

        /* Responsive */
        @media (max-width: 768px) {
          #hero { padding: 64px 16px !important; }
          .hero-text-box { padding: 18px 14px; border-radius: 12px; }
          .h1 { font-size: 30px; line-height: 38px; }
          
          #heroForm.horizontal-form.center-form { grid-template-columns: 1fr; }
          #heroForm .btn { grid-column: 1 / -1; width: 100%; }
          #heroForm .h-input { min-width: 0; font-size: 16px; height: 46px; }
          #heroForm .h-label { font-size: 12px; }
          
          .hero-form-card { padding: 14px; border-radius: 16px; }
          
          .filmstrip-row, .caption-row { grid-template-columns: repeat(2, 1fr); }
          .filmstrip-row img { height: 120px; }
          
          .num-grid { grid-template-columns: 1fr; text-align: left; }
          .num { font-size: 28px; }
          
          .why-item { grid-template-columns: 1fr; }
          .topics-grid { grid-template-columns: 1fr; }
          .learn-split { grid-template-columns: 1fr; gap: 24px; }
        }
        
        @media (max-width: 1024px) {
          .filmstrip-row, .caption-row { grid-template-columns: repeat(3, 1fr); }
          .filmstrip-row img { height: 150px; }
          
          #heroForm.horizontal-form.center-form {
            grid-template-columns: minmax(220px,1fr) minmax(220px,1fr);
          }
          #heroForm .btn {
            grid-column: 1 / -1;
            justify-self: stretch;
          }
        }
        
        @media (max-width: 1180px) {
          #heroForm.horizontal-form.center-form {
            grid-template-columns: minmax(220px,1fr) minmax(220px,1fr);
          }
          #heroForm .btn {
            grid-column: 1 / -1;
            justify-self: stretch;
          }
        }

        /* Hero styles */
        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: url('https://drive.google.com/thumbnail?id=1dqPrlDGVMgKHbwcRm2Ww8TcuSjkoJF-F&sz=w3200');
          background-size: cover;
          background-position: 70% 60%;
          pointer-events: none;
          transition: background 0.5s;
        }

        .hero-grid {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 2;
        }

        .hero-text-box {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.7);
          padding: 28px 24px;
          border-radius: 16px;
          text-align: left;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          margin-left: 0;
          margin-right: auto;
          max-width: 680px;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          padding-top: 1px;
        }

        .hero-form-row {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-top: 20px;
          z-index: 2;
          position: relative;
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
          display: grid !important;
          grid-template-columns: minmax(220px,1fr) minmax(220px,1fr) minmax(220px,1fr) minmax(160px,auto);
          column-gap: 12px;
          row-gap: 12px;
          align-items: end;
          padding: 0;
          border: 0;
          box-shadow: none;
          background: transparent;
          border-radius: 999px;
          justify-content: center;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }

        .h-field {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
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
          min-width: 0;
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
          white-space: nowrap;
          align-self: stretch;
        }

        .horizontal-form .btn:hover {
          background: linear-gradient(90deg, #00BEE3, #0286C9);
          transform: scale(1.04);
          box-shadow: 0 8px 24px rgba(2, 122, 185, 0.32);
          transition: all 0.25s ease-in-out;
        }

        .caption {
          color: #6A7A8A;
          font-size: 13px;
          text-align: center;
          margin-bottom: 0;
        }

        /* Filmstrip */
        .filmstrip {
          height: 200px;
          background: #ffffff;
          overflow: hidden;
          border-top: 20px solid #ffffff;
          border-bottom: 1px solid #ffffff;
        }
        .filmstrip .row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          height: 100%;
          width: 100vw;
          margin-left: calc(50% - 50vw);
        }
        .tile {
          position: relative;
          overflow: hidden;
        }
        .tile img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(6%) contrast(1.03) saturate(0.96);
        }
        .tile::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(16,35,53,.18), rgba(16,35,53,.18));
        }
        @media (max-width:767px) {
          .filmstrip { height: 140px; }
        }

        /* Numbers */
        .numbers { background: #FFFFFF; }
        .num-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 24px;
          text-align: center;
        }
        .filmstrip-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          width: 100%;
          margin: 0;
          padding: 0;
          border: none;
        }
        .filmstrip-row img {
          width: 100%;
          height: 180px;
          display: block;
          margin: 0;
          padding: 0;
          border: none;
        }
        .caption-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
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
        .why { background: #FFFFFF; }
        .why-rows { display: grid; gap: 24px; margin-top: 40px; }
        .why-item {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          border: 1px solid var(--divider);
          border-radius: 24px;
          background: #FFFFFF;
          padding: 28px;
        }
        .why-tag {
          display: inline-block;
          font-size: 12px;
          letter-spacing: .04em;
          text-transform: uppercase;
          border-radius: 999px;
          padding: 4px 10px;
          margin-bottom: 12px;
        }
        .why-tag.pain {
          background: #009FB6;
          color: #ffffff;
          font-weight: 500;
        }
        .why-tag.solution {
          background: var(--gold);
          color: #ffffff;
          font-weight: 800;
        }
        @media (max-width:1024px) {
          .why-item { grid-template-columns: 1fr; }
        }

        /* Topics */
        .topics { background: linear-gradient(to bottom, #F6F9FE, #F2F6FB); }
        .topics-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 40px;
          margin-top: 24px;
        }
        .topic-cards {
          display: flex;
          flex-direction: row;
          gap: 90px;
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
        .course-card-content {
          padding: 14px 18px 18px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 8px;
        }
        .course-tag {
          background: #e6f7fb;
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
        .topic-label {
          font-size: 20px;
          font-weight: 600;
          color: #027AB9;
          margin-bottom: 16px;
          margin-top: 48px;
          font-family: 'Inter', sans-serif;
        }

        @media (max-width: 768px) {
          .topic-cards {
            gap: 20px;
          }
          .course-card {
            width: 100%;
          }
        }
        @media (max-width:1024px) {
          .topics-grid { grid-template-columns: 1fr; }
        }

        /* Learn split */
        .learn-split {
          position: relative;
          display: grid;
          grid-template-columns: 560px minmax(0,1fr);
          gap: 40px;
          align-items: start;
        }
        .learn-photo {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid var(--divider);
          box-shadow: 0 18px 40px rgba(16,58,99,.10);
          aspect-ratio: 1/1;
          background: #0B0C0D;
        }
        .learn-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(6%) contrast(1.02) saturate(0.98);
        }
        .learn-photo::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(16,35,53,.10), rgba(16,35,53,.18));
        }
        .learn-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .learn-item {
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(16,35,53,.12);
        }
        .learn-item:last-child {
          border-bottom: none;
        }
        .learn-item button {
          all: unset;
          cursor: pointer;
          display: block;
        }
        .learn-item h3 {
          font-size: 18px;
          line-height: 26px;
          font-weight: 800;
          margin: 0 0 6px;
          color: var(--ink);
        }
        .learn-item p {
          margin: 0 0 6px;
          color: var(--ink-dim);
          font-size: 14px;
          line-height: 22px;
        }
        .learn-badge {
          display: inline-block;
          border: 1px solid var(--divider);
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 11px;
          color: #5B6D7E;
          background: #FFFFFF;
        }
        .learn-item.active h3 {
          color: #2E6EB6;
        }
        .learn-item.active .learn-badge {
          border-color: #2E6EB6;
          color: #2E6EB6;
          background: #E9F2FF;
        }
        @media (max-width:900px) {
          .learn-split { grid-template-columns: 1fr; gap: 24px; }
        }

        /* Redirect */
        .redirect {
          background: rgba(0, 159, 182, 0.1);
          color: var(--ink);
          border-top: 1px solid var(--divider);
          border-bottom: 1px solid var(--divider);
          position: relative;
        }
        .redirect::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(90% 140% at 0% 50%, rgba(46,110,182,.15), rgba(255,255,255,0) 55%), radial-gradient(90% 140% at 100% 50%, rgba(242,193,78,.12), rgba(255,255,255,0) 55%);
          pointer-events: none;
        }
        .redirect .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 40px 24px;
        }
        .redirect h3 {
          margin: 0;
          font-weight: 800;
          letter-spacing: -.01em;
          font-size: 28px;
          line-height: 34px;
        }
        .redirect p {
          margin: 6px 0 0;
          color: #49647B;
        }
        .redirect-cta.secondary {
          background: #ffffff;
          color: #027AB9;
          border: 2px solid #027AB9;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 28px;
          border-radius: 999px;
          font-weight: 800;
          box-shadow: 0 10px 24px rgba(2, 122, 185, 0.22);
          text-decoration: none;
        }
        .redirect-cta.secondary:hover {
          background: #F0F9FD;
          color: #027AB9;
          border-color: #027AB9;
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(2, 122, 185, 0.12);
          transition: all 0.2s ease-in-out;
        }
        .redirect-cta svg {
          flex: none;
        }
        @media (max-width:768px) {
          .redirect .container {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          .redirect h3 {
            font-size: 24px;
            line-height: 30px;
          }
        }

        /* Footer */
        .footer-cta-section {
          background: #F7FAFE;
          padding: 72px 0;
          border-top: 1px solid var(--divider);
        }
        .footer-info-section {
          background: #DFDFDF;
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

        /* Form design styles */
        .footer-card .form-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 24px;
          align-items: end;
        }
        .footer-card .form-grid > div {
          min-width: 0;
        }
        .footer-card .form-grid button {
          grid-column: 3;
          justify-self: end;
          height: 52px;
        }
        .footer-card .form-grid label {
          font-weight: 600;
          font-size: 14px;
          color: #1F2937;
          margin-bottom: 4px;
        }
        .footer-card .form-grid input {
          padding: 12px 16px;
          font-size: 16px;
          border: 1px solid #DCE3ED;
          border-radius: 12px;
        }
        .footer-card .form-grid button {
          padding: 0 24px;
          line-height: 1;
          white-space: nowrap;
          border: none;
          border-radius: 999px;
          background: linear-gradient(90deg, #009FB6, #027AB9);
          color: #FFFFFF;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 8px 24px rgba(2, 122, 185, 0.24);
          cursor: pointer;
          align-self: flex-end;
        }
        .footer-card .form-grid button:hover {
          background: linear-gradient(90deg, #00BEE3, #0286C9);
          transform: scale(1.04);
          box-shadow: 0 8px 24px rgba(2, 122, 185, 0.32);
          transition: all 0.25s ease-in-out;
        }
        .footer-card .form-grid .caption {
          flex-basis: 100%;
          margin-top: 12px;
          font-size: 13px;
          color: var(--ink-dim, #64798A);
          text-align: center;
        }

        /* Mobile: vertical stacking, full-width button */
        @media (max-width: 768px) {
          .footer-card .form-grid {
            grid-template-columns: 1fr;
            align-items: stretch;
          }
          .footer-card .form-grid button {
            grid-column: 1 / -1;
            width: 100%;
          }
        }
        @media (max-width: 1024px) {
          .footer-card .form-grid {
            grid-template-columns: repeat(2, minmax(0,1fr));
          }
          .footer-card .form-grid button {
            grid-column: 1 / -1;
            justify-self: stretch;
          }
        }

        #fSuccess,
        #fFail {
          display: none;
        }

        html, body { 
          overflow-x: hidden; 
        }
      `}</style>
      
      {/* Header */}
      <header style={{position: 'sticky', top: 0, zIndex: 20, background: 'linear-gradient(to bottom, rgba(255,255,255,.86), rgba(255,255,255,.75))', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--divider)'}}>
        <div style={{display: 'flex', alignItems: 'center', height: '72px', maxWidth: 'var(--container)', margin: '0 auto', padding: '0 24px'}}>
          <a href="#hero" style={{display: 'inline-flex', alignItems: 'center', gap: '12px'}}>
            <img 
              src="https://drive.google.com/thumbnail?id=1-eMGYDEmR20U0q9CurC0Z49jW6aTUcgO&sz=w400"
              srcSet="https://drive.google.com/thumbnail?id=1-eMGYDEmR20U0q9CurC0Z49jW6aTUcgO&sz=w400 1x, https://drive.google.com/thumbnail?id=1-eMGYDEmR20U0q9CurC0Z49jW6aTUcgO&sz=w800 2x"
              alt="Taipei Language Institute logo"
              style={{height: '36px', width: 'auto'}}
            />
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="section" id="hero" style={{padding: '96px 60px', position: 'relative'}}>
        <div className="hero-bg" />

        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-text-box">
              <span style={{
                display: 'inline-block',
                padding: '6px 12px',
                border: '1px solid #009FB6',
                borderRadius: '999px',
                fontSize: '14px',
                color: '#009FB6',
                margin: '20px 0',
                background: '#ffffff'
              }}>
                Membership | 3‑Month / 1‑Year Plans
              </span>
              <h1 className="h1">Break Language Barriers. Unlock Asian Markets.</h1>
              <p className="body-l" style={{color: '#7FA8D8'}}>
                Language × Culture × Business —<br/>
                Sharpen your skills alongside professionals worldwide and<br/>
                become the next generation of international leaders.
              </p>
            </div>
          </div>

          <div className="hero-form-row">
            <div className="hero-form-card">
              <form id="heroForm" className="horizontal-form center-form" onSubmit={handleSubmit('hero', heroForm)}>
                <div className="h-field">
                  <label className="h-label">Name<span style={{color:'var(--gold)'}}>*</span></label>
                  <input 
                    id="hName" 
                    name="name" 
                    type="text" 
                    placeholder="Your name" 
                    required 
                    className="h-input"
                    value={heroForm.name}
                    onChange={(e) => setHeroForm({...heroForm, name: e.target.value})}
                  />
                  {errors.hero?.name && <div style={{display: 'block', color: 'var(--error)', fontSize: '12px', marginTop: '6px'}}>{errors.hero.name}</div>}
                </div>
                <div className="h-field">
                  <label className="h-label">Email<span style={{color:'var(--gold)'}}>*</span></label>
                  <input 
                    id="hEmail" 
                    name="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    required 
                    className="h-input"
                    value={heroForm.email}
                    onChange={(e) => setHeroForm({...heroForm, email: e.target.value})}
                  />
                  {errors.hero?.email && <div style={{display: 'block', color: 'var(--error)', fontSize: '12px', marginTop: '6px'}}>{errors.hero.email}</div>}
                </div>
                <div className="h-field">
                  <label className="h-label">Phone <span className="caption">(optional)</span></label>
                  <input 
                    id="hPhone" 
                    name="phone" 
                    type="tel" 
                    placeholder="+886 912 345 678" 
                    className="h-input"
                    value={heroForm.phone}
                    onChange={(e) => setHeroForm({...heroForm, phone: e.target.value})}
                  />
                  {errors.hero?.phone && <div style={{display: 'block', color: 'var(--error)', fontSize: '12px', marginTop: '6px'}}>{errors.hero.phone}</div>}
                </div>
                <button className="btn" type="submit">Free Consultation</button>
              </form>
              <div className="caption" style={{margin: '12px 0 0 0', textAlign: 'center'}}>
                We'll get back to you within 1–2 business days. Your information is kept strictly confidential.
              </div>
              {success === 'hero' && (
                <div style={{
                  display: 'block',
                  borderLeft: '4px solid var(--success)',
                  background: 'rgba(28,168,122,.08)',
                  color: '#0F7F5F',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginTop: '16px',
                  fontSize: '14px'
                }}>
                  Thank you for your submission! We'll be in touch within 1–2 business days.
                </div>
              )}
              {errors.hero?.submit && (
                <div style={{
                  display: 'block',
                  borderLeft: '4px solid var(--error)',
                  background: 'rgba(213,72,72,.08)',
                  color: '#B91C1C',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginTop: '16px',
                  fontSize: '14px'
                }}>
                  {errors.hero.submit}
                </div>
              )}
              <div style={{textAlign: 'center', marginTop: '16px'}}>
                <a
                  href="/role-select"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    border: '2px solid var(--blue-500)',
                    borderRadius: '999px',
                    background: 'transparent',
                    color: 'var(--blue-500)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  Already a member? Login here
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filmstrip */}
      <div className="filmstrip">
        <div className="row">
          <div className="tile">
            <img src="https://images.unsplash.com/photo-1699443218794-589f8bdd48e4?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
          </div>
          <div className="tile">
            <img src="https://images.unsplash.com/photo-1515168833906-d2a3b82b302a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
          </div>
          <div className="tile">
            <img src="https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
          </div>
          <div className="tile">
            <img src="https://images.unsplash.com/photo-1548684133-8739f016b2ac?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
          </div>
        </div>
      </div>

      {/* Why */}
      <section className="section why">
        <div className="container">
          <h2 className="h2">Why Do You Need a Cross‑Cultural Learning Community?</h2>
          <div className="why-rows">
            <div className="why-item">
              <div>
                <span className="why-tag pain">Common Challenge</span>
                <h3 className="h3">"I need flexibility, but I also want real connection—not just watching videos alone."</h3>
              </div>
              <div>
                <span className="why-tag solution">Solution</span>
                <p>We're more than a classroom—it's a curated community. Connect with like-minded professionals in Taiwan and worldwide to exchange ideas, practice Mandarin, and build meaningful networks that support both your language journey and your career growth.</p>
              </div>
            </div>
            <div className="why-item">
              <div>
                <span className="why-tag pain">Common Challenge</span>
                <h3 className="h3">"I feel like an outsider, unable to connect with Chinese colleagues or clients."</h3>
              </div>
              <div>
                <span className="why-tag solution">Solution</span>
                <p>We focus on cultural immersion and practical language application, helping you build trust, credibility, and confidence in both formal and informal settings.</p>
              </div>
            </div>
            <div className="why-item">
              <div>
                <span className="why-tag pain">Common Challenge</span>
                <h3 className="h3">"I've already studied Chinese before, but I'm losing touch—and I need to keep it sharp to maintain client relationships."</h3>
              </div>
              <div>
                <span className="why-tag solution">Solution</span>
                <p>With advanced-level classes, industry-specific workshops, and a global professional community, we help you sustain and expand your Mandarin fluency for ongoing professional impact.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="section topics">
        <div className="container">
          <h2 className="h2">Language, Culture & Business — All in One Membership</h2>
          <p className="body-m" style={{margin: '8px 0 32px 0', color: '#49647B'}}>
            Membership term: 3‑month or 1‑year. Same benefits — choose your pace.
          </p>

          {/* Chinese Proficiency */}
          <div>
            <div className="topic-label">Chinese Proficiency</div>
            <div className="topic-cards">
              <div className="course-card">
                <div className="course-card-imgbox">
                  <img
                    src="https://drive.google.com/thumbnail?id=1_NyugcIq2A1IxVae0oqbbmOF7S_tbDuc&sz=w1200"
                    alt="Practical Real Life Based Essentials"
                    style={{transform: 'scale(0.98)', transformOrigin: 'center center', display: 'block', margin: '0 auto'}}
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
                  <img src="https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg" alt="Daily Life & Business Communication" />
                </div>
                <div className="course-card-content">
                  <div className="course-tag">Live Mini‑Classes</div>
                  <div className="course-title">Daily Life & Business Communication</div>
                  <div className="course-desc">Interactive, Small group, Themed</div>
                </div>
              </div>
              <div className="course-card">
                <div className="course-card-imgbox">
                  <img src="https://drive.google.com/thumbnail?id=1hFq0oBzJvJm3isL3ElTvnnNy7NZ8Z6_l&sz=w1200" alt="Mandarin Lounge" />
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
          <div>
            <div className="topic-label">Cultural Insight</div>
            <div className="topic-cards">
              <div className="course-card">
                <div className="course-card-imgbox">
                  <img src="https://drive.google.com/thumbnail?id=1V_1-zTB0N-Eq0PvvDFpP3MHycN-OtO1B&sz=w1200" alt="Local Folk Culture Experience" />
                </div>
                <div className="course-card-content">
                  <div className="course-tag">Events</div>
                  <div className="course-title">Local Folk Culture Experience</div>
                  <div className="course-desc">Immersive, Cultural deep-dive</div>
                </div>
              </div>
              <div className="course-card">
                <div className="course-card-imgbox">
                  <img src="https://drive.google.com/thumbnail?id=19QrdateU5N8G0RS-dtmpx43rRd2hIiJc&sz=w1200" alt="Yoga Martial Home Fitness Series" />
                </div>
                <div className="course-card-content">
                  <div className="course-tag">Workshops</div>
                  <div className="course-title">Yoga Martial Home Fitness Series</div>
                  <div className="course-desc">Wellness, Monthly</div>
                </div>
              </div>
              <div className="course-card">
                <div className="course-card-imgbox">
                  <img src="https://images.unsplash.com/photo-1672826980330-93ae1ac07b41?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Global Etiquette" />
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
          <div>
            <div className="topic-label">Industry Firepower</div>
            <div className="topic-cards">
              <div className="course-card">
                <div className="course-card-imgbox">
                  <img src="https://drive.google.com/thumbnail?id=1Dr3O7I80LIGirmqxreB5fnqrRtxEJOBx&sz=w1200" alt="Regenerative medicine & Longevity: Reverse Aging with Science" />
                </div>
                <div className="course-card-content">
                  <div className="course-tag">Expert Channels</div>
                  <div className="course-title">Regenerative medicine & Longevity: Reverse Aging with Science</div>
                  <div className="course-desc">Expert guest, Industry insights</div>
                </div>
              </div>
              <div className="course-card">
                <div className="course-card-imgbox">
                  <img src="https://drive.google.com/thumbnail?id=1flasExlMfa01xbwSr1Uf_yfOcL2-GAS4&sz=w1200" alt="Networking for Conscious Entrepreneurs and Investors" />
                </div>
                <div className="course-card-content">
                  <div className="course-tag">Expert Channels</div>
                  <div className="course-title">Networking for Conscious Entrepreneurs and Investors</div>
                  <div className="course-desc">Expand horizons, Networking</div>
                </div>
              </div>
              <div className="course-card">
                <div className="course-card-imgbox">
                  <img src="https://drive.google.com/thumbnail?id=1xM0bM-uYXYkcRyGQQ5b9K_pJyMpbBG_Z&sz=w1200" alt="Kickstarting Global Impact: A Martial Artist's Journey in Business and Cross-Cultural Leadership" />
                </div>
                <div className="course-card-content">
                  <div className="course-tag">Expert Channels</div>
                  <div className="course-title">Kickstarting Global Impact: A Martial Artist's Journey in Business and Cross-Cultural Leadership</div>
                  <div className="course-desc">Hands-on, Cross-culture</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers with Historical Photos */}
      <section className="section numbers">
        <div className="container">
          <h2 className="h2">
            TLI Connect — Building on 70 Years of TLI Language Excellence to Launch a Global Learning Community
          </h2>
        </div>

        {/* Filmstrip row: images and captions separated */}
        <div style={{margin: '40px 0'}}>
          <div className="filmstrip-row">
            <img src="https://drive.google.com/thumbnail?id=1ty5zRQX-Na3YIiVVt0-NTLLW-HA-zrc_&sz=w1600" alt="Professor John King Fairbank" />
            <img src="https://drive.google.com/thumbnail?id=12zdFoBZzR6gcRwEBG37IRb85a4Sn00mu&sz=w1600" alt="Mr. James Stapleton Roy" />
            <img src="https://drive.google.com/thumbnail?id=13r0Zn7E9YCj9-waSjb3Wp9uFJ65iBluS&sz=w1600" alt="Mr. Nicholas Kristof and Ms. Sheryl WuDunn" />
            <img src="https://drive.google.com/thumbnail?id=13Q4uM8toWNxVaN9tSzbw9GtWHnjxrBI9&sz=w1600" alt="Mr. Lee Kuan Yew" />
            <img src="https://drive.google.com/thumbnail?id=1co45YrsO_hgKCZnUdYxoz-9ik9WzmZHw&sz=w1600" alt="Mr. Mike Chinoy" />
          </div>
          <div className="caption-row">
            <p>Professor John King Fairbank — Harvard University Sinologist</p>
            <p>Mr. James Stapleton Roy — Former U.S. Ambassador to Beijing</p>
            <p>Mr. Nicholas Kristof & Ms. Sheryl WuDunn — Pulitzer Prize Winners for International Reporting</p>
            <p>Mr. Lee Kuan Yew — Former Prime Minister of Singapore</p>
            <p>Mr. Mike Chinoy — Former Asia-Pacific Regional Director, CNN</p>
          </div>
        </div>

        <div className="container">
          <div className="num-grid" style={{marginTop: '40px'}}>
            <div>
              <div className="num">Established<br/>1956</div>
              <p className="body-m">TLI is Taiwan's pioneer language institute.</p>
            </div>
            <div>
              <div className="num">600k+<br/>Learners</div>
              <p className="body-m">We have served learners across business, academia, and NGOs.</p>
            </div>
            <div>
              <div className="num">Global +<br/>Digital</div>
              <p className="body-m">We deliver the same quality standard both on-campus and online.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Redirect */}
      <section className="redirect">
        <div className="container">
          <div>
            <h3>Need a Customized Corporate Training Solution?</h3>
            <p>Tailored team training programs with management tools and performance tracking.</p>
          </div>
          <a className="redirect-cta secondary" href="#">
            <span>Explore Corporate Plans</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="#027AB9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </section>

      {/* Footer Call-to-Action (Form 區塊) */}
      <section className="footer-cta-section section">
        <div className="container" style={{display: 'flex', gap: '48px', alignItems: 'flex-start'}}>
          <div style={{flex: '1'}}>
            <h2 className="h2">Ready to Join TLI Connect?</h2>
            <p className="body-m">Leave your info and we'll send you full plan details within one business day.</p>
          </div>
          <div style={{
            background: 'var(--paper)',
            border: '1px solid var(--divider)',
            borderRadius: 'var(--r32)',
            boxShadow: '0 10px 30px rgba(16,58,99,.06)',
            padding: '32px',
            minWidth: '500px'
          }}>
            <form id="footerForm" onSubmit={handleSubmit('footer', footerForm)}>
              <div className="form-grid">
                <div>
                  <label className="label">Name<span style={{color:'var(--gold)'}}>*</span></label>
                  <input 
                    id="fName" 
                    name="name" 
                    type="text" 
                    placeholder="Your name" 
                    required
                    value={footerForm.name}
                    onChange={(e) => setFooterForm({...footerForm, name: e.target.value})}
                  />
                  {errors.footer?.name && <div style={{display: 'block', color: 'var(--error)', fontSize: '12px', marginTop: '6px'}}>{errors.footer.name}</div>}
                </div>
                <div>
                  <label className="label">Email<span style={{color:'var(--gold)'}}>*</span></label>
                  <input 
                    id="fEmail" 
                    name="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    required
                    value={footerForm.email}
                    onChange={(e) => setFooterForm({...footerForm, email: e.target.value})}
                  />
                  {errors.footer?.email && <div style={{display: 'block', color: 'var(--error)', fontSize: '12px', marginTop: '6px'}}>{errors.footer.email}</div>}
                </div>
                <div>
                  <label className="label">Phone <span className="caption">(optional)</span></label>
                  <input 
                    id="fPhone" 
                    name="phone" 
                    type="tel" 
                    placeholder="+886 912 345 678"
                    value={footerForm.phone}
                    onChange={(e) => setFooterForm({...footerForm, phone: e.target.value})}
                  />
                  {errors.footer?.phone && <div style={{display: 'block', color: 'var(--error)', fontSize: '12px', marginTop: '6px'}}>{errors.footer.phone}</div>}
                </div>
                <button type="submit">Free Consultation</button>
                <div className="caption">We'll get back to you within 1–2 business days. Your information is kept strictly confidential.</div>
                {success === 'footer' && (
                  <div style={{
                    display: 'block',
                    borderLeft: '4px solid var(--success)',
                    background: 'rgba(28,168,122,.08)',
                    color: '#0F7F5F',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginTop: '16px',
                    fontSize: '14px'
                  }}>
                    Thanks! We'll contact you within 1–2 business days.
                  </div>
                )}
                {errors.footer?.submit && (
                  <div style={{
                    display: 'block',
                    borderLeft: '4px solid var(--error)',
                    background: 'rgba(213,72,72,.08)',
                    color: '#B91C1C',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginTop: '16px',
                    fontSize: '14px'
                  }}>
                    {errors.footer.submit}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Info（最底部資訊）*/}
      <footer className="footer-info-section">
        <div className="container footer-bottom">
          <div className="body-m footer-info">
            <a href="https://tli1956.com/?lang=tc" target="_blank" rel="noopener noreferrer">TLI Taipei Language Institute</a><span> | </span>
            <a href="mailto:contact@tli1956.com" style={{color:'#1E60A9'}}>contact@tli1956.com</a>
          </div>
          <div className="social body-m" style={{marginBottom:'8px'}}>
            <a href="https://www.linkedin.com/school/taipei-language-institute/posts/?feedView=all" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://www.youtube.com/channel/UCCySlsmCXX8Id-m5NSTLCrw" target="_blank" rel="noopener noreferrer">YouTube</a>
            <a href="https://www.instagram.com/learn.chinese.tli/?hl=en" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.facebook.com/tli1956/?locale=zh_TW" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
          <div className="legal">© TLI Taipei Language Institute. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}