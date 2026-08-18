function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout({ title, body }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="auth-page">
    ${body}
  </div>
</body>
</html>`;
}

function alert(message, type = 'error') {
  if (!message) return '';
  return `<div class="alert alert--${type}">${escapeHtml(message)}</div>`;
}

function registerPage({ error, values = {} } = {}) {
  return layout({
    title: 'Inscription | OIBSIP Auth',
    body: `
    <div class="auth-card">
      <h1 class="auth-card__title">Créer un compte</h1>
      <p class="auth-card__subtitle">Rejoins la plateforme en quelques secondes.</p>
      ${alert(error)}
      <form method="POST" action="/register" class="auth-form" novalidate>
        <label class="auth-form__label" for="username">Nom d'utilisateur</label>
        <input class="auth-form__input" type="text" id="username" name="username" required minlength="3" value="${escapeHtml(values.username)}">

        <label class="auth-form__label" for="email">Email</label>
        <input class="auth-form__input" type="email" id="email" name="email" required value="${escapeHtml(values.email)}">

        <label class="auth-form__label" for="password">Mot de passe</label>
        <input class="auth-form__input" type="password" id="password" name="password" required minlength="8">
        <p class="auth-form__hint">8 caractères minimum, avec au moins un chiffre.</p>

        <button type="submit" class="auth-form__submit">S'inscrire</button>
      </form>
      <p class="auth-card__footer">Déjà un compte ? <a href="/login">Se connecter</a></p>
    </div>`
  });
}

function loginPage({ error, notice, values = {} } = {}) {
  return layout({
    title: 'Connexion | OIBSIP Auth',
    body: `
    <div class="auth-card">
      <h1 class="auth-card__title">Se connecter</h1>
      <p class="auth-card__subtitle">Content de te revoir.</p>
      ${alert(notice, 'success')}
      ${alert(error)}
      <form method="POST" action="/login" class="auth-form" novalidate>
        <label class="auth-form__label" for="identifier">Nom d'utilisateur ou email</label>
        <input class="auth-form__input" type="text" id="identifier" name="identifier" required value="${escapeHtml(values.identifier)}">

        <label class="auth-form__label" for="password">Mot de passe</label>
        <input class="auth-form__input" type="password" id="password" name="password" required>

        <button type="submit" class="auth-form__submit">Se connecter</button>
      </form>
      <p class="auth-card__footer">Pas encore de compte ? <a href="/register">S'inscrire</a></p>
    </div>`
  });
}

function dashboardPage({ user }) {
  return layout({
    title: 'Tableau de bord | OIBSIP Auth',
    body: `
    <div class="auth-card auth-card--wide">
      <div class="dashboard-header">
        <div>
          <h1 class="auth-card__title">Bienvenue, ${escapeHtml(user.username)}</h1>
          <p class="auth-card__subtitle">Tu es connecté à l'espace protégé.</p>
        </div>
        <form method="POST" action="/logout">
          <button type="submit" class="auth-form__submit auth-form__submit--ghost">Se déconnecter</button>
        </form>
      </div>
      <div class="dashboard-info">
        <div class="dashboard-info__row">
          <span class="dashboard-info__label">Email</span>
          <span class="dashboard-info__value">${escapeHtml(user.email)}</span>
        </div>
        <div class="dashboard-info__row">
          <span class="dashboard-info__label">Membre depuis</span>
          <span class="dashboard-info__value">${new Date(user.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
      <p class="dashboard-note">Cette page n'est accessible qu'après une connexion réussie. Essaie d'y accéder en navigation privée sans être connecté, tu seras redirigé vers /login.</p>
    </div>`
  });
}

module.exports = { registerPage, loginPage, dashboardPage };
