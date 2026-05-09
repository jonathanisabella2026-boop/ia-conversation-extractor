<div align="center">

# 📝 IA Conversation Extractor

**Convierte conversaciones con IA en documentos Markdown estructurados — 100% offline**

Desarrollado por **DIGITAL SolutJon**

[![Electron](https://img.shields.io/badge/Electron-30.0.0-47848F?logo=electron&logoColor=white)](https://electronjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](package.json)
[![Offline](https://img.shields.io/badge/Offline-Ready-brightgreen)]()

[📥 Descargar última versión](#-descargas) · [🚀 Cómo usar](#-uso) · [🛠️ Desarrollo](#%EF%B8%8F-desarrollo)

</div>

---

## ✨ Características

- 🔍 **Detección automática de roles** — Identifica quién habla (Usuario vs IA) en conversaciones de ChatGPT, Claude, Gemini, Copilot...
- 📄 **Plantillas inteligentes** — Completa, Técnica/Código, Creativa, Resumen Ejecutivo, Tutorial Paso a Paso
- ✂️ **Editor visual por bloques** — Selecciona, edita, reordena y filtra contenido antes de exportar
- 🖱️ **Drag & Drop** — Reordena bloques arrastrando
- ✏️ **Edición inline** — Modifica cualquier bloque sin salir de la app
- 🔎 **Búsqueda en tiempo real** — Filtra bloques por contenido
- 🌓 **Tema oscuro/claro** — Interfaz adaptable
- 📋 **Portapapeles integrado** — Pega conversaciones con un clic
- 💾 **Exportación nativa .md** — Guarda directamente en Markdown limpio
- 🌐 **100% Offline** — Sin conexión, sin cuentas, sin tracking

---

## 📥 Descargas

| Plataforma | Descarga | Estado |
|------------|----------|--------|
| Windows (Portable) | `.exe` | ✅ Disponible |
| macOS | `.dmg` | 🔄 Próximamente |
| Linux | `.AppImage` | 🔄 Próximamente |

> Las builds automáticas se generan vía GitHub Actions en cada release.

---

## 🚀 Uso

### 1. Desde release (Usuario final)
1. Descarga el `.exe` portable desde [Releases](../../releases)
2. Ejecuta — no requiere instalación ni internet

### 2. Desde código (Desarrolladores)
```bash
# Clonar
git clone https://github.com/tu-usuario/ia-conversation-extractor.git
cd ia-conversation-extractor

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# Compilar portable para Windows
npm run build:win
```

---

## 🛠️ Desarrollo

### Requisitos
- Node.js ≥ 18.x
- npm ≥ 9.x
- Windows 10/11 (para build nativo)

### Scripts disponibles
| Script | Descripción |
|--------|-------------|
| `npm start` | Ejecuta en modo desarrollo |
| `npm run build:win` | Compila `.exe` portable |
| `npm run build:mac` | Compila `.dmg` (requiere macOS) |
| `npm run build:linux` | Compila `.AppImage` |

### Estructura del proyecto
```
ia-conversation-extractor/
├── .github/               # GitHub Actions & templates
├── assets/                # Iconos e imágenes
├── src/
│   ├── index.html         # UI principal
│   ├── styles.css         # Estilos con tema oscuro/claro
│   └── app.js             # Lógica de extracción y exportación
├── main.js                # Proceso principal Electron
├── preload.js             # Bridge seguro IPC
├── package.json
└── README.md
```

---

## 📸 Screenshots

> Añade aquí capturas de pantalla en `assets/screenshots/` y actualiza los enlaces.

| Modo Oscuro | Modo Claro | Editor de Bloques |
|-------------|------------|-------------------|
| ![Dark](assets/screenshots/dark.png) | ![Light](assets/screenshots/light.png) | ![Blocks](assets/screenshots/blocks.png) |

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Lee [CONTRIBUTING.md](CONTRIBUTING.md) para empezar.

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcion`
3. Commit: `git commit -m "feat: añade nueva función"`
4. Push: `git push origin feature/nueva-funcion`
5. Abre un Pull Request

---

## 📝 Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para historial de versiones.

---

## 📄 Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).

Copyright (c) 2026 DIGITAL SolutJon

---

<div align="center">

**Hecho con ❤️ por DIGITAL SolutJon**

[⬆ Volver arriba](#-ia-conversation-extractor)

</div>
