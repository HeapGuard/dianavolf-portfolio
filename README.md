# Портфолио Дианы Вольф

Статичный сайт-портфолио на React + TypeScript + Vite. Он не хранит ключи, не содержит формы обратной связи и не имеет серверной базы данных: это уменьшает поверхность атаки и делает публикацию безопаснее.

## Запуск

```powershell
npm install
npm run dev
```

Для публикации создайте production-сборку:

```powershell
npm run build
```

Папку `dist/` можно загрузить в Cloudflare Pages, Netlify или Vercel. Для Cloudflare Pages укажите команды `npm run build` и каталог `dist`. Файл `public/_headers` будет опубликован как `_headers` и задаст CSP, запрет встраивания сайта в iframe и отключение ненужных разрешений браузера.

## Одна команда: GitHub + VPS

Для основного сайта используйте:

```powershell
python deploy.py "Обновить портфолио"
```

Скрипт работает только из ветки `main`: добавляет изменения, создаёт коммит, пушит его в GitHub, собирает сайт и публикует новый релиз на VPS. VPN он не трогает.

Локально создайте `deploy.config.json` (файл игнорируется Git):

```json
{
  "host": "ВАШ_IP_VPS",
  "user": "root",
  "port": 22,
  "ssh_key_path": "C:/Users/ВАШ_ПОЛЬЗОВАТЕЛЬ/.ssh/КЛЮЧ",
  "domain": "dianavolf.ru",
  "remote_root": "/var/www/dianavolf.ru",
  "caddy_service": "caddy-naive"
}
```

## Как добавить или изменить работу

1. Сохраните две или больше картинок работы в JPG (длинная сторона до 2000 px, качество 75-85%) и положите их в `src/media/`. Например: `coffee-cover.jpg` и `coffee-details.jpg`.
2. В начале [src/data/projects.ts](src/data/projects.ts) добавьте две строки:

   ```ts
   import coffeeCover from '../media/coffee-cover.jpg'
   import coffeeDetails from '../media/coffee-details.jpg'
   ```

3. Скопируйте в конец массива `projects` этот шаблон и замените значения:

   ```ts
   {
     id: 'coffee', number: '05', title: 'Coffee Brand',
     subtitle: 'Айдентика кофейни', year: '2026',
     tags: ['Branding', 'Print', 'Identity'],
     description: 'Коротко: какая была задача и что вы сделали.',
     cover: coffeeCover,
     images: [coffeeCover, coffeeDetails],
     theme: 'ink', // варианты: ink, wine, green, pulse
   },
   ```

4. Запустите `npm run build` перед публикацией. Карточка, hover-превью и полноценный кейс появятся автоматически.

Важно: не подменяйте старые файлы с тем же названием. Для новой работы используйте новые имена файлов и новый `id`.

Контакты и текст находятся в [src/main.tsx](src/main.tsx). Не размещайте в репозитории токены, пароли или файлы `.env`.
