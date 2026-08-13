import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, ChevronDown, Sparkles, Star, Zap, Shield } from "lucide-react";
import { AmbientBackground, ParticleField } from "../components/ui/AmbientBackground";
import { RevealOnScroll } from "../components/ui/RevealOnScroll";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";
import { FutureMealScore } from "../components/ui/FutureMealScore";
import { useAuth } from "../context/AuthContext";
import { DEMO_CREDENTIALS, CUISINE_CATEGORIES } from "../utils/seedData";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1600",
  "https://images.unsplash.com/photo-1563379091339-03246963d96b?w=1600",
  "https://images.unsplash.com/photo-1630383249896-42f06efd1494?w=1600",
];

function useEntrance() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [100,400,700,1000,1300].map((ms,i) => setTimeout(()=>setPhase(i+1),ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  return phase;
}

function useIntentCycle() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const iv = setInterval(()=>setStep(s=>(s+1)%4), 2200);
    return () => clearInterval(iv);
  }, []);
  return step;
}

function tr(show: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0) scale(1)" : "translateY(28px) scale(0.97)",
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  };
}
function sc(show: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: show ? 1 : 0,
    transform: show ? "scale(1)" : "scale(0.88)",
    transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  };
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const phase = useEntrance();
  const intentStep = useIntentCycle();
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(()=>setImgIdx(i=>(i+1)%HERO_IMAGES.length), 6000);
    return () => clearInterval(iv);
  }, []);

  const intentData = [
    { label:"WHEN",    value:"Friday, 7:30 PM" },
    { label:"CRAVING", value:"Spicy Biryani"   },
    { label:"BUDGET",  value:"Under ₹250"  },
    { label:"WHERE",   value:"Hyderabad"        },
  ];

  return (
    <div style={{ background:"#0e0c0a", color:"#f9f6ef", overflowX:"hidden" }}>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ minHeight:"100svh" }}>
        {HERO_IMAGES.map((src,i)=>(
          <div key={src} className="absolute inset-0 transition-opacity duration-[2000ms]" style={{ opacity:imgIdx===i?1:0 }}>
            <img src={src} alt="" aria-hidden className="w-full h-full object-cover" style={{ filter:"brightness(0.2) saturate(0.7)" }} />
          </div>
        ))}
        <div className="absolute inset-0" style={{ background:"linear-gradient(105deg,rgba(14,12,10,0.97) 0%,rgba(14,12,10,0.7) 55%,rgba(14,12,10,0.4) 100%)" }} />
        <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(14,12,10,1) 0%,transparent 45%)" }} />
        <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse 70% 60% at 20% 50%,rgba(232,137,42,0.07) 0%,transparent 70%)" }} />
        <AmbientBackground variant="hero" />
        <ParticleField count={22} />
        <div className="noise-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-center" style={{ minHeight:"100svh", paddingTop:"6rem", paddingBottom:"4rem" }}>
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* LEFT */}
            <div>
              <div style={tr(phase>=1,0)}>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-label mb-6" style={{ background:"rgba(232,137,42,0.1)", border:"1px solid rgba(232,137,42,0.2)", color:"#e8892a" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-glow-pulse" style={{ background:"#e8892a" }} />
                  INTELLIGENT MEAL PLANNING
                </span>
              </div>

              <h1 style={{ fontFamily:'"Playfair Display",serif', lineHeight:0.95, letterSpacing:"-0.04em", fontWeight:700 }}>
                <span className="block" style={{ fontSize:"clamp(3rem,7vw,6.5rem)", color:"#f3ede0", ...tr(phase>=1,0) }}>Your future</span>
                <span className="block" style={{ fontSize:"clamp(3rem,7vw,6.5rem)", ...tr(phase>=2,0) }}>
                  <em style={{ color:"#e8892a", fontStyle:"italic" }}>self</em>{" "}
                  <span style={{ color:"#f3ede0" }}>already</span>
                </span>
                <span className="block" style={{ fontSize:"clamp(3rem,7vw,6.5rem)", color:"#f3ede0", ...tr(phase>=2,80) }}>knows what</span>
                <span className="block" style={{ fontSize:"clamp(3rem,7vw,6.5rem)", color:"#f3ede0", ...tr(phase>=3,0) }}>it wants.</span>
              </h1>

              <p style={{ ...tr(phase>=3,100), color:"#7a7165", fontSize:"1.0625rem", lineHeight:1.75, maxWidth:460, fontFamily:'"DM Sans",sans-serif', marginTop:"1.75rem" }}>
                Plan a meal for any future moment. FutureMeal watches restaurants,
                prices and timing&mdash;then presents the perfect match exactly when you need it.
              </p>

              <div className="flex flex-wrap gap-4 mt-10" style={tr(phase>=4,0)}>
                <Link to="/future-meals/new" className="btn-ember" style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", fontSize:"0.9375rem", padding:"0.875rem 1.75rem" }}>
                  <Clock className="w-4 h-4" /> Plan a FutureMeal
                </Link>
                <Link to="/restaurants" className="btn-ghost-ember" style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", fontSize:"0.9375rem", padding:"0.875rem 1.75rem" }}>
                  Explore Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex gap-10 mt-14" style={tr(phase>=5,0)}>
                {[{val:500,suffix:"+",label:"Restaurants",dec:0},{val:30,suffix:" min",label:"Avg delivery",dec:0},{val:4.5,suffix:"★",label:"User rating",dec:1}].map(s=>(
                  <div key={s.label}>
                    <div style={{ fontFamily:'"Playfair Display",serif', fontSize:"1.875rem", fontWeight:700, color:"#e8892a", lineHeight:1 }}>
                      <AnimatedCounter target={s.val} suffix={s.suffix} decimals={s.dec} />
                    </div>
                    <div className="text-label mt-1" style={{ color:"#4f4840" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT panel */}
            <div className="hidden lg:block" style={sc(phase>=4,200)}>
              <div className="relative rounded-2xl p-7 mb-5" style={{ background:"rgba(20,18,16,0.9)", backdropFilter:"blur(32px)", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 0 0 1px rgba(232,137,42,0.1),0 40px 80px rgba(0,0,0,0.6)" }}>
                <div className="noise-overlay" style={{ borderRadius:"inherit", opacity:0.03 }} />
                <div className="flex items-center justify-between mb-6">
                  <span className="text-label" style={{ color:"#e8892a" }}>FUTUREMEAL INTENT</span>
                  <span className="flex items-center gap-1.5 text-label" style={{ color:"#4f4840" }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-glow-pulse" style={{ background:"#e8892a" }} />
                    WATCHING
                  </span>
                </div>
                <div className="space-y-3 mb-6">
                  {intentData.map((row,i)=>(
                    <div key={row.label} className="flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-500"
                      style={{ background:intentStep===i?"rgba(232,137,42,0.08)":"rgba(255,255,255,0.02)", border:`1px solid ${intentStep===i?"rgba(232,137,42,0.2)":"rgba(255,255,255,0.04)"}`, transform:intentStep===i?"translateX(3px)":"translateX(0)" }}
                    >
                      <span className="text-label" style={{ color:intentStep===i?"#e8892a":"#4f4840" }}>{row.label}</span>
                      <span style={{ fontFamily:'"Playfair Display",serif', fontSize:"1rem", color:intentStep===i?"#f3ede0":"#3c3630", transition:"color 0.5s" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-4" style={{ background:"rgba(232,137,42,0.05)", border:"1px solid rgba(232,137,42,0.15)" }}>
                  <div className="text-label mb-3" style={{ color:"#625a50" }}>BEST MATCH PREVIEW</div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1563379091339-03246963d96b?w=100" alt="Biryani" className="w-full h-full object-cover" style={{ filter:"brightness(0.85)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontFamily:'"Playfair Display",serif', color:"#f3ede0", fontWeight:600, fontSize:"0.9375rem" }}>Chicken Dum Biryani</div>
                      <div className="text-label mt-0.5" style={{ color:"#625a50" }}>Spice Route &middot; ₹229 &middot; 28 min</div>
                    </div>
                    <FutureMealScore score={92} size={52} animated />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <Link to="/future-meals/new" className="btn-ember flex-1 justify-center" style={{ padding:"0.75rem", fontSize:"0.875rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
                    <Clock className="w-3.5 h-3.5" /> Plan This Meal
                  </Link>
                  <Link to="/restaurants" className="btn-surface" style={{ padding:"0.75rem 1.25rem", fontSize:"0.875rem", display:"flex", alignItems:"center" }}>Explore</Link>
                </div>
              </div>
              <div className="rounded-xl p-5 flex items-center gap-5" style={{ background:"rgba(14,12,10,0.6)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.05)" }}>
                <FutureMealScore score={92} size={80} showFactors animated />
                <div>
                  <div style={{ fontFamily:'"Playfair Display",serif', fontSize:"1.25rem", color:"#f3ede0", fontWeight:600 }}>92% Match</div>
                  <p className="text-label mt-1" style={{ color:"#625a50", lineHeight:1.6 }}>Budget ✓ &nbsp; Taste ✓ &nbsp; Rating ✓<br/>Delivery ✓ &nbsp; Availability ✓</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float" style={tr(phase>=5,200)}>
            <span className="text-label" style={{ color:"#3c3630", fontSize:"0.6rem" }}>DISCOVER</span>
            <ChevronDown className="w-4 h-4" style={{ color:"#3c3630" }} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-32 overflow-hidden">
        <AmbientBackground variant="subtle" />
        <div className="noise-overlay" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
          <RevealOnScroll>
            <div className="text-center mb-20">
              <div className="text-label mb-4" style={{ color:"#e8892a" }}>THE FUTUREMEAL DIFFERENCE</div>
              <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:"clamp(2rem,5vw,4rem)", color:"#f3ede0", fontWeight:600, lineHeight:1.05, letterSpacing:"-0.03em" }}>
                Not ordering.<br /><em style={{ color:"#e8892a", fontStyle:"italic" }}>Intending.</em>
              </h2>
            </div>
          </RevealOnScroll>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px hidden lg:block" style={{ background:"linear-gradient(to bottom,transparent,rgba(232,137,42,0.15),transparent)", transform:"translateX(-50%)" }} />
            {[
              { time:"TODAY",        icon:"🎯", title:"You describe a craving",   body:'"I want spicy biryani on Friday evening, under ₹250."',                                                 side:"left" },
              { time:"IMMEDIATELY",  icon:"🧠", title:"Intention saved",            body:"FutureMeal creates a plan. Status: Watching for the perfect match.",                                         side:"right" },
              { time:"LEADING UP",   icon:"⚡",       title:"Conditions evaluated",       body:"6 factors scored in real-time: budget, distance, ratings, availability, delivery time, preferences.",        side:"left", score:72 },
              { time:"30 MIN BEFORE",icon:"✶",       title:"92% Match Found",            body:"Chicken Biryani · Spice Route · ₹229 · 28 min · 4.6★",                       side:"right", score:92 },
              { time:"YOUR MOMENT",  icon:"🍛", title:"One tap to order",          body:"Exactly when you planned. Exactly what you wanted. Your future self is satisfied.",                          side:"left" },
            ].map((step,i)=>(
              <RevealOnScroll key={i} delay={i*80}>
                <div className={`relative mb-16 lg:mb-20 flex ${step.side==="right"?"lg:flex-row-reverse":"lg:flex-row"} items-center gap-8`}>
                  <div className={`flex-1 ${step.side==="right"?"lg:text-right":""}`}>
                    <div className="text-label mb-2" style={{ color:"#625a50" }}>{step.time}</div>
                    <h3 style={{ fontFamily:'"Playfair Display",serif', fontSize:"1.4rem", color:"#f3ede0", fontWeight:600, marginBottom:"0.625rem" }}>{step.title}</h3>
                    <p style={{ color:"#7a7165", fontFamily:'"DM Sans",sans-serif', lineHeight:1.7, fontSize:"0.9375rem" }}>{step.body}</p>
                  </div>
                  <div className="relative flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-xl" style={{ background:"rgba(232,137,42,0.1)", border:"1px solid rgba(232,137,42,0.2)", boxShadow:(step as any).score?"0 0 30px rgba(232,137,42,0.25)":"none", zIndex:2 }}>
                    {step.icon}
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    {(step as any).score ? <FutureMealScore score={(step as any).score} size={96} showFactors /> : <div style={{ height:96 }} />}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CUISINES */}
      <section className="relative py-28 overflow-hidden" style={{ background:"#141210" }}>
        <AmbientBackground variant="warm" />
        <div className="noise-overlay" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <RevealOnScroll>
            <div className="flex items-end justify-between mb-14">
              <div>
                <div className="text-label mb-3" style={{ color:"#e8892a" }}>INDIAN CUISINE</div>
                <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:"clamp(2rem,4vw,3.5rem)", color:"#f3ede0", fontWeight:600, lineHeight:1.1 }}>Explore your<br />possibilities.</h2>
              </div>
              <Link to="/restaurants" className="hidden md:flex items-center gap-1.5 transition-colors text-sm" style={{ color:"#625a50", fontFamily:'"DM Sans",sans-serif' }}
                onMouseEnter={e=>(e.currentTarget.style.color="#e8892a")} onMouseLeave={e=>(e.currentTarget.style.color="#625a50")}>
                All cuisines <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CUISINE_CATEGORIES.map((c,i)=>(
              <RevealOnScroll key={c.id} delay={i*35}>
                <Link to={`/restaurants?cuisine=${c.id}`} className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-300"
                  style={{ border:"1px solid rgba(255,255,255,0.04)", background:"rgba(255,255,255,0.02)" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor="rgba(232,137,42,0.25)"; (e.currentTarget as HTMLElement).style.background="rgba(232,137,42,0.07)"; (e.currentTarget as HTMLElement).style.transform="translateY(-5px)"; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.02)"; (e.currentTarget as HTMLElement).style.transform="translateY(0)"; }}>
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="text-center" style={{ color:"#625a50", fontSize:"0.68rem", letterSpacing:"0.05em", fontFamily:'"DM Sans",sans-serif', lineHeight:1.3 }}>{c.name}</span>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* RESTAURANTS */}
      <section className="relative py-28 overflow-hidden">
        <AmbientBackground variant="subtle" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <RevealOnScroll>
            <div className="mb-14">
              <div className="text-label mb-3" style={{ color:"#e8892a" }}>CURATED FOR YOU</div>
              <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:"clamp(2rem,4vw,3.5rem)", color:"#f3ede0", fontWeight:600, lineHeight:1.1 }}>Where great<br />meals begin.</h2>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name:"Spice Route Biryani",     tag:"Hyderabadi · Biryani",    rating:4.6, img:"https://images.unsplash.com/photo-1563379091339-03246963d96b?w=600", price:"₹229", id:1 },
              { name:"Annapoorna South Indian", tag:"South Indian · Pure Veg", rating:4.4, img:"https://images.unsplash.com/photo-1630383249896-42f06efd1494?w=600", price:"₹89",  id:2 },
              { name:"Punjabi Tadka",           tag:"North Indian · Mughlai",  rating:4.3, img:"https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600", price:"₹249", id:3 },
              { name:"Chaat Corner",            tag:"Street Food · Snacks",    rating:4.5, img:"https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600", price:"₹59",  id:4 },
            ].map((r,i)=>(
              <RevealOnScroll key={r.id} delay={i*80}>
                <Link to={`/restaurants/${r.id}`} className="block group">
                  <div className="relative overflow-hidden rounded-xl mb-4 transition-all duration-500"
                    style={{ height:"14rem", border:"1px solid rgba(255,255,255,0.05)" }}
                    onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor="rgba(232,137,42,0.2)"; (e.currentTarget as HTMLElement).style.boxShadow="0 20px 40px rgba(0,0,0,0.4)"; }}
                    onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.boxShadow="none"; }}>
                    <img src={r.img} alt={r.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ filter:"brightness(0.6) saturate(0.85)" }}
                      onError={e=>{(e.target as HTMLImageElement).src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";}} loading="lazy" />
                    <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(14,12,10,0.95) 0%,rgba(14,12,10,0.2) 55%,transparent 100%)" }} />
                    <div className="absolute top-3 right-3 chip chip-ember" style={{ fontSize:"0.7rem" }}><Star className="w-3 h-3 fill-current inline mr-0.5" />{r.rating}</div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div style={{ fontFamily:'"Playfair Display",serif', color:"#f3ede0", fontSize:"1rem", fontWeight:600, marginBottom:"0.25rem" }}>{r.name}</div>
                      <div className="text-label" style={{ color:"#625a50" }}>{r.tag}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span style={{ color:"#7a7165", fontSize:"0.8rem", fontFamily:'"DM Sans",sans-serif' }}>From {r.price}</span>
                    <span className="text-label transition-colors" style={{ color:"#4f4840" }}
                      onMouseEnter={e=>(e.currentTarget.style.color="#e8892a")} onMouseLeave={e=>(e.currentTarget.style.color="#4f4840")}>VIEW →</span>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
          <RevealOnScroll className="mt-12 text-center">
            <Link to="/restaurants" className="btn-ghost-ember" style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem" }}>
              See all restaurants <ArrowRight className="w-4 h-4" />
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="relative py-28 overflow-hidden" style={{ background:"#141210" }}>
        <AmbientBackground variant="warm" />
        <div className="noise-overlay" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
          <RevealOnScroll className="text-center mb-16">
            <div className="text-label mb-4" style={{ color:"#e8892a" }}>WHY FUTUREMEAL</div>
            <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:"clamp(2rem,4vw,3.5rem)", color:"#f3ede0", fontWeight:600, lineHeight:1.1 }}>
              Food + Time + <em style={{ color:"#e8892a", fontStyle:"italic" }}>Intention.</em>
            </h2>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { Icon:Clock,   ic:"#e8892a", title:"Plan ahead, eat better",  body:"Schedule meals around your life. Post-meeting lunches, post-gym dinners, study-night cravings. Stop deciding when you’re hungry." },
              { Icon:Zap,     ic:"#e8a820", title:"Intelligent matching",     body:"6-factor scoring engine evaluates every option across budget, distance, rating, and your personal preferences." },
              { Icon:Shield,  ic:"#4db87a", title:"Genuine Indian food",     body:"Hyderabadi dum biryani. Kerala fish curry. Delhi chaat. Andhra meals. FutureMeal curates authentic regional Indian cuisine." },
            ].map((f,i)=>(
              <RevealOnScroll key={f.title} delay={i*100}>
                <div className="p-7 rounded-xl h-full transition-all duration-300" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor="rgba(232,137,42,0.15)"; (e.currentTarget as HTMLElement).style.background="rgba(232,137,42,0.04)"; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.02)"; }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <f.Icon className="w-6 h-6" style={{ color:f.ic }} />
                  </div>
                  <h3 style={{ fontFamily:'"Playfair Display",serif', fontSize:"1.15rem", color:"#e9e0cc", fontWeight:600, marginBottom:"0.625rem" }}>{f.title}</h3>
                  <p style={{ color:"#625a50", fontFamily:'"DM Sans",sans-serif', lineHeight:1.75, fontSize:"0.9rem" }}>{f.body}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-36 overflow-hidden">
        <AmbientBackground variant="hero" />
        <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse 80% 60% at 50% 100%,rgba(232,137,42,0.07),transparent)" }} />
        <div className="noise-overlay" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <RevealOnScroll>
            <div className="text-5xl mb-8">🍛</div>
            <h2 style={{ fontFamily:'"Playfair Display",serif', fontSize:"clamp(2rem,5vw,3.75rem)", color:"#f3ede0", fontWeight:600, lineHeight:1.05, marginBottom:"1.5rem" }}>
              Ready to meet your<br /><em style={{ color:"#e8892a", fontStyle:"italic" }}>future meal?</em>
            </h2>
            <p style={{ color:"#625a50", fontFamily:'"DM Sans",sans-serif', fontSize:"1rem", marginBottom:"2.5rem", lineHeight:1.75 }}>
              Join thousands of food lovers across India planning smarter.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={isAuthenticated?"/future-meals/new":"/register"} className="btn-ember" style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", padding:"0.875rem 2rem" }}>
                <Sparkles className="w-4 h-4" />{isAuthenticated?"Plan a FutureMeal":"Get Started Free"}
              </Link>
              <Link to="/restaurants" className="btn-surface" style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", padding:"0.875rem 2rem" }}>Explore Restaurants</Link>
            </div>
            <p style={{ color:"#2e2820", marginTop:"2.5rem", fontSize:"0.8rem", fontFamily:'"DM Mono",monospace' }}>
              Demo: {DEMO_CREDENTIALS.customer.email} / {DEMO_CREDENTIALS.customer.password}
            </p>
          </RevealOnScroll>
        </div>
      </section>

    </div>
  );
}
