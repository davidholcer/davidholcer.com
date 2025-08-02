# P5.js Fullscreen Guide

## Overview

The p5.js sketches in this project now support true fullscreen functionality that breaks free from DOM container limitations. When in fullscreen mode, the canvas can use the entire screen dimensions instead of being constrained by the iframe container.

## How It Works

### 1. Fullscreen Detection
- The sketch detects when fullscreen mode is requested (F key)
- Canvas dimensions are dynamically adjusted to use `window.screen.width` and `window.screen.height`
- The parent container is notified via `postMessage` to adjust its styling

### 2. Container Management
- The `P5Sketch` component listens for fullscreen messages from the iframe
- When fullscreen is enabled, the container expands to `100vw x 100vh`
- The container becomes `position: fixed` with `z-index: 9999` to overlay everything

### 3. Canvas Resizing
- The sketch's `setup()` function is overridden to handle fullscreen dimensions
- `windowResized()` is also overridden to maintain proper sizing
- Canvas automatically resizes when entering/exiting fullscreen

## Controls

### Keyboard Shortcuts
- **F**: Toggle fullscreen mode
- **ESC**: Exit fullscreen mode (when in fullscreen)
- **Space/N**: Reset composition
- **D**: Toggle dark mode
- **P**: Pause/unpause animation
- **R**: Toggle rotation
- **O**: Toggle opacity effects

### Mouse Controls
- **Click and drag**: Interact with shapes
- **Mouse wheel**: Zoom in/out
- **Click outside canvas**: Exit fullscreen (when in fullscreen mode)

## Technical Implementation

### API Route (`/api/sketch/[filename]/route.ts`)
- Injects fullscreen JavaScript into the sketch iframe
- Handles canvas resizing and fullscreen API calls
- Manages communication with parent window

### P5Sketch Component
- Listens for fullscreen messages from iframe
- Adjusts container styling based on fullscreen state
- Maintains proper iframe permissions for fullscreen

### CSS Fullscreen Styles
```css
body.fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
}
```

## Browser Compatibility

The fullscreen functionality works across modern browsers:
- **Chrome/Edge**: Full native fullscreen API support
- **Firefox**: Full native fullscreen API support
- **Safari**: Full native fullscreen API support
- **Fallback**: CSS-based fullscreen for older browsers

## Usage Example

```jsx
<P5Sketch 
  sketchPath="/assets/sketches/ccc.js"
  width={800}
  height={600}
  sketchWidth={1200}
  sketchHeight={900}
/>
```

The sketch will render at 1200x900 internally but display at 800x600 in the DOM. When fullscreen is activated, it will expand to use the full screen dimensions.

## Troubleshooting

### Fullscreen Not Working
1. Check if the iframe has proper permissions (`allow="fullscreen"`)
2. Ensure the sandbox allows fullscreen (`sandbox="allow-fullscreen"`)
3. Verify the browser supports the Fullscreen API

### Canvas Not Resizing
1. Check browser console for JavaScript errors
2. Verify the sketch's `windowResized()` function is being called
3. Ensure the canvas element is properly selected

### Performance Issues
1. Fullscreen mode uses higher resolution - consider reducing sketch complexity
2. Monitor frame rate in fullscreen mode
3. Check for memory leaks in long-running fullscreen sessions 