import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import ThreeScene from './ThreeScene';
import '../style/HomePage.css';
import nigeriaFlag from '../assets/Nigeria.png';
import spoonLogo from '../assets/spoon.jpg'; // logo image

const HomePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Attempt autoplay
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.3;
      audio.loop = true;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        console.log('Autoplay blocked – waiting for user interaction');
      });
    }
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log('Playback error:', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Intersection Observer for Trust cards
  const trustRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );
    trustRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">
      {/* ===== BACKGROUND ANIMATED SPOON (watermark) ===== */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-5 dark:opacity-10"
        style={{ animation: 'floatSpoon 12s ease-in-out infinite' }}
      >
        <img 
          src={spoonLogo} 
          alt="Spoon" 
          className="w-96 h-96 object-contain transform rotate-12"
          style={{ filter: 'grayscale(1) brightness(2)' }}
        />
      </div>

      {/* ===== CONTENT (relative z-1) ===== */}
      <div className="relative z-10">
        {/* ===== NAVBAR ===== */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight font-fraunces">
                <img src={spoonLogo} alt="Spoon" className="w-8 h-8 rounded-full object-cover" />
                <span className="text-orange">SILVER SPOON</span>
              </Link>

              <nav className="hidden md:flex items-center gap-8 font-fraunces">
                <a href="#home" className="hover:text-orange transition">Home</a>
                <a href="#about" className="hover:text-orange transition">About</a>
                <a href="#services" className="hover:text-orange transition">Services</a>
                <a href="#plans" className="hover:text-orange transition">Plans</a>
                <a href="#contact" className="hover:text-orange transition">Contact</a>
              </nav>

              <div className="flex items-center gap-4">
                {/* Sound toggle */}
                <button
                  onClick={toggleAudio}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-lg"
                  aria-label={isPlaying ? 'Mute music' : 'Play music'}
                >
                  {isPlaying ? '🔊' : '🔇'}
                </button>

                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>

                <Link to="/login" className="hidden sm:inline-block px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">Sign In</Link>
                <Link to="/register" className="hidden sm:inline-block px-4 py-2 text-sm font-medium bg-orange text-white rounded hover:bg-orange-dark transition">Register</Link>
              </div>
            </div>
          </div>
        </header>

        {/* ===== AUDIO ELEMENT ===== */}
        <audio ref={audioRef} src="/audio/background.mp3" preload="auto" />

        {/* ===== HERO ===== */}
        <section id="home" className="pt-12 pb-16 px-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight font-fraunces">
                Invest Smart with Artificial Intelligent in <span className="text-orange">SILVER-SPOON</span>
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
                Grow your wealth with trusted, secure, and high‑performing investment plans designed for your future.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="px-8 py-3 bg-orange text-white font-semibold rounded hover:bg-orange-dark transition text-center">Get Started</Link>
                <a href="#plans" className="px-8 py-3 border border-gray-300 dark:border-gray-600 font-semibold rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-center">View Plans</a>
              </div>
            </div>
            <div className="w-full h-80 md:h-96">
              <ThreeScene />
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section id="services" className="py-16 px-4 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center font-fraunces text-orange">Why Choose SILVER SPOON?</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2 mb-12">Secure, profitable, and built for you.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🔒', title: 'Secure Platform', desc: 'Bank‑level encryption to keep your funds safe.' },
              { icon: '📈', title: 'High Returns', desc: 'Competitive interest rates on all plans.' },
              { icon: '⚡', title: 'Instant Withdrawals', desc: 'Fast and reliable payout system.' },
              { icon: '🤝', title: '24/7 Support', desc: 'Dedicated team ready to assist you.' },
            ].map((item, idx) => (
              <div key={idx} className="feature-card-3d bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-lg font-fraunces">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== TRUST & REGULATORY ===== */}
        <section className="py-16 px-4 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center font-fraunces text-orange">Trusted & Regulated</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div ref={(el) => (trustRefs.current[0] = el)} className="trust-card bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold font-fraunces">🇳🇬 Federal Republic of Nigeria</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  SILVER SPOON operates in full compliance with the laws of the Federal Republic of Nigeria.
                  We are registered with the Corporate Affairs Commission (CAC) and adhere to all financial regulations
                  set by the Central Bank of Nigeria.
                </p>
              </div>
              <div ref={(el) => (trustRefs.current[1] = el)} className="trust-card bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold font-fraunces">🔒 Your Security is Our Priority</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  We use bank-grade encryption, multi‑factor authentication, and continuous monitoring
                  to protect your funds and personal data. Your trust is our most valuable asset.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== WHY NIGERIANS TRUST ===== */}
        <section className="py-16 px-4 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center font-fraunces text-orange">Why Nigerians Trust SILVER SPOON</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2 mb-10">
            We’ve been empowering individuals and businesses across Nigeria with smart investment solutions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="text-4xl">📊</div>
              <h4 className="font-bold mt-2 font-fraunces">Transparent Operations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Real‑time portfolio tracking and clear reporting.</p>
            </div>
            <div className="p-6">
              <div className="text-4xl">⏱️</div>
              <h4 className="font-bold mt-2 font-fraunces">Fast Payouts</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Withdraw your earnings in minutes, not days.</p>
            </div>
            <div className="p-6">
              <div className="text-4xl">📞</div>
              <h4 className="font-bold mt-2 font-fraunces">Local Support</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Our team is based in Nigeria, ready to assist you 24/7.</p>
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="py-16 px-4 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div><span className="text-3xl font-black text-orange">50K+</span><p className="text-sm text-gray-600 dark:text-gray-400">Investors</p></div>
            <div><span className="text-3xl font-black text-orange">$120M+</span><p className="text-sm text-gray-600 dark:text-gray-400">Funds</p></div>
            <div><span className="text-3xl font-black text-orange">98%</span><p className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</p></div>
            <div><span className="text-3xl font-black text-orange">10+</span><p className="text-sm text-gray-600 dark:text-gray-400">Years</p></div>
          </div>
        </section>

        {/* ===== ABOUT ===== */}
        <section id="about" className="py-16 px-4 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-fraunces text-orange">About SILVER SPOON</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
            SILVER SPOON is a trusted financial platform dedicated to helping individuals and businesses grow their wealth through smart, secure, and transparent investment opportunities. With years of expertise and a client‑first approach, we make investing simple, safe, and rewarding.
          </p>
        </section>

        {/* ===== SUBSCRIPTION PLANS ===== */}
        <section id="plans" className="py-16 px-4 subscription-container">
          <h2 className="text-3xl font-bold text-center font-fraunces text-orange">Choose Your Investment Plan</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2 mb-10">
            Select a plan that fits your goals – all plans come with full support and transparency.
          </p>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic */}
            <div className="card-3d bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
              <h3 className="text-xl font-bold font-fraunces">Basic</h3>
              <div className="mt-2 text-3xl font-black text-orange">₦10,000</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">per month</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>✅ 5% monthly returns</li>
                <li>✅ ₦50,000 insurance cover</li>
                <li>✅ 24/7 email support</li>
              </ul>
              <Link to="/register" className="mt-6 w-full py-2 bg-orange text-white rounded hover:bg-orange-dark transition font-semibold">Start Now</Link>
            </div>

            {/* Pro */}
            <div className="card-3d card-3d-center bg-orange dark:bg-white text-white dark:text-black rounded-2xl p-6 border-2 border-orange-dark flex flex-col items-center text-center transform scale-105 shadow-xl">
              <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Popular</span>
              <h3 className="text-xl font-bold mt-2 font-fraunces">Pro</h3>
              <div className="mt-2 text-3xl font-black">₦50,000</div>
              <p className="text-sm text-gray-200 dark:text-gray-500">per month</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-100 dark:text-gray-700">
                <li>✅ 12% monthly returns</li>
                <li>✅ ₦250,000 insurance cover</li>
                <li>✅ Priority 24/7 support</li>
                <li>✅ Free financial consultation</li>
              </ul>
              <Link to="/register" className="mt-6 w-full py-2 bg-white dark:bg-black text-orange dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition font-semibold">Get Pro</Link>
            </div>

            {/* Premium */}
            <div className="card-3d bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
              <h3 className="text-xl font-bold font-fraunces">Premium</h3>
              <div className="mt-2 text-3xl font-black text-orange">₦100,000</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">per month</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>✅ 20% monthly returns</li>
                <li>✅ ₦1,000,000 insurance cover</li>
                <li>✅ 24/7 VIP support</li>
                <li>✅ Personal financial advisor</li>
                <li>✅ Early withdrawal options</li>
              </ul>
              <Link to="/register" className="mt-6 w-full py-2 bg-orange text-white rounded hover:bg-orange-dark transition font-semibold">Go Premium</Link>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="py-16 px-4 bg-orange dark:bg-white text-white dark:text-black text-center">
          <h2 className="text-3xl font-bold font-fraunces">Ready to Start Investing?</h2>
          <Link to="/register" className="inline-block mt-6 px-8 py-3 bg-white dark:bg-black text-orange dark:text-white font-semibold rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition">
            Create Your Account
          </Link>
        </section>

        {/* ===== CONTACT ===== */}
        <section id="contact" className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center font-fraunces text-orange">Contact Us</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p><strong>📍 Address:</strong> 104 Finance Street, Abuja, Nigeria</p>
              <p className="mt-2"><strong>📞 Phone:</strong> +234 800 333 2999</p>
              <p className="mt-2"><strong>✉ Email:</strong> support@silverspoon.com or silverspoon@gmail.com</p>
              <p className="mt-2"><strong>🕒 Hours:</strong> Mon - Fri, 9AM - 6PM (WAT)</p>
            </div>
            <form className="flex flex-col gap-4">
              <input type="text" placeholder="Your Name" className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" />
              <input type="email" placeholder="Your Email" className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800" />
              <textarea rows={4} placeholder="Your Message" className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"></textarea>
              <button type="submit" className="px-6 py-3 bg-orange text-white rounded font-semibold hover:bg-orange-dark transition">Send Message</button>
            </form>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="bg-gray-100 dark:bg-gray-800 py-8 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
            <div><h4 className="font-bold font-fraunces">SILVER SPOON</h4><p className="text-gray-600 dark:text-gray-400 mt-1">Your trusted partner.</p></div>
            <div><h4 className="font-bold font-fraunces">Quick Links</h4><ul className="space-y-1 mt-1 text-gray-600 dark:text-gray-400"><li><a href="#home" className="hover:text-orange">Home</a></li><li><a href="#about" className="hover:text-orange">About</a></li><li><a href="#services" className="hover:text-orange">Services</a></li><li><a href="#plans" className="hover:text-orange">Plans</a></li></ul></div>
            <div><h4 className="font-bold font-fraunces">Legal</h4><ul className="space-y-1 mt-1 text-gray-600 dark:text-gray-400"><li><a href="#" className="hover:text-orange">Terms</a></li><li><a href="#" className="hover:text-orange">Privacy</a></li></ul></div>
            <div><h4 className="font-bold font-fraunces">Follow</h4><ul className="space-y-1 mt-1 text-gray-600 dark:text-gray-400"><li><a href="#" className="hover:text-orange">Facebook</a></li><li><a href="#" className="hover:text-orange">Twitter</a></li></ul></div>
          </div>

          <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-gray-300 dark:border-gray-600">
            <div className="footer-logos">
              {/* Nigeria flag image */}
              <img src={nigeriaFlag} alt="Nigeria" className="h-10 w-auto" />
              <span className="text-gray-400 dark:text-gray-500 text-2xl">|</span>
              {/* SILVER SPOON logo (spoon image) */}
              <div className="flex items-center gap-2">
                <img src={spoonLogo} alt="Spoon" className="h-10 w-10 rounded-full object-cover" />
                <span className="font-bold text-gray-700 dark:text-gray-300 font-fraunces">SILVER SPOON</span>
              </div>
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              © 2026 SILVER SPOON. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;