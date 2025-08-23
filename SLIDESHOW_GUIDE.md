# Slideshow Gallery Guide

This guide explains how to use the new slideshow gallery feature in your MDX content.

## Overview

The slideshow gallery creates a beautiful image carousel with thumbnail navigation using the [Splide.js library](https://splidejs.com/tutorials/thumbnail-carousel/). It automatically scans folders for images and creates a responsive gallery interface.

## Basic Usage

### Syntax
```markdown
![[slideshow]][[/assets/images/folder-name]]
```

### Example
```markdown
![[slideshow]][[/assets/images/deco]]
```

This will:
1. Scan the `/assets/images/deco` folder
2. Find all image files (jpg, jpeg, png, gif, webp)
3. Create a slideshow with thumbnail navigation
4. Display images in a responsive gallery

## Features

### 🎨 Visual Features
- **Main carousel** with fade transitions
- **Thumbnail navigation** below the main image
- **Responsive design** that adapts to screen size
- **Smooth animations** and transitions
- **Active slide highlighting** in thumbnails

### 📱 Responsive Design
- **Desktop**: Large main image with thumbnail strip
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface with smaller thumbnails

### ♿ Accessibility
- **Keyboard navigation** (arrow keys, space, enter)
- **Screen reader support** with proper ARIA labels
- **Focus management** for keyboard users
- **High contrast** active states

### 🎯 Interactive Features
- **Click thumbnails** to navigate
- **Swipe gestures** on mobile devices
- **Auto-focus** on center thumbnail
- **Smooth scrolling** through thumbnails

## Supported Image Formats

The slideshow supports these image formats:
- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`

## Folder Structure

### Recommended Structure
```
public/
  assets/
    images/
      your-project/
        image1.jpg
        image2.png
        image3.webp
        thumbnail.jpg
```

### Usage in MDX
```markdown
![[slideshow]][[/assets/images/your-project]]
```

## Advanced Usage

### Multiple Slideshows
You can use multiple slideshows in the same document:

```markdown
## Project Screenshots
![[slideshow]][[/assets/images/project-screenshots]]

## Design Process
![[slideshow]][[/assets/images/design-process]]

## Final Results
![[slideshow]][[/assets/images/final-results]]
```

### Error Handling
The component gracefully handles errors:
- **Folder not found**: Shows error message
- **No images**: Shows warning message
- **Invalid paths**: Displays helpful error

## Technical Implementation

### Components Used
- `GallerySlideshow.tsx` - Main slideshow component
- `mdx-utils.ts` - MDX parsing utilities
- `BlogPost.tsx` - Integration with blog posts

### Dependencies
- `@splidejs/splide` - Carousel functionality
- `next/image` - Image optimization
- React hooks for state management

### Performance Features
- **Dynamic imports** to avoid SSR issues
- **Image optimization** with Next.js
- **Lazy loading** for better performance
- **Memory efficient** carousel management

## Customization

### Styling
The slideshow uses Tailwind CSS classes and can be customized:

```tsx
<GallerySlideshow 
  images={images} 
  className="border rounded-lg shadow-lg my-8" 
/>
```

### Splide Configuration
The carousel is configured with these settings:

```javascript
// Main carousel
{
  type: 'fade',
  rewind: true,
  pagination: false,
  arrows: false,
}

// Thumbnail carousel
{
  fixedWidth: 100,
  fixedHeight: 60,
  gap: 10,
  rewind: true,
  pagination: false,
  isNavigation: true,
  focus: 'center',
  breakpoints: {
    600: {
      fixedWidth: 60,
      fixedHeight: 44,
    },
  },
}
```

## Troubleshooting

### Common Issues

1. **No images found**
   - Check folder path is correct
   - Ensure images are in supported formats
   - Verify folder exists in `public/assets/images/`

2. **Slideshow not loading**
   - Check browser console for errors
   - Verify Splide.js is installed
   - Ensure images are accessible

3. **Thumbnails not working**
   - Check for JavaScript errors
   - Verify responsive breakpoints
   - Test on different screen sizes

### Debug Information
The component logs helpful debug information:
- Folder paths being scanned
- Images found in folder
- Generated component structure
- Error messages for troubleshooting

## Examples

### Portfolio Gallery
```markdown
## My Design Portfolio
![[slideshow]][[/assets/images/portfolio]]
```

### Project Documentation
```markdown
## Development Process
![[slideshow]][[/assets/images/development-steps]]
```

### Before/After Comparison
```markdown
## Design Evolution
![[slideshow]][[/assets/images/design-evolution]]
```

## Best Practices

1. **Organize images** in descriptive folders
2. **Use consistent naming** for easy sorting
3. **Optimize images** for web (compress, resize)
4. **Test on mobile** devices
5. **Provide alt text** in image filenames
6. **Keep folder sizes** reasonable (10-20 images max)

## Future Enhancements

Potential improvements:
- **Custom transitions** between slides
- **Fullscreen mode** for better viewing
- **Image captions** and descriptions
- **Zoom functionality** for detailed viewing
- **Auto-play** with configurable timing
- **Custom thumbnail layouts**
