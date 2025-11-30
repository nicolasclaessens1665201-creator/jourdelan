# 🚀 Déploiement GitHub

## Étape 1 : Créer le repository sur GitHub

### Via le site web (recommandé)
1. Aller sur https://github.com
2. Cliquer sur le **+** en haut à droite → **New repository**
3. Configurer :
   - **Repository name** : `Jourdelan` ou `potluck-jourdelan`
   - **Description** : Application pour organiser le potluck du Jour de l'an
   - **Public** ou **Private** : selon votre préférence
   - ⚠️ **NE PAS** cocher "Initialize with README" (on a déjà les fichiers)
4. Cliquer sur **Create repository**

### Via GitHub CLI (optionnel)
```powershell
# Installer GitHub CLI si nécessaire
winget install GitHub.cli

# Se connecter
gh auth login

# Créer le repo
gh repo create Jourdelan --public --source=. --remote=origin --push
```

## Étape 2 : Pousser le code sur GitHub

Copier les commandes affichées sur GitHub après création du repo, OU utiliser :

```powershell
cd "c:\Users\nicol\Jourdelan"

# Ajouter le remote (remplacer VOTRE-USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/VOTRE-USERNAME/Jourdelan.git

# Pousser le code
git push -u origin main
```

Si vous avez une erreur d'authentification, GitHub vous demandera de vous connecter.

## Étape 3 : Activer GitHub Pages (pour inscription.html et admin.html)

1. Aller sur votre repo : `https://github.com/VOTRE-USERNAME/Jourdelan`
2. Cliquer sur **Settings** (onglet en haut)
3. Dans le menu de gauche, cliquer sur **Pages**
4. Sous "Source", sélectionner :
   - **Branch** : `main`
   - **Folder** : `/ (root)`
5. Cliquer sur **Save**
6. Attendre 1-2 minutes

Votre site sera disponible à : `https://VOTRE-USERNAME.github.io/Jourdelan/inscription.html`

## 🔗 URLs disponibles

Après activation de GitHub Pages :

- **Page d'inscription** : `https://VOTRE-USERNAME.github.io/Jourdelan/inscription.html`
- **Page admin** : `https://VOTRE-USERNAME.github.io/Jourdelan/admin.html`
- **Application complète** : Reste sur Azure (`https://potluck-jourdelan.azurewebsites.net`)

## 📧 Partager les liens

Envoyez ce message :

```
Bonjour,

Inscrivez-vous au Potluck du Jour de l'an !

🎉 Formulaire d'inscription :
https://VOTRE-USERNAME.github.io/Jourdelan/inscription.html

📱 Application complète (avec gestion des plats) :
https://potluck-jourdelan.azurewebsites.net

Au plaisir de vous voir !
```

## 🔄 Mettre à jour le code

Quand vous faites des modifications :

```powershell
cd "c:\Users\nicol\Jourdelan"

# Voir les changements
git status

# Ajouter les modifications
git add .

# Commiter avec un message
git commit -m "Description de vos changements"

# Pousser sur GitHub
git push

# Déployer aussi sur Azure (si nécessaire)
az webapp up --name potluck-jourdelan --resource-group rg-potluck
```

## 📊 Bonus : Actions GitHub (CI/CD automatique vers Azure)

Pour déployer automatiquement sur Azure à chaque push GitHub :

1. Dans Azure, obtenir les credentials de déploiement :
```powershell
az webapp deployment list-publishing-profiles --name potluck-jourdelan --resource-group rg-potluck --xml
```

2. Sur GitHub :
   - Aller dans **Settings** → **Secrets and variables** → **Actions**
   - Cliquer sur **New repository secret**
   - Nom : `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Valeur : coller le XML obtenu à l'étape 1

3. Créer le fichier `.github/workflows/azure.yml` :

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Deploy to Azure WebApp
      uses: azure/webapps-deploy@v2
      with:
        app-name: potluck-jourdelan
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .
```

Maintenant, chaque `git push` déploiera automatiquement sur Azure ! 🎉

## ✅ Checklist complète

- [ ] Repository GitHub créé
- [ ] Code poussé sur GitHub (`git push`)
- [ ] GitHub Pages activé
- [ ] URLs testées et fonctionnelles
- [ ] Liens partagés par courriel
- [ ] (Optionnel) CI/CD configuré vers Azure

## 🆘 Problèmes courants

### Erreur d'authentification GitHub
```powershell
# Utiliser un Personal Access Token
# Aller sur GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
# Créer un token avec scope "repo"
# Utiliser le token comme mot de passe lors du push
```

### GitHub Pages ne fonctionne pas
- Vérifier que les fichiers sont bien à la racine (pas dans un sous-dossier)
- Attendre 2-3 minutes après activation
- Vérifier dans Settings → Pages que le déploiement est "Active"

### admin.html ne charge pas les données de l'API Azure
Dans `admin.html`, remplacer :
```javascript
const API_BASE = 'http://localhost:3000/api';
```
par :
```javascript
const API_BASE = 'https://potluck-jourdelan.azurewebsites.net/api';
```
