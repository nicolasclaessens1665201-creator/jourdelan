# 🚀 Guide de déploiement Azure

## Option 1 : Azure App Service (Recommandé)

### Prérequis
```powershell
# Installer Azure CLI si pas déjà fait
winget install Microsoft.AzureCLI
# OU télécharger depuis https://aka.ms/installazurecliwindows

# Se connecter à Azure
az login
```

### Déploiement rapide via VS Code (plus simple)

1. **Installer l'extension Azure App Service** dans VS Code
2. Cliquer sur l'icône Azure dans la barre latérale
3. Cliquer sur "+" pour créer une nouvelle Web App
4. Suivre les instructions :
   - Nom unique pour votre app (ex: `potluck-jourdelan`)
   - Subscription : choisir votre abonnement
   - Runtime : Node 18 LTS
   - OS : Linux (recommandé) ou Windows
   - Region : Canada Central ou East US
5. Clic droit sur votre app → "Deploy to Web App"
6. Sélectionner le dossier `c:\Users\nicol\Jourdelan`

### Déploiement via Azure CLI

```powershell
cd "c:\Users\nicol\Jourdelan"

# Créer un groupe de ressources
az group create --name rg-potluck --location canadacentral

# Créer un App Service Plan (gratuit)
az appservice plan create --name plan-potluck --resource-group rg-potluck --sku F1 --is-linux

# Créer la Web App
az webapp create --resource-group rg-potluck --plan plan-potluck --name potluck-jourdelan --runtime "NODE:18-lts"

# Configurer le déploiement depuis un dossier local
az webapp up --name potluck-jourdelan --resource-group rg-potluck --runtime "NODE:18-lts"
```

Votre app sera disponible à : `https://potluck-jourdelan.azurewebsites.net`

### Configuration post-déploiement

```powershell
# Activer les logs
az webapp log config --name potluck-jourdelan --resource-group rg-potluck --application-logging filesystem --level information

# Voir les logs en temps réel
az webapp log tail --name potluck-jourdelan --resource-group rg-potluck
```

---

## Option 2 : Azure Static Web Apps (Pages statiques uniquement)

Pour déployer uniquement `inscription.html` et `admin.html` :

### Via Azure Portal

1. Aller sur https://portal.azure.com
2. Créer une ressource → Static Web Apps
3. Configuration :
   - Nom : `potluck-inscription`
   - Region : Canada Central
   - Deployment : GitHub (ou upload manuel)
4. Upload `inscription.html` et `admin.html`

### Via Azure CLI

```powershell
cd "c:\Users\nicol\Jourdelan"

# Créer un groupe de ressources
az group create --name rg-potluck-static --location canadacentral

# Créer Static Web App
az staticwebapp create --name potluck-inscription --resource-group rg-potluck-static --location canadacentral --source .

# Déployer les fichiers
az staticwebapp upload --name potluck-inscription --resource-group rg-potluck-static --app .
```

---

## Option 3 : Déploiement via Git

```powershell
cd "c:\Users\nicol\Jourdelan"

# Initialiser git si pas déjà fait
git init
git add .
git commit -m "Initial commit - Potluck app"

# Configurer le déploiement Git sur Azure
az webapp deployment source config-local-git --name potluck-jourdelan --resource-group rg-potluck

# Obtenir l'URL Git de déploiement
$gitUrl = az webapp deployment source show --name potluck-jourdelan --resource-group rg-potluck --query "repoUrl" -o tsv

# Ajouter Azure comme remote et pousser
git remote add azure $gitUrl
git push azure main
```

---

## 🔧 Configuration Azure pour votre app

### Variables d'environnement (si nécessaire)

```powershell
az webapp config appsettings set --name potluck-jourdelan --resource-group rg-potluck --settings PORT=8080 NODE_ENV=production
```

### Activer HTTPS uniquement

```powershell
az webapp update --name potluck-jourdelan --resource-group rg-potluck --https-only true
```

### Configurer un domaine personnalisé (optionnel)

```powershell
# Mapper votre domaine
az webapp config hostname add --webapp-name potluck-jourdelan --resource-group rg-potluck --hostname votredomaine.com

# Activer SSL gratuit
az webapp config ssl create --name potluck-jourdelan --resource-group rg-potluck --hostname votredomaine.com
```

---

## 📊 Monitoring

### Voir les métriques
```powershell
az monitor metrics list --resource "/subscriptions/{subscription-id}/resourceGroups/rg-potluck/providers/Microsoft.Web/sites/potluck-jourdelan"
```

### Application Insights (optionnel mais recommandé)
```powershell
# Créer Application Insights
az monitor app-insights component create --app potluck-insights --location canadacentral --resource-group rg-potluck

# Lier à la Web App
az webapp config appsettings set --name potluck-jourdelan --resource-group rg-potluck --settings APPINSIGHTS_INSTRUMENTATIONKEY=$(az monitor app-insights component show --app potluck-insights --resource-group rg-potluck --query instrumentationKey -o tsv)
```

---

## 💰 Coûts estimés

- **F1 (Free)** : Gratuit, 60 min CPU/jour, 1 GB RAM
- **B1 (Basic)** : ~13 CAD/mois, toujours actif
- **S1 (Standard)** : ~70 CAD/mois, autoscaling

Pour un potluck personnel, le plan **F1 gratuit** suffit !

---

## 🔄 Mise à jour de l'app

```powershell
cd "c:\Users\nicol\Jourdelan"

# Méthode 1 : Via Azure CLI
az webapp up --name potluck-jourdelan --resource-group rg-potluck

# Méthode 2 : Via Git
git add .
git commit -m "Update app"
git push azure main

# Méthode 3 : Via VS Code
# Clic droit sur l'app → Deploy to Web App
```

---

## 🆘 Dépannage

### Voir les logs d'erreur
```powershell
az webapp log tail --name potluck-jourdelan --resource-group rg-potluck
```

### Redémarrer l'app
```powershell
az webapp restart --name potluck-jourdelan --resource-group rg-potluck
```

### SSH dans le container (Linux)
```powershell
az webapp ssh --name potluck-jourdelan --resource-group rg-potluck
```

### Vérifier l'état
```powershell
az webapp show --name potluck-jourdelan --resource-group rg-potluck --query state
```

---

## 📧 Partager votre app déployée

Une fois déployée, envoyez ce lien par courriel :

```
🎉 Inscrivez-vous au Potluck du Jour de l'an !

Page d'inscription : https://potluck-jourdelan.azurewebsites.net/inscription.html

Application complète : https://potluck-jourdelan.azurewebsites.net

Au plaisir de vous voir !
```

---

## ✅ Checklist de déploiement

- [ ] Azure CLI installé et connecté (`az login`)
- [ ] Groupe de ressources créé
- [ ] Web App créée
- [ ] Code déployé
- [ ] HTTPS activé
- [ ] Logs configurés
- [ ] Test de l'URL publique
- [ ] Lien partagé par courriel
