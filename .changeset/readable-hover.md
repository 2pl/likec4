---
'@likec4/diagram': patch
'@likec4/config': patch
'@likec4/vite-plugin': patch
'@likec4/style-preset': patch
'likec4': patch
---

Hovering an element or relationship label on a zoomed-out diagram now enlarges it until its text is readable, and lifts it above its neighbours. Enabled by default; turn it off with `webapp.readableHover: false` in the project config, the `readableHover` prop, or the new toggle in the view header.
