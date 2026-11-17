# Калькулятор практичности ПО (React)

## Локальный запуск
Требуется Node.js 20+.

```bash
npm install
npm run dev
```

## Сборка
```bash
npm run build
```
Файлы сайта появятся в `dist/`.

## Публикация на GitHub Pages
1. Создайте GitHub-репозиторий и загрузите содержимое этой папки.
2. Откройте Settings → Pages.
3. Выберите GitHub Actions в разделе Build and deployment.
4. Добавьте `.github/workflows/deploy.yml` из примера ниже и отправьте его в ветку `main`.
5. После успешного workflow сайт будет доступен по адресу `https://ВАШ-ЛОГИН.github.io/ИМЯ-РЕПОЗИТОРИЯ/`.

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
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
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Модель и допущения
- Начальные значения x1–x27 нормированы на [0;1].
- z1–z5 рассчитываются по формуле из примера: `z(t)=clamp((b+g*100t)/m,0,1)`.
- f1–f81 — кубические полиномы `a*u^3+b*u^2+c*u+d`; по умолчанию `f(u)=u`.
- Численное интегрирование — метод Рунге — Кутты 4-го порядка.
- В исходной модели F1–F5 не определены. Калькулятор использует среднее арифметическое как явно обозначенное техническое допущение.
- Знаки возмущений перенесены из записанных уравнений. В документе есть противоречие: z названы неблагоприятными, но в нескольких уравнениях стоят положительные знаки. Это нужно согласовать до научного использования результатов.
- Множитель 0,1 взят из присланного примера кода.
