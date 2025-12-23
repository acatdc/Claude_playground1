# Onyx DEX Swap - Техническая спецификация Layout

## 1. Общая структура страницы

### 1.1 Layout архитектура
Страница построена на **двухколоночной системе** с фиксированной шириной контейнера:

```
┌─────────────────────────────────────────────────────┐
│ Header (full width)                                  │
├──────────────────────────┬───────────────────────────┤
│                          │                           │
│   Main Swap Area         │   Top Pools Sidebar       │
│   (60% width)            │   (40% width)             │
│                          │                           │
└──────────────────────────┴───────────────────────────┘
```

**Параметры контейнера:**
- Максимальная ширина: 1200px
- Минимальная ширина: 768px
- Padding по бокам: 24px
- Центрирование: margin 0 auto

### 1.2 Модульная сетка
- Базовая единица spacing: **8px**
- Производные: 12px (1.5×), 16px (2×), 24px (3×), 32px (4×)
- Gap между колонками: 24px
- Vertical rhythm: кратно 8px

---

## 2. Зоны интерфейса

### 2.1 Header (Навигационная панель)
**Высота:** 64px
**Layout:** Flexbox, justify-content: space-between

**Структура (слева направо):**
```
[Logo] ────────── [Menu] ────────── [Connect Wallet]
 120px             центр              180px
```

**Детали элементов:**

