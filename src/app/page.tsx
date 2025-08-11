'use client';

import Image from 'next/image';
import { useState, useEffect } from "react";
import { COURSE_IMAGE_BLUR_DATA_URL } from '../utils/blurPlaceholder';

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
  useEffect(() => {
    document.body.classList.add('hydrated');
  }, []);

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

        :root{
          /* Layout */
          --container: 1200px;
          --page-padding: 100px;          /* 全站左右留白 */
          --page-padding-mobile: 16px;    /* 行動裝置留白 */
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

          --cta-gradient-left: #009FB6;
          --cta-gradient-right: #027AB9;
          --cta-gradient-hover-left: #00BEE3;
          --cta-gradient-hover-right: #0286C9;
          --primary: #027AB9;
          --blue-100: #E3F1F8;

          /* States */
          --error: #D54848;
          --success: #1CA87A;

          /* 補充（若需） */
          --blue-500: #027AB9;       /* 行銷文案標色／強調 */
          --blue-100: #E9F2FF;       /* 很淺的藍色背景 */
        }

        *,*::before,*::after{box-sizing:border-box}
        html,body{margin:0;padding:0}
        body{font-family:var(--font-inter), "Noto Sans", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif; color:var(--ink); background:var(--black)}
        a{text-decoration:none; color:#1E60A9}
        img{max-width:100%; display:block}
        .container{max-width:var(--container); margin:0 auto; padding:0 24px}
        .section{padding:88px 0}
        @media (max-width:767px){.section{padding:64px 0}}

        h1,h2,h3{margin:0 0 16px; color:var(--ink); font-family:var(--font-plus-jakarta-sans), var(--font-noto-sans-tc), var(--font-inter), system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-feature-settings:"pnum" 1, "lnum" 1; font-weight:800}
        .h1{font-size:48px; line-height:64px; font-weight:800; letter-spacing:-0.015em}
        .h2{font-size:34px; line-height:42px; font-weight:800; letter-spacing:-0.01em}
        .h3{font-size:20px; line-height:30px; font-weight:300; letter-spacing:-0.01em}
        .body-l{font-size:18px; line-height:28px; color:var(--ink)}
        .body-m{font-size:16px; line-height:26px; color:var(--ink-dim)}
        .label{font-size:14px; line-height:20px; font-weight:600; color:#027AB9}
        .caption{font-size:12px; line-height:18px; color:var(--ink-dim)}
        @media (max-width:1100px){.h1{font-size:44px; line-height:52px} .h2{font-size:30px; line-height:38px}}

        /* Header */
        .site-header{position:sticky !important; top:0 !important; z-index:999 !important; background:linear-gradient(to bottom, rgba(255,255,255,.86), rgba(255,255,255,.75)); backdrop-filter:blur(8px); border-bottom:1px solid var(--divider); width:100%; left:0}
        .site-header .inner{display:flex; align-items:center; justify-content:space-between; height:72px}
        .brand-logo{display:inline-flex; align-items:center; gap:12px}
        .brand-logo img{height:36px; width:auto; display:block}
        .brand{font-weight:800; letter-spacing:.01em; color:var(--ink)}
        
        /* Navigation */
        .main-nav{display:flex; align-items:center}
        .nav-list{display:flex; list-style:none; margin:0; padding:0; gap:32px; align-items:center}
        .nav-link{font-size:15px; font-weight:500; color:var(--ink); text-decoration:none; padding:8px 0; position:relative; transition:color 0.2s ease}
        .nav-link:hover{color:var(--gold)}
        .nav-link::after{content:''; position:absolute; bottom:0; left:0; width:0; height:2px; background:var(--gold); transition:width 0.3s ease}
        .nav-link:hover::after{width:100%}
        
        /* Header Actions */
        .header-actions{display:flex; align-items:center; gap:16px}
        .login-link{font-size:15px; font-weight:600; background:linear-gradient(90deg, #009FB6, #027AB9); color:#FFFFFF; text-decoration:none; padding:10px 20px; border-radius:999px; transition:all 0.2s ease; box-shadow:0 2px 8px rgba(2,122,185,0.16)}
        .login-link:hover{background:linear-gradient(90deg, #00BEE3, #0286C9); transform:translateY(-1px); box-shadow:0 4px 12px rgba(2,122,185,0.24)}
        /* Buttons */
        button, .cta-btn, .secondary-btn { border-radius: 999px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.25s ease-in-out; }

        /* Primary CTA 基本樣式 */
        .cta-btn {
          background: linear-gradient(90deg, var(--cta-gradient-left), var(--cta-gradient-right));
          color: #FFFFFF; border: none; padding: 16px 40px; box-shadow: 0 10px 24px rgba(2, 122, 185, 0.22);
        }
        .cta-btn:hover {
          background: linear-gradient(90deg, var(--cta-gradient-hover-left), var(--cta-gradient-hover-right));
          transform: scale(1.04);
          box-shadow: 0 8px 24px rgba(2, 122, 185, 0.32);
        }
        
        /* Header 專用小尺寸 CTA（覆蓋 .cta-btn 的內距/字級/陰影） */
        header .cta-btn--sm{
          padding:10px 18px;     /* 原本 16px 40px → 更精緻 */
          font-size:14px;        /* 原本 16px */
          box-shadow:0 6px 14px rgba(2,122,185,.18);
        }
        header .cta-btn--sm:hover{
          transform:scale(1.02); /* 原本 1.04，縮小一點就好 */
          box-shadow:0 8px 18px rgba(2,122,185,.24);
        }
        
        /* Mobile Menu Button */
        .mobile-menu-btn{display:none; flex-direction:column; gap:4px; background:none; border:none; cursor:pointer; padding:8px}
        .mobile-menu-btn span{width:24px; height:2px; background:var(--ink); border-radius:1px; transition:all 0.3s ease}
        
        /* RWD – 自動縮減左右邊距 */
        @media (max-width: 600px) {
          :root { --page-padding: var(--page-padding-mobile); }
        }

        /* Mobile Styles */
        @media (max-width:1024px){.main-nav{display:none} .mobile-menu-btn{display:flex}}
        @media (max-width:768px){
          header .cta-btn--sm{ padding:8px 14px; font-size:13px; }
        }
        @media (max-width:960px) {
          :root { --page-padding: 24px; } /* 原 100px 太大 */
        }
        @media (max-width:767px){.brand-logo img{height:30px} .header-actions{gap:12px} .cta-btn{padding:8px 16px; font-size:14px} .login-link{padding:6px 12px; font-size:14px}}

        /* HERO：標題左、表單右 */
        .hero{background:linear-gradient(180deg, #FFFFFF 0%, #F7FAFE 60%, #F5F8FC 100%)}
        .hero-grid{display:block}
        .hero-inline{display:grid; grid-template-columns:minmax(0,1fr) 440px; gap:32px; align-items:start}
        @media (max-width:992px){.hero-inline{grid-template-columns:1fr; gap:28px}}
        .hero-copy .tagline{color:#7FA8D8}
        .badge{display:inline-block; padding:6px 12px; border:1px solid #009FB6; border-radius:999px; font-size:14px; color:#009FB6; margin:20px 0; background:#ffffff}
        .hero-bullets{margin-top:24px}
        @media (max-width:1200px){.hero-grid{grid-template-columns:1fr; gap:32px}}

        /* Form */
        .card-form{background:#FFFFFF; border:1px solid #DCE3ED; border-radius: 24px; box-shadow:0 10px 30px rgba(16,58,99,.06); padding:32px}
        .form-grid{display:grid; grid-template-columns:1fr; gap:16px}
        
        /* Footer specific form styling */
        .footer-card .form-grid{display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:24px; align-items:end}
        .footer-card .form-grid > div{display:flex; flex-direction:column; flex:1 1 200px; min-width:180px}
        .footer-card .form-grid label{font-weight:600; font-size:14px; color:#1F2937; margin-bottom:4px}
        .footer-card .form-grid input{padding:12px 16px; font-size:16px; border:1px solid #DCE3ED; border-radius:12px}
        .footer-card .form-grid button{grid-column:3; justify-self:end; height:52px; padding:0 24px; line-height:1; white-space:nowrap}
        @media (max-width:1024px){.footer-card .form-grid{grid-template-columns:repeat(2, minmax(0,1fr))} .footer-card .form-grid button{grid-column:1 / -1; justify-self:stretch}}
        @media (max-width:768px){.footer-card .form-grid{grid-template-columns:1fr} .footer-card .form-grid button{grid-column:1 / -1; width:100%}}
        input[type="text"],input[type="email"],input[type="tel"]{height:52px; border:1px solid #DCE3ED; border-radius:12px; padding:0 16px; font-size:16px; color:#333333; background:#FFFFFF; outline:none}
        input::placeholder{color:#98A6B3}
        input:focus{border-color:#2E6EB6; box-shadow:0 0 0 3px rgba(46,110,182,.18)}
        .btn{height:56px; border:none; border-radius:999px; background:linear-gradient(90deg, #009FB6, #027AB9); color:#FFFFFF; font-size:16px; font-weight:700; cursor:pointer; box-shadow:0 10px 24px rgba(242,193,78,.22)}
        .btn:hover{background:linear-gradient(90deg, #009FB6, #026AA7)}
        .error-msg{display:none; color:#D54848; font-size:12px; margin-top:6px}
        .success{display:none; border-left:4px solid #1CA87A; background:rgba(28,168,122,.08); color:#0F7F5F; padding:12px 16px; border-radius:12px; margin-top:16px; font-size:14px}
        .fail{display:none; border-left:4px solid #D54848; background:rgba(213,72,72,.08); color:#B04343; padding:12px 16px; border-radius:12px; margin-top:16px; font-size:14px}

        /* Hero specific background styles */
        .hero-bg{position:absolute; inset:0; z-index:0; background:url('https://drive.google.com/thumbnail?id=1dqPrlDGVMgKHbwcRm2Ww8TcuSjkoJF-F&sz=w3200'); background-size:cover; background-position:70% 60%; pointer-events:none; transition:background 0.5s}
        .hero-grid{max-width:1200px; margin:0 auto; padding:0 24px; position:relative; z-index:2}
        .hero-content{display:flex; flex-direction:column; align-items:flex-start; gap:12px; padding-top:1px; position:relative; z-index:2}
        .hero-text-box{background:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.7); padding:28px 24px; border-radius:16px; text-align:left; box-shadow:0 4px 12px rgba(0,0,0,0.12); margin-left:0; margin-right:auto; max-width:680px}
        .hero-form-row{width:100%; display:flex; justify-content:center; margin-top:20px; z-index:2; position:relative}
        .hero-form-card{background:#fff; border-radius:20px; box-shadow:0 4px 12px rgba(0,0,0,0.16); border:1px solid #E9EFFB; padding:10px 20px; max-width:1120px; width:100%; display:flex; flex-direction:column; align-items:center; transition:box-shadow .2s; position:relative; top:0; margin-top:12px; overflow:hidden}
        
        /* Horizontal form layout */
        .horizontal-form.center-form{display:flex; justify-content:center; gap:18px; align-items:flex-end; max-width:900px; margin:0 auto; flex-wrap:nowrap}
        .h-field{display:flex; flex-direction:column; align-items:flex-start; gap:2px; flex:1 1 auto; min-width:0}
        .h-label{font-size:13px; color:#027AB9; font-weight:700; letter-spacing:0.5px; margin:0 0 6px 8px; display:block}
        .h-input{width:100%; border:none; background:transparent; font-size:15px; color:#333; padding:10px 12px 8px 12px; border-bottom:2px solid #E0E8F0; transition:all 0.25s ease; outline:none; font-family:inherit}
        .h-input:focus{background:#F0F6FF; border-radius:12px}
        .horizontal-form .btn{height:52px; padding:0 24px; font-size:16px; font-weight:700; border:none; border-radius:999px; background:linear-gradient(90deg, #00BEE3, #027AB9); color:#FFFFFF; cursor:pointer; transition:all 0.25s ease; align-self:flex-end; white-space:nowrap}
        .horizontal-form .btn:hover{background:linear-gradient(90deg, #00BEE3, #0286C9); transform:scale(1.04); box-shadow:0 8px 24px rgba(2,122,185,0.32)}
        
        /* Responsive design for hero form */
        @media (max-width:900px){.hero-form-card{padding:14px; border-radius:16px} .horizontal-form.center-form{flex-wrap:wrap; gap:12px} .h-field{flex:1 1 260px; min-width:0}}
        @media (max-width:768px){.hero{padding:64px 16px !important} .horizontal-form.center-form{flex-direction:column; align-items:stretch} .h-field{width:100%; margin:0} .horizontal-form .btn{width:100%; align-self:stretch} .hero-text-box{padding:18px 14px; border-radius:12px} .h1{font-size:30px; line-height:38px}}
        
        /* Hero form specific overrides */
        #heroForm.horizontal-form.center-form{max-width:100% !important; display:grid !important; grid-template-columns:minmax(220px,1fr) minmax(220px,1fr) minmax(220px,1fr) minmax(160px,auto); column-gap:12px; row-gap:12px; align-items:end; padding:0; border:0; box-shadow:none}
        #heroForm .h-field{min-width:0; margin:0}
        #heroForm .btn{align-self:center !important; height:52px; white-space:nowrap}
        @media (max-width:1100px){#heroForm.horizontal-form.center-form{grid-template-columns:minmax(220px,1fr) minmax(220px,1fr)} #heroForm .btn{grid-column:1 / -1; justify-self:stretch}}
        @media (max-width:768px){#heroForm.horizontal-form.center-form{grid-template-columns:1fr} #heroForm .btn{grid-column:1 / -1; width:100%}}
        #heroForm .h-input{min-width:0; font-size:16px; height:46px}
        #heroForm .h-label{font-size:12px}
        .horizontal-form .btn{align-self:stretch !important; height:52px; white-space:nowrap}
        @media (max-width:1180px){.horizontal-form.center-form{grid-template-columns:minmax(220px,1fr) minmax(220px,1fr)} .horizontal-form .btn{grid-column:1 / -1; justify-self:stretch}}
        @media (max-width:900px){.hero-form-card{padding:14px; border-radius:16px}}
        @media (max-width:768px){.hero{padding:64px 16px !important} .horizontal-form.center-form{grid-template-columns:1fr} .horizontal-form .btn{grid-column:1 / -1; width:100%} .hero-text-box{padding:18px 14px; border-radius:12px} .h1{font-size:30px; line-height:38px}}

        /* Filmstrip */
        .filmstrip{height:200px; background:#ffffff; overflow:hidden; border-top:20px solid #ffffff; border-bottom:1px solid #ffffff}
        .filmstrip .row{display:grid; grid-template-columns:repeat(4, 1fr); gap:0; height:100%; width:100vw; margin-left:calc(50% - 50vw)}
        .tile{position:relative; overflow:hidden}
        .tile img{width:100%; height:100%; object-fit:cover; filter:grayscale(6%) contrast(1.03) saturate(0.96)}
        .tile::after{content:""; position:absolute; inset:0; background:linear-gradient(0deg, rgba(16,35,53,.18), rgba(16,35,53,.18))}
        @media (max-width:767px){.filmstrip{height:140px}}

        /* Numbers */
        .numbers{background:#FFFFFF}
        .num-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:24px; text-align:center}
        .filmstrip-row{display:grid; grid-template-columns:repeat(5, 1fr); width:100%; margin:0; padding:0; border:none}
        .filmstrip-row img{width:100%; height:180px; display:block; margin:0; padding:0; border:none}
        .caption-row{display:grid; grid-template-columns:repeat(5, 1fr); margin-top:8px}
        .caption-row p{text-align:center; font-size:10px; color:#333; line-height:1.4; margin:0; padding:0 4px}
        .num{font-size:32px; color:#027AB9; font-weight:bold; line-height:1.2}
        @media (max-width:1024px){.filmstrip-row, .caption-row{grid-template-columns:repeat(3, 1fr)} .filmstrip-row img{height:150px}}
        @media (max-width:640px){.filmstrip-row, .caption-row{grid-template-columns:repeat(2, 1fr)} .filmstrip-row img{height:120px}}
        @media (max-width:900px){.num-grid{grid-template-columns:repeat(2, 1fr)}}
        @media (max-width:600px){.num-grid{grid-template-columns:1fr; text-align:left} .num{font-size:28px}}

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
        .topic-cards{display:flex; flex-direction:row; gap:90px; flex-wrap:wrap; justify-content:center}
        .course-card{display:flex; flex-direction:column; width:320px; background:#fff; border-radius:24px; border:1px solid #EDF1F8; box-shadow:0 4px 18px rgba(30,60,120,.09); overflow:hidden; cursor:default}
        .course-card-imgbox{width:100%; height:180px; background-color:#F3F6F9; display:flex; align-items:center; justify-content:center}
        .course-card-imgbox img{width:100%; height:100%; object-fit:cover; display:block}
        .course-card-content{padding:14px 18px 18px; display:flex; flex-direction:column; justify-content:flex-start; gap:8px}
        .course-tag{background:#e6f7fb; color:#027AB9; font-size:13px; font-weight:600; padding:4px 10px; border-radius:8px; width:fit-content; white-space:nowrap}
        .course-title{font-size:18px; font-weight:700; color:#14263F; line-height:1.5; white-space:normal; overflow-wrap:break-word}
        .course-desc{font-size:14px; color:#6A7A8A; line-height:1.4; white-space:normal; overflow-wrap:break-word}
        .topic-label{font-size:20px; font-weight:600; color:#027AB9; margin-bottom:16px; margin-top:48px; font-family:var(--font-inter),sans-serif}
        .small-img{transform:scale(0.98); transform-origin:center center; display:block; margin:0 auto}
        @media (max-width:768px){.topic-cards{gap:20px} .course-card{width:100%} .topic-label{margin-top:28px}}
        @media (max-width:1024px){.topics-grid{grid-template-columns:1fr}}

        /* Learn split */
        .learn-split{position:relative; display:grid; grid-template-columns:560px minmax(0,1fr); gap:40px; align-items:start}
        .learn-photo{position:relative; border-radius:28px; overflow:hidden; border:1px solid var(--divider); box-shadow:0 18px 40px rgba(16,58,99,.10); aspect-ratio:1/1; background:#0B0C0D}
        .learn-photo img{width:100%; height:100%; object-fit:cover; display:block; filter:grayscale(6%) contrast(1.02) saturate(0.98)}
        .learn-photo::after{content:""; position:absolute; inset:0; background:linear-gradient(to bottom, rgba(16,35,53,.10), rgba(16,35,53,.18))}
        .learn-list{display:flex; flex-direction:column; gap:16px}
        .learn-item{padding-bottom:14px; border-bottom:1px solid rgba(16,35,53,.12)}
        .learn-item:last-child{border-bottom:none}
        .learn-item button{all:unset; cursor:pointer; display:block}
        .learn-item h3{font-size:18px; line-height:26px; font-weight:800; margin:0 0 6px; color:var(--ink)}
        .learn-item p{margin:0 0 6px; color:var(--ink-dim); font-size:14px; line-height:22px}
        .learn-badge{display:inline-block; border:1px solid var(--divider); border-radius:999px; padding:5px 10px; font-size:11px; color:#5B6D7E; background:#FFFFFF}
        .learn-item.active h3{color:#2E6EB6}
        .learn-item.active .learn-badge{border-color:#2E6EB6; color:#2E6EB6; background:#E9F2FF}
        @media (max-width:900px){.learn-split{grid-template-columns:1fr; gap:24px}}

        /* Redirect */
        .redirect{background:#ffffff; color:#14263F; border-top:1px solid var(--divider); border-bottom:1px solid var(--divider); position:relative}
        .redirect::before{content:""; position:absolute; inset:0; background:radial-gradient(90% 140% at 0% 50%, rgba(46,110,182,.15), rgba(255,255,255,0) 55%), radial-gradient(90% 140% at 100% 50%, rgba(242,193,78,.12), rgba(255,255,255,0) 55%); pointer-events:none}
        .redirect .container{display:flex; align-items:center; justify-content:space-between; gap:24px; padding:40px 24px}
        .redirect h3{margin:0; font-weight:800; letter-spacing:-.01em; font-size:28px; line-height:34px; color:#14263F}
        .redirect p{margin:6px 0 0; color:#49647B}
        .redirect-cta.secondary{background:#ffffff; color:#027AB9; border:2px solid #027AB9; display:inline-flex; align-items:center; gap:10px; padding:16px 28px; border-radius:999px; font-weight:800; box-shadow:0 10px 24px rgba(2, 122, 185, 0.22); text-decoration:none}
        .redirect-cta.secondary:hover{background:#F0F9FD; color:#027AB9; border-color:#027AB9; transform:scale(1.02); box-shadow:0 4px 12px rgba(2, 122, 185, 0.12); transition:all 0.2s ease-in-out}
        .redirect-cta svg{flex:none}
        @media (max-width:768px){.redirect .container{flex-direction:column; align-items:flex-start; gap:20px; padding:28px 24px} .redirect h3{font-size:24px; line-height:30px}}

        /* Footer */
        .footer-cta-section{background:#F7FAFE; padding:72px 0; border-top:1px solid #DCE3ED}
        .footer-cta{display:block}
        .footer-copy{margin-bottom:32px}
        .footer-card{background:#FFFFFF; border:1px solid #DCE3ED; border-radius:24px; box-shadow:0 10px 30px rgba(16,58,99,.06); padding:32px}
        .footer-info-section{background:#DFDFDF; padding-top:24px; padding-bottom:16px; border-top:1px solid #DCE3ED}
        .footer-bottom{text-align:center; font-size:14px; color:#5F7180}
        .footer-bottom .footer-info{display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px}
        .footer-bottom .social{display:flex; justify-content:center; gap:16px; flex-wrap:wrap; margin-bottom:8px}
        .footer-bottom .legal{font-size:13px; color:#64798A}

        html{overflow-x:hidden}
        body{overflow-x:hidden; position:relative}
        
        /* Header responsive padding */
        .page-header { padding: 0 100px !important; }
        @media (max-width:960px) { .page-header { padding: 0 24px !important; } }
        @media (max-width:600px) { .page-header { padding: 0 16px !important; } }
        
        /* Fixed consultation button responsive styles */
        .consultation-btn:hover { 
          background: linear-gradient(90deg, #00BEE3, #0286C9) !important; 
          transform: scale(1.02) !important;
          box-shadow: 0 8px 18px rgba(2,122,185,.24) !important;
        }
        @media (max-width:768px) {
          .consultation-btn { 
            padding: 8px 14px !important; 
            font-size: 13px !important; 
          }
        }
        
        /* Footer stability fixes */
        .footer-cta-section { 
          min-height: 400px; 
          padding: 72px 100px !important; 
        }
        .footer-info-section { 
          min-height: 120px; 
          padding: 24px 100px 16px !important; 
        }
        @media (max-width:960px) { 
          .footer-cta-section { padding: 72px 24px !important; }
          .footer-info-section { padding: 24px 24px 16px !important; }
        }
        @media (max-width:600px) { 
          .footer-cta-section { padding: 72px 16px !important; }
          .footer-info-section { padding: 24px 16px 16px !important; }
        }
        
        @media (max-width:360px){.h1, .h2{overflow-wrap:anywhere; word-break:break-word}}
      `}</style>
      
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '72px',
        background: '#fff',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 100px'
      }} className="page-header">
        <a href="#hero" aria-label="Taipei Language Institute Logo" style={{
          display: 'inline-block',
          width: '200px',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          padding: '4px'
        }}>
          <Image 
            src="https://drive.google.com/thumbnail?id=1-eMGYDEmR20U0q9CurC0Z49jW6aTUcgO&sz=w400"
            alt="Taipei Language Institute logo"
            width={400}
            height={120}
            priority
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmZmZmIi8+PC9zdmc+"
            style={{width: '100%', height: 'auto', backgroundColor: '#ffffff', borderRadius: '4px', display: 'block'}}
          />
        </a>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <a href="#contact" aria-label="Free Consultation" className="consultation-btn" style={{
            display: 'inline-block',
            background: 'linear-gradient(90deg, #009FB6, #027AB9)',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            cursor: 'pointer',
            boxShadow: '0 6px 14px rgba(2,122,185,.18)',
            transition: 'all 0.25s ease-in-out'
          }}>
            Free Consultation
          </a>
          <a 
            href="/login" 
            className="login-link"
            style={{
              fontSize: '15px',
              fontWeight: 600,
              background: 'linear-gradient(90deg, #009FB6, #027AB9)',
              color: '#FFFFFF',
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: '999px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(2,122,185,0.16)'
            }}
          >
            Login
          </a>
        </div>
      </header>

      {/* Spacer to compensate fixed header */}
      <div style={{height: '72px'}}></div>

      {/* Hero */}
      <section className="hero section" id="hero" style={{padding: '96px 60px', position: 'relative'}}>
        <div className="hero-bg"></div>
        
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-text-box">
              <span className="badge">Membership | 3‑Month / 1‑Year Plans</span>
              <h1 className="h1">Break Language Barriers. Unlock Asian Markets.</h1>
              <p className="body-l tagline">
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
                  <label htmlFor="hName" className="h-label">Name<span style={{color:'var(--gold)'}}>*</span></label>
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
                  {errors.hero?.name && <div className="error-msg" style={{display: 'block'}}>{errors.hero.name}</div>}
                </div>
                <div className="h-field">
                  <label htmlFor="hEmail" className="h-label">Email<span style={{color:'var(--gold)'}}>*</span></label>
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
                  {errors.hero?.email && <div className="error-msg" style={{display: 'block'}}>{errors.hero.email}</div>}
                </div>
                <div className="h-field">
                  <label htmlFor="hPhone" className="h-label">Phone <span className="caption">(optional)</span></label>
                  <input 
                    id="hPhone" 
                    name="phone" 
                    type="tel" 
                    placeholder="+886 912 345 678" 
                    className="h-input"
                    value={heroForm.phone}
                    onChange={(e) => setHeroForm({...heroForm, phone: e.target.value})}
                  />
                  {errors.hero?.phone && <div className="error-msg" style={{display: 'block'}}>{errors.hero.phone}</div>}
                </div>
                <button className="btn" type="submit">Free Consultation</button>
              </form>
              <div className="caption" style={{margin: '12px 0 0 0', textAlign:'center'}}>
                We&apos;ll get back to you within 1–2 business days. Your information is kept strictly confidential.
              </div>
              {success === 'hero' && (
                <div className="success" style={{display: 'block'}}>
                  Thank you for your submission! We&apos;ll be in touch within 1–2 business days.
                </div>
              )}
              {errors.hero?.submit && (
                <div className="fail" style={{display: 'block'}}>
                  {errors.hero.submit}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filmstrip */}
      <div className="filmstrip">
        <div className="row">
          <div className="tile">
            <Image src="https://images.unsplash.com/photo-1699443218794-589f8bdd48e4?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Language Learning" width={300} height={200}/>
          </div>
          <div className="tile">
            <Image src="https://images.unsplash.com/photo-1515168833906-d2a3b82b302a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Business Communication" width={300} height={200}/>
          </div>
          <div className="tile">
            <Image src="https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Cultural Exchange" width={300} height={200}/>
          </div>
          <div className="tile">
            <Image src="https://images.unsplash.com/photo-1548684133-8739f016b2ac?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Global Business" width={300} height={200}/>
          </div>
        </div>
      </div>

      {/* Why */}
      <section id="about" className="section why">
        <div className="container">
          <h2 className="h2">Why Do You Need a Cross‑Cultural Learning Community?</h2>
          <div className="why-rows">
            <div className="why-item">
              <div>
                <span className="why-tag pain">Common Challenge</span>
                <h3 className="h3">&quot;I need flexibility, but I also want real connection—not just watching videos alone.&quot;</h3>
              </div>
              <div>
                <span className="why-tag solution">Solution</span>
                <p>We&apos;re more than a classroom—it&apos;s a curated community. Connect with like-minded professionals in Taiwan and worldwide to exchange ideas, practice Mandarin, and build meaningful networks that support both your language journey and your career growth.</p>
              </div>
            </div>
            <div className="why-item">
              <div>
                <span className="why-tag pain">Common Challenge</span>
                <h3 className="h3">&quot;I feel like an outsider, unable to connect with Chinese colleagues or clients.&quot;</h3>
              </div>
              <div>
                <span className="why-tag solution">Solution</span>
                <p>We focus on cultural immersion and practical language application, helping you build trust, credibility, and confidence in both formal and informal settings.</p>
              </div>
            </div>
            <div className="why-item">
              <div>
                <span className="why-tag pain">Common Challenge</span>
                <h3 className="h3">&quot;I&apos;ve already studied Chinese before, but I&apos;m losing touch—and I need to keep it sharp to maintain client relationships.&quot;</h3>
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
      <section id="topics" className="section topics">
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
                  <Image
                    className="small-img"
                    src="https://drive.google.com/thumbnail?id=1_NyugcIq2A1IxVae0oqbbmOF7S_tbDuc&sz=w1200"
                    alt="Practical Real Life Based Essentials"
                    width={300}
                    height={200}
                    placeholder="blur"
                    blurDataURL={COURSE_IMAGE_BLUR_DATA_URL}
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
                  <Image src="https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg" alt="Daily Life & Business Communication" width={300} height={200} />
                </div>
                <div className="course-card-content">
                  <div className="course-tag">Live Mini‑Classes</div>
                  <div className="course-title">Daily Life & Business Communication</div>
                  <div className="course-desc">Interactive, Small group, Themed</div>
                </div>
              </div>
              <div className="course-card">
                <div className="course-card-imgbox">
                  <Image src="https://drive.google.com/thumbnail?id=1hFq0oBzJvJm3isL3ElTvnnNy7NZ8Z6_l&sz=w1200" alt="Mandarin Lounge" width={300} height={200} />
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
                  <Image src="https://drive.google.com/thumbnail?id=1V_1-zTB0N-Eq0PvvDFpP3MHycN-OtO1B&sz=w1200" alt="Local Folk Culture Experience" width={300} height={200} loading="lazy" />
                </div>
                <div className="course-card-content">
                  <div className="course-tag">Events</div>
                  <div className="course-title">Local Folk Culture Experience</div>
                  <div className="course-desc">Immersive, Cultural deep-dive</div>
                </div>
              </div>
              <div className="course-card">
                <div className="course-card-imgbox">
                  <Image src="https://drive.google.com/thumbnail?id=19QrdateU5N8G0RS-dtmpx43rRd2hIiJc&sz=w1200" alt="Yoga Martial Home Fitness Series" width={300} height={200} loading="lazy" />
                </div>
                <div className="course-card-content">
                  <div className="course-tag">Workshops</div>
                  <div className="course-title">Yoga Martial Home Fitness Series</div>
                  <div className="course-desc">Wellness, Monthly</div>
                </div>
              </div>
              <div className="course-card">
                <div className="course-card-imgbox">
                  <Image src="https://images.unsplash.com/photo-1672826980330-93ae1ac07b41?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Global Etiquette" width={300} height={200} loading="lazy" />
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
                  <Image src="https://drive.google.com/thumbnail?id=1Dr3O7I80LIGirmqxreB5fnqrRtxEJOBx&sz=w1200" alt="Regenerative medicine & Longevity: Reverse Aging with Science" width={300} height={200} loading="lazy" />
                </div>
                <div className="course-card-content">
                  <div className="course-tag">Expert Channels</div>
                  <div className="course-title">Regenerative medicine & Longevity: Reverse Aging with Science</div>
                  <div className="course-desc">Expert guest, Industry insights</div>
                </div>
              </div>
              <div className="course-card">
                <div className="course-card-imgbox">
                  <Image src="https://drive.google.com/thumbnail?id=1flasExlMfa01xbwSr1Uf_yfOcL2-GAS4&sz=w1200" alt="Networking for Conscious Entrepreneurs and Investors" width={300} height={200} loading="lazy" />
                </div>
                <div className="course-card-content">
                  <div className="course-tag">Expert Channels</div>
                  <div className="course-title">Networking for Conscious Entrepreneurs and Investors</div>
                  <div className="course-desc">Expand horizons, Networking</div>
                </div>
              </div>
              <div className="course-card">
                <div className="course-card-imgbox">
                  <Image src="https://drive.google.com/thumbnail?id=1xM0bM-uYXYkcRyGQQ5b9K_pJyMpbBG_Z&sz=w1200" alt="Kickstarting Global Impact: A Martial Artist's Journey in Business and Cross-Cultural Leadership" width={300} height={200} loading="lazy" />
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
      </section>

      {/* Numbers with Historical Photos */}
      <section id="courses" className="section numbers">
        <div className="container">
          <h2 className="h2">
            TLI Connect — Building on 70 Years of TLI Language Excellence to Launch a Global Learning Community
          </h2>
        </div>

        {/* Filmstrip row: images and captions separated */}
        <div style={{margin: '40px 0'}}>
          <div className="filmstrip-row">
            <Image src="https://drive.google.com/thumbnail?id=1ty5zRQX-Na3YIiVVt0-NTLLW-HA-zrc_&sz=w1600" alt="Professor John King Fairbank" width={250} height={180} loading="lazy" />
            <Image src="https://drive.google.com/thumbnail?id=12zdFoBZzR6gcRwEBG37IRb85a4Sn00mu&sz=w1600" alt="Mr. James Stapleton Roy" width={250} height={180} loading="lazy" />
            <Image src="https://drive.google.com/thumbnail?id=13r0Zn7E9YCj9-waSjb3Wp9uFJ65iBluS&sz=w1600" alt="Mr. Nicholas Kristof and Ms. Sheryl WuDunn" width={250} height={180} loading="lazy" />
            <Image src="https://drive.google.com/thumbnail?id=13Q4uM8toWNxVaN9tSzbw9GtWHnjxrBI9&sz=w1600" alt="Mr. Lee Kuan Yew" width={250} height={180} loading="lazy" />
            <Image src="https://drive.google.com/thumbnail?id=1co45YrsO_hgKCZnUdYxoz-9ik9WzmZHw&sz=w1600" alt="Mr. Mike Chinoy" width={250} height={180} loading="lazy" />
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
          <div className="num-grid">
            <div>
              <div className="num">Established<br/>1956</div>
              <p className="body-m">TLI is Taiwan&apos;s pioneer language institute.</p>
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
          <a className="redirect-cta secondary" href="/business">
            <span>Explore Corporate Plans</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="#027AB9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </section>

      {/* Footer Call-to-Action (Form 區塊) */}
      <section id="contact" className="footer-cta-section section">
        <div className="container footer-cta">
          <div className="footer-copy">
            <h2 className="h2">Ready to Join TLI Connect?</h2>
            <p className="body-m">Leave your info and we&apos;ll send you full plan details within one business day.</p>
          </div>
          <div className="card-form footer-card">
            <form id="footerForm" onSubmit={handleSubmit('footer', footerForm)}>
              <div className="form-grid">
                <div>
                  <label className="label">Name<span style={{color:'var(--gold)'}}>*</span></label>
                  <input 
                    type="text" 
                    placeholder="Your name" 
                    required
                    value={footerForm.name}
                    onChange={(e) => setFooterForm({...footerForm, name: e.target.value})}
                  />
                  {errors.footer?.name && <div className="error-msg" style={{display: 'block'}}>{errors.footer.name}</div>}
                </div>
                <div>
                  <label className="label">Email<span style={{color:'var(--gold)'}}>*</span></label>
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    required
                    value={footerForm.email}
                    onChange={(e) => setFooterForm({...footerForm, email: e.target.value})}
                  />
                  {errors.footer?.email && <div className="error-msg" style={{display: 'block'}}>{errors.footer.email}</div>}
                </div>
                <div>
                  <label className="label">Phone <span className="caption">(optional)</span></label>
                  <input 
                    type="tel" 
                    placeholder="+886 912 345 678"
                    value={footerForm.phone}
                    onChange={(e) => setFooterForm({...footerForm, phone: e.target.value})}
                  />
                  {errors.footer?.phone && <div className="error-msg" style={{display: 'block'}}>{errors.footer.phone}</div>}
                </div>
                <button className="btn" type="submit">Free Consultation</button>
                <div className="caption">We&apos;ll get back to you within 1–2 business days. Your information is kept strictly confidential.</div>
                {success === 'footer' && (
                  <div className="success" style={{display: 'block'}}>
                    Thanks! We&apos;ll contact you within 1–2 business days.
                  </div>
                )}
                {errors.footer?.submit && (
                  <div className="fail" style={{display: 'block'}}>
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