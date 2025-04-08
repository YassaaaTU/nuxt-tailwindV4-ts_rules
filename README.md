# Nuxt TailwindV4 + DaisyUI + Eslint boilerplate template

## Overview
`nuxt-tailwindV4-ts_rules` is a project setup with Nuxt.js and Tailwind CSS v4, incorporating TypeScript ESLint rules and stylistic rules (that may or may not work correctly 🤷🏻‍♂️). This repository serves as a boilerplate for building modern web applications with a focus on performance, scalability, and maintainability. Additionally, it enforces the use of the Bun package manager for managing dependencies.

## Features
- **Nuxt.js**: A powerful framework for building server-side rendered Vue.js applications.
- **Tailwind CSS v4**: A utility-first CSS framework for rapid UI development.
- **Bun Package Manager**: Enforced for managing project dependencies.
- **ESLint**: Applied TypeScript linting rules and stylistic rules.
- **DaisyUI**: Tailwind CSS plugin for additional UI components.
- **Theme Switching**: DaisyUI theme switching functionality implemented in `app/plugins/theme.client.ts` and a pinia store.
- **GitHub Copilot LLM File**: Includes `daisyui.md` in the `.vscode` directory to help with generating DaisyUI content with AI.
- **Recommended VS Code Extensions**: A workspace file is provided that recommends cool VS Code extensions to use.

## Getting Started

### Prerequisites
- Node.js (>= 14.x)
- Bun Package Manager
- VS Code (for recommended extensions)

### Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/YassaaaTU/nuxt-tailwindV4-ts_rules.git
    cd nuxt-tailwindV4-ts_rules
    ```
2. Install dependencies using Bun:
    ```bash
    bun install
    ```

### Running the Project
To start the development server, run:
```bash
bun dev
