import { useEffect, useState } from 'react';
import { ArrowRight, Bell, Check, ChevronLeft, ChevronRight, Download, Heart, Leaf, RotateCw, Sparkles, Sun } from 'lucide-react';

const moments = [
  { category: 'A little reset', title: 'Step outside for five minutes.', note: 'No destination, no step goal. Just a little daylight and a change of scene.', time: '5 min', color: 'sage', icon: '☀️', why: 'A short pause outdoors can help you reset your attention.' },
  { category: 'For your future self', title: 'Put one thing back where it belongs.', note: 'Choose the mug, the jacket, or that one thing on your desk. One is plenty.', time: '2 min', color: 'peach', icon: '🧺', why: 'Small resets make tomorrow feel a little lighter.' },
  { category: 'A kind connection', title: 'Send someone a message just to say hi.', note: 'No big catch-up required. A small “thinking of you” is enough.', time: '2 min', color: 'lavender', icon: '💌', why: 'A small moment of connection can brighten an ordinary day.' },
  { category: 'Make something', title: 'Write down one thing you noticed today.', note: 'A funny sign, a good cup of tea, a patch of sunlight. Anything counts.', time: '3 min', color: 'yellow', icon: '✍️', why: 'Noticing small details is a gentle way to be present.' },
  { category: 'Move gently', title: 'Stretch your shoulders and take three slow breaths.', note: 'Let your shoulders drop. There is nowhere else you need to be for a moment.', time: '1 min', color: 'blue', icon: '🌿', why: 'A brief pause can give your body a chance to soften.' },
  { category: 'A tiny treat', title: 'Make your next drink feel like a little ritual.', note: 'Use your favorite cup. Sit down while you drink it. That is the whole plan.', time: '5 min', color: 'peach', icon: '☕', why: 'Ordinary routines can become small moments of care.' },
  { category: 'Clear a little space', title: 'Clear one small surface.', note: 'A corner of your desk or the space beside your bed. Stop when it feels better.', time: '5 min', color: 'sage', icon: '🪴', why: 'A calmer corner can make a room feel easier to be in.' },
];

// A small recipe-like idea builder gives the app a much larger rotating library.
const littleActions = ['Take a short walk', 'Tidy one small corner', 'Write a kind note', 'Stretch for a moment', 'Make a favorite drink', 'Notice something lovely'];
const littleDetails = ['without checking your phone', 'at your own pace', 'with your favorite song on', 'before the day gets busy', 'and let that be enough', 'just for yourself'];
const littleReasons = ['A little pause can make room to breathe.', 'Tiny acts of care still count.', 'You do not need to finish everything today.', 'Ordinary moments can be worth noticing.', 'Small beginnings are still beginnings.', 'A kinder pace is a good pace.'];
const generatedMoments = littleActions.flatMap((action, actionIndex) => littleDetails.map((detail, detailIndex) => ({
  category: ['A little reset', 'For your future self', 'A kind connection', 'Make a moment', 'Move gently', 'A tiny treat'][actionIndex],
  title: `${action} ${detail}.`,
  note: 'Keep it simple. There is no need to do it perfectly or turn it into a bigger task.',
  time: ['1 min', '2 min', '3 min', '5 min'][((actionIndex + detailIndex) % 4)],
  color: ['sage', 'peach', 'lavender', 'yellow', 'blue'][(actionIndex + detailIndex) % 5],
  icon: ['🌿', '☕', '✍️', '☀️', '💌', '🪴'][(actionIndex * 2 + detailIndex) % 6],
  why: littleReasons[(actionIndex + detailIndex) % littleReasons.length],
})));
const allMoments = [...moments, ...generatedMoments];

const todayKey = () => new Date().toISOString().slice(0, 10);
const dayIndex = () => Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() / 86400000);
const dateLabel = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

function readSaved() {
  try { return JSON.parse(localStorage.getItem('one-good-thing-data')) || {}; }
  catch { return {}; }
}

