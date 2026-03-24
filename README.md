# Fantasy (прототип)

Минимальный вертикальный срез: **winit + wgpu + egui**, low-poly сцена «руины», камера от третьего лица, один NPC с диалогом.

## Требования

- Rust stable (проверено на 1.87+)
- macOS / Windows / Linux с поддержкой Metal / Vulkan / DX12

## Запуск

```bash
cargo run
```

Логи: `RUST_LOG=info cargo run` (по умолчанию почти без шума).

## Управление

| Действие | Клавиши |
|----------|---------|
| Вперёд / назад | W / S |
| Поворот | A / D |
| Диалог (рядом с NPC) | E |
| Закрыть диалог | Esc |

## Стек

- `wgpu` 25.x (совместим с `egui-wgpu`)
- `egui` / `egui-winit` / `egui-wgpu` для текста и окон
- `glam` для матриц

Шейдеры: `shaders/scene.wgsl`.
