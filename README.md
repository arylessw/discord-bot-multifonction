# 🤖 Bot Discord Multifonction

Un bot Discord puissant et polyvalent offrant des fonctionnalités de modération, de gestion et d'utilitaires pour votre serveur.

## ✨ Fonctionnalités

### 🛡️ Modération
- **Sanctions**
  - `ban` - Bannir un membre
  - `kick` - Expulser un membre
  - `mute` - Mettre en sourdine un membre
  - `tempmute` - Mettre en sourdine temporairement un membre
  - `cmute` - Mettre en sourdine dans un canal spécifique
  - `tempcmte` - Mettre en sourdine temporairement dans un canal
  - `unmute` - Retirer la sourdine d'un membre
  - `cunmute` - Retirer la sourdine d'un canal
  - `sanctions` - Voir l'historique des sanctions
  - `clearsanctions` - Effacer les sanctions d'un membre

### 🎮 Gestion
- **Salons**
  - `createchannel` - Créer un nouveau salon
  - `editchannel` - Modifier les paramètres d'un salon
  - `tempvoc` - Gérer les salons vocaux temporaires
  - `cleanup` - Déconnecter tous les utilisateurs d'un salon vocal

- **Configuration**
  - `config` - Configurer les paramètres du serveur
  - `joinsettings` - Configurer les messages de bienvenue
  - `leavesettings` - Configurer les messages de départ
  - `autopublish` - Gérer la publication automatique
  - `rolemenu` - Gérer les menus de rôles

### 🛠️ Utilitaires
- `help` - Afficher l'aide des commandes
- `serverinfo` - Afficher les informations du serveur
- `userinfo` - Afficher les informations d'un utilisateur
- `snipe` - Voir le dernier message supprimé
- `calc` - Calculatrice

## 🚀 Installation

1. Clonez le repository :
```bash
git clone https://github.com/arylessw/discord-bot-multifonction.git
cd discord-bot-multifonction
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez le fichier `.env` (Enlever le .example) :
```env
TOKEN=votre_token_ici
```

4. Configurez l'ID du Owner, dans le dossier `data`, `owners.json` : 

```
{
  "owners": ["ID_ICI"]
} 
```

5. Démarrez le bot :
```bash
npm start
```

## ⚙️ Configuration

1. Créez une application sur le [Portail Développeur Discord](https://discord.com/developers/applications)
2. Activez les "Privileged Gateway Intents" dans la section "Bot"
3. Copiez le token du bot dans votre fichier `.env`
4. Invitez le bot sur votre serveur avec les permissions nécessaires

## 📝 Prérequis

- Node.js v16.9.0 ou supérieur
- npm (Node Package Manager)
- Un token de bot Discord valide

## 🔧 Permissions Requises

Le bot nécessite les permissions suivantes :
- Gérer les serveurs
- Gérer les rôles
- Gérer les salons
- Gérer les messages
- Gérer les membres
- Bannir des membres
- Expulser des membres
- Modérer les membres
- Voir les salons
- Envoyer des messages
- Lire l'historique des messages
- Utiliser des embeds
- Joindre des fichiers
- Ajouter des réactions

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Support

Pour toute question ou problème, n'hésitez pas à :
- Ouvrir une issue sur GitHub
- Rejoindre notre serveur de support Discord
- Contacter les développeurs

## 🙏 Remerciements

Merci à tous les contributeurs qui ont participé au développement de ce bot ! (Voici mon premier bot Discord que je publie, soyez donc indulgent.)
