const feed = document.getElementById('feed');

const REQUIRED_VIEWS = 3;

function dayString(date) {
  // returns "YYYY-MM-DD" in LOCAL time
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function updateStreak() {
  const today = dayString(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dayString(yesterdayDate);
  const lastActive = localStorage.getItem('piger_last_active');
  let streak = parseInt(localStorage.getItem('piger_streak')) || 0;

  if (lastActive === today) return; // already counted today, do nothing
  else if (lastActive === yesterday) streak = streak + 1;
  else streak = 1; // first time, or streak broken

  localStorage.setItem('piger_streak', streak);
  localStorage.setItem('piger_last_active', today);
  document.getElementById('streak-count').textContent = streak;
}

const cards = PHRASES.map((p) => `
  <article class="card" data-id="${p.id}">
    <p class="eyebrow">${p.category.toUpperCase()}</p>
    <h1 class="phrase" lang="fr">${p.french}</h1>
    <p class="phonetic">${p.phonetic}</p>
    <button class="translate-btn">Hold to translate</button>
    <div class="translation">
      <p class="english">${p.english}</p>
      <p class="usage-note">${p.usage_note}</p>
    </div>
    <div class="audio-bar">
      <button class="play-btn" aria-label="Play audio">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      </button>
      <span class="contributor-name">${p.contributor_name}</span>
      <span class="contributor-country">${p.contributor_country}</span>
    </div>
    <button class="save-btn" aria-label="Save phrase">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
    </button>
  </article>
`);

feed.innerHTML = cards.join('');

document.getElementById('streak-count').textContent =
  parseInt(localStorage.getItem('piger_streak')) || 0;

const getSaved = () => JSON.parse(localStorage.getItem('piger_saved')) || [];
const setSaved = (arr) => localStorage.setItem('piger_saved', JSON.stringify(arr));

const savedCount = document.getElementById('saved-count');

function syncFeedHearts() {
  const saved = getSaved();
  document.querySelectorAll('#feed .save-btn').forEach((btn) => {
    const id = btn.closest('.card').dataset.id;
    if (saved.includes(id)) btn.classList.add('saved');
    else btn.classList.remove('saved');
  });
  document.getElementById('saved-count').textContent = `${saved.length}/5`;
}

document.querySelectorAll('.save-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.closest('.card').dataset.id;
    let saved = getSaved();
    if (saved.includes(id)) {
      saved = saved.filter((s) => s !== id);
      btn.classList.remove('saved');
    } else {
      if (saved.length >= 5) {
        btn.classList.remove('shake');
        void btn.offsetWidth;
        btn.classList.add('shake');
        return;
      }
      saved.push(id);
      btn.classList.add('saved');
    }
    setSaved(saved);
    savedCount.textContent = `${saved.length}/5`;
    syncFeedHearts();
  });
});

const initialSaved = getSaved();
initialSaved.forEach((id) => {
  const btn = document.querySelector(`.card[data-id="${id}"] .save-btn`);
  if (btn) btn.classList.add('saved');
});
savedCount.textContent = `${initialSaved.length}/5`;

document.querySelectorAll('.translate-btn').forEach((btn) => {
  const translation = btn.closest('.card').querySelector('.translation');

  const reveal = () => translation.classList.add('revealed');
  const hide = () => translation.classList.remove('revealed');

  btn.addEventListener('mousedown', reveal);
  btn.addEventListener('mouseup', hide);
  btn.addEventListener('mouseleave', hide);
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); reveal(); });
  btn.addEventListener('touchend', hide);
});

const viewedToday = new Set();
let dayCounted = false;

const viewObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = entry.target.dataset.id;
      viewedToday.add(id);
      if (viewedToday.size >= REQUIRED_VIEWS && !dayCounted) {
        dayCounted = true;          // flip the latch so this block never runs again today
        updateStreak();
      }
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.card').forEach((card) => viewObserver.observe(card));

const savedButton = document.getElementById('saved-button');
const savedSheet = document.getElementById('saved-sheet');
const sheetBackdrop = document.getElementById('sheet-backdrop');
const sheetClose = document.getElementById('sheet-close');

function renderSavedSheet() {
  const list = document.getElementById('saved-list');
  const saved = getSaved();

  if (saved.length === 0) {
    list.innerHTML = `<p class="saved-empty">No saved phrases yet. Tap the heart on a
      phrase to save it.</p>`;
    return;
  }

  const savedCards = saved
    .map((id) => PHRASES.find((p) => p.id === id))
    .filter((p) => p)
    .map((p) => `
      <article class="saved-card" data-id="${p.id}">
        <div class="saved-card-top">
          <p class="saved-phrase" lang="fr">${p.french}</p>
          <button class="unsave-btn" aria-label="Remove from saved">&hearts;</button>
        </div>
        <p class="saved-phonetic">${p.phonetic}</p>
        <button class="saved-translate-btn">Hold to translate</button>
        <div class="saved-translation">
          <p class="saved-english">${p.english}</p>
          <p class="saved-usage">${p.usage_note}</p>
        </div>
        <div class="saved-audio-bar">
          <button class="saved-play-btn" aria-label="Play audio">&#9654;</button>
          <span class="saved-contributor">${p.contributor_name}</span>
          <span class="saved-country">${p.contributor_country}</span>
        </div>
      </article>
    `);

  list.innerHTML = savedCards.join('');
  wireSavedCardEvents();
}

function wireSavedCardEvents() {
  document.querySelectorAll('#saved-list .saved-translate-btn').forEach((btn) => {
    const translation = btn.closest('.saved-card').querySelector('.saved-translation');

    const reveal = () => translation.classList.add('revealed');
    const hide = () => translation.classList.remove('revealed');

    btn.addEventListener('mousedown', reveal);
    btn.addEventListener('mouseup', hide);
    btn.addEventListener('mouseleave', hide);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); reveal(); });
    btn.addEventListener('touchend', hide);
  });

  document.querySelectorAll('#saved-list .unsave-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.saved-card').dataset.id;
      let saved = getSaved();
      saved = saved.filter((savedId) => savedId !== id);
      setSaved(saved);
      syncFeedHearts();
      renderSavedSheet();
    });
  });
}

function openSheet() {
  savedSheet.classList.add('open');
  sheetBackdrop.classList.add('open');
  savedSheet.setAttribute('aria-hidden', 'false');
  renderSavedSheet();
}

function closeSheet() {
  savedSheet.classList.remove('open');
  sheetBackdrop.classList.remove('open');
  savedSheet.setAttribute('aria-hidden', 'true');
}

savedButton.addEventListener('click', openSheet);
sheetClose.addEventListener('click', closeSheet);
sheetBackdrop.addEventListener('click', closeSheet);
