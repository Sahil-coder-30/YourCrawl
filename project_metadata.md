# YourCrawl Project Metadata

## Overview
This file contains the complete metadata and structure of the YourCrawl project to be used as context for Claude.

## Directory Structure
```text
YourCrawl/
    Readme.md
    Frontend/
        .gitignore
        README.md
        eslint.config.js
        index.html
        package-lock.json
        package.json
        postcss.config.js
        vite.config.js
        public/
            favicon.svg
            icons.svg
        src/
            App.css
            App.jsx
            index.css
            main.jsx
            styles/
                variables.css
            components/
                Sidebar/
                    Sidebar.jsx
                ui/
                    button.jsx
                    checkbox.jsx
                    input.jsx
                    select.jsx
                    tabs.jsx
                Footer/
                    Footer.jsx
                StatCard/
                    StatCard.jsx
                TopNav/
                    TopNav.jsx
                AppLayout/
                    AppLayout.jsx
            data/
                mockData.js
            assets/
                hero.png
                react.svg
                vite.svg
            pages/
                Landing/
                    Landing.jsx
                Analysis/
                    Analysis.jsx
                Audits/
                    Audits.jsx
                Config/
                    Config.jsx
                Roadmap/
                    Roadmap.jsx
                Compliance/
                    Compliance.jsx
                Dashboard/
                    Dashboard.jsx
    Backend/
        .env
        .gitignore
        output.json
        package-lock.json
        package.json
        server.js
        screenshots/
            https___example_com_1776862314755.png
            https___jssuninoida_edu_in_home_1776867504382.png
            https___jssuninoida_edu_in_home_1776875007431.png
            https___jssuninoida_edu_in_home_1776875155095.png
            https___jssuninoida_edu_in_home_1776876340589.png
            https___jssuninoida_edu_in_home_1776879227725.png
            https___jssuninoida_edu_in_home_1776879694599.png
            https___jssuninoida_edu_in_home_1776937269071.png
            https___jssuninoida_edu_in_home_1776937668033.png
            https___jssuninoida_edu_in_home_1776937879488.png
            https___jssuninoida_edu_in_home_1776937926010.png
            https___jssuninoida_edu_in_home_1776938093641.png
            https___jssuninoida_edu_in_home_1776938402553.png
            https___www_apple_com_1776191733169.png
            https___www_apple_com_1776862394769.png
            https___www_sheryians_com__1776168161127.png
            https___www_sheryians_com__1776168492629.png
            https___www_sheryians_com__1776168837935.png
        scratch/
        src/
            app/
                app.js
            config/
                config.js
            middlewares/
            models/
            validators/
            controllers/
                crawl.controller.js
            routes/
                crawl.route.js
            services/
                ai.service.js
                crawl.service.js
    ML/
        .env
        .gitignore
        api.py
        config.py
        main.py
        mathur_dataset.tsv
        requirements.txt
        train.py
        training_data/
            batch_001.json
            batch_002.json
            batch_003.json
            batch_004.json
            batch_005.json
            batch_006.json
            batch_007.json
            batch_008.json
            batch_009.json
            batch_010.json
            batch_011.json
            batch_012.json
            batch_013.json
            batch_014.json
            batch_015.json
            batch_016.json
            batch_017.json
            batch_018.json
            batch_019.json
            batch_020.json
            batch_021.json
            batch_022.json
            batch_023.json
            batch_024.json
            batch_025.json
            batch_026.json
            batch_027.json
            batch_028.json
            batch_029.json
            batch_030.json
            batch_031.json
            batch_032.json
            batch_033.json
            batch_034.json
            batch_035.json
            batch_036.json
            batch_037.json
            batch_038.json
            batch_039.json
            batch_040.json
            batch_041.json
            batch_042.json
            batch_043.json
            batch_044.json
            batch_045.json
            batch_046.json
            batch_047.json
            batch_048.json
            labels.json
        output/
            __init__.py
            priority_scorer.py
            report_renderer.py
            roadmap_generator.py
        compliance/
            __init__.py
            clause_database.py
            mapper.py
            regulatory_data/
                clauses.json
        schemas/
            __init__.py
            compliance.py
            detection.py
            features.py
            input_schema.py
            output.py
        sample_data/
            alpha.json
            cookie_banner.json
            dark_checkout.json
            subscription_cancel.json
        scripts/
            convert_dataset.py
        extractors/
            __init__.py
            cv_agent.py
            nlp_agent.py
            spatial_agent.py
        detection/
            EU AI Act enforcement drives immediate enterprise demand (1).pdf
            __init__.py
            ensemble.py
            gemini_verify.py
            heuristic_rules.py

```

## Frontend Metadata
**Dependencies:**
```json
{
  "lucide-react": "^1.8.0",
  "react": "^19.2.5",
  "react-dom": "^19.2.5",
  "react-router-dom": "^7.14.2",
  "sonner": "^2.0.7"
}
```
**Dev Dependencies:**
```json
{
  "@eslint/js": "^9.39.4",
  "@tailwindcss/postcss": "^4.2.4",
  "@types/react": "^19.2.14",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^6.0.1",
  "eslint": "^9.39.4",
  "eslint-plugin-react-hooks": "^7.1.1",
  "eslint-plugin-react-refresh": "^0.5.2",
  "globals": "^17.5.0",
  "tailwindcss": "^4.2.4",
  "vite": "^8.0.9"
}
```
**Scripts:**
```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

## Backend Metadata
**Dependencies:**
```json
{
  "@langchain/cohere": "^1.0.4",
  "@langchain/core": "^1.1.41",
  "@langchain/google-genai": "^2.1.27",
  "@langchain/langgraph": "^1.2.9",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "imagekit": "^6.0.0",
  "langchain": "^1.3.3",
  "morgan": "^1.10.1",
  "nodemon": "^3.1.14",
  "puppeteer": "^24.42.0",
  "puppeteer-core": "^24.40.0",
  "zod": "^3.25.76"
}
```
**Dev Dependencies:**
```json
{}
```
**Scripts:**
```json
{
  "test": "echo \"Error: no test specified\" && exit 1",
  "dev": "npx nodemon server.js"
}
```

## ML Service Metadata
**Requirements.txt:**
```text
# Core
pydantic>=2.0
python-dotenv
numpy
pillow

# CV
ultralytics
transformers
torch
torchvision
open-clip-torch

# NLP
sentencepiece

# ML Ensemble
xgboost
lightgbm
shap
scikit-learn

# Output
jinja2

# Gemini API
google-generativeai

# API
fastapi
uvicorn[standard]
python-multipart

# Utilities
colorama
tqdm

```
