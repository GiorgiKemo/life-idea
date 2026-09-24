import { useEffect, useRef, useState } from "react";

const clamp = (value) => Math.min(1, Math.max(0, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

function blendPose(sprite, position, frameCount, loop = true) {
  const layers = sprite.querySelectorAll(".pose-frame");
  const index = Math.floor(position);
  const first = loop ? index % frameCount : Math.min(frameCount - 1, index);
  const second = loop ? (first + 1) % frameCount : Math.min(frameCount - 1, first + 1);
  const blend = smoothstep(position - index);

  layers[0].style.backgroundPositionX = String((first / (frameCount - 1)) * 100) + "%";
  layers[0].style.opacity = String(1 - blend);
  layers[1].style.backgroundPositionX = String((second / (frameCount - 1)) * 100) + "%";
  layers[1].style.opacity = String(blend);
}

function useScrollStory() {
  useEffect(() => {
    const scenes = Array.from(document.querySelectorAll("[data-scene]"));
    const states = scenes.map((scene) => ({
      scene,
      current: 0,
      target: 0,
      visibility: 0,
      targetVisibility: 0,
      runPose: 0,
      runDistance: 0,
      runLastPoseAt: 0,
      runLastInputAt: 0,
      runLastScrollY: window.scrollY,
    }));
    const progressBar = document.getElementById("scroll-progress");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastTime = 0;

    const paint = () => {
      states.forEach(({ scene, current, visibility }) => {
        const progress = smoothstep(current);
        scene.style.setProperty("--progress", String(progress));
        scene.style.setProperty("--visibility", String(visibility));
        scene.style.setProperty("--hero-x", String(progress * 1.7) + "vw");
        scene.style.setProperty("--hero-y", String(-progress * 18) + "px");
        scene.style.setProperty("--hero-angle", String(progress * 1.1) + "deg");
        scene.style.setProperty("--walk-x", String(progress * (scene.dataset.scene === "adulthood" ? 6 : 8)) + "vw");
        scene.style.setProperty("--slow-x", String(progress * 3) + "vw");
        scene.style.setProperty("--drift-y", String(-progress * 14) + "px");

        const sprite = scene.querySelector("[data-poses]");
        if (sprite) {
          const type = sprite.getAttribute("data-poses");
          const amount = reducedMotion.matches ? 0 : progress;
          if (type === "youth") blendPose(sprite, amount * 3, 3);
          if (type === "adult") blendPose(sprite, amount * 2, 3, false);
          if (type === "old") blendPose(sprite, amount * 2.4, 3);
        }

        if (scene.dataset.scene === "ending") {
          const breath = progress < 0.74 ? 1 + Math.sin(progress * Math.PI * 4) * 0.006 : 1;
          scene.style.setProperty("--breath", String(breath));
          scene.style.setProperty("--last-breath", String(smoothstep(clamp((progress - 0.68) / 0.25))));
        }
      });
    };

    const tick = (time) => {
      frame = 0;
      const delta = lastTime ? Math.min(64, time - lastTime) : 16;
      lastTime = time;
      const easing = 1 - Math.exp(-delta / 210);
      let moving = false;

      states.forEach((state) => {
        const distance = state.target - state.current;
        const visibilityDistance = state.targetVisibility - state.visibility;
        if (Math.abs(distance) > 0.001) {
          state.current += distance * easing;
          moving = true;
        } else {
          state.current = state.target;
        }
        if (Math.abs(visibilityDistance) > 0.001) {
          state.visibility += visibilityDistance * easing;
          moving = true;
        } else {
          state.visibility = state.targetVisibility;
        }
      });

      paint();
      if (moving) frame = window.requestAnimationFrame(tick);
      else lastTime = 0;
    };

    const measure = (instant = false) => {
      const viewport = window.innerHeight;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - viewport);
      if (progressBar) progressBar.style.transform = "scaleX(" + String(window.scrollY / scrollable) + ")";

      states.forEach((state) => {
        const rect = state.scene.getBoundingClientRect();
        const range = Math.max(1, rect.height - viewport);
        state.target = clamp(-rect.top / range);
        if (state.scene.dataset.scene === "childhood") {
          const now = performance.now();
          const scrollDelta = window.scrollY - state.runLastScrollY;
          state.runLastScrollY = window.scrollY;
          const sprite = state.scene.querySelector(".runner-sprite");
          const stride = Math.max(48, Math.min(84, viewport * 0.085));

          if (instant || reducedMotion.matches) {
            state.runPose = reducedMotion.matches ? 0 : Math.floor(Math.max(0, -rect.top) / stride) % 4;
            state.runDistance = 0;
            state.runLastPoseAt = now;
            state.runLastInputAt = now;
          } else if (scrollDelta !== 0) {
            if (now - state.runLastInputAt > 300 || (state.runDistance && Math.sign(scrollDelta) !== Math.sign(state.runDistance))) state.runDistance = 0;
            state.runLastInputAt = now;
            state.runDistance += scrollDelta;
            const direction = Math.sign(state.runDistance);
            if (direction && Math.abs(state.runDistance) >= stride && now - state.runLastPoseAt >= 240) {
              state.runPose = (state.runPose + direction + 4) % 4;
              state.runDistance = 0;
              state.runLastPoseAt = now;
            }
          }

          const progress = reducedMotion.matches ? 0 : state.target;
          state.scene.style.setProperty("--run-x", String(-4 + smoothstep(progress) * 10) + "vw");
          sprite.style.backgroundPositionX = String((state.runPose / 3) * 100) + "%";
          sprite.style.setProperty("--run-bob", String(Math.sin((state.runPose / 4) * Math.PI * 2) * 4) + "px");
        }
        state.targetVisibility = clamp((viewport - rect.top) / (viewport * 0.9));
        if (instant || reducedMotion.matches) {
          state.current = state.target;
          state.visibility = state.targetVisibility;
        }
      });

      if (instant || reducedMotion.matches) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        paint();
      } else if (!frame) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    const onScroll = () => measure();
    const onResize = () => measure(true);
    const onMotionChange = () => measure(true);

    measure(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    reducedMotion.addEventListener("change", onMotionChange);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      reducedMotion.removeEventListener("change", onMotionChange);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
}
function ChapterText({ number, label, title, lines, aside }) {
  return (
    <div className="chapter-copy">
      <div className="chapter-number"><span>{number}</span><span className="chapter-rule" /></div>
      <p className="chapter-label">{label}</p>
      <h2>{title}</h2>
      <div className="chapter-lines">
        {lines.map((line) => <p key={line}>{line}</p>)}
      </div>
      {aside && <p className="chapter-aside">{aside}</p>}
    </div>
  );
}

function ScrollHint() {
  return (
    <div className="scroll-hint" aria-hidden="true">
      <span>Scroll to follow his story</span>
      <span className="scroll-hint-line" />
    </div>
  );
}

function ContactForm() {
  const [message, setMessage] = useState("");
  const formRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formRef.current?.reportValidity()) return;
    setMessage("Your message is ready. This demo does not send messages yet.");
  };

  return (
    <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
      <p className="form-note">Demo form — messages are not sent yet</p>
      <label htmlFor="contact-name">Your name</label>
      <input id="contact-name" name="name" autoComplete="name" required />
      <label htmlFor="contact-email">Your email</label>
      <input id="contact-email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="contact-message">Your message</label>
      <textarea id="contact-message" name="message" rows="4" required />
      <button type="submit">Preview message <span aria-hidden="true">↗</span></button>
      {message && <p className="form-status" role="status">{message}</p>}
    </form>
  );
}

export function App() {
  useScrollStory();

  return (
    <>
      <div className="reading-progress" aria-hidden="true"><span id="scroll-progress" /></div>
      <header className="site-header">
        <a className="wordmark" href="#beginning" aria-label="LIFE IDEA, return to beginning">
          LIFE IDEA <small>A life in moments</small>
        </a>
        <nav aria-label="Story navigation">
          <a href="#beginning">Beginning</a>
          <a href="#childhood">The journey</a>
        </nav>
        <span className="header-thought">Same sky<br />Different days<br />A full life</span>
      </header>

      <main id="main-content">
        <section id="beginning" className="chapter chapter-hero" data-scene="beginning" aria-labelledby="hero-title">
          <div className="chapter-sticky">
            <div className="hero-copy">
              <p className="chapter-label">The beginning</p>
              <h1 id="hero-title">A Life<br />Well Lived</h1>
              <p className="hero-deck">Not a longer life.<br />A deeper one.</p>
              <span className="gold-mark" aria-hidden="true" />
              <p className="hero-small">The same person.<br />A thousand meaningful moments.</p>
            </div>
            <img className="chapter-landscape hero-landscape" src="/assets/ink-landscape.webp" alt="" aria-hidden="true" />
            <div className="scene-art hero-art">
              <img src="/assets/hero-family.webp" alt="A laughing little boy held by his mother beside his smiling father" />
            </div>
            <p className="hero-whisper">The people<br />we love<br />make life<br />extraordinary.</p>
            <ScrollHint />
          </div>
        </section>

        <section id="childhood" className="chapter chapter-childhood" data-scene="childhood" aria-labelledby="childhood-title">
          <div className="chapter-sticky">
            <div className="chapter-copy">
              <div className="chapter-number"><span>01</span><span className="chapter-rule" /></div>
              <p className="chapter-label">The journey</p>
              <h2 id="childhood-title">Childhood</h2>
              <div className="chapter-lines"><p>A world of firsts.</p><p>Small feet, big dreams.</p></div>
              <p className="chapter-aside">Curiosity turns ordinary days into adventures.</p>
            </div>
            <img className="chapter-landscape childhood-landscape" src="/assets/ink-landscape.webp" alt="" aria-hidden="true" />
            <img className="chapter-path" src="/assets/gold-path.webp" alt="" aria-hidden="true" />
            <div className="scene-art running-stage">
              <div className="runner" data-runner role="img" aria-label="The boy runs forward as the story scrolls"><span className="runner-sprite" aria-hidden="true" /></div>
            </div>
            <p className="scene-quote">He kept running<br />toward what came next.</p>
          </div>
        </section>

        <section id="youth" className="chapter chapter-youth" data-scene="youth" aria-labelledby="youth-title">
          <div className="chapter-sticky">
            <ChapterText number="02" label="The journey" title="Youth" lines={["Bigger questions.", "A wider world.", "The same hopeful heart."]} aside="We grow not just in years, but in perspective." />
            <img className="chapter-landscape" src="/assets/ink-horizon.webp" alt="" aria-hidden="true" />
            <img className="chapter-path" src="/assets/gold-path.webp" alt="" aria-hidden="true" />
            <div className="scene-art youth-art">
              <div className="figure-sprite youth-sprite pose-sprite" data-poses="youth" role="img" aria-label="The boy, now a young man, walks toward a wider world"><span className="pose-frame" aria-hidden="true" /><span className="pose-frame" aria-hidden="true" /></div>
            </div>
          </div>
        </section>

        <section id="adulthood" className="chapter chapter-adulthood" data-scene="adulthood" aria-labelledby="adult-title">
          <div className="chapter-sticky">
            <div className="chapter-copy">
              <div className="chapter-number"><span>03</span><span className="chapter-rule" /></div>
              <p className="chapter-label">The journey</p>
              <h2 id="adult-title">Adulthood</h2>
              <div className="chapter-lines"><p>Responsibilities.</p><p>Relationships.</p><p>A fuller understanding<br />of what truly matters.</p></div>
              <p className="chapter-aside">A good life is built in the everyday.</p>
            </div>
            <img className="chapter-landscape" src="/assets/ink-horizon.webp" alt="" aria-hidden="true" />
            <img className="chapter-path" src="/assets/gold-path.webp" alt="" aria-hidden="true" />
            <div className="scene-art adult-art">
              <div className="figure-sprite adult-sprite pose-sprite" data-poses="adult" role="img" aria-label="The man turns toward the horizon as the story scrolls"><span className="pose-frame" aria-hidden="true" /><span className="pose-frame" aria-hidden="true" /></div>
            </div>
          </div>
        </section>

        <section id="old-age" className="chapter chapter-oldage" data-scene="old-age" aria-labelledby="old-title">
          <div className="chapter-sticky">
            <ChapterText number="04" label="The journey" title="Old Age" lines={["A quieter pace.", "A deeper gratitude.", "The same wonder, still alive."]} aside="In the end, we remember what we gave, felt, and loved." />
            <img className="chapter-landscape" src="/assets/ink-horizon.webp" alt="" aria-hidden="true" />
            <img className="chapter-path" src="/assets/gold-path.webp" alt="" aria-hidden="true" />
            <div className="scene-art old-art">
              <div className="figure-sprite old-sprite pose-sprite" data-poses="old" role="img" aria-label="The same man in old age walks slowly with a cane"><span className="pose-frame" aria-hidden="true" /><span className="pose-frame" aria-hidden="true" /></div>
            </div>
          </div>
        </section>

        <section id="ending" className="chapter chapter-ending" data-scene="ending" aria-labelledby="ending-title">
          <div className="chapter-sticky">
            <ChapterText number="05" label="The final chapter" title="The Final Breath" lines={["A gentle ending.", "A life, complete."]} aside="And so, he lets go — with peace, with love, with a life well lived." />
            <div className="scene-art ending-art">
              <img className="final-man" src="/assets/final-breath.webp" alt="The elderly man rests in bed as his breathing slows and ends" />
              <img className="breath-wisp" src="/assets/breath-wisp.webp" alt="" aria-hidden="true" />
            </div>
            <p className="ending-stillness">A life ends.<br />Love remains.</p>
          </div>
        </section>

        <section id="contact" className="reveal" data-scene="reveal" aria-labelledby="reveal-title">
          <div className="reveal-inner">
            <p className="reveal-intro">For the stories that live on.</p>
            <h2 id="reveal-title">EXAMPLE COMPANY NAME</h2>
            <p className="reveal-subtitle">Coffins &amp; memorial accessories</p>
            <p className="reveal-caption">Honouring every story. Always.</p>
            <div className="reveal-content">
              <div className="reveal-art"><img src="/assets/memorial-still-life.webp" alt="An illustrated coffin with flowers and a candle" /></div>
              <div className="contact-details">
                <h3>Contact Us</h3>
                <p>We are here to help you choose a meaningful farewell.</p>
                <dl>
                  <div><dt>Phone</dt><dd>+1 (000) 000-0000</dd></div>
                  <div><dt>Email</dt><dd>hello@example.com</dd></div>
                </dl>
                <a className="contact-action" href="#contact-form">Write a message <span aria-hidden="true">↗</span></a>
              </div>
              <div id="contact-form"><ContactForm /></div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer"><span>LIFE IDEA</span><span>People pass. Love remains.</span><span>EXAMPLE COMPANY NAME</span></footer>
    </>
  );
}






