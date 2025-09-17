# WebGL Point Cloud Generator

A complete HTML5/WebGL application that transforms images into interactive 3D point clouds. No installation required - runs directly in the browser!

## Features

- **WebGL Powered**: High-performance rendering using custom shaders
- **Drag & Drop Upload**: Simply drag images onto the page
- **Real-time Controls**: Interactive sliders for all parameters
- **Complete Image Display**: Ensures entire image is visible as point cloud
- **Smooth Navigation**: Mouse orbit, zoom, and auto-rotation
- **Screenshot Export**: Save your creations as PNG images
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

### 1. Open the Application
- Open `index.html` in any modern web browser
- No server required - works locally or hosted

### 2. Upload an Image
- **Drag & Drop**: Drag any image file onto the upload area
- **Click to Browse**: Click the upload area to select a file
- **Supported Formats**: PNG, JPG, GIF, WebP, and more

### 3. Interact with the Point Cloud
- **Mouse Drag**: Orbit around the point cloud
- **Mouse Wheel**: Zoom in and out
- **Auto-Rotation**: Toggle with the button or adjust speed

### 4. Customize Parameters
- **Point Count**: 10K - 200K points (affects performance)
- **Point Size**: 0.5 - 10.0 pixels
- **Depth Range**: 50 - 500 units (Z-axis variation)
- **Rotation Speed**: 0 - 0.05 (auto-rotation speed)

### 5. Save Your Work
- Click "Save Screenshot" to download a PNG image
- High-resolution export matches your screen size

## Technical Implementation

### WebGL Shaders
```glsl
// Vertex Shader
attribute vec3 a_position;
attribute vec3 a_color;
uniform mat4 u_mvp;
uniform float u_pointSize;
varying vec3 v_color;

void main() {
    gl_Position = u_mvp * vec4(a_position, 1.0);
    gl_PointSize = u_pointSize;
    v_color = a_color;
}

// Fragment Shader
precision mediump float;
varying vec3 v_color;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    float alpha = 1.0 - (dist * 2.0);
    gl_FragColor = vec4(v_color, alpha);
}
```

### Key Features

#### Image Processing
- Canvas-based pixel sampling for any image format
- Adaptive sampling step to achieve target point count
- Automatic scaling to ensure complete image visibility
- Smart filtering of transparent and overly bright pixels

#### 3D Rendering
- Vertex Buffer Objects (VBOs) for efficient GPU data transfer
- Point sprites with circular shape and alpha blending
- Perspective projection with proper depth testing
- Smooth camera controls with spherical coordinates

#### Performance Optimization
- Efficient WebGL rendering pipeline
- Minimal JavaScript overhead
- Responsive design that adapts to screen size
- Real-time parameter updates without regeneration

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 50+
- ✅ Firefox 45+
- ✅ Safari 10+
- ✅ Edge 79+
- ✅ Mobile browsers with WebGL support

### Requirements
- WebGL 1.0 support
- HTML5 File API
- Canvas 2D context
- Modern JavaScript (ES6+)

## File Structure

```
material_splashscreen/
├── index.html              # Complete WebGL point cloud app
├── PointCloudGL.pde        # Original Processing version
├── data/                   # Optional default images
│   └── input.png
└── README_HTML.md          # This documentation
```

## Customization

### Styling
The CSS can be easily customized:
- Color schemes in the `:root` variables
- UI layout and positioning
- Animation effects and transitions

### Shader Effects
Modify the fragment shader for different visual effects:
- Point shapes (squares, stars, etc.)
- Color processing (brightness, contrast, saturation)
- Animation effects (pulsing, rotation, etc.)
- Particle systems

### Parameters
Adjust default values in the JavaScript:
```javascript
// In PointCloudRenderer constructor
this.maxPoints = 50000;      // Default point count
this.pointSize = 3.0;        // Default point size
this.depthRange = 150.0;     // Default depth variation
this.rotationSpeed = 0.01;   // Default rotation speed
```

## Advanced Usage

### Hosting
- **Local**: Open `index.html` directly in browser
- **Web Server**: Upload to any web hosting service
- **GitHub Pages**: Perfect for free hosting

### Integration
- Embed in other websites using iframe
- Integrate with existing web applications
- Use as a component in larger projects

### Extensions
- Add support for video input
- Implement real-time webcam processing
- Create VR/AR versions with WebXR
- Add physics simulation with cannon.js or similar

## Troubleshooting

### Performance Issues
- Reduce point count for better frame rate
- Use smaller images or lower resolution
- Close other browser tabs to free GPU memory

### WebGL Errors
- Check browser console for detailed error messages
- Ensure WebGL is enabled in browser settings
- Try a different browser if issues persist
- Update graphics drivers

### File Upload Issues
- Ensure image file is valid format
- Check file size (very large images may cause memory issues)
- Try different image formats if one doesn't work

## Examples

### Recommended Settings
- **Portraits**: 30K-50K points, size 2-4, depth 100-200
- **Landscapes**: 50K-100K points, size 1-3, depth 200-400
- **Logos/Graphics**: 20K-40K points, size 3-6, depth 50-150
- **Detailed Images**: 100K+ points, size 1-2, depth 300-500

This WebGL implementation provides a complete, professional-grade point cloud generator that runs entirely in the browser with no dependencies!

