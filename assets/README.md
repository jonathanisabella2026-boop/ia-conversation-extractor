# Assets

## Iconos requeridos para build

Para compilar las versiones finales necesitas estos archivos en esta carpeta:

| Archivo | Formato | Tamaño recomendado | Plataforma |
|---------|---------|-------------------|------------|
| `icon.ico` | ICO | 256x256 | Windows |
| `icon.icns` | ICNS | 512x512 | macOS |
| `icon.png` | PNG | 512x512 | Linux / Universal |

### Generar desde SVG

Puedes convertir el `icon.svg` incluido:

**Windows (.ico):**
```bash
# Usando ImageMagick
magick convert icon.svg -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

**macOS (.icns):**
```bash
# Usando iconutil (macOS only)
mkdir icon.iconset
sips -z 16 16 icon.svg --out icon.iconset/icon_16x16.png
# ... (repetir para todos los tamaños)
iconutil -c icns icon.iconset
```

**Linux (.png):**
```bash
magick convert icon.svg -resize 512x512 icon.png
```

## Screenshots

Añade capturas de pantalla en `assets/screenshots/` para el README:
- `dark.png` — Modo oscuro
- `light.png` — Modo claro
- `blocks.png` — Editor de bloques
