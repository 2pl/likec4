---
'@likec4/diagram': patch
'@likec4/config': patch
'@likec4/vite-plugin': patch
'likec4': patch
---

Magnifying titles and labels on zoomed-out diagrams can now be turned off: set `webapp.readableText: false` in the project config, pass `readableText={false}` to the diagram, or use the new toggle in the view header (saved per project).
