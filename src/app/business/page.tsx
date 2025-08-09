'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BusinessLanding() {
  const [ctaForm, setCtaForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    jobtitle: '',
    primaryTraining: '',
    participants: '',
    requirements: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, company } = ctaForm;
    let valid = true;

    if (!name) { alert('Please enter your name.'); valid = false; }
    if (!email || !/\S+@\S+\.\S+/.test(email)) { alert('Please enter a valid email.'); valid = false; }
    if (!company) { alert('Please enter your company name.'); valid = false; }

    if (valid) {
      alert('Thank you for your submission! We will contact you soon.');
      setCtaForm({
        name: '',
        email: '',
        company: '',
        phone: '',
        jobtitle: '',
        primaryTraining: '',
        participants: '',
        requirements: ''
      });
    }
  };

  return (
    <>
      <style jsx global>{`
        /* ---- Global Tokens ---- */
        :root {
          /* layout */
          --container: 1200px;            /* max content width */
          --page-padding: 100px;          /* 全站左右留白 */
          --page-padding-mobile: 16px;    /* 行動裝置留白 */

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

        /* RWD – 自動縮減左右邊距 */
        @media (max-width: 600px) {
          :root { --page-padding: var(--page-padding-mobile); }
        }

        /* ---- Reset & Base ---- */
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        body {
          font-family: Inter, "Noto Sans", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif;
          color: var(--ink);
          background: var(--black);
        }
        a { text-decoration: none; color: #1E60A9; }
        img { max-width: 100%; display: block; }

        /* ---- Layout Helpers ---- */
        .container { max-width: var(--container); margin: 0 auto; }
        body > section, footer { padding-left: var(--page-padding); padding-right: var(--page-padding); }

        h1, h2, h3 { margin: 0 0 16px; font-family: "Plus Jakarta Sans", "Noto Sans TC", Inter, sans-serif; font-weight: 800; color: var(--ink); font-feature-settings: "pnum" 1, "lnum" 1; }
        .h1 { font-size: 56px; line-height: 64px; letter-spacing: -0.015em; }
        .h2 { font-size: 32px; line-height: 42px; letter-spacing: -0.01em; }
        .body-l { font-size: 18px; line-height: 28px; color: var(--ink); }
        .body-m { font-size: 16px; line-height: 26px; color: var(--ink-dim); }
        @media (max-width: 1100px) { .h1 { font-size: 44px; line-height: 52px; } .h2 { font-size: 30px; line-height: 38px; } }

        /* ---- Buttons ---- */
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

        /* Secondary CTA */
        .secondary-btn {
          background: #ffffff; color: var(--primary); border: 2px solid var(--primary); padding: 14px 32px;
        }
        .secondary-btn:hover {
          background: #F0F9FD; color: var(--primary); transform: scale(1.02); box-shadow: 0 4px 12px rgba(2, 122, 185, 0.12);
        }

        .secondary-btn {
          display: inline-flex;    /* 讓內容置中好排版 */
          align-items: center;
          gap: 8px;                /* 有圖示時的間距，沒有也可留著 */
          width: auto;             /* <= 重點：不要固定寬度 */
          padding: 14px 24px;      /* 內距可自行調整 */
          white-space: nowrap;     /* 讓文字不換行（可拿掉） */
        }

        /* 防止被父層 flex:1 或舊規則影響撐滿 */
        .cta-section .secondary-btn,
        .membership-wrapper .secondary-btn {
          flex: 0 0 auto;
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

        /* 手機再小一點，或需要就隱藏（擇一） */
        @media (max-width:768px){
          header .cta-btn--sm{ padding:8px 14px; font-size:13px; }
        }

        /* Login link styles */
        .login-link{font-size:15px; font-weight:600; background:linear-gradient(90deg, #009FB6, #027AB9); color:#FFFFFF; text-decoration:none; padding:10px 20px; border-radius:999px; transition:all 0.2s ease; box-shadow:0 2px 8px rgba(2,122,185,0.16)}
        .login-link:hover{background:linear-gradient(90deg, #00BEE3, #0286C9); transform:translateY(-1px); box-shadow:0 4px 12px rgba(2,122,185,0.24)}

        /* ---- Hero ---- */
        .hero { position: relative; background:url('https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg') center/cover no-repeat; padding: 120px 300px; text-align: center; }
        .hero::after { content:""; position:absolute; inset:0; background:rgba(255,255,255,0.2); }
        .hero .container { position:relative; z-index:1; }

        /* ---- Pain & Solution ---- */
        .pain-solution-section { background:#fff; padding:72px 0; text-align:center; }
        .pain-checklist { max-width:720px; margin:0 auto; background:var(--paper-soft); border-radius:24px; padding:40px 32px; box-shadow:0 8px 20px rgba(16,35,53,.08); }
        .pain-checklist li { display:flex; align-items:flex-start; margin:16px 0; font-size:16px; font-weight:600; line-height:1.5; }
        .pain-checklist li::before { content:"✖"; color:#D9534F; font-weight:700; font-size:20px; margin-right:12px; }

        /* ---- Third Section (Roles) ---- */
        .third-section{
          background:#ffffff;
          padding:72px 0;
          text-align:center;
        }
        .roles-wrapper{
          max-width:var(--container);
          margin:0 auto;
          display:flex;
          align-items:center;
          gap:56px;
        }

        /* 左圖 40% / 右文 60% */
        .roles-img{ flex:0 0 40%; overflow:visible; }  /* overflow:visible 防止陰影被截掉 */
        .roles-content{ flex:0 0 60%; }

        /* 圖片尺寸 + 統一陰影（基礎） */
        .roles-img img{
          width:65%;
          height:320px;                   /* 你的原設定；若 HTML 有內聯 height，會以內聯為準 */
          object-fit:cover;
          border-radius:24px;
          box-shadow:
            0 16px 36px rgba(16,35,53,.22),
            0 6px 14px  rgba(16,35,53,.12);
        }

        /* 直接覆蓋內聯陰影：三張圖都有 class="zz-img" */
        .third-section .zz-img{
          box-shadow:
            0 16px 36px rgba(16,35,53,.22),
            0 6px 14px  rgba(16,35,53,.12) !important;
          border-radius:24px; /* 保險重申，陰影跟圓角 */
        }

        /* Accordion 基本樣式（原樣保留） */
        .role-accordion details{
          border:1px solid var(--divider);
          border-left:6px solid #262626;
          border-radius:16px;
          overflow:hidden;
          transition:background .2s, border-left-color .2s;
        box-shadow:
            0 10px 14px  rgba(2,122,185,.1);
        }
        .role-accordion details+details{ margin-top:8px; }
        .role-accordion summary{
          list-style:none; cursor:pointer;
          padding:20px 56px 20px 20px;
          font-weight:400; font-size:18px; position:relative;
        }
        .role-accordion summary::-webkit-details-marker{ display:none; }
        .role-accordion summary::after{
          content:"›"; position:absolute; right:20px; top:50%;
          transform:translateY(-50%); font-size:20px; transition:transform .2s;}
        .role-accordion details[open]{ background:var(--paper-soft); border-left-color:#027AB9; }
        .role-accordion details[open] summary::after{ transform:translateY(-50%) rotate(90deg); }
        .role-body{ padding:0 20px 20px; font-size:16px; line-height:1.5; font-weight:400; color:var(--ink); }
        .role-accordion {
          background: #fff;
          margin: 12px 16px 16px;   /* 與外框留一點距離，陰影比較看得出來 */
          padding: 16px 20px;}

        /* 展開時陰影稍微加強（可選） */
        .role-accordion details[open] {
          box-shadow:
            0 12px 28px rgba(2,122,185,.18),
            0 6px 14px  rgba(2,122,185,.12);
        }
        /* 手機：陰影收斂一點，圖高也可微調 */
        @media (max-width:768px){
          .roles-img img{ height:260px; } /* 需要就留；不需要可刪 */
          .third-section .zz-img{
            box-shadow:
              0 12px 28px rgba(16,35,53,.20),
              0 4px 10px  rgba(16,35,53,.12) !important;
          }
        }

        /* ---- Fourth Section (Features) ---- */
        .fourth-section {
          background: #025F96;
          padding: 80px 0;
        }

        /* 主標題：置中且白字 */
        .fourth-section .h2 {
          color: #fff;
          text-align: center;
          margin: 0 0 48px;
        }

        /* 容器 + zigzag 佈局（文字:圖片 = 60% : 40%） */
        .feature-wrapper {
          max-width: var(--container);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 56px;
          padding: 0 var(--page-padding);
          box-sizing: content-box;
        }
        .feature-block {
          display: flex;
          align-items: center;
          gap: 56px;
        }
        .feature-block:nth-child(even) {
          flex-direction: row-reverse;
        }
        .feature-text  { flex: 0 0 60%; }
        .feature-visual{ flex: 0 0 40%; }

        /* 文字：全白，只有條列首句可加粗 */
        .fourth-section .feature-text,
        .fourth-section .feature-text * {
          color: #fff;
          font-weight: 400;
        }
        .fourth-section .feature-text h3 {
          font-size: 24px;
          line-height: 32px;
          margin: 0 0 16px;
        }
        .fourth-section .feature-text ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .fourth-section .feature-text li {
          margin-bottom: 12px;
          font-size: 16px;
          line-height: 1.6;
        }
        .fourth-section .feature-text li strong {
          font-weight: 700;       /* 僅首句加粗 */
          display: block;
          margin-bottom: 6px;
        }

        /* 視覺區：支援放 <img> */
        .feature-visual {
          height: 260px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.12); /* 若用 <img> 也可保留淡底 */
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feature-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 24px;
          display: block;
          box-shadow: 0 8px 20px rgba(0,0,0,.12);
        }

        /* RWD：手機改直向堆疊 */
        @media (max-width: 960px) {
          .feature-block,
          .feature-block:nth-child(even) {
            flex-direction: column;
          }
          .feature-text,
          .feature-visual {
            flex: 0 0 auto;
            width: 100%;
          }
        }

        /* ---- Brand Trust ---- */
        .brand-trust-section { background:#fff; padding: 72px var(--page-padding); text-align:center; }
        .trust-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:32px; max-width:960px; margin:0 auto; }
        .brand-trust-section .filmstrip-vintage{
          margin-left: calc(-1 * var(--page-padding));
          margin-right: calc(-1 * var(--page-padding));
          width: calc(100% + 2 * var(--page-padding));
        }
        .brand-trust-section .h2 { margin-bottom: 16px; }        /* 標題 → 副標 */
        .brand-trust-section .subtitle { margin: 0 0 32px; }     /* 副標 → 圖帶 */
        .brand-trust-section .filmstrip-vintage {                /* 圖帶上下距 */
          margin-top: 16px;
          margin-bottom: 32px;
        }
        .brand-trust-section .trust-list { margin-top: 48px; }   /* 圖帶 → 數字卡 */
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
            height: 170px; /* 一致高度 */
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

         /* ===== Individual Membership 修正版（70/30 + 中線/右邊留白） ===== */
        .individual-membership-section{
          background:#fff;
          padding:24px 0;

          /* 想調距離只改這裡 */
          --edge-x: 32px;           /* 外框左右內距（整塊卡片 ↔ 內容） */
          --text-right-inset: 24px; /* 左欄文字 → 中線 的距離 */
          --cta-left-inset: 24px;   /* 右欄按鈕 → 中線 的距離 */
          --cta-right-gap: 48px;    /* 右欄按鈕 → 外框右邊 的距離 */
        }

        .individual-membership-section .membership-wrapper{
          max-width:var(--container);
          margin:0 auto;
          padding:40px var(--edge-x);
          background:rgba(0,159,182,.08);
          border-radius:24px;

          display:grid;
          grid-template-columns:70% 30%;  /* ← 回到 70/30 */
          align-items:center;
          gap:40px;
        }

        /* 左欄：離中線留白 */
        .individual-membership-section .membership-text{
          min-width:0;
          padding-right:var(--text-right-inset);
        }

        /* 右欄：離中線 + 離外框右邊都留白，按鈕仍靠右 */
        .individual-membership-section .membership-cta{
          display:flex;
          justify-content:flex-end;
          align-items:center;
          padding-left:var(--cta-left-inset);
          padding-right:var(--cta-right-gap);
        }

        /* 保險：避免奇怪的 margin 影響位置 */
        .individual-membership-section .secondary-btn{ margin:0; }

        /* 手機直排：拿掉內側留白，避免擠 */
        @media (max-width:960px){
          .individual-membership-section .membership-wrapper{
            grid-template-columns:1fr;
            gap:20px;
            padding:28px 20px;
          }
          .individual-membership-section .membership-text,
          .individual-membership-section .membership-cta{
            padding:0;
          }
        }

         /* ===== CTA ===== */
        .cta-section {
          background: #fff;
          padding: 64px 0;
        }
        .cta-wrapper {
          max-width: var(--container);
          margin: 0 auto;
          display: flex;
          align-items: stretch;
          gap: 48px;
        }

        /* 左側：表單卡片（維持原寬，行數變少 → 整體更矮） */
        .cta-form {
          flex: 1 1 560px;
          background: #FFFFFF;
          border: 1px solid var(--divider);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(16,58,99,.06);
          --row-gap: 20px;   /* 每一行之間垂直距離 */
          --col-gap: 16px;   /* 同一行欄位之間的水平距離 */
          box-shadow:
            0 14px 36px rgba(2, 122, 185, 0.22),   /* 主色大陰影 */
            0 4px 12px  rgba(2, 122, 185, 0.14);   /* 主色小陰影 */
          border: 1px solid rgba(2, 122, 185, 0.2); /*（可選）邊框也帶一點主色 */
        }
        .cta-form .h2 { margin: 0 0 8px; }
        .cta-form .subtitle {
          font-size: 15px;
          line-height: 22px;
          color: var(--ink-dim);
          margin: 0 0 18px;
        }

        /* 表單網格排版 */
        .form-row { display: grid; gap: 12px; margin-bottom: var(--row-gap); }
        .form-row.two   { grid-template-columns: repeat(2, 1fr); }
        .form-row.three { grid-template-columns: repeat(3, 1fr); }
        .form-row.four  { grid-template-columns: repeat(4, 1fr); }

        .cta-form .form-row.two,
        .cta-form .form-row.three,
        .cta-form .form-row.four { column-gap: var(--col-gap); }

        .field { display: flex; flex-direction: column; gap: 6px; }

        /* Labels：主藍色，(optional) 灰色 */
        .cta-form label {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: .01em;
          color: #027AB9;
        }
        .cta-form label .opt {
          color: #6A7A8A;
          font-weight: 700;
        }

        /* 欄位外觀 */
        .cta-form input,
        .cta-form select,
        .cta-form textarea {
          width: 100%;
          height: 56px;
          border: 1.5px solid #D7DEE8;
          border-radius: 18px;
          background: #FFFFFF;
          font-size: 16px;
          color: #1F2937;
          padding: 12px 16px;
          outline: none;
          transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
          -webkit-appearance: none;
          appearance: none;
        }
        .cta-form textarea {
          min-height: 100px;  /* ↓ 稍短一點 */
          height: auto;
          line-height: 1.5;
          resize: vertical;
        }
        .cta-form ::placeholder { color: #A9B4C2; }

        /* Focus 效果 */
        .cta-form input:focus,
        .cta-form select:focus,
        .cta-form textarea:focus {
          border-color: #027AB9;
          box-shadow: 0 0 0 3px rgba(2,122,185,.18);
          background: #FFFFFF;
        }

        /* 送出按鈕（沿用全站 hover） */
        .cta-form .cta-btn {
          height: 52px;
          padding: 0 28px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(90deg, #009FB6, #027AB9);
          color: #fff;
          font-weight: 800;
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(2,122,185,.22);
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
          display: block;
          margin: 12px auto 0;  /* 置中 */
        }
        .cta-form .cta-btn:hover {
          background: linear-gradient(90deg, #00BEE3, #0286C9);
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(2,122,185,.28);
        }

        .form-row.four .field.company { 
          grid-column: span 2;
        }

        /* RWD */
        @media (max-width: 1200px) {
          .form-row.four  { grid-template-columns: repeat(2, 1fr); } /* 4 欄 → 2 欄 */
          .form-row.three { grid-template-columns: repeat(2, 1fr); } /* 3 欄 → 2 欄 */
        }
        @media (max-width: 960px) {
          .cta-wrapper { flex-direction: column; gap: 24px; }
          .form-row.two,
          .form-row.three,
          .form-row.four { grid-template-columns: 1fr; } /* 手機單欄 */
          .cta-form { padding: 22px; }
        }

        /* ============== Simple Footer ============== */
        footer{
          --footer-bg: #FFFFFF;           /* 想改底色就改這裡 */
          --footer-link: #1E60A9;         /* 連結色 */
          --footer-text: #5F7180;         /* 文字色 */
          --footer-border: #DCE3ED;       /* 上邊框色 */

          background: var(--footer-bg);
          color: var(--footer-text);
          border-top: 1px solid var(--footer-border);
          padding: 24px 0 16px;
          font-size: 14px;
        }

        footer .container{
          max-width: var(--container, 1200px);
          margin: 0 auto;
          padding: 0 24px;
          text-align: center;
        }

        /* 每行間距 */
        footer .container > div{
          margin-bottom: 8px;
        }
        footer .container > div:last-child{
          margin-bottom: 0;
        }

        /* 連結 */
        footer a{
          color: var(--footer-link);
          text-decoration: none;
        }
        footer a:hover{
          text-decoration: underline;
        }
        footer a:focus-visible{
          outline: 2px solid var(--footer-link);
          outline-offset: 2px;
          border-radius: 3px;
        }

        /* 連結群組（Privacy / Terms） */
        footer .footer-links{
          margin: 4px 0 8px;
          line-height: 1.6;
          color: var(--footer-text);
        }

        /* 社群列 */
        footer .social{
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 8px; /* 若已寫 inline，可移除此行 */
        }
        footer .social a{
          color: var(--footer-link);
        }

        /* RWD */
        @media (max-width: 768px){
          footer{ font-size: 13px; }
        }

        /* 讓平板也縮左右邊距 */
        @media (max-width: 960px) {
          :root { --page-padding: 24px; } /* 原 100px 太大 */
        }

        /* Hero：用全域留白，手機再縮上下距 */
        .hero { padding: 120px var(--page-padding); }
        @media (max-width: 600px) {
          .hero { padding: 80px var(--page-padding); }
        }

        /* Features：強制直排，覆蓋 inline 的 row-reverse */
        @media (max-width: 960px) {
          .feature-block,
          .feature-block:nth-child(even) {
            flex-direction: column !important; /* 覆蓋 inline */
            gap: 24px;
          }
          .feature-wrapper { gap: 32px; }
          .fourth-section .feature-text li { font-size: 14px; } /* 可改 15–16 自行微調 */
        }

        /* Brand Trust：手機改成橫向滑動的膠卷，避免 5 欄擠爆 */
        @media (max-width: 600px) {
          .brand-trust-section .filmstrip-row {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 80vw;      /* 每張佔 80% 螢幕寬 */
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .brand-trust-section .filmstrip-row img {
            height: 160px;
            scroll-snap-align: center;
          }
          /* caption 太擠可先隱藏；若要保留可做成跟著滑的單行 */
          .brand-trust-section .caption-row { display: none; }
        }

        /* Heading 更友善的小尺寸（可選） */
        @media (max-width: 600px) {
          .h1 { font-size: 36px; line-height: 44px; }
          .h2 { font-size: 24px; line-height: 32px; }
        }

        /* Roles：在 960px 以下強制直排，間距別太大 */
        @media (max-width: 960px) {
          .roles-wrapper {
            flex-direction: column;
            gap: 24px;
            text-align: center;
          }
          .roles-content { text-align: left; } /* 內容仍以左對齊較好讀 */
        }

        /* Roles 圖片群：手機版不要爆版（兩種選一：A 保留交疊、B 只留一張） */

        /* A. 保留交疊但縮小＆限制範圍 */
        @media (max-width: 960px) {
          .roles-img { 
            max-width: 320px; 
            margin: 0 auto; 
            height: 320px;       /* 固定容器高，避免往下壓到文字 */
            position: relative;
          }
          .roles-img .zz-img { 
            width: 70%; 
            height: 240px; 
            object-fit: cover; 
            border-radius: 24px;
          }
          /* 三張的位置微調，縮短位移距離 */
          .roles-img .zz-img:nth-child(1) { position: relative; top: 0; left: 0; z-index: 3; }
          .roles-img .zz-img:nth-child(2) { position: absolute; top: 20px; left: 28%; z-index: 2; }
          .roles-img .zz-img:nth-child(3) { position: absolute; top: 40px; left: 0; z-index: 1; }
        }

        /* 副標 20px（確保這塊的第二行說明字級到位） */
        #roles .subtitle,
        .roles-content .subtitle { 
          font-size: 20px; 
          line-height: 30px;
        }

        /* 平板也縮左右留白，避免 100px 太寬 */
        @media (max-width: 960px) {
          :root { --page-padding: 24px; }
        }

        @media (max-width: 960px) {
          .roles-img { display: none; }
          .roles-content { flex: 1 1 100%; width: 100%; }
        }

        /* Pain card styles */
        .pain-card-list {max-width:1200px; margin:40px auto 0; display:grid; gap:24px; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); padding:0; list-style:none;}
        @media (min-width:1024px){ .pain-card-list{grid-template-columns:repeat(5,1fr);} }

        /* 卡片改用 grid：上下各占一半 */
        .pain-card{border-radius:24px; box-shadow:0 6px 16px rgba(16,35,53,.08); overflow:hidden; display:grid; grid-template-rows:1fr 1fr; height:220px; transition:transform .2s, box-shadow .2s;}
        .pain-card:hover{transform:translateY(-4px); box-shadow:0 12px 28px rgba(16,35,53,.15);}    

        .pain-card .card-title{background:#009FB6; color:#ffffff; font-weight:700; font-size:16px; line-height:1.4; padding:16px 20px; display:flex; align-items:center; justify-content:center; text-align:center;}
        .pain-card .card-body{background:#ffffff; color:var(--ink); font-size:14px; line-height:1.5; padding:16px 20px; overflow:hidden;}
      `}</style>

      <div>
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
          padding: '0 var(--page-padding)'
        }}>
          <a href="#hero" aria-label="Taipei Language Institute Logo" style={{
            display: 'inline-block',
            width: '200px'
          }}>
            <Image 
              src="https://drive.google.com/thumbnail?id=1-eMGYDEmR20U0q9CurC0Z49jW6aTUcgO&sz=w400"
              alt="Taipei Language Institute logo"
              width={400}
              height={120}
              priority
              style={{width: '100%', height: 'auto'}}
            />
          </a>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <a href="#contact" className="cta-btn cta-btn--sm" aria-label="Free Consultation">
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

        {/* Hero Section */}
        <section className="hero" id="hero">
          <div className="container hero-text" style={{textAlign: 'center'}}>
            <div style={{
              background: 'rgba(255,255,255,0.8)',
              padding: '32px 40px',
              borderRadius: '24px',
              display: 'block',
              maxWidth: '720px',
              width: '100%',
              margin: '0 auto'
            }}>
              <h1 className="h1">TLI Connect — Build Your Own Global Talent Community</h1>
              <p className="body-l" style={{fontSize: '20px'}}>
                Integrated language, culture & business modules — learn anytime, anywhere with global professionals.
              </p>
              <p className="body-m" style={{marginBottom: 0}}>
                Since 1956, TLI has specialized in language education, serving enterprises and academic institutions around the world.
              </p>
            </div>
            <button
              type="button"
              className="cta-btn"
              aria-label="Free Consultation"
              style={{marginTop: '24px'}}
              onClick={() => document.querySelector('#contact')?.scrollIntoView({behavior: 'smooth', block: 'start'})}
            >
              Free Consultation
            </button>
          </div>
        </section>

        {/* Pain & Solution */}
        <section className="pain-solution-section" style={{
          background: 'rgba(0,159,182,0.08)',
          padding: '72px 0',
          textAlign: 'center'
        }}>
          <h2 className="h2">What Challenges Are You Facing in International Training?</h2>
          <p className="subtitle" style={{fontSize: '20px'}}>
            As you help employees adapt to diverse cultures and markets, do any of these issues resonate?
          </p>

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
            <div className="roles-img" aria-hidden="true" style={{
              position: 'relative',
              maxWidth: '350px',
              margin: '0 auto'
            }}>
              <Image 
                className="zz-img" 
                src="https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg" 
                alt="Scenario 1" 
                width={260}
                height={250}
                style={{
                  width: '65%',
                  height: '250px',
                  objectFit: 'cover',
                  borderRadius: '24px',
                  boxShadow: '0 8px 24px rgba(16,35,53,.12)',
                  position: 'relative',
                  top: '-125px',
                  left: '-15%',
                  zIndex: 1
                }}
              />
              <Image 
                className="zz-img" 
                src="https://images.unsplash.com/photo-1701980889802-55ff39e2e973?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Scenario 2" 
                width={260}
                height={250}
                style={{
                  width: '65%',
                  height: '250px',
                  objectFit: 'cover',
                  borderRadius: '24px',
                  boxShadow: '0 8px 24px rgba(16,35,53,.12)',
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  zIndex: 2
                }}
              />
              <Image 
                className="zz-img" 
                src="https://images.pexels.com/photos/12437056/pexels-photo-12437056.jpeg" 
                alt="Scenario 3" 
                width={260}
                height={250}
                style={{
                  width: '65%',
                  height: '250px',
                  objectFit: 'cover',
                  borderRadius: '24px',
                  boxShadow: '0 8px 24px rgba(16,35,53,.12)',
                  position: 'absolute',
                  top: '160px',
                  left: '0%',
                  zIndex: 3
                }}
              />
            </div>
            <div className="roles-content">
              <h2 className="h2">Tailored Training for Every Role on Your Team</h2>
              <p className="subtitle" style={{fontSize: '20px'}}>
                Whether you&apos;re launching a new project or collaborating day-to-day, we help you bridge departmental divides. 
                We empower your team by building a common language and fostering a shared cultural understanding for smoother collaboration.
              </p>

              <div className="role-accordion">
                <details open>
                  <summary>Expats & New Hires</summary>
                  <div className="role-body">Strengthen language skills and local cultural awareness before day one.</div>
                </details>
                <details>
                  <summary>Foreign Managers & Technical Experts</summary>
                  <div className="role-body">Learn local management styles to reduce onboarding friction.</div>
                </details>
                <details>
                  <summary>Sales & Project Teams</summary>
                  <div className="role-body">Master cross‑border presentations, proposals, and negotiation tactics.</div>
                </details>
                <details>
                  <summary>Customer Support & Service</summary>
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
        <section className="fourth-section" id="features" style={{
          background: '#025F96',
          padding: '80px 0',
          color: '#fff'
        }}>
          <h2 className="h2" style={{textAlign: 'center', margin: '0 0 48px'}}>
            How We Help You Achieve Your Training Goals
          </h2>

          <div className="feature-wrapper" style={{
            maxWidth: 'var(--container)',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '56px',
            padding: '0 var(--page-padding)',
            boxSizing: 'content-box'
          }}>
            {/* Block A */}
            <div className="feature-block" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '56px'
            }}>
              <div className="feature-text" style={{flex: '0 0 60%'}}>
                <h3 style={{
                  margin: '0 0 16px',
                  fontSize: '24px',
                  lineHeight: '32px',
                  fontWeight: 400
                }}>
                  We Create a Learning Experience Your Team Will Love
                </h3>
                <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
                  <li style={{
                    marginBottom: '12px',
                    fontSize: '16px',
                    lineHeight: 1.6,
                    fontWeight: 400
                  }}>
                    <strong style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 700
                    }}>
                      Flexible & Cost-Effective Training
                    </strong>
                    <span>
                      Combine a video library, live small-group classes, and in-person workshops to create a blended learning program that fits your team&apos;s schedule and your budget.
                    </span>
                  </li>
                  <li style={{
                    marginBottom: '12px',
                    fontSize: '16px',
                    lineHeight: 1.6,
                    fontWeight: 400
                  }}>
                    <strong style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 700
                    }}>
                      A Community to Boost Engagement
                    </strong>
                    <span>
                      A cross-border forum allows learners to ask questions, share insights, and network, building a powerful internal knowledge network for your company.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="feature-visual" aria-hidden="true" style={{flex: '0 0 40%'}}>
                <Image
                  src="https://drive.google.com/thumbnail?id=1-2N3ADEgUMbVAVpJMkdNehtAfCWPC8M-&sz=w1600"
                  alt="Learning Hub"
                  width={400}
                  height={260}
                  style={{
                    width: '100%',
                    height: '260px',
                    objectFit: 'cover',
                    borderRadius: '24px',
                    display: 'block',
                    boxShadow: '0 8px 20px rgba(0,0,0,.12)'
                  }}
                />
              </div>
            </div>

            {/* Block B */}
            <div className="feature-block" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '56px',
              flexDirection: 'row-reverse'
            }}>
              <div className="feature-text" style={{flex: '0 0 60%'}}>
                <h3 style={{
                  margin: '0 0 16px',
                  fontSize: '24px',
                  lineHeight: '32px',
                  fontWeight: 400
                }}>
                  Streamline Processes & Measure What Matters
                </h3>
                <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
                  <li style={{
                    marginBottom: '12px',
                    fontSize: '16px',
                    lineHeight: 1.6,
                    fontWeight: 400
                  }}>
                    <strong style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 700
                    }}>
                      Automated HR & Admin
                    </strong>
                    <span>
                      Cut down on manual work with self-service enrollment, automated reminders, and attendance tracking, reducing administrative burden and paperwork.
                    </span>
                  </li>
                  <li style={{
                    marginBottom: '12px',
                    fontSize: '16px',
                    lineHeight: 1.6,
                    fontWeight: 400
                  }}>
                    <strong style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 700
                    }}>
                      Real-Time Progress Tracking
                    </strong>
                    <span>
                      Monitor learning status with dashboard reports and at-a-glance summaries. Easily track team progress and align training with your company&apos;s performance goals.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="feature-visual" aria-hidden="true" style={{flex: '0 0 40%'}}>
                <Image
                  src="https://drive.google.com/thumbnail?id=1DJnDUDcbaryrG27Jgb-gt0AWPXr-SKGo&sz=w1600"
                  alt="Automation & KPI"
                  width={400}
                  height={260}
                  style={{
                    width: '100%',
                    height: '260px',
                    objectFit: 'cover',
                    borderRadius: '24px',
                    display: 'block',
                    boxShadow: '0 8px 20px rgba(0,0,0,.12)'
                  }}
                />
              </div>
            </div>

            {/* Block C */}
            <div className="feature-block" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '56px'
            }}>
              <div className="feature-text" style={{flex: '0 0 60%'}}>
                <h3 style={{
                  margin: '0 0 16px',
                  fontSize: '24px',
                  lineHeight: '32px',
                  fontWeight: 400
                }}>
                  Scale Your Training Across the Globe
                </h3>
                <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
                  <li style={{
                    marginBottom: '12px',
                    fontSize: '16px',
                    lineHeight: 1.6,
                    fontWeight: 400
                  }}>
                    <strong style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: 700
                    }}>
                      Multi-Language Support for Global Teams
                    </strong>
                    <span>
                      Access content covering language, culture, and key business topics, all available in multiple languages. The platform easily expands to support your new regional markets as you grow.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="feature-visual" aria-hidden="true" style={{flex: '0 0 40%'}}>
                <Image
                  src="https://drive.google.com/thumbnail?id=1CTnouKt7sz-z_0CFRuIwk5ROZDBTO3QZ&sz=w1600"
                  alt="Learning Hub"
                  width={400}
                  height={260}
                  style={{
                    width: '100%',
                    height: '260px',
                    objectFit: 'cover',
                    borderRadius: '24px',
                    display: 'block',
                    boxShadow: '0 8px 20px rgba(0,0,0,.12)'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Brand Trust */}
        <section className="brand-trust-section">
          <h2 className="h2">From Language Instruction to Cross-Cultural Collaboration—TLI&apos;s Commitment</h2>
          <p className="subtitle" style={{fontSize: '20px'}}>
            TLI Connect extends 70 years of TLI&apos;s educational heritage, delivering scalable, governable, and measurable cross-cultural training solutions.
          </p>
          <div className="filmstrip-vintage">
            <div className="filmstrip-row">
              <Image src="https://drive.google.com/thumbnail?id=1ty5zRQX-Na3YIiVVt0-NTLLW-HA-zrc_&sz=w1600" alt="Professor John King Fairbank" width={200} height={150} />
              <Image src="https://drive.google.com/thumbnail?id=12zdFoBZzR6gcRwEBG37IRb85a4Sn00mu&sz=w1600" alt="Mr. James Stapleton Roy" width={200} height={150} />
              <Image src="https://drive.google.com/thumbnail?id=13r0Zn7E9YCj9-waSjb3Wp9uFJ65iBluS&sz=w1600" alt="Mr. Nicholas Kristof and Ms. Sheryl WuDunn" width={200} height={150} />
              <Image src="https://drive.google.com/thumbnail?id=13Q4uM8toWNxVaN9tSzbw9GtWHnjxrBI9&sz=w1600" alt="Mr. Lee Kuan Yew" width={200} height={150} />
              <Image src="https://drive.google.com/thumbnail?id=1co45YrsO_hgKCZnUdYxoz-9ik9WzmZHw&sz=w1600" alt="Mr. Mike Chinoy" width={200} height={150} />
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
              <p style={{fontSize: '48px', fontWeight: 800, color: 'var(--primary)', margin: '0 0 8px 0'}}>
                1956
              </p>
              <p style={{color: 'var(--ink)', fontWeight: 200}}>
                TLI founded, serving the U.S. State Department&apos;s stationed diplomats and advisors
              </p>
            </div>
            <div>
              <p style={{fontSize: '48px', fontWeight: 800, color: 'var(--primary)', margin: '0 0 8px 0'}}>
                80,000+
              </p>
              <p style={{color: 'var(--ink)', fontWeight: 200}}>
                Chinese teachers certified with over 500 teaching materials developed
              </p>
            </div>
            <div>
              <p style={{fontSize: '48px', fontWeight: 800, color: 'var(--primary)', margin: '0 0 8px 0'}}>
                400,000+
              </p>
              <p style={{color: 'var(--ink)', fontWeight: 200}}>
                Students trained across Fortune 500 firms, embassies, and institutions
              </p>
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
              <Link href="/" className="secondary-btn" aria-label="View Individual Plans">
                View Individual Plans
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section" id="contact">
          <div className="cta-wrapper">
            {/* LEFT – Form */}
            <div className="cta-form">
              <h2 className="h2">Ready to Kick-Start Corporate Cross-Cultural Training?</h2>
              <p className="subtitle">Tell us what you need, and our consultants will craft a scalable, measurable training roadmap for your team.</p>

              <form id="ctaForm" noValidate onSubmit={handleSubmit}>
                {/* Row 1：Name / Email / Company（4 欄，Company 跨 2 欄） */}
                <div className="form-row four">
                  <div className="field">
                    <label htmlFor="name">Name *</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      placeholder="Your name" 
                      required 
                      value={ctaForm.name}
                      onChange={(e) => setCtaForm({...ctaForm, name: e.target.value})}
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
                      value={ctaForm.email}
                      onChange={(e) => setCtaForm({...ctaForm, email: e.target.value})}
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
                      value={ctaForm.company}
                      onChange={(e) => setCtaForm({...ctaForm, company: e.target.value})}
                    />
                  </div>
                </div>

                {/* Row 2：Phone / Job Title / Primary Training / Number of Participants（4 欄） */}
                <div className="form-row four">
                  <div className="field">
                    <label htmlFor="phone">Phone <span className="opt">(optional)</span></label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      placeholder="+886 912 345 678" 
                      value={ctaForm.phone}
                      onChange={(e) => setCtaForm({...ctaForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="jobtitle">Job Title <span className="opt">(optional)</span></label>
                    <input 
                      type="text" 
                      id="jobtitle" 
                      name="jobtitle" 
                      placeholder="Your job title" 
                      value={ctaForm.jobtitle}
                      onChange={(e) => setCtaForm({...ctaForm, jobtitle: e.target.value})}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="primaryTraining">Primary Training Needs <span className="opt">(optional)</span></label>
                    <select 
                      id="primaryTraining" 
                      name="primaryTraining"
                      value={ctaForm.primaryTraining}
                      onChange={(e) => setCtaForm({...ctaForm, primaryTraining: e.target.value})}
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
                      value={ctaForm.participants}
                      onChange={(e) => setCtaForm({...ctaForm, participants: e.target.value})}
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

                {/* Row 3：Brief Description（單欄） */}
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="requirements">Brief Description of Your Requirements <span className="opt">(optional)</span></label>
                    <textarea 
                      id="requirements" 
                      name="requirements" 
                      placeholder="Describe your requirements"
                      value={ctaForm.requirements}
                      onChange={(e) => setCtaForm({...ctaForm, requirements: e.target.value})}
                    ></textarea>
                  </div>
                </div>

                <button type="submit" className="cta-btn" aria-label="Free Consultation">
                  Free Consultation
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <div className="container">
            <div>
              <a href="https://tli1956.com/?lang=en" target="_blank" rel="noopener noreferrer" title="TLI Website">
                TLI Taipei Language Institute
              </a>
              | <a href="mailto:contact@tli1956.com">contact@tli1956.com</a>
            </div>
            <div className="footer-links"></div>
            <div className="social body-m" style={{marginBottom: '8px'}}>
              <a href="https://www.linkedin.com/school/taipei-language-institute/posts/?feedView=all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LinkedIn</a>
              <a href="https://www.youtube.com/channel/UCCySlsmCXX8Id-m5NSTLCrw" target="_blank" rel="noopener noreferrer" aria-label="YouTube">YouTube</a>
              <a href="https://www.instagram.com/learn.chinese.tli/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
              <a href="https://www.facebook.com/tli1956/?locale=zh_TW" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
            </div>
            <div>© TLI Taipei Language Institute. All rights reserved.</div>
          </div>
        </footer>
      </div>
    </>
  );
}