// Theme
const THEME_KEY = 'theme';

function preferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

applyTheme(preferredTheme());

const themeBtn = document.getElementById('themeToggle');
themeBtn?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});

// Keep previously shared hash URLs working after the site was split into pages.
const legacyRoutes = {
  '#publications': 'publications.html',
  '#projects': 'projects.html',
  '#news': 'news.html',
  '#news/macsys-workshop3': 'news-macsys-workshop3.html',
  '#news/macsys-launch': 'news-macsys-launch.html'
};

const isHomePage = location.pathname.endsWith('/') || location.pathname.endsWith('/index.html');
if (isHomePage && legacyRoutes[location.hash]) {
  location.replace(legacyRoutes[location.hash]);
}

function createNewsItem(item, layout = 'card') {
  const listItem = document.createElement('li');
  listItem.className = 'news-item';
  const isTimeline = layout === 'timeline';
  if (isTimeline) listItem.classList.add('news-item--timeline');

  const thumbnailLink = document.createElement('a');
  thumbnailLink.className = 'news-thumb-link';
  thumbnailLink.href = item.href;
  thumbnailLink.setAttribute('aria-hidden', 'true');
  thumbnailLink.tabIndex = -1;

  const image = document.createElement('img');
  image.className = 'news-thumb';
  image.src = item.image;
  image.alt = item.imageAlt;
  image.loading = 'lazy';
  thumbnailLink.append(image);

  const body = document.createElement('div');
  body.className = 'news-body';

  const heading = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = item.href;
  titleLink.textContent = item.title;
  heading.append(titleLink);

  const meta = document.createElement('div');
  const time = document.createElement('time');
  time.dateTime = item.date;

  if (isTimeline) {
    meta.className = 'news-when';

    const year = document.createElement('div');
    year.className = 'news-year';
    year.textContent = item.date.slice(0, 4);

    const datePlace = document.createElement('div');
    datePlace.className = 'news-date-place';
    time.textContent = item.dateLabel.replace(new RegExp(`,?\\s*${year.textContent}$`), '');

    const place = document.createElement('span');
    place.className = 'news-place';
    place.textContent = item.location;
    datePlace.append(time, place);
    meta.append(year, datePlace);
  } else {
    meta.className = 'news-meta';
    time.textContent = item.dateLabel;
    meta.append(time, document.createTextNode(` · ${item.location}`));
  }

  const summary = document.createElement('p');
  summary.className = 'muted';
  summary.textContent = item.summary;

  const actions = document.createElement('div');
  actions.className = 'news-actions';
  const actionItems = item.actions || [{
    href: item.href,
    label: item.actionLabel,
    ariaLabel: item.actionAriaLabel,
    external: item.external
  }];
  actionItems.forEach((action, index) => {
    const actionLink = document.createElement('a');
    actionLink.className = 'read-more';
    actionLink.href = action.href;
    actionLink.textContent = action.label;
    if (action.ariaLabel) actionLink.setAttribute('aria-label', action.ariaLabel);
    if (action.external ?? item.external) {
      actionLink.target = '_blank';
      actionLink.rel = 'noopener';
    }
    if (index > 0) actions.append(document.createTextNode(' · '));
    actions.append(actionLink);
  });

  if (item.external) {
    [thumbnailLink, titleLink].forEach((link) => {
      link.target = '_blank';
      link.rel = 'noopener';
    });
  }

  if (isTimeline) {
    body.append(heading, summary, actions);
    listItem.append(meta, thumbnailLink, body);
  } else {
    body.append(heading, meta, summary, actions);
    listItem.append(thumbnailLink, body);
  }
  return listItem;
}

function renderNews(target, items, layout = 'card') {
  if (!target) return;
  target.replaceChildren(...items.map((item) => createNewsItem(item, layout)));
}

if (Array.isArray(window.NEWS_ITEMS)) {
  const newsByDate = [...window.NEWS_ITEMS].sort((a, b) => b.date.localeCompare(a.date));
  renderNews(document.getElementById('recentNewsList'), newsByDate.slice(0, 4));
  renderNews(document.getElementById('allNewsList'), newsByDate, 'timeline');
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
