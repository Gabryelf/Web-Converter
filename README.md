
<div align="center">
  <img src="https://img.shields.io/badge/version-0.0.3-blue?style=for-the-badge&logo=github" alt="Version"/>
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
</div>

<div align="center">
  <h1>⚡ ConvertPro</h1>
  <h3>Универсальный конвертер и редактор мультимедиа</h3>
  <p>
    <strong>Конвертируйте, редактируйте, улучшайте ваши медиафайлы</strong>
  </p>
</div>

<br/>

<div align="center">
  <img src="https://github.com/Gabryelf/Web-Converter/blob/main/docs/screen_1.png" alt="ConvertPro Preview" style="border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);"/>
</div>

<br/>

## ✨ Особенности

### 🎯 Конвертер
- 🖼️ **Конвертация в GIF** с настройкой FPS (5-60), качества и размера
- 🎬 **Конвертация в WebM** с высоким качеством
- 🎵 **Конвертация в WAV** из любых аудиоформатов
- ✂️ **Обрезка видео** по времени (выбор начала и длительности)
- 👁️ **Предпросмотр** выбранной области

### 🎨 Редактор
- ✂️ **Обрезка видео** с визуальным отображением области
- 🎭 **7+ эффектов**:
  - ⚫ Черно-белый
  - 🟫 Сепия
  - ☀️ Яркость
  - 🌓 Контраст
  - 🌫️ Размытие
  - 📱 Пикселизация
  - 🎨 Инверсия
- 🎚️ **Регулировка интенсивности** эффектов
- 🎵 **Работа с аудио**:
  - Оставить оригинал
  - Удалить звук
  - Заменить на свой
- 🏷️ **Водяные знаки**:
  - Текстовые с настройкой цвета и прозрачности
  - Изображения с прозрачностью

### 🎛️ Настройки
- 📐 **Размеры**: от 320x240 до 1280x720
- 📊 **Качество**: Низкое, Среднее, Высокое, Ультра
- ⏱️ **FPS**: 5, 10, 15, 24, 30, 60
- 🎚️ **Интенсивность эффектов**: 0-100%

<br/>


### 🌐 Онлайн версия

[🌍 Открыть онлайн демо](https://gabryelf.github.io/Web-Converter/)

<br/>

## 🛠️ Технологии

<div align="center">
  <table>
    <tr>
      <td align="center"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" width="60" height="60"/><br/><b>HTML5</b></td>
      <td align="center"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" width="60" height="60"/><br/><b>CSS3</b></td>
      <td align="center"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" width="60" height="60"/><br/><b>JavaScript ES6+</b></td>
    </tr>
  </table>
</div>

**Используемые библиотеки:**
- [Gifshot](https://github.com/yahoo/gifshot) - Создание GIF анимаций
- [Google Fonts](https://fonts.google.com/specimen/Inter) - Шрифт Inter

<br/>

## 📂 Структура проекта

```
convertpro/
├── index.html              # Главная страница
├── css/
│   ├── main.css           # Главный файл стилей
│   ├── base.css           # Базовые стили
│   ├── layout.css         # Структура страницы
│   ├── tabs.css           # Стили вкладок
│   ├── sidebar.css        # Стили сайдбара
│   ├── canvas.css         # Стили канваса
│   ├── components.css     # Общие компоненты
│   └── editor.css         # Стили редактора
├── js/
│   ├── main.js            # Точка входа
│   ├── config.js          # Конфигурация
│   ├── state.js           # Глобальное состояние
│   ├── utils.js           # Утилиты
│   ├── tabs-manager.js    # Управление вкладками
│   ├── ui/
│   │   └── ui-controller.js # Управление UI
│   └── modules/
│       ├── converter/
│       │   ├── gif-converter.js
│       │   ├── webm-converter.js
│       │   └── audio-converter.js
│       └── editor/
│           └── video-processor.js
└── libs/
    └── gifshot.min.js
```

<br/>

## 📸 Скриншоты

<div align="center">
  <table>
    <tr>
      <td><img src="https://github.com/Gabryelf/Web-Converter/blob/main/docs/screen_1.png" alt="Converter Tab"/></td>
      <td><img src="https://github.com/Gabryelf/Web-Converter/blob/main/docs/screen_1.png" alt="Editor Tab"/></td>
    </tr>
    <tr>
      <td><em>Вкладка Конвертера</em></td>
      <td><em>Вкладка Редактора</em></td>
    </tr>
  </table>
</div>

<br/>

## 🎮 Использование

### Конвертер
1. 📁 **Загрузите файл** - нажмите на область загрузки или перетащите файл
2. ⚙️ **Настройте параметры** - выберите формат, FPS, качество, размер
3. ✂️ **Выберите область** - установите начало и длительность захвата
4. 👁️ **Предпросмотр** - проверьте выбранную область
5. 🔄 **Нажмите "Конвертировать"**
6. ⬇️ **Скачайте результат**

### Редактор
1. 🎬 **Загрузите видео** - переключитесь на вкладку "Редактор" и загрузите видео
2. 🎨 **Примените эффекты** - выберите эффект и настройте интенсивность
3. ✂️ **Обрежьте видео** - установите начало и конец
4. 🎵 **Настройте аудио** - выберите действие с звуковой дорожкой
5. 🏷️ **Добавьте водяной знак** - текст или изображение
6. 🎬 **Нажмите "Применить изменения"** или **"Экспортировать"**

<br/>

## 🔥 Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| `Ctrl+1` | Переключиться на вкладку "Конвертер" |
| `Ctrl+2` | Переключиться на вкладку "Редактор" |
| `Ctrl+Enter` | Запустить конвертацию/экспорт |
| `Ctrl+R` | Сбросить все настройки |
| `Space` | Воспроизвести/остановить предпросмотр |

<br/>


## 🙏 Благодарности

- [Gifshot](https://github.com/yahoo/gifshot) за отличную библиотеку для создания GIF
- [Google Fonts](https://fonts.google.com/) за красивые шрифты
- Всем контрибьюторам и пользователям ❤️

<br/>

<div align="center">
  <p>
    <strong>⭐ Поставьте звезду, если вам понравился проект!</strong>
  </p>
  <p>
    <a href="https://github.com/Gabryelf/Web-Converter/issues">Сообщить о проблеме</a> •
    <a href="https://github.com/Gabryelf/Web-Converter/discussions">Обсуждения</a> •
    <a href="https://github.com/Gabryelf/Web-Converter/wiki">Wiki</a>
  </p>
  <p>
    Сделано с ❤️ в России
  </p>
</div>
