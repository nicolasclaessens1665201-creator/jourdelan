# Potluck - Jour de l'an

Petit projet pour organiser un potluck (jour de l'an).

## 📋 Application complète (serveur Node.js)

Installation et lancement:

```powershell
cd "c:/Users/nicol/Jourdelan"
npm install
npm start
# puis ouvrir http://localhost:3000
```

Pour développement avec reload automatique (nodemon):

```powershell
npm install
npm run dev
# ouvre http://localhost:3000
```

Fonctionnalités:
- Page `Participants`: ajouter des participants et voir la liste.
- Page `Plats`: ajouter des plats avec un nombre maximum de contributeurs, voir qui apporte quoi, et marquer "Complet" quand le maximum est atteint.

Données persistées dans `data/data.json` au format JSON:

```json
{
  "participants": [ { "id": "...", "name": "Alice", "adults": 2, "children": 1 } ],
  "dishes": [ { "id": "...", "name": "Salade", "maxPeople": 2, "contributors": ["participantId1"] } ]
}
```

---

## 🎉 Page d'inscription autonome (envoyable par courriel)

### Fichiers autonomes

Deux fichiers HTML 100% autonomes (pas de serveur requis) :

1. **`inscription.html`** - Page d'inscription pour les invités
2. **`admin.html`** - Page d'administration pour voir les inscriptions

### Caractéristiques

✅ **Autonome** - Aucun serveur requis, fonctionne directement dans le navigateur  
✅ **Stockage local** - Les données sont stockées dans le localStorage du navigateur  
✅ **Design festif** - Interface moderne et responsive  
✅ **Export de données** - CSV et JSON disponibles  
✅ **Prêt à envoyer** - Peut être envoyé par courriel et ouvert directement  

### 📧 Comment distribuer par courriel

**Option 1 - Hébergement recommandé (meilleur pour plusieurs utilisateurs):**

1. Héberger les fichiers sur un service gratuit :
   - **GitHub Pages** (gratuit, recommandé)
   - **Netlify** (gratuit)
   - **Vercel** (gratuit)
   - **Azure Static Web Apps** (gratuit)

2. Partager le lien par courriel :
   ```
   Inscrivez-vous à notre potluck du Jour de l'an !
   https://[votre-site].github.io/inscription.html
   ```

**Option 2 - Fichier attaché (pour petit groupe):**

1. Attacher `inscription.html` au courriel
2. Les invités ouvrent le fichier localement
3. ⚠️ **Limitation** : Chaque personne aura son propre stockage local (les données ne seront pas partagées entre invités)

### 🚀 Déploiement sur GitHub Pages (gratuit)

```powershell
# 1. Créer un repo GitHub
git init
git add inscription.html admin.html
git commit -m "Add registration pages"
git branch -M main
git remote add origin https://github.com/[votre-username]/potluck.git
git push -u origin main

# 2. Activer GitHub Pages dans Settings > Pages
# 3. Choisir la branche 'main' et le dossier root
# 4. Votre site sera accessible à https://[votre-username].github.io/potluck/inscription.html
```

### 🌐 Déploiement sur Netlify (drag & drop, 30 secondes)

1. Aller sur [netlify.com](https://netlify.com)
2. Se connecter (gratuit)
3. Glisser-déposer `inscription.html` et `admin.html`
4. Obtenir un lien comme `https://[random-name].netlify.app/inscription.html`

### 📊 Accès administrateur

Pour voir les inscriptions :
- Ouvrir `admin.html` dans le même navigateur que celui utilisé pour les inscriptions
- Ou héberger `admin.html` avec un lien protégé
- Exporter les données en CSV ou JSON

### ⚠️ Important - Stockage des données

**localStorage** :
- Les données sont stockées dans le navigateur
- Persistent entre les sessions
- Partagées seulement si même navigateur/ordinateur
- **Pour partage multi-utilisateurs** : héberger sur un serveur web (les données seront visibles par tous)

**Si vous avez besoin d'un vrai backend** :
- Utilisez l'application Node.js complète (serveur Express + JSON)
- Ou déployez sur Azure/Heroku avec une vraie base de données

### 🎨 Personnalisation

Modifiez directement dans `inscription.html` :
- **Date** : Ligne 49 - `📅 <strong>Date :</strong> 31 décembre 2025`
- **Lieu** : Ligne 50 - `📍 <strong>Lieu :</strong> [À compléter]`
- **Couleurs** : Sections `background: linear-gradient(...)` dans le CSS

### 💡 Conseils

1. **Pour un petit groupe (< 20 personnes)** : Hébergez sur GitHub Pages ou Netlify
2. **Pour un grand événement** : Utilisez l'application Node.js avec serveur
3. **Protection admin** : Changez le nom de `admin.html` en quelque chose de secret (ex: `admin-secret-xyz.html`)
4. **Sauvegarde** : Exportez régulièrement les données en CSV/JSON

---

## 📱 Support navigateurs

- ✅ Chrome/Edge (recommandé)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile (iOS/Android)

---

## 🆘 Support

Pour questions ou problèmes, ouvrir une issue ou contacter l'organisateur
