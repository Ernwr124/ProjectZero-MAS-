# 🌌 ProjectZero (pzero) — AI Orchestration Studio

**Official Website:** [www.pzero.kz](https://www.pzero.kz)

**Mission:** Создание локальной, высокопроизводительной среды для визуального проектирования и управления армиями автономных ИИ-агентов.
**Design Philosophy:** "Technical Noir" — минимализм, точность, модульность.

---

## 🛠 Tech Stack
- **Backend:** Node.js + Fastify (Local server & JSON API).
- **Frontend:** Single Page Application (SPA).
- **Logic:** Vanilla JS (ES Modules) — без тяжелых фреймворков.
- **Styling:** Tailwind CSS + Custom Engineering CSS.
- **Data:** Flat JSON files storage (External `~/.pzero/`).

---

## 📂 Project Structure (Modular Architecture)
Проект строго разделен на независимые компоненты для удобства редактирования:

### 🎨 Client-Side (`.pzero-client/public/js/`)
- `App.js`: **Оркестратор.** Управляет роутингом, глобальным состоянием, событиями мыши/клавиатуры и автосохранением.
- `components/`:
    - `Navbar.js`: Умная навигация с Breadcrumbs (`PZERO / AI_AGENTS / ...`).
    - `Dashboard.js`: Шапка и основные действия стартовой страницы.
    - `ProjectCard.js`: Компактная карточка проекта с логикой удаления.
    - `AgentCard.js`: Логика **AgentNode**. Snap-to-grid (20px), рендеринг портов, перетаскивание.
    - `ConnectionManager.js`: **Движок связей.** Отрисовка строгих ортогональных SVG-линий (изгибы под 90° по сетке).
    - `Toolbar.js`: Нижняя панель управления (Add Unit, Exit).
    - `Modal.js`: Центрированная панель создания проекта с техническими деталями.
    - `Inspector.js`: Боковая панель настройки параметров конкретного агента.
    - `Logo.js`: Интерактивный геометрический логотип (Legion Grid).

### 🖥 Backend-Side (`.pzero-client/bin/pzero.js`)
- Реализует API для CRUD операций:
    - `GET /api/projects`: Список всех армий.
    - `GET /api/projects/:id`: Загрузка конфигурации конкретной армии.
    - `PUT /api/projects/:id`: Сохранение узлов и связей.
    - `DELETE /api/projects/:id`: Уничтожение проекта.

---

## 🕹 UX & Canvas Mechanics
Для работы на холсте реализованы профессиональные механики:
1.  **Smart Zoom:** `Ctrl + Scroll` — зум строго в точку наведения курсора.
2.  **Panning:** `Ctrl + Left Mouse Drag` — перемещение всей доски.
3.  **Marquee Selection:** Зажатие мыши на пустом месте — прямоугольное выделение нескольких агентов.
4.  **Mass Action:** Нажатие `Backspace` или `Delete` удаляет все выделенные ноды (с подтверждением).
5.  **Snap-to-Grid:** Все элементы (ноды, изгибы линий) строго привязаны к сетке 20px.
6.  **Auto-save:** Каждые 30 секунд + сохранение при каждом изменении (создание связи, ввод текста).

---

## 🚀 Roadmap (Future Implementation)
1.  **Engine Execution (`runArmy()`):** Реализация обхода графа (DAG) и последовательного запуска агентов.
2.  **LLM Connectors:** Интеграция с локальной Ollama и облачным Alem AI.
3.  **Visual Feedback:** Анимация "активного процесса" внутри линий связи при выполнении задачи.

---

## 📝 Guidelines for AI Assistant
1.  **Strict Modularity:** Не добавляй HTML-код напрямую в `App.js` или `index.html`. Создавай новый компонент в `js/components/` или редактируй существующий.
2.  **Precision Styling:** Используй только `Zinc` палитру для Noir-эффекта. Все отступы должны быть кратны 4 или 20 (шаг сетки).
3.  **Event Handling:** Все глобальные слушатели (мышь, кнопки) должны инициализироваться в методе `setupCanvasControls` или `setupKeyboardControls` внутри `App.js`.

*Создано командой ProjectZero AI. Будущее автономно.*
