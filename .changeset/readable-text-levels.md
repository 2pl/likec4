---
'@likec4/diagram': patch
'@likec4/config': patch
'@likec4/vite-plugin': patch
'@likec4/style-preset': patch
'@likec4/styles': patch
'likec4': patch
---

Readable text on zoomed-out diagrams now has levels, for presenting on a large screen: set `webapp.readableText` (or the `readableText` prop) to `"large"` or `"xlarge"`, or cycle through off, normal, large and extra large with the button in the view header. Titles are no longer magnified beyond the size at which they still fit whole in their elements.