export default function App() {
  const [saved, setSaved] = useState(readSaved);
  const [offset, setOffset] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const [toast, setToast] = useState('');
  const [view, setView] = useState('today');
  const [reminder, setReminder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('one-good-thing-reminder')) || { enabled: false, time: '18:00' }; }
    catch { return { enabled: false, time: '18:00' }; }
  });
  const [installPrompt, setInstallPrompt] = useState(null);
  const index = ((dayIndex() + offset) % allMoments.length + allMoments.length) % allMoments.length;
  const moment = allMoments[index];
  const isToday = offset === 0;
  const isDone = isToday && saved.completedDate === todayKey();
  const history = saved.history || [];

  useEffect(() => { localStorage.setItem('one-good-thing-data', JSON.stringify(saved)); }, [saved]);
  useEffect(() => { localStorage.setItem('one-good-thing-reminder', JSON.stringify(reminder)); }, [reminder]);
  useEffect(() => { if (!toast) return undefined; const timeout = setTimeout(() => setToast(''), 2400); return () => clearTimeout(timeout); }, [toast]);
  useEffect(() => {
    const captureInstall = (event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener('beforeinstallprompt', captureInstall);
    return () => window.removeEventListener('beforeinstallprompt', captureInstall);
  }, []);
  useEffect(() => {
    if (!reminder.enabled || !('Notification' in window) || Notification.permission !== 'granted') return undefined;
    let timer;
    const scheduleNext = () => {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const next = new Date();
      next.setHours(hours, minutes, 0, 0);
      if (next <= new Date()) next.setDate(next.getDate() + 1);
      timer = setTimeout(() => {
        new Notification('One Good Thing', { body: "A small, kind idea is waiting for you.", icon: '/icon.svg' });
        scheduleNext();
      }, next.getTime() - Date.now());
    };
    scheduleNext();
    return () => clearTimeout(timer);
  }, [reminder]);

  function markDone() {
    if (!isToday || isDone) return;
    const nextHistory = [{ date: todayKey(), title: moment.title }, ...history.filter((item) => item.date !== todayKey())].slice(0, 14);
    setSaved({ ...saved, completedDate: todayKey(), history: nextHistory });
    setToast('That counts. Well done for showing up.');
  }

  function pickAnother() {
    setOffset((current) => current + 1);
    setShowWhy(false);
  }

  async function toggleReminder() {
    if (reminder.enabled) { setReminder({ ...reminder, enabled: false }); return; }
    if (!('Notification' in window)) { setToast('This browser does not support notifications.'); return; }
    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission !== 'granted') { setToast('Allow notifications in your browser to turn on reminders.'); return; }
    setReminder({ ...reminder, enabled: true });
    setToast('Daily reminder is on while this app is open.');
  }

  async function installApp() {
    if (!installPrompt) { setToast('Use your browser menu and choose “Install app” or “Add to Home Screen”.'); return; }
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  const completedDays = history.length;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="One Good Thing home"><span className="brand-mark"><Sun size={19} /></span><span>one good thing<span className="brand-period">.</span></span></a>
        <nav className="nav-links" aria-label="Main navigation">
          <button className={view === 'today' ? 'nav-link active' : 'nav-link'} onClick={() => setView('today')}>Today</button>
          <button className={view === 'journey' ? 'nav-link active' : 'nav-link'} onClick={() => setView('journey')}>Your little wins</button>
        </nav>
        <div className="top-tools"><button className="tool-button" onClick={toggleReminder}><Bell size={14} />{reminder.enabled ? 'Reminder on' : 'Remind me'}</button><button className="tool-button install-button" onClick={installApp}><Download size={14} />Install</button><span className="top-note"><span className="status-dot" /> A gentler kind of to-do list</span></div>
      </header>

      {view === 'today' ? <>
        <section className="intro" id="top">
          <div className="eyebrow"><span className="eyebrow-line" /> A SMALL THING FOR A REAL DAY <span className="eyebrow-line" /></div>
          <h1>Progress can be<br /><em>soft around the edges.</em></h1>
          <p className="intro-copy">One thoughtful little thing to make today feel a bit more like yours.<br className="desktop-break" /> No streaks to protect. No catching up. Just today.</p>
          <div className="date-pill"><Sun size={15} /> {dateLabel}</div>
          <div className="reminder-control"><Bell size={13} /><span>Daily nudge</span><input aria-label="Reminder time" type="time" value={reminder.time} onChange={(event) => setReminder({ ...reminder, time: event.target.value })} /><button onClick={toggleReminder}>{reminder.enabled ? 'Turn off' : 'Set reminder'}</button><small>while this app is open</small></div>
        </section>

        <section className="daily-layout" aria-label="Today's good thing">
          <aside className="side-note left-note"><span className="note-icon">✳</span><span>Small is<br />still something.</span></aside>
          <article className={`daily-card ${moment.color}`}>
            <div className="card-top"><div className="category"><span className="category-dot" />{isToday ? "TODAY'S LITTLE THING" : 'A LITTLE SOMETHING'}</div><span className="time-chip">{moment.time}</span></div>
            <div className="moment-illustration" aria-hidden="true"><span className="illustration-orbit orbit-one" /><span className="illustration-orbit orbit-two" /><span className="illustration-spark spark-one">✦</span><span className="illustration-spark spark-two">·</span><span className="illustration-emoji">{moment.icon}</span></div>
            <div className="card-copy"><p className="moment-category">{moment.category}</p><h2>{moment.title}</h2><p className="moment-note">{moment.note}</p></div>
            <div className="card-actions">
              <button className={`done-button ${isDone ? 'is-done' : ''}`} onClick={markDone} disabled={!isToday || isDone}><span className="done-icon">{isDone ? <Check size={18} /> : <Heart size={17} />}</span>{isDone ? 'You did your good thing' : 'I did this little thing'}</button>
              <button className="why-button" onClick={() => setShowWhy(!showWhy)} aria-expanded={showWhy}>{showWhy ? 'A little less' : 'Why this one?'} <ArrowRight size={14} /></button>
            </div>
            {showWhy && <div className="why-panel"><Sparkles size={16} /><p>{moment.why} Take what feels useful and leave the rest.</p></div>}
            <div className="card-footer"><span><span className="footer-heart">♥</span> No perfect days required</span><div className="card-pagination"><button onClick={() => { setOffset((n) => n - 1); setShowWhy(false); }} aria-label="Previous idea"><ChevronLeft size={17} /></button><span>{String(index + 1).padStart(2, '0')} <i>/</i> {allMoments.length}</span><button onClick={pickAnother} aria-label="Next idea"><ChevronRight size={17} /></button></div></div>
          </article>
          <aside className="side-note right-note"><div className="win-count"><span>{completedDays}</span><small>{completedDays === 1 ? 'little win' : 'little wins'}</small></div><span className="note-caption">kept for you</span><button className="history-shortcut" onClick={() => setView('journey')}>See yours <ArrowRight size={13} /></button></aside>
        </section>
        <div className="another-row"><span>Not quite your thing today?</span><button onClick={pickAnother}><RotateCw size={14} /> Give me another</button></div>
        <section className="promise-row"><div><span className="promise-icon">♡</span><span><strong>Easy to begin</strong><small>Everything takes 5 minutes or less.</small></span></div><div><span className="promise-icon">↗</span><span><strong>Made for real life</strong><small>Skip a day. You can always come back.</small></span></div><div><span className="promise-icon">☼</span><span><strong>Yours to keep</strong><small>Your little wins stay on this device.</small></span></div></section>
      </> : <section className="journey-page" id="top">
        <button className="back-link" onClick={() => setView('today')}><ChevronLeft size={16} /> Back to today</button>
        <div className="journey-heading"><span className="eyebrow left-eyebrow"><span className="eyebrow-line" /> YOUR OWN PACE</span><h1>A collection of<br /><em>little wins.</em></h1><p>Every small thing you showed up for counts. Have a look.</p></div>
        <div className="journey-summary"><div className="summary-flower">✿</div><div><span className="summary-number">{completedDays}</span><span className="summary-label">{completedDays === 1 ? 'good thing done' : 'good things done'}</span></div><div className="summary-divider" /><div className="summary-message">No streak to maintain.<br /><strong>Just moments that happened.</strong></div></div>
        {history.length ? <div className="history-list"><h2>Your recent moments</h2>{history.map((item, i) => <article className="history-item" key={item.date}><div className="history-check"><Check size={15} /></div><div className="history-detail"><strong>{item.title}</strong><span>{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date(`${item.date}T12:00:00`))}</span></div><span className="history-sparkle">{i === 0 ? '✦' : '·'}</span></article>)}</div> : <div className="empty-state"><span className="empty-icon">🌱</span><h2>Your first little win is waiting.</h2><p>There is no rush. When you are ready, today's idea will be here.</p><button className="empty-cta" onClick={() => setView('today')}>See today's idea <ArrowRight size={15} /></button></div>}
      </section>}
      <footer className="footer"><span><Leaf size={14} /> Made for the in-between moments.</span><span>One day at a time, your way.</span></footer>
      {toast && <div className="toast" role="status"><span><Check size={15} /></span>{toast}</div>}
    </main>
  );
}
