# Optics IDP: Internal Developer Portal 🚀

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![AWS](https://img.shields.io/badge/AWS-EKS_%7C_Bedrock-FF9900?logo=amazonaws)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?logo=terraform)](https://www.terraform.io/)

Optics IDP is an enterprise-grade Internal Developer Portal built to monitor Kubernetes (EKS) infrastructure and provide SREs with AI-driven root-cause analysis for failing pods.

> **Note for Reviewers:** To avoid hundreds of dollars in monthly AWS EKS and Bedrock costs, the live demo of this application runs in a **Mock Environment** (Serverless). However, the complete Infrastructure as Code (Terraform) and Kubernetes manifests are available in the `infra/` and `k8s/` directories, demonstrating a production-ready architecture.

## ✨ Key Features

- **🛡️ Edge-Level Security & RBAC:** Custom JWT-based SSO authentication running on Next.js Edge Middleware for zero-latency route protection.
- **📊 K8s Fleet Monitoring:** Real-time visualization of cluster health, node count, and Kubernetes versions.
- **🤖 Cloud SRE Assistant:** Integration with AWS Bedrock (Claude 3) to analyze `CrashLoopBackOff` and `OOMKilled` logs, providing instant actionable steps.
- **🏗️ Infrastructure as Code (IaC):** Complete Terraform modules to provision AWS VPC, EKS Clusters, and Managed Redis.
- **⚙️ CI/CD Pipeline:** GitHub Actions configured for automated linting, testing, and Docker image pushing to AWS ECR.

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, SWR (Data Fetching).
- **Backend:** Next.js Route Handlers, Redis (Caching), JWT Auth (jose).
- **AI / Cloud:** AWS Bedrock, AWS EKS.
- **DevOps / IaC:** Docker, Terraform, Kubernetes YAML, GitHub Actions, Husky (Git Hooks).

## 🚀 Running Locally (Mock Mode)

You can run this project locally without needing AWS credentials by using the built-in mock services.

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root directory:

```env
USE_MOCK_DATA=true
MOCK_BEDROCK=true
JWT_SECRET=your-secure-local-secret-key
```

### 3. Run the development server

```bash
npm run dev
```

### 4. Login Credentials

Open `http://localhost:3000` and login with test credentials:

- **Admin:** `admin001@maioli.dev.br`
- **Dev:** `dev001@maioli.dev.br`

## 📁 Repository Structure

- `/src` - Application source code (Frontend & API).
- `/infra` - Terraform modules for AWS provisioning.
- `/k8s` - Kubernetes deployment and service manifests.
- `/.github/workflows` - CI/CD pipelines.
- `/Dockerfile` - Multi-stage optimized container build.

---

_Architected and developed by [Irineu Marcelo Maioli](https://maioli.dev.br)._
