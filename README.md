# 🏃 SlimKit 

![HTTPS](https://img.shields.io/badge/HTTPS-enabled-brightgreen)
![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20ECR%20%7C%20Bedrock-orange)
![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)

> **🔒 Live** : [https://slimkit.duckdns.org](https://slimkit.duckdns.org)

---

## 🤝 Honnêteté intellectuelle

Ce projet a été réalisé dans un **contexte d'apprentissage personnel**.

L'intégralité du **code applicatif** (frontend React, backend Node.js, logique métier) a été **générée par Claude (Anthropic)**.

En revanche, **Frédéric Junior EPESSE PRISO** a :
- Suivi et compris chaque étape du déploiement
- Provisionné l'infrastructure AWS **manuellement via AWS CLI et Terraform**
- Configuré le pipeline **CI/CD GitHub Actions** de A à Z
- Déployé l'application en **environnement de production réel**
- Configuré **HTTPS avec Let's Encrypt + DuckDNS**
- Résolu les problèmes rencontrés (Security Groups, IAM roles, DNS propagation...)
- Appris et appliqué des **compétences DevOps concrètes**

Ce projet est un **projet personnel d'apprentissage**, pas un projet professionnel.

---

## 📋 Description

SlimKit est une application web mobile-first qui aide à perdre du poids par la marche. Elle calcule un objectif quotidien de pas personnalisé selon l'âge, le poids et l'objectif de l'utilisateur, et propose une analyse nutritionnelle des repas par photo grâce à l'IA.

### Fonctionnalités
- **Onboarding en 3 étapes** : Profil → Groupe d'âge → Objectif
- **Calcul personnalisé** : Pas/jour, km, calories brûlées selon l'âge et l'objectif
- **Conseils adaptés** par tranche d'âge (20-29, 30-39, 40-49, 50-59, 60+)
- **Analyse IA des repas** : photo → calories, protéines, glucides, lipides, score santé
- **Propulsé par Claude Sonnet 4** via AWS Bedrock

---

## 🏗️ Architecture

### Infrastructure globale

```mermaid
flowchart TD
    Internet([🌐 Internet]) --> DNS

    DNS["🦆 DuckDNS\nslimkit.duckdns.org\n→ 1...237.13...238"]

    DNS --> EC2

    subgraph EC2["☁️ AWS EC2 t3.micro — eu-west-3 Paris"]
        Nginx["🔀 Nginx\nReverse Proxy\n:80 redirect → HTTPS\n:443 SSL Let's Encrypt"]

        Nginx --> Frontend
        Nginx --> Backend

        Frontend["⚛️ Docker: Frontend\nReact + Vite\n:8080"]
        Backend["🟢 Docker: Backend\nNode.js + Express\n:3001"]
    end

    Backend -->|IAM Role| Bedrock

    subgraph AWS["☁️ AWS Services"]
        Bedrock["🤖 AWS Bedrock\nClaude Sonnet 4\nAnalyse repas IA"]
        ECR["📦 AWS ECR\nslimkit/frontend\nslimkit/backend"]
    end

    style EC2 fill:#1a1a2e,stroke:#3B5BFC,color:#fff
    style AWS fill:#0d1117,stroke:#f59e0b,color:#fff
```

### Pipeline CI/CD

```mermaid
flowchart LR
    Dev["💻 WSL\ngit push"] --> GH

    subgraph GH["🔄 GitHub Actions"]
        direction TB
        J1["📦 Job 1: Build & Push\n• Checkout code\n• AWS credentials\n• Login ECR\n• Build images\n• Push to ECR"]
        J2["🚀 Job 2: Deploy\n• Copy docker-compose\n• SSH → EC2\n• docker pull\n• docker compose up -d"]
        J1 -->|needs: build| J2
    end

    GH --> ECR["📦 AWS ECR\nfrontend:latest\nbackend:latest"]
    ECR -->|docker pull| EC2["☁️ EC2\nApp en production\n✅ Live"]

    style GH fill:#0d1117,stroke:#2088FF,color:#fff
```

### Infrastructure Terraform

```mermaid
flowchart TD
    subgraph TF["🏗️ Terraform — eu-west-3"]
        subgraph NET["📡 Module Network"]
            VPC["VPC\n10.0.0.0/16"]
            SUB["Subnet public\n10.0.1.0/24\neu-west-3a"]
            IGW["Internet Gateway"]
            RTB["Route Table\n0.0.0.0/0 → IGW"]
            SG["Security Group\n:22 SSH\n:80 HTTP\n:443 HTTPS"]
        end

        subgraph COM["🖥️ Module Compute"]
            EC2["EC2 t3.micro\nUbuntu 24.04\n20Go gp3 chiffré"]
            EIP["Elastic IP\n15.237.135.238"]
            KP["Key Pair\nRSA 4096"]
            IAM["IAM Role\nBedrock + ECR"]
            ECRR["ECR Repos\nfrontend\nbackend"]
        end
    end

    VPC --> SUB --> IGW --> RTB --> SG --> EC2
    EC2 --> EIP
    EC2 --> KP
    EC2 --> IAM
    EC2 --> ECRR

    style TF fill:#1a1a2e,stroke:#7B42BC,color:#fff
    style NET fill:#0d1117,stroke:#22c55e,color:#fff
    style COM fill:#0d1117,stroke:#3B5BFC,color:#fff
```

---

## 🛠️ Stack technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| IA | AWS Bedrock (Claude Sonnet 4) |
| Conteneurs | Docker + Docker Compose |
| Registry | AWS ECR |
| Serveur | AWS EC2 t3.micro (Ubuntu 24.04) |
| IaC | Terraform 1.9.x |
| CI/CD | GitHub Actions |
| Reverse Proxy | Nginx |
| SSL | Let's Encrypt (Certbot) |
| DNS | DuckDNS |
| Région AWS | eu-west-3 (Paris) |

---

## 📚 Ce que j'ai appris en déployant ce projet

### 1. AWS & Cloud
- Création et gestion d'un compte AWS
- Configuration d'utilisateurs **IAM** avec le principe du moindre privilège
- Utilisation d'**AWS CLI** pour piloter l'infrastructure sans interface graphique
- Compréhension du réseau AWS : **VPC, Subnet, Internet Gateway, Route Table, Security Groups**
- Déploiement d'une instance **EC2** et connexion SSH
- Utilisation d'**AWS ECR** comme registry Docker privé
- Intégration d'**AWS Bedrock** pour utiliser des modèles IA en production
- Attachement de **IAM Roles** à une instance EC2 pour l'authentification sans clé

### 2. Terraform (Infrastructure as Code)
- Écriture de fichiers `.tf` avec une architecture **modulaire** (modules network/compute)
- Utilisation des **variables, outputs et tfvars**
- Commandes essentielles : `terraform init`, `plan`, `apply`
- Gestion du **state Terraform**
- Comprendre pourquoi l'IaC est préférable à la configuration manuelle

### 3. Docker & Conteneurs
- Écriture de **Dockerfiles** multi-stage (build + production)
- Utilisation de **Docker Compose** pour orchestrer plusieurs services
- Distinction entre image de développement et de production
- Build, tag et push d'images vers un **registry privé**
- Gestion des variables d'environnement dans les containers

### 4. CI/CD avec GitHub Actions
- Écriture d'un **workflow YAML** complet
- Gestion des **secrets GitHub** (AWS keys, SSH key, ECR registry...)
- Pipeline en 2 jobs : **Build & Push** → **Deploy**
- Utilisation d'**actions communautaires** (aws-actions, appleboy/ssh-action, scp-action)
- Déclenchement automatique sur `git push`
- Débogage de pipelines en échec via les logs

### 5. Linux & Administration système
- Navigation et gestion de fichiers sous **Ubuntu**
- Installation de paquets avec `apt`
- Gestion des services avec **systemd** (`systemctl start/enable/status`)
- Configuration de **Nginx** comme reverse proxy
- Gestion des permissions fichiers (`chmod 600`)

### 6. SSL/HTTPS & DNS
- Compréhension du fonctionnement des **certificats SSL/TLS**
- Utilisation de **Let's Encrypt** (autorité de certification gratuite)
- Utilisation de **Certbot** pour obtenir et configurer un certificat
- Validation par **challenge DNS TXT**
- Configuration d'un sous-domaine gratuit avec **DuckDNS**
- Propagation DNS et vérification avec `dig`

### 7. DevOps & Bonnes pratiques
- Séparation des environnements (dev/prod)
- Sécurisation des secrets (jamais dans le code)
- Architecture **frontend/backend** conteneurisée
- Principe du **reverse proxy** pour exposer les services
- Compréhension du flux complet : code → build → registry → déploiement

---

## 🗂️ Structure du projet

```
slimkit-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Pipeline CI/CD GitHub Actions
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Application React complète
│   │   └── main.jsx            # Point d'entrée React
│   ├── index.html
│   ├── vite.config.js
│   ├── nginx.conf              # Config Nginx dans le container
│   ├── package.json
│   └── Dockerfile              # Multi-stage: build + nginx
├── backend/
│   ├── server.js               # API Express + AWS Bedrock
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml          # Développement local
├── docker-compose.prod.yml     # Production (images ECR)
├── .gitignore
└── README.md
```

```
slimkit-infra/                  # Infrastructure Terraform
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars            # ⚠️ jamais sur Git
└── modules/
    ├── network/
    │   ├── main.tf             # VPC, Subnet, IGW, Routes, SG
    │   ├── variables.tf
    │   └── outputs.tf
    └── compute/
        ├── main.tf             # EC2, Key Pair, EIP, ECR
        ├── variables.tf
        ├── outputs.tf
        └── userdata.sh         # Script d'init EC2
```

---

## 🚀 Déploiement

Chaque `git push` sur la branche `main` déclenche automatiquement le pipeline :

```bash
git add .
git commit -m "feat: ma nouvelle fonctionnalité"
git push origin main
# → GitHub Actions build, push et déploie automatiquement
```

Surveiller le déploiement :
```bash
gh run watch --repo Whitedukecmr/slimkit-app
```

---

## 🔄 Renouvellement SSL

Le certificat Let's Encrypt expire le **02/09/2026**. Pour le renouveler :

```bash
sudo certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d slimkit.duckdns.org \
  --email chocobig505@gmail.com \
  --agree-tos
# Puis mettre à jour DuckDNS avec la nouvelle valeur TXT
sudo systemctl reload nginx
```

---

## 👤 Auteur

**Frédéric Junior EPESSE PRISO**
Alternant en systèmes, réseaux et cloud computing

- Déploiement, infrastructure et configuration : Frédéric Junior EPESSE PRISO
- Code applicatif : généré par [Claude](https://claude.ai) (Anthropic)
- Projet personnel d'apprentissage DevOps — Juin 2026
