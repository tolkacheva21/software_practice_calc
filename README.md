
# Калькулятор практичности ПО

Веб-приложение для расчёта и анализа показателей практичности программного обеспечения. Разработано с использованием React и Vite.

## Технологии

- React
- JavaScript
- Vite
- CSS
- GitHub Pages

## Требования

Для локального запуска необходимы:

- Node.js 20.19+;
- npm.

## Локальный запуск

1. Клонируйте репозиторий:

```bash
git clone https://github.com/ВАШ-ЛОГИН/software_practice_calc.git
```

2. Перейдите в папку проекта:

```bash
cd software_practice_calc
```

3. Установите зависимости:

```bash
npm install
```

4. Запустите приложение:

```bash
npm run dev
```

После запуска приложение будет доступно по адресу, указанному в терминале (обычно http://localhost:5173).

## Сборка проекта

Для создания production-сборки выполните:

```bash
npm run build
```

Собранные файлы приложения появятся в папке `dist/`.

Для локальной проверки production-сборки:

```bash
npm run preview
```

## Публикация на GitHub Pages

Проект настроен для публикации на GitHub Pages с помощью GitHub Actions.

### 1. Настройка репозитория

Создайте репозиторий с названием:

`software_practice_calc`

Загрузите в него файлы проекта.

### 2. Настройка Vite

В файле `vite.config.js` должен быть указан путь к репозиторию:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/software_practice_calc/",
});
```

Если название репозитория изменится, необходимо изменить значение `base`.

### 3. Настройка GitHub Pages

1. Откройте репозиторий на GitHub.
2. Перейдите в Settings → Pages.
3. В разделе Build and deployment выберите GitHub Actions.

### 4. Настройка автоматической публикации

Создайте файл:

`.github/workflows/deploy.yml`

Добавьте в него следующий код:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 5. Запуск публикации

Отправьте изменения в ветку `main`:

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

После отправки изменений GitHub Actions автоматически выполнит сборку и публикацию проекта.

Статус публикации можно посмотреть во вкладке Actions репозитория.

После успешного завершения сайт будет доступен по адресу:

https://ВАШ-ЛОГИН.github.io/software_practice_calc/

## Модель и допущения

- Начальные значения показателей `x1–x27` нормированы на интервал `[0; 1]`.
- Возмущения `z1–z5` рассчитываются по формуле из примера:

  `z(t) = clamp((b + g * 100t) / m, 0, 1)`

- Вспомогательные функции `f1–f81` представлены кубическими полиномами:

  `f(u) = a * u³ + b * u² + c * u + d`

  По умолчанию используется функция `f(u) = u`.

- Численное интегрирование выполняется методом Рунге — Кутты 4-го порядка.
- В исходной модели функции `F1–F5` не определены. Калькулятор использует среднее арифметическое как явно обозначенное техническое допущение.
- Знаки возмущений перенесены из записанных уравнений. В документе присутствует противоречие: возмущения `z` названы неблагоприятными, но в нескольких уравнениях используются положительные знаки. Это необходимо согласовать перед научным использованием результатов.
- Множитель `0,1` взят из присланного примера кода.

## Структура проекта

```text
software_practice_calc/
│
├── public/
│
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── model.js
│   ├── modelData.js
│   └── styles.css
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```
