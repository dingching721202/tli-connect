'use client';

import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";

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
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validPhone = (v: string) => !v || /^[0-9+\-()\s]+$/.test(v);

  const handleSubmit = (formType: string, formData: any) => (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name.';
    if (!validEmail(formData.email.trim())) newErrors.email = 'Please enter a valid email address.';
    if (!validPhone(formData.phone.trim())) newErrors.phone = 'Please enter numbers only or include + / - / ( ).';

    setErrors({...errors, [formType]: newErrors});

    if (Object.keys(newErrors).length === 0) {
      setSuccess(formType);
      if (formType === 'hero') setHeroForm({ name: '', email: '', phone: '' });
      if (formType === 'footer') setFooterForm({ name: '', email: '', phone: '' });
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  const [activeLearnItem, setActiveLearnItem] = useState(0);
  const [currentImage, setCurrentImage] = useState("https://images.unsplash.com/photo-1522199710521-72d69614c702?w=2000&auto=format&fit=crop&q=80");

  const learnItems = [
    {
      title: "Video Library",
      description: "400+ curated videos — learn anytime, anywhere",
      badge: "400+ · 24/7",
      image: "https://images.unsplash.com/photo-1522199710521-72d69614c702?w=2000&auto=format&fit=crop&q=80"
    },
    {
      title: "Live Mini‑Classes",
      description: "45‑minute small‑group sessions, immediate feedback",
      badge: "45m · small‑group",
      image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=2000&auto=format&fit=crop&q=80"
    },
    {
      title: "Events & Workshops",
      description: "Networking & themed workshops every month",
      badge: "Monthly",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=2000&auto=format&fit=crop&q=80"
    },
    {
      title: "Expert Channels",
      description: "Cross‑discipline guest instructors, fresh content weekly",
      badge: "Weekly",
      image: "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=2000&auto=format&fit=crop&q=80"
    },
    {
      title: "Member Community",
      description: "Discussion forums & language‑exchange groups",
      badge: "24/7",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=2000&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
        
        :root{
          --container: 1200px;
          --r32: 32px;
          --black: #F5F8FC;
          --black-900: #103A63;
          --paper: #FFFFFF;
          --paper-soft: #F9FBFE;
          --ink: #102335;
          --ink-dim: #6A7A8A;
          --divider: rgba(16,35,53,.14);
          --gold: #F2C14E;
          --gold-strong: #E4B43B;
          --error: #D54848;
          --success: #1CA87A;
          --blue-500: #2E6EB6;
          --blue-100: #E9F2FF;
        }
        
        body {
          font-family: Inter, "Noto Sans", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif;
          color: var(--ink);
          background: var(--black);
          margin: 0;
          padding: 0;
        }
        
        .page-container {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 24px;
        }
        
        .section {
          padding: 88px 0;
        }
        
        @media (max-width: 767px) {
          .section {
            padding: 64px 0;
          }
        }
        
        .h1 {
          font-size: 56px;
          line-height: 64px;
          font-weight: 800;
          letter-spacing: -0.015em;
          font-family: "Plus Jakarta Sans", "Noto Sans TC", Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          color: var(--ink);
          margin: 0 0 16px;
        }
        
        .h2 {
          font-size: 34px;
          line-height: 42px;
          font-weight: 800;
          letter-spacing: -0.01em;
          font-family: "Plus Jakarta Sans", "Noto Sans TC", Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          color: var(--ink);
          margin: 0 0 16px;
        }
        
        .h3 {
          font-size: 22px;
          line-height: 30px;
          font-weight: 800;
          letter-spacing: -0.01em;
          font-family: "Plus Jakarta Sans", "Noto Sans TC", Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          color: var(--ink);
          margin: 0 0 16px;
        }
        
        .body-l {
          font-size: 18px;
          line-height: 28px;
          color: var(--ink);
        }
        
        .body-m {
          font-size: 16px;
          line-height: 26px;
          color: var(--ink-dim);
        }
        
        .label {
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
          color: var(--ink);
        }
        
        @media (max-width: 1100px) {
          .h1 {
            font-size: 44px;
            line-height: 52px;
          }
          .h2 {
            font-size: 30px;
            line-height: 38px;
          }
        }
      `}</style>
      
      <div style={{minHeight: '100vh', background: 'var(--black)'}}>
        {/* Navigation First */}
        <Navigation />
        
        {/* HERO */}
        <section className="section" style={{background: 'linear-gradient(180deg, #FFFFFF 0%, #F7FAFE 60%, #F5F8FC 100%)'}}>
          <div className="page-container">
            <div style={{display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 440px', gap: '32px', alignItems: 'start'}}>
              <div>
                <h1 className="h1">Master the Global Stage — Join TLI Connect</h1>
                <p className="body-l" style={{color: '#7FA8D8'}}>Language × Culture × Business — empowering tomorrow's global talent.</p>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  border: '1px solid var(--blue-500)',
                  borderRadius: '999px',
                  fontSize: '14px',
                  color: 'var(--blue-500)',
                  margin: '20px 0',
                  background: '#F0F6FF'
                }}>
                  Membership | 3‑Month / 1‑Year Plans
                </span>
                <p className="body-m" style={{marginTop: '24px', color: '#49647B'}}>Since 1956, TLI has empowered learners worldwide.</p>
              </div>
              
              <div style={{
                background: 'var(--paper)',
                border: '1px solid var(--divider)',
                borderRadius: 'var(--r32)',
                boxShadow: '0 10px 30px rgba(16,58,99,.06)',
                padding: '32px'
              }}>
                <h2 className="h3" style={{marginBottom: '12px', color: '#2E6EB6'}}>Talk to Us</h2>
                <form onSubmit={handleSubmit('hero', heroForm)}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '16px'}}>
                    <div>
                      <label className="label">Name<span style={{color: 'var(--gold)'}}>*</span></label>
                      <input
                        type="text"
                        placeholder="Your name"
                        required
                        value={heroForm.name}
                        onChange={(e) => setHeroForm({...heroForm, name: e.target.value})}
                        style={{
                          height: '52px',
                          border: '1px solid var(--divider)',
                          borderRadius: '16px',
                          padding: '0 16px',
                          fontSize: '16px',
                          color: 'var(--ink)',
                          background: '#FFFFFF',
                          outline: 'none',
                          width: '100%'
                        }}
                      />
                      {errors.hero?.name && <div style={{display: 'block', color: 'var(--error)', fontSize: '12px', marginTop: '6px'}}>{errors.hero.name}</div>}
                    </div>
                    <div>
                      <label className="label">Email<span style={{color: 'var(--gold)'}}>*</span></label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={heroForm.email}
                        onChange={(e) => setHeroForm({...heroForm, email: e.target.value})}
                        style={{
                          height: '52px',
                          border: '1px solid var(--divider)',
                          borderRadius: '16px',
                          padding: '0 16px',
                          fontSize: '16px',
                          color: 'var(--ink)',
                          background: '#FFFFFF',
                          outline: 'none',
                          width: '100%'
                        }}
                      />
                      {errors.hero?.email && <div style={{display: 'block', color: 'var(--error)', fontSize: '12px', marginTop: '6px'}}>{errors.hero.email}</div>}
                    </div>
                    <div>
                      <label className="label">Phone <span style={{fontSize: '12px', lineHeight: '18px', color: 'var(--ink-dim)'}}>(optional)</span></label>
                      <input
                        type="tel"
                        placeholder="+886 912 345 678"
                        value={heroForm.phone}
                        onChange={(e) => setHeroForm({...heroForm, phone: e.target.value})}
                        style={{
                          height: '52px',
                          border: '1px solid var(--divider)',
                          borderRadius: '16px',
                          padding: '0 16px',
                          fontSize: '16px',
                          color: 'var(--ink)',
                          background: '#FFFFFF',
                          outline: 'none',
                          width: '100%'
                        }}
                      />
                      {errors.hero?.phone && <div style={{display: 'block', color: 'var(--error)', fontSize: '12px', marginTop: '6px'}}>{errors.hero.phone}</div>}
                    </div>
                    <button
                      type="submit"
                      style={{
                        height: '56px',
                        border: 'none',
                        borderRadius: '999px',
                        background: 'var(--gold)',
                        color: '#1E2328',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 10px 24px rgba(242,193,78,.22)'
                      }}
                    >
                      Talk to Us
                    </button>
                    <div style={{fontSize: '12px', lineHeight: '18px', color: 'var(--ink-dim)'}}>
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
                        Thanks! We'll contact you within 1–2 business days.
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Filmstrip */}
        <div style={{
          height: '200px',
          background: 'var(--black-900)',
          overflow: 'hidden',
          borderTop: '1px solid var(--divider)',
          borderBottom: '1px solid var(--divider)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '0',
            height: '100%',
            width: '100vw',
            marginLeft: 'calc(50% - 50vw)'
          }}>
            {[
              "https://images.unsplash.com/photo-1522199710521-72d69614c702?w=2000&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1511578314322-379afb476865?w=2000&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=2000&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=2000&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=2000&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=2000&auto=format&fit=crop&q=80"
            ].map((src, i) => (
              <div key={i} style={{position: 'relative', overflow: 'hidden'}}>
                <img 
                  src={src}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'grayscale(6%) contrast(1.03) saturate(0.96)'
                  }}
                />
                <div style={{
                  content: '""',
                  position: 'absolute',
                  inset: '0',
                  background: 'linear-gradient(0deg, rgba(16,35,53,.18), rgba(16,35,53,.18))'
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Numbers */}
        <section className="section" style={{background: '#EFF5FC'}}>
          <div className="page-container">
            <h2 className="h2">TLI Connect — The Digital Extension of TLI's Legacy</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: '24px',
              textAlign: 'center',
              marginTop: '40px'
            }}>
              <div>
                <div style={{
                  fontSize: '44px',
                  lineHeight: '52px',
                  fontWeight: '800',
                  color: '#2E6EB6',
                  letterSpacing: '-0.015em'
                }}>
                  Established<br/>1956
                </div>
                <p className="body-m">Taiwan's pioneer language institute.</p>
              </div>
              <div>
                <div style={{
                  fontSize: '44px',
                  lineHeight: '52px',
                  fontWeight: '800',
                  color: '#2E6EB6',
                  letterSpacing: '-0.015em'
                }}>
                  600k+<br/>Learners
                </div>
                <p className="body-m">Served across business, academia & NGOs.</p>
              </div>
              <div>
                <div style={{
                  fontSize: '44px',
                  lineHeight: '52px',
                  fontWeight: '800',
                  color: '#2E6EB6',
                  letterSpacing: '-0.015em'
                }}>
                  Global +<br/>Digital
                </div>
                <p className="body-m">On‑campus & online, same quality standard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="section" style={{background: 'linear-gradient(to bottom, #F6F9FE, #F2F6FB)'}}>
          <div className="page-container">
            <h2 className="h2">Why Do You Need a Cross‑Cultural Learning Community?</h2>
            <div style={{display: 'grid', gap: '24px', marginTop: '40px'}}>
              {[
                {
                  pain: "Training feels disconnected from work",
                  solution: "Scenario‑based courses mirror real presentations, meetings, emails and negotiations."
                },
                {
                  pain: "No practice arena or peer circle",
                  solution: "Monthly workshops & networking sessions provide live practice and high‑quality connections."
                },
                {
                  pain: "Missing the cultural lens",
                  solution: "Deep‑dive cultural cases decode unspoken rules so you avoid missteps and communicate confidently."
                }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                  border: '1px solid var(--divider)',
                  borderRadius: '24px',
                  background: '#FFFFFF',
                  padding: '28px'
                }}>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '12px',
                      letterSpacing: '.04em',
                      textTransform: 'uppercase',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      marginBottom: '12px',
                      border: '1px solid var(--blue-500)',
                      color: 'var(--blue-500)',
                      background: '#E9F2FF'
                    }}>
                      Pain
                    </span>
                    <h3 className="h3">{item.pain}</h3>
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '12px',
                      letterSpacing: '.04em',
                      textTransform: 'uppercase',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      marginBottom: '12px',
                      background: 'var(--gold)',
                      color: '#1E2328',
                      fontWeight: '800'
                    }}>
                      Solution
                    </span>
                    <p style={{margin: 0, color: 'var(--ink-dim)'}}>{item.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Topics */}
        <section className="section" style={{background: '#F7FAFE'}}>
          <div className="page-container">
            <h2 className="h2">Language, Culture & Business — All in One Membership</h2>
            <p style={{marginTop: '12px', color: '#7FA8D8', fontSize: '12px', lineHeight: '18px'}}>
              Membership term: 3‑month or 1‑year. Same benefits — choose your pace.
            </p>

            <h3 style={{
              fontSize: '18px',
              lineHeight: '28px',
              fontWeight: '700',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: '#2E6EB6',
              marginTop: '40px'
            }}>
              What you'll master
            </h3>
            
            <div style={{
              position: 'relative',
              padding: '64px 0',
              background: 'radial-gradient(circle at 50% 0%, rgba(46,110,182,.06), rgba(0,0,0,0) 60%)',
              marginTop: '16px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: '40px'
              }}>
                {[
                  {
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path stroke="#2E6EB6" d="M12 3C7.582 3 4 6.134 4 9.999c0 1.63.6 3.142 1.63 4.372l-.367 3.299 3.08-1.737C9.391 16.314 10.654 16.6 12 16.6c4.418 0 8-3.134 8-7.001C20 6.134 16.418 3 12 3Z" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path stroke="#2E6EB6" d="M15.5 7.75h-7M17 10.25H8.5" strokeWidth="1.6" strokeLinecap="round"/>
                        <path stroke="#2E6EB6" d="M6.5 21.5l4.2-1.2 6.8-6.8a1.6 1.6 0 0 0 0-2.263v0a1.6 1.6 0 0 0-2.263 0L8.437 18.037 6.5 21.5Z" strokeWidth="1.6" strokeLinejoin="round"/>
                      </svg>
                    ),
                    title: "Chinese Proficiency",
                    desc: "A0→B2 structured path: speak, write, present with ease."
                  },
                  {
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path stroke="#2E6EB6" d="M12 21c4.971 0 9-4.029 9-9s-4.029-9-9-9-9 4.029-9 9 4.029 9 9 9Z" strokeWidth="1.6"/>
                        <path stroke="#2E6EB6" d="M3.5 12h17M12 3.5c2.5 2.5 2.5 14.5 0 17M8 5c1.2 1.6 1.8 5.4 1.8 7s-.6 5.4-1.8 7" strokeWidth="1.6" strokeLinecap="round"/>
                        <path stroke="#2E6EB6" d="M21.5 18.5c-2.2 2.2-5.8 2.2-8 0 2.2-2.2 5.8-2.2 8 0Z" strokeWidth="1.6" strokeLinejoin="round"/>
                        <circle stroke="#2E6EB6" cx="17.5" cy="18.5" r="1.2" strokeWidth="1.6"/>
                      </svg>
                    ),
                    title: "Cultural Insight",
                    desc: "Business etiquette & local know‑how: read the subtext."
                  },
                  {
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path stroke="#2E6EB6" d="M3.5 20.5h17" strokeWidth="1.6" strokeLinecap="round"/>
                        <path stroke="#2E6EB6" d="M6 16l4-4 3 3 6-6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path stroke="#2E6EB6" d="M16.5 7.5H20v3.5" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    ),
                    title: "Business Firepower",
                    desc: "Presentations, negotiations, crisis emails: real‑world comms."
                  }
                ].map((topic, i) => (
                  <div key={i} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: '#FFFFFF',
                      border: '1px solid var(--divider)',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 6px 16px rgba(16,58,99,.06)'
                    }}>
                      {topic.icon}
                    </div>
                    <div style={{
                      fontSize: '24px',
                      lineHeight: '32px',
                      fontWeight: '700',
                      color: 'var(--ink)'
                    }}>
                      {topic.title}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      lineHeight: '26px',
                      color: 'var(--ink-dim)'
                    }}>
                      {topic.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h3 style={{
              fontSize: '18px',
              lineHeight: '28px',
              fontWeight: '700',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: '#2E6EB6',
              marginTop: '48px'
            }}>
              How you'll learn
            </h3>
            
            <div style={{
              position: 'relative',
              padding: '64px 0',
              background: 'radial-gradient(circle at 50% 0%, rgba(46,110,182,.06), rgba(0,0,0,0) 60%)',
              marginTop: '16px'
            }}>
              <div style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '560px minmax(0,1fr)',
                gap: '40px',
                alignItems: 'start'
              }}>
                <div style={{
                  position: 'relative',
                  borderRadius: '28px',
                  overflow: 'hidden',
                  border: '1px solid var(--divider)',
                  boxShadow: '0 18px 40px rgba(16,58,99,.10)',
                  aspectRatio: '1/1',
                  background: '#0B0C0D'
                }}>
                  <img 
                    src={currentImage}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      filter: 'grayscale(6%) contrast(1.02) saturate(0.98)',
                      transition: 'opacity 0.3s'
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {learnItems.map((item, i) => (
                    <div key={i} style={{
                      paddingBottom: '14px',
                      borderBottom: i === learnItems.length - 1 ? 'none' : '1px solid rgba(16,35,53,.12)'
                    }}>
                      <button
                        onClick={() => {
                          setActiveLearnItem(i);
                          setCurrentImage(item.image);
                        }}
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          display: 'block',
                          width: '100%'
                        }}
                      >
                        <h3 style={{
                          fontSize: '18px',
                          lineHeight: '26px',
                          fontWeight: '800',
                          margin: '0 0 6px',
                          color: activeLearnItem === i ? '#2E6EB6' : 'var(--ink)'
                        }}>
                          {item.title}
                        </h3>
                        <p style={{
                          margin: '0 0 6px',
                          color: 'var(--ink-dim)',
                          fontSize: '14px',
                          lineHeight: '22px'
                        }}>
                          {item.description}
                        </p>
                        <span style={{
                          display: 'inline-block',
                          border: `1px solid ${activeLearnItem === i ? '#2E6EB6' : 'var(--divider)'}`,
                          borderRadius: '999px',
                          padding: '5px 10px',
                          fontSize: '11px',
                          color: activeLearnItem === i ? '#2E6EB6' : '#5B6D7E',
                          background: activeLearnItem === i ? '#E9F2FF' : '#FFFFFF'
                        }}>
                          {item.badge}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Redirect */}
        <section style={{
          background: 'linear-gradient(90deg, #F7FAFE, #FFFFFF)',
          color: 'var(--ink)',
          borderTop: '1px solid var(--divider)',
          borderBottom: '1px solid var(--divider)',
          position: 'relative'
        }}>
          <div style={{
            content: '""',
            position: 'absolute',
            inset: '0',
            background: 'radial-gradient(90% 140% at 0% 50%, rgba(46,110,182,.15), rgba(255,255,255,0) 55%), radial-gradient(90% 140% at 100% 50%, rgba(242,193,78,.12), rgba(255,255,255,0) 55%)',
            pointerEvents: 'none'
          }} />
          <div className="page-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            padding: '40px 24px'
          }}>
            <div>
              <h3 style={{
                margin: '0',
                fontWeight: '800',
                letterSpacing: '-.01em',
                fontSize: '28px',
                lineHeight: '34px'
              }}>
                Looking for a team solution?
              </h3>
              <p style={{
                margin: '6px 0 0',
                color: '#49647B'
              }}>
                Custom training, reporting, and admin tools for teams.
              </p>
            </div>
            <a
              href="#"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 28px',
                borderRadius: '999px',
                background: 'var(--gold)',
                color: '#1E2328',
                fontWeight: '800',
                boxShadow: '0 10px 30px rgba(242,193,78,.20)',
                border: 'none',
                textDecoration: 'none'
              }}
            >
              <span>Visit our corporate page</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="#1E2328" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </section>

        {/* Footer with Form */}
        <footer className="section" style={{background: 'linear-gradient(to top,#EDF3FA,#F7FAFE)', borderTop: '1px solid var(--divider)'}}>
          <div className="page-container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) 600px',
              gap: '48px',
              alignItems: 'flex-start'
            }}>
              <div>
                <h2 className="h2" style={{marginBottom: '16px'}}>Ready to Join TLI Connect?</h2>
                <p className="body-m" style={{margin: '0'}}>Leave your info and we'll send you full plan details within one business day.</p>
              </div>
              
              <div style={{
                background: 'var(--paper)',
                border: '1px solid var(--divider)',
                borderRadius: 'var(--r32)',
                boxShadow: '0 10px 30px rgba(16,58,99,.06)',
                padding: '32px'
              }}>
                <form onSubmit={handleSubmit('footer', footerForm)}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '16px'}}>
                    <div>
                      <label className="label">Name<span style={{color: 'var(--gold)'}}>*</span></label>
                      <input
                        type="text"
                        placeholder="Your name"
                        required
                        value={footerForm.name}
                        onChange={(e) => setFooterForm({...footerForm, name: e.target.value})}
                        style={{
                          height: '52px',
                          border: '1px solid var(--divider)',
                          borderRadius: '16px',
                          padding: '0 16px',
                          fontSize: '16px',
                          color: 'var(--ink)',
                          background: '#FFFFFF',
                          outline: 'none',
                          width: '100%'
                        }}
                      />
                      {errors.footer?.name && <div style={{display: 'block', color: 'var(--error)', fontSize: '12px', marginTop: '6px'}}>{errors.footer.name}</div>}
                    </div>
                    <div>
                      <label className="label">Email<span style={{color: 'var(--gold)'}}>*</span></label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={footerForm.email}
                        onChange={(e) => setFooterForm({...footerForm, email: e.target.value})}
                        style={{
                          height: '52px',
                          border: '1px solid var(--divider)',
                          borderRadius: '16px',
                          padding: '0 16px',
                          fontSize: '16px',
                          color: 'var(--ink)',
                          background: '#FFFFFF',
                          outline: 'none',
                          width: '100%'
                        }}
                      />
                      {errors.footer?.email && <div style={{display: 'block', color: 'var(--error)', fontSize: '12px', marginTop: '6px'}}>{errors.footer.email}</div>}
                    </div>
                    <div>
                      <label className="label">Phone <span style={{fontSize: '12px', lineHeight: '18px', color: 'var(--ink-dim)'}}>(optional)</span></label>
                      <input
                        type="tel"
                        placeholder="+886 912 345 678"
                        value={footerForm.phone}
                        onChange={(e) => setFooterForm({...footerForm, phone: e.target.value})}
                        style={{
                          height: '52px',
                          border: '1px solid var(--divider)',
                          borderRadius: '16px',
                          padding: '0 16px',
                          fontSize: '16px',
                          color: 'var(--ink)',
                          background: '#FFFFFF',
                          outline: 'none',
                          width: '100%'
                        }}
                      />
                      {errors.footer?.phone && <div style={{display: 'block', color: 'var(--error)', fontSize: '12px', marginTop: '6px'}}>{errors.footer.phone}</div>}
                    </div>
                    <button
                      type="submit"
                      style={{
                        height: '56px',
                        border: 'none',
                        borderRadius: '999px',
                        background: 'var(--gold)',
                        color: '#1E2328',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 10px 24px rgba(242,193,78,.22)'
                      }}
                    >
                      Talk to Us
                    </button>
                    <div style={{fontSize: '12px', lineHeight: '18px', color: 'var(--ink-dim)'}}>
                      We'll get back to you within 1–2 business days. Your information is kept strictly confidential.
                    </div>
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
                  </div>
                </form>
              </div>
            </div>
            
            <div style={{textAlign: 'center', maxWidth: 'var(--container)', padding: '0', marginTop: '48px'}}>
              <div className="body-m" style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '10px',
                color: '#5F7180',
                textAlign: 'center'
              }}>
                <span>TLI Taipei Language Institute</span><span>|</span><a href="mailto:contact@tli1956.com" style={{color: '#1E60A9'}}>contact@tli1956.com</a>
              </div>
              <div className="body-m" style={{marginBottom: '24px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap'}}>
                <a href="#" style={{color: '#1E60A9'}}>Privacy Policy</a><span>|</span><a href="#" style={{color: '#1E60A9'}}>Terms of Use</a>
              </div>
              <div className="body-m" style={{marginBottom: '8px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap'}}>
                <a href="#" style={{color: '#1E60A9'}}>LinkedIn</a>
                <a href="#" style={{color: '#1E60A9'}}>YouTube</a>
                <a href="#" style={{color: '#1E60A9'}}>Instagram</a>
                <a href="#" style={{color: '#1E60A9'}}>Facebook</a>
              </div>
              <div style={{fontSize: '0.875rem', color: '#64798A'}}>© TLI Taipei Language Institute. All rights reserved.</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
