"use client";

import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="min-h-[85vh] flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle, #F26522 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 text-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Currently building in public
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Software with<br />
            <span className="gradient-text">personality.</span>
          </h1>
          
          <p className="text-white/60 text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed">
            We build thoughtful software for people who care deeply about what they do.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#products"
              className="gradient-bg text-white px-8 py-4 rounded-full font-semibold hover:opacity-90 transition text-lg shadow-lg">
              See Our Products
            </Link>
            <Link href="#about"
              className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition text-lg">
              About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-24" style={{ background: "var(--color-cream)" }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-orange)" }}>Our Products</p>
            <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--color-dark)" }}>Built with purpose.</h2>
            <p style={{ color: "var(--color-slate)" }} className="text-lg max-w-xl mx-auto">
              Each product we build solves a real problem for a specific community. No fluff, no bloat.
            </p>
          </div>

          {/* StitchLogic card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-black/5">
            <div className="h-2 gradient-bg" />
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-white text-2xl">🧵</div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: "var(--color-dark)" }}>StitchLogic</h3>
                      <p className="text-sm font-medium" style={{ color: "var(--color-orange)" }}>iOS App · Active Development</p>
                    </div>
                  </div>
                  
                  <p className="text-lg mb-6" style={{ color: "var(--color-slate)" }}>
                    The most complete quilting toolkit on iOS. Visualize patterns with your actual fabrics, 
                    manage your stash, and get instant answers from an AI quilt coach — all in one app.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                    {["100+ Quilt Patterns", "12 Calculators", "AI Quilt Coach", "Fabric Visualizer", "Stash Manager", "Community"].map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-slate)" }}>
                        <span style={{ color: "var(--color-orange)" }} className="font-bold">✓</span>
                        {f}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href="https://stitchlogic.app" target="_blank" rel="noopener noreferrer"
                      className="gradient-bg text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition shadow-md">
                      Visit StitchLogic →
                    </Link>
                    <Link href="https://stitchlogic.app/pro" target="_blank" rel="noopener noreferrer"
                      className="border-2 px-6 py-3 rounded-full font-semibold hover:bg-orange-50 transition text-sm"
                      style={{ borderColor: "var(--color-orange)", color: "var(--color-orange)" }}>
                      Go Pro
                    </Link>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-shrink-0 w-full md:w-56">
                  <div className="rounded-2xl p-6 text-center" style={{ background: "var(--color-cream)" }}>
                    <p className="text-4xl font-bold gradient-text mb-1">100+</p>
                    <p className="text-sm" style={{ color: "var(--color-slate)" }}>Quilt Patterns</p>
                  </div>
                  <div className="rounded-2xl p-6 text-center mt-3" style={{ background: "var(--color-cream)" }}>
                    <p className="text-4xl font-bold gradient-text mb-1">12</p>
                    <p className="text-sm" style={{ color: "var(--color-slate)" }}>Calculators</p>
                  </div>
                  <div className="rounded-2xl p-6 text-center mt-3" style={{ background: "var(--color-cream)" }}>
                    <p className="text-4xl font-bold gradient-text mb-1">iOS</p>
                    <p className="text-sm" style={{ color: "var(--color-slate)" }}>iPhone + iPad</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Future products teaser */}
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {["Eyecare Practice Tools", "Coming Soon"].map((name, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-black/5 border-dashed opacity-50">
                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-xl"
                  style={{ background: "var(--color-cream)" }}>
                  {i === 0 ? "👁️" : "🚀"}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "var(--color-dark)" }}>{name}</h3>
                <p className="text-sm" style={{ color: "var(--color-slate)" }}>In exploration. More coming from RaT Studios.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-orange)" }}>About RaT Studios</p>
              <h2 className="text-4xl font-bold mb-6" style={{ color: "var(--color-dark)" }}>
                Richard and Topher.<br />
                <span className="gradient-text">RaT Studios.</span>
              </h2>
              <p className="text-lg mb-4" style={{ color: "var(--color-slate)" }}>
                RaT Studios is a product studio founded by Richard Ashcraft and Topher Sorenson — 
                an optometrist and a technologist who kept having the same conversation: 
                <em> "why doesn't software exist for this?"</em>
              </p>
              <p className="mb-4" style={{ color: "var(--color-slate)" }}>
                We build niche software for communities that are underserved by big tech. 
                People who care deeply about their craft deserve tools built with the same care.
              </p>
              <p style={{ color: "var(--color-slate)" }}>
                Based in the western US. Incorporated in Wyoming.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: "🎯", title: "Niche-first", desc: "We go deep on one community before moving to the next. StitchLogic exists because quilters deserved better tools." },
                { icon: "🔨", title: "Always building", desc: "We ship fast, listen to users, and iterate. No vaporware." },
                { icon: "🤝", title: "Fair business", desc: "Transparent pricing, no dark patterns, no selling your data." },
              ].map((v) => (
                <div key={v.title} className="flex gap-4 p-5 rounded-2xl" style={{ background: "var(--color-cream)" }}>
                  <span className="text-2xl flex-shrink-0">{v.icon}</span>
                  <div>
                    <p className="font-bold mb-1" style={{ color: "var(--color-dark)" }}>{v.title}</p>
                    <p className="text-sm" style={{ color: "var(--color-slate)" }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24" style={{ background: "var(--color-cream)" }}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-orange)" }}>Get In Touch</p>
          <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--color-dark)" }}>Let's talk.</h2>
          <p className="text-lg mb-10" style={{ color: "var(--color-slate)" }}>
            Questions about our products, partnership inquiries, or just want to say hello.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: "📧", label: "General", value: "hello@ratstudios.ai", href: "mailto:hello@ratstudios.ai" },
              { icon: "🧵", label: "StitchLogic Support", value: "support@stitchlogic.app", href: "mailto:support@stitchlogic.app" },
              { icon: "💼", label: "Business", value: "biz@ratstudios.ai", href: "mailto:biz@ratstudios.ai" },
            ].map((c) => (
              <a key={c.label} href={c.href}
                className="bg-white rounded-2xl p-6 border border-black/5 hover:shadow-md hover:border-orange-200 transition group">
                <p className="text-3xl mb-3">{c.icon}</p>
                <p className="font-bold text-sm mb-1" style={{ color: "var(--color-dark)" }}>{c.label}</p>
                <p className="text-xs" style={{ color: "var(--color-orange)" }}>{c.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)" }}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-5xl mb-6">🧵</p>
          <h2 className="text-3xl font-bold text-white mb-4">Start with StitchLogic</h2>
          <p className="text-white/60 text-lg mb-8">
            Our first product. 10 free patterns, 12 calculators, AI Quilt Coach.
          </p>
          <Link href="https://stitchlogic.app" target="_blank" rel="noopener noreferrer"
            className="inline-block gradient-bg text-white px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 transition shadow-xl">
            Visit StitchLogic →
          </Link>
        </div>
      </section>
    </>
  );
}