**Логотип (элемент #1):**
- Ширина: ~100px
- Высота иконки: 32px
- Margin-right: 16px

**Меню-гамбургер (элемент #2):**
- Размер кликабельной области: 40×40px
- Размер иконки: 24×24px
- Margin: auto (центрирование)

**Кнопка Connect Wallet (элемент #3):**
- Padding: 12px 20px
- Border-radius: 12px
- Минимальная ширина: 160px
- Height: 40px
- Gap между иконкой и текстом: 8px
- Размер иконки кошелька: 20×20px

**Spacing:**
- Padding контейнера: 12px 24px
- Vertical align: center

---

## 3. Main Swap Area (Левая колонка)

**Ширина:** 60% от контейнера (~720px при max-width)
**Padding:** 24px

### 3.1 Заголовок секции
**Высота блока:** 56px
**Layout:** Flex, justify-content: space-between

```
[Swap]                    [Settings] [Refresh]
h1, 22px                   24×24px    24×24px
```

**Элементы:**
- Заголовок "Swap" (элемент #4): font-size 22px, weight 600
- Иконка Settings (элемент #5): 24×24px, padding 8px (кликабельная область 40×40px)
- Иконка Refresh (элемент #6): 24×24px, padding 8px
- Gap между иконками: 8px

**Margin-bottom:** 16px

### 3.2 Swap Card (секции From + To)
**Общий контейнер:**
- Border-radius: 16px
- Padding: 20px
- Margin-bottom: 12px

#### 3.2.1 Секция "From" (элементы #7-13)
**Высота:** 92px

**Layout структура:**
```
From                           Balance: 0    [MAX]
label, 14px                    12px          button

┌──────────────────────────────────────────────────┐
│  10                           [icon] axlUSDC(... │
│  input, 18px                  selector, 16px     │
└──────────────────────────────────────────────────┘
```

**Детали:**

**Строка 1 (метаинформация):**
- Height: 20px
- Margin-bottom: 8px
- Layout: Flex, space-between

- Label "From" (элемент #7):
  - Font-size: 14px
  - Color: secondary text

- Balance + MAX (элементы #8, #9):
  - Layout: Flex, gap 8px
  - Balance font-size: 12px
  - MAX button: padding 4px 8px, border-radius 6px, font-size 12px

**Строка 2 (поле ввода):**
- Height: 56px
- Border-radius: 12px
- Padding: 12px 16px
- Layout: Flex, space-between, align-items center

- Input field (элемент #10):
  - Font-size: 18px
  - Font-weight: 500
  - Width: flex-grow
  - Border: none
  - Text-align: left

- Token selector (элементы #11-13):
  - Layout: Flex, gap 8px, align-items center
  - Width: auto
  - Padding: 8px 12px
  - Border-radius: 8px
  - Курсор: pointer

  - Icon (элемент #11): 24×24px
  - Token name (элемент #12): font-size 16px, weight 500
  - Dropdown arrow (элемент #13): 16×16px

**Margin-bottom после секции:** 8px

#### 3.2.2 Кнопка переключения (элемент #14)
**Размеры:**
- Width × Height: 40×40px
- Border-radius: 50% (круг)
- Icon size: 20×20px
- Position: между секциями, центрирование по горизонтали

**Spacing:**
- Margin: -20px auto (наложение на границу между секциями)
- Z-index: 10

#### 3.2.3 Секция "To" (элементы #15-21)
**Идентична структуре "From":**
- Height: 92px
- Те же отступы и размеры
- Layout аналогичный секции From

**Единственное отличие:**
- Input field (элемент #18): read-only, calculated value
- Font-size может быть адаптивным (12-16px) для длинных чисел

### 3.3 Информационная панель (элементы #22-30)
**Высота блока:** ~140px
**Padding:** 16px
**Border-radius:** 12px
**Margin-bottom:** 12px

**Layout:** Grid, 2 columns для компактности

```
Rate: 1 axlUSDC = 0.362775 GNK    |    Slippage: 0.1%
Min. Received: 3.624118 GNK       |

Direct AMM  0.9%                       [Details ▼]
```

**Структура:**

**Строка 1 (Rate + Slippage):**
- Height: 32px
- Grid: 2 columns (70% / 30%)
- Gap: 16px
- Margin-bottom: 8px

- Rate (элементы #22-23):
  - Label font-size: 12px, secondary color
  - Value font-size: 14px, может быть multi-line
  - Layout: inline, label + value

- Slippage (элементы #24-25):
  - Label: 12px, secondary
  - Value: 14px, weight 500
  - Layout: Flex, space-between внутри ячейки
  - Alignment: right

**Строка 2 (Min. Received):**
- Height: 24px
- Margin-bottom: 12px
- Label (элемент #26): 12px
- Value (элемент #27): 14px, weight 500

**Строка 3 (Route info):**
- Height: 32px
- Layout: Flex, space-between, align-items center

- Direct AMM (элемент #28):
  - Font-size: 14px
  - Weight: 500

- Fee percentage (элемент #29):
  - Font-size: 14px
  - Padding: 4px 8px
  - Border-radius: 6px
  - Margin-left: 8px

- Details button (элемент #30):
  - Padding: 6px 12px
  - Border-radius: 8px
  - Font-size: 14px
  - Icon: 16×16px

### 3.4 Primary Action Button (элемент #31)
**Размеры:**
- Width: 100% (full width родителя)
- Height: 56px
- Border-radius: 14px
- Padding: 16px 24px

**Typography:**
- Font-size: 16px
- Font-weight: 600
- Text-transform: none (сохранить регистр "Connect Wallet")

**Icon:**
- Size: 24×24px
- Margin-right: 8px
- Vertical-align: middle

**Margin-top:** 16px

---

## 4. Top Pools Sidebar (Правая колонка)

**Ширина:** 40% от контейнера (~456px при max-width)
**Padding:** 24px
**Border-radius:** 16px (если есть фоновый контейнер)

### 4.1 Заголовок (элемент #32)
**Размеры:**
- Font-size: 20px
- Font-weight: 600
- Margin-bottom: 16px
- Height: 28px

### 4.2 Pool Card (элементы #33-34)
**Размеры карточки:**
- Width: 100%
- Min-height: 140px
- Padding: 16px
- Border-radius: 12px
- Margin-bottom: 12px (между карточками)

**Layout:** Vertical stack

#### Структура Pool Card:

**Строка 1 (Header):**
- Height: 40px
- Layout: Flex, align-items center
- Gap: 12px
- Margin-bottom: 12px

```
[Icons overlap]  GNK/axlUSDC(neutron)
  40×40px        font-size 16px, weight 500
```

**Icons (overlapping):**
- Each icon: 32×32px
- Overlap: 8px (второй icon margin-left: -8px)
- Container width: 56px (32 + 32 - 8)

**Pool name:**
- Font-size: 16px
- Font-weight: 500
- Line-height: 1.2
- Max-width: calc(100% - 68px)

**Строка 2 (Subtitle):**
- Height: 20px
- Font-size: 12px
- Margin-bottom: 12px

**Строка 3-4 (Liquidity amounts):**
- Layout: Vertical stack
- Gap: 4px
- Margin-bottom: 12px

- Amount line height: 20px
- Font-size: 14px
- Weight: 400

**Строка 5 (Metrics):**
- Height: 36px
- Layout: Grid 2 columns
- Gap: 12px

```
30d fees:          APY (30d):
$2.24              0.83%
```

**Metric block:**
- Label font-size: 11px, secondary color
- Value font-size: 14px, weight 500
- Layout: vertical (label на value)
- Gap: 2px

---

## 5. Spacing System - Детализация

### 5.1 Vertical Spacing (сверху вниз)
```
Header: 64px
  ↓ gap 0px (header flush to content)
Main content padding-top: 24px
  ↓
Page title + icons: 56px
  ↓ margin 16px
Swap Card: ~208px
  (From: 92px + Switch: 8px + To: 92px + padding: 16px)
  ↓ margin 12px
Info Panel: 140px
  ↓ margin 16px
Action Button: 56px
  ↓ margin-bottom 24px
Total Main Area Height: ~560px
```

### 5.2 Horizontal Spacing
```
Page padding-left/right: 24px
  ↓
Main Area (60%): ~720px
  padding-left/right: 24px
  content width: ~672px

Gap between columns: 24px

Sidebar (40%): ~456px
  padding-left/right: 24px
  content width: ~408px
```

### 5.3 Internal Component Spacing

**Swap Card:**
- Container padding: 20px
- Gap между From и To: 8px (с учетом overlap кнопки)
- Label to input: 8px
- Input internal padding: 12px 16px

**Info Panel:**
- Container padding: 16px
- Row gap: 8px
- Column gap (grid): 16px

**Pool Card:**
- Container padding: 16px
- Icon to text: 12px
- Row gap: 4px (amounts)
- Metric grid gap: 12px

---

## 6. Typography Scale

### 6.1 Размеры (только layout relevance)
- **H1 (Page titles):** 22px, line-height 28px
- **H2 (Section titles):** 20px, line-height 26px
- **H3 (Card headers):** 16px, line-height 20px
- **Body Large (Input values):** 18px, line-height 24px
- **Body (Default text):** 14-16px, line-height 20px
- **Small (Labels, secondary):** 12px, line-height 16px
- **Tiny (Metadata):** 11px, line-height 14px

### 6.2 Font Weights (структурная иерархия)
- **600 (Semibold):** Headings, кнопки, важные значения
- **500 (Medium):** Input values, token names, metrics
- **400 (Regular):** Body text, labels, descriptions

---

## 7. Component Dimensions Reference

### 7.1 Buttons
| Type | Height | Padding (V×H) | Border-radius | Font-size |
|------|--------|---------------|---------------|-----------|
| Primary Large | 56px | 16×24px | 14px | 16px |
| Secondary | 40px | 12×20px | 12px | 14px |
| Small | 32px | 8×16px | 8px | 12px |
| Icon | 40×40px | 8px | 50% | — |
| Inline (MAX) | 24px | 4×8px | 6px | 12px |

### 7.2 Input Fields
| Type | Height | Padding | Border-radius | Font-size |
|------|--------|---------|---------------|-----------|
| Large (Swap) | 56px | 12×16px | 12px | 18px |
| Standard | 44px | 10×14px | 10px | 16px |

### 7.3 Cards/Containers
| Element | Padding | Border-radius | Min-height |
|---------|---------|---------------|------------|
| Swap Card | 20px | 16px | auto |
| Info Panel | 16px | 12px | 140px |
| Pool Card | 16px | 12px | 140px |
| Sidebar Container | 24px | 16px | auto |

### 7.4 Icons
| Usage | Size | Stroke |
|-------|------|--------|
| Header icons | 24×24px | 2px |
| Button icons | 20×24px | 1.5px |
| Token icons | 24-32px | — |
| Dropdown arrows | 16×16px | 1.5px |

---

## 8. Responsive Behavior

### 8.1 Breakpoints
- **Desktop (>= 1200px):** Full layout как описано
- **Tablet (768px - 1199px):** Пропорции колонок 55% / 45%
- **Mobile (<768px):** Одна колонка, Sidebar под Main Area

### 8.2 Mobile Layout (< 768px)
**Структура становится вертикальной:**
```
┌─────────────────────┐
│ Header              │
├─────────────────────┤
│ Main Swap Area      │
│ (100% width)        │
├─────────────────────┤
│ Top Pools Sidebar   │
│ (100% width)        │
└─────────────────────┘
```

**Адаптация:**
- Container padding: 16px (вместо 24px)
- Main Area padding: 16px (вместо 24px)
- Swap Card padding: 16px (вместо 20px)
- Button heights: сохраняются (tap targets)
- Font-sizes: сохраняются для читаемости
- Pool Cards: остаются полной ширины

**Sidebar на mobile:**
- Margin-top: 16px (отступ от Main Area)
- Показывать максимум 3 top pools (остальные - scroll или "Show more")

### 8.3 Adaptive Elements
**Token selector на узких экранах:**
- Token name может сокращаться: "axlUSDC(...)" → иконка + ticker
- Min-width selector: 80px

**Info Panel на mobile:**
- Grid может схлопываться в одну колонку если < 400px
- Сохранить двухколоночность при возможности для компактности

**Input values:**
- Длинные числа: font-size адаптивный 14-18px
- Использовать overflow: hidden + text-overflow: ellipsis при необходимости

---

## 9. Z-Index Hierarchy

**Layering для корректного наложения:**
```
Modal overlays: 1000
Dropdown menus: 100
Sticky header (если будет): 50
Swap switch button: 10
Token selector dropdown: 5
Cards/containers: 1
Base layer: 0
```

---

## 10. Accessibility - Размеры для интерактивных элементов

**Минимальные tap/click targets (WCAG):**
- Кнопки: минимум 40×40px (соблюдено)
- Иконки: кликабельная область 40×40px (padding вокруг иконки 24px)
- Token selectors: высота 56px (достаточно)
- Checkbox/radio (если будут): 24×24px с padding

**Focus states:**
- Outline offset: 2px
- Outline width: 2px
- Border-radius соответствует элементу

---

## 11. Grid System Summary

**12-column grid для контента:**
- Main Swap Area: 7 columns (58.3%)
- Gap: 0.5 column (4.2%)
- Top Pools Sidebar: 4.5 columns (37.5%)

**Альтернатива: Flexbox с процентами**
- Main: flex-basis 60%, max-width 720px
- Gap: 24px fixed
- Sidebar: flex-basis 40%, max-width 480px

**Выбор:** Flexbox предпочтительнее для данного layout (проще управление и gap)

---

## 12. Все элементы - Checklist размещения

### Header (3 элемента) ✓
- [x] #1 Logo - левый край
- [x] #2 Menu - центр
- [x] #3 Connect Wallet - правый край

### Main Area Title (3 элемента) ✓
- [x] #4 "Swap" heading - слева
- [x] #5 Settings icon - справа
- [x] #6 Refresh icon - справа от Settings

### Swap From Section (7 элементов) ✓
- [x] #7 "From" label
- [x] #8 Balance display
- [x] #9 MAX button
- [x] #10 Amount input
- [x] #11 Token icon
- [x] #12 Token name
- [x] #13 Dropdown arrow

### Switch Button (1 элемент) ✓
- [x] #14 Swap direction toggle

### Swap To Section (7 элементов) ✓
- [x] #15 "To" label
- [x] #16 Balance display
- [x] #17 MAX button
- [x] #18 Amount output (calculated)
- [x] #19 Token icon
- [x] #20 Token name
- [x] #21 Dropdown arrow

### Info Panel (9 элементов) ✓
- [x] #22 "Rate:" label
- [x] #23 Rate value
- [x] #24 "Slippage:" label
- [x] #25 Slippage value
- [x] #26 "Min. Received:" label
- [x] #27 Min amount value
- [x] #28 "Direct AMM" text
- [x] #29 Fee percentage
- [x] #30 "Details" button

### Action Button (1 элемент) ✓
- [x] #31 "Connect Wallet" / "Swap" button

### Top Pools (3+ элементы) ✓
- [x] #32 "Top Pools" heading
- [x] #33 Pool 1 card (8 sub-elements)
- [x] #34 Pool 2 card (8 sub-elements)
- [ ] Pool 3+ (опционально, по необходимости)

**Всего: 34 основных элемента размещены**

---

## 13. Performance Considerations

### Layout Optimization
- **Avoid layout shifts:** зарезервировать пространство для calculated amounts
- **Fixed heights где возможно:** Pool cards min-height для стабильности
- **Lazy loading:** если > 5 pools, виртуализация списка

### Paint/Composite
- **Transform для анимаций:** button hover использует transform, не margin
- **Will-change:** только на активных элементах (modals при открытии)
- **Containment:** `contain: layout` на Cards для изоляции reflow

---

**Конец технической спецификации Layout**
