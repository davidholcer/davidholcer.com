# Locomotive Scroll Integration

This application now uses [Locomotive Scroll](https://github.com/locomotivemtl/locomotive-scroll) for smooth scrolling animations instead of Framer Motion.

## What's Changed

1. **Replaced Framer Motion animations** with Locomotive Scroll data attributes
2. **Added smooth scrolling** throughout the application
3. **Enhanced performance** with hardware-accelerated animations

## How It Works

### LocomotiveScrollProvider Component
The main scroll container is wrapped with `LocomotiveScrollProvider` in `layout.tsx`. This initializes the smooth scrolling functionality.

### Data Attributes
Locomotive Scroll uses data attributes to control animations:

- `data-scroll` - Enables scroll animations on an element
- `data-scroll-speed` - Controls the scroll speed (positive = slower, negative = faster)
- `data-scroll-delay` - Adds delay to animations
- `data-scroll-section` - Defines a scroll section
- `data-scroll-sticky` - Makes an element sticky during scroll
- `data-scroll-target` - Targets a specific scroll container

### Examples

```tsx
// Basic scroll animation
<div data-scroll data-scroll-speed="0.5">
  This element moves slower than the scroll
</div>

// Sticky element
<div data-scroll data-scroll-sticky data-scroll-target="#scroll-container">
  This element stays in place
</div>

// Scroll section
<div data-scroll-section>
  <div data-scroll data-scroll-speed="0.2">
    Content with custom scroll speed
  </div>
</div>
```

## Custom Hook

A custom hook `useLocomotiveScroll` is available for programmatic control:

```tsx
import { useLocomotiveScroll } from '@/hooks/useLocomotiveScroll';

const { scrollTo, scrollToTop, update } = useLocomotiveScroll();

// Scroll to specific element
scrollTo('#section-1');

// Scroll to top
scrollToTop();

// Update scroll instance
update();
```

## Performance Benefits

- **Hardware acceleration** - Uses CSS transforms for better performance
- **Reduced bundle size** - Removed Framer Motion dependency
- **Smoother animations** - Native scroll-based animations
- **Better mobile performance** - Optimized for touch devices

## Configuration

The Locomotive Scroll configuration can be modified in `components/LocomotiveScroll.tsx`:

```tsx
locomotiveRef.current = new LocomotiveScroll({
  el: scrollRef.current,
  smooth: true,
  lerp: 0.1, // Linear interpolation (0-1)
  multiplier: 1, // Scroll speed multiplier
});
```

## Browser Support

Locomotive Scroll works in all modern browsers and gracefully degrades to normal scrolling in older browsers. 