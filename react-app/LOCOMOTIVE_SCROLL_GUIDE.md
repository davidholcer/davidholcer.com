# Locomotive Scroll Implementation Guide

This guide explains how Locomotive Scroll is implemented across all pages in your Next.js application.

## 🚀 Overview

Locomotive Scroll provides smooth scrolling and parallax effects across your entire application. It's implemented at the layout level, so it works on all pages automatically.

## 📁 File Structure

```
src/
├── components/
│   ├── LocomotiveScroll.tsx          # Main scroll provider
│   ├── SignatureNav.tsx              # Navigation with scroll effects
│   └── ThemeToggle.tsx               # Sticky theme toggle
├── hooks/
│   └── useScrollAnimation.ts         # Custom hook for easy animations
├── app/
│   ├── layout.tsx                    # Root layout with LocomotiveScroll
│   ├── page.tsx                      # Home page with parallax effects
│   ├── about/page.tsx                # About page with scroll animations
│   └── blog/page.tsx                 # Blog page with scroll effects
└── globals.css                       # Locomotive Scroll styles
```

## 🎯 How It Works

### 1. Layout Level Implementation
The `LocomotiveScrollProvider` wraps all content in `layout.tsx`, ensuring smooth scrolling works on every page.

### 2. Automatic Initialization
- Locomotive Scroll initializes automatically on client-side
- Handles route changes for Next.js
- Provides fallback scrolling if initialization fails

### 3. Cross-Page Compatibility
All pages automatically get smooth scrolling without additional setup.

## 🎨 Adding Scroll Animations

### Method 1: Data Attributes (Recommended)
Add these attributes to any element:

```tsx
<div data-scroll data-scroll-speed="0.5">
  This element moves slower than the scroll
</div>

<div data-scroll data-scroll-speed="-0.2">
  This element moves faster than the scroll (negative speed)
</div>

<div data-scroll data-scroll-delay="0.1">
  This element has a delay before animation starts
</div>
```

### Method 2: Custom Hook
Use the `useScrollAnimation` hook for programmatic control:

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

function MyComponent() {
  const scrollRef = useScrollAnimation({
    speed: 0.3,
    delay: 0.1,
    direction: 'up',
    threshold: 0.2
  });

  return (
    <div ref={scrollRef}>
      This element will animate on scroll
    </div>
  );
}
```

## 📄 Page-Specific Implementation

### Home Page (`page.tsx`)
- Hero section with `data-scroll-speed="0.5"`
- Project cards with varying speeds based on index
- Smooth parallax effects on all content

### About Page (`about/page.tsx`)
- Title with `data-scroll-speed="0.5"`
- Content sections with scroll animations
- Profile image with parallax effect

### Blog Page (`blog/page.tsx`)
- Blog title with scroll animation
- Article cards with smooth reveal effects
- Content sections with scroll-based animations

## 🎛️ Configuration Options

### Locomotive Scroll Settings
```tsx
{
  el: scrollRef.current!,
  smooth: true,           // Enable smooth scrolling
  lerp: 0.1,             // Linear interpolation (0-1)
  multiplier: 1,         // Scroll speed multiplier
  reloadOnContextChange: true  // Update on route changes
}
```

### Data Attributes
- `data-scroll` - Enable scroll animations
- `data-scroll-speed` - Animation speed (positive = slower, negative = faster)
- `data-scroll-delay` - Delay before animation starts
- `data-scroll-section` - Define a scroll section
- `data-scroll-sticky` - Make element sticky during scroll
- `data-scroll-target` - Target specific scroll container

## 🛠️ Troubleshooting

### Scroll Not Working
1. Check console for "Locomotive Scroll initialized successfully"
2. Ensure `data-scroll-container` is present in layout
3. Verify CSS is loaded properly

### Animations Not Smooth
1. Check `lerp` value (lower = smoother)
2. Ensure `data-scroll-speed` values are appropriate
3. Verify no conflicting CSS animations

### Performance Issues
1. Reduce number of `data-scroll` elements
2. Use lower `data-scroll-speed` values
3. Consider using `data-scroll-section` for grouping

## 🎨 CSS Classes

### Automatic Classes
- `has-scroll-smooth` - Added to HTML when Locomotive Scroll is active
- `has-scroll-dragging` - Added during scroll interactions

### Custom Classes
- `scroll-up`, `scroll-down`, `scroll-left`, `scroll-right` - Direction-based classes

## 📱 Mobile Support

Locomotive Scroll automatically handles:
- Touch scrolling on mobile devices
- Responsive behavior
- Performance optimization for mobile

## 🔧 Advanced Usage

### Custom Scroll Events
```tsx
locomotiveInstance.on('scroll', (args) => {
  // Handle scroll events
  console.log('Scroll position:', args.scroll.y);
});
```

### Programmatic Scrolling
```tsx
locomotiveInstance.scrollTo(100, { duration: 1000 });
locomotiveInstance.scrollTo('#section-1', { offset: -50 });
```

### Route Change Handling
Locomotive Scroll automatically updates when navigating between pages in Next.js.

## 🚀 Best Practices

1. **Use `data-scroll-section`** for major page sections
2. **Keep `data-scroll-speed` values small** (0.1 to 0.5)
3. **Add `data-scroll-delay`** for staggered animations
4. **Test on mobile devices** for performance
5. **Use the custom hook** for complex animations

## 🎯 Examples

### Staggered Animation
```tsx
{items.map((item, index) => (
  <div 
    key={item.id}
    data-scroll 
    data-scroll-speed="0.1"
    data-scroll-delay={index * 0.1}
  >
    {item.content}
  </div>
))}
```

### Parallax Background
```tsx
<div 
  className="background-image"
  data-scroll 
  data-scroll-speed="-0.5"
  style={{ backgroundImage: 'url(/image.jpg)' }}
/>
```

### Sticky Element
```tsx
<div 
  data-scroll 
  data-scroll-sticky 
  data-scroll-target="#scroll-container"
>
  This element stays in place while scrolling
</div>
```

This implementation ensures smooth, consistent scrolling across your entire application with easy-to-use animations and effects! 