const feed = document.getElementById('feed');

const cards = PHRASES.map((p) => `
  <article class="card">
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
