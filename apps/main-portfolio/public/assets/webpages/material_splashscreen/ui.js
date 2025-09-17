/**
 * UI Controller for Advanced Point Cloud Viewer
 * Handles all user interface interactions and updates
 */

// Unified toggle system
const toggleStates = {
    animateCamera: false,
    reverse: false,
    loop: false,
    autoPause: true,
    easeIn: false,
    easeOut: false
};

function setToggle(name, value) {
    console.log(`setToggle called: ${name} = ${value}`);
    
    toggleStates[name] = value;
    const element = document.querySelector(`[data-toggle="${name}"]`);
    
    if (element) {
        element.checked = value;
        element.setAttribute('aria-checked', value.toString());
        
        // Update renderer state
        if (renderer) {
            switch (name) {
                case 'animateCamera':
                    renderer.animateCamera = value;
                    break;
                case 'reverse':
                    renderer.isReversed = value;
                    break;
                case 'loop':
                    renderer.loopAnimation = value;
                    break;
                case 'autoPause':
                    renderer.autoPause = value;
                    break;
                case 'easeIn':
                    if (renderer.motionParams) renderer.motionParams.easeIn = value;
                    break;
                case 'easeOut':
                    if (renderer.motionParams) renderer.motionParams.easeOut = value;
                    break;
            }
        }
    }
}

function getToggle(name) {
    return toggleStates[name];
}

function setupUnifiedToggles() {
    console.log('Setting up toggles...');
    
    // Find all toggles and set them up
    const toggles = document.querySelectorAll('[data-toggle]');
    console.log('Found toggles:', toggles.length);
    
    toggles.forEach(toggle => {
        const toggleName = toggle.getAttribute('data-toggle');
        console.log(`Setting up toggle: ${toggleName}`);
        
        // Initialize state
        toggleStates[toggleName] = toggle.checked;
        toggle.setAttribute('aria-checked', toggle.checked.toString());
        
        // Add event listener
        toggle.addEventListener('change', function(e) {
            console.log(`Toggle ${toggleName} changed to: ${e.target.checked}`);
            setToggle(toggleName, e.target.checked);
        });
        
        // Make sure the visual state is correct
        if (toggle.checked) {
            console.log(`Toggle ${toggleName} is checked, ensuring visual state`);
        }
    });
}

function refreshAllToggles() {
    console.log('Refreshing all toggle visuals...');
    Object.keys(toggleStates).forEach(name => {
        const element = document.querySelector(`[data-toggle="${name}"]`);
        if (element) {
            const currentState = toggleStates[name];
            element.checked = currentState;
            element.setAttribute('aria-checked', currentState.toString());
            console.log(`Refreshed toggle ${name}: ${currentState}`);
        }
    });
}

function testToggles() {
    console.log('=== TOGGLE TEST ===');
    const toggles = document.querySelectorAll('[data-toggle]');
    console.log(`Found ${toggles.length} toggles`);
    
    toggles.forEach(toggle => {
        const name = toggle.getAttribute('data-toggle');
        const switchElement = toggle.nextElementSibling;
        console.log(`Toggle ${name}:`, {
            checked: toggle.checked,
            'aria-checked': toggle.getAttribute('aria-checked'),
            'switch element': switchElement ? switchElement.className : 'not found',
            'switch display': switchElement ? getComputedStyle(switchElement).display : 'n/a'
        });
    });
    console.log('=== END TOGGLE TEST ===');
}

// Make testToggles available globally for debugging
window.testToggles = testToggles;

function setupUI() {
    setupUnifiedToggles();
    setupBasicControls();
    setupColorControls();
    setupCameraControls();
    setupAnimationControls();
    setupEasingControls();
    setupMotionControls();
    setupExportControls();
    setupSettingsControls();
    setupFileUpload();
    setupToolbar();
    setupFPSCounter();
    
    // Force refresh all toggles after setup
    setTimeout(() => {
        refreshAllToggles();
        testToggles();
    }, 100);
}

function setupBasicControls() {
    // Point count slider
    const pointCountSlider = document.getElementById('pointCount');
    pointCountSlider.addEventListener('input', (e) => {
        document.getElementById('pointCountValue').textContent = parseInt(e.target.value).toLocaleString();
    });
    
    // Point size slider
    const pointSizeSlider = document.getElementById('pointSize');
    pointSizeSlider.addEventListener('input', (e) => {
        renderer.pointSize = parseFloat(e.target.value);
        document.getElementById('pointSizeValue').textContent = e.target.value;
    });
    
    // Depth range slider
    const depthRangeSlider = document.getElementById('depthRange');
    depthRangeSlider.addEventListener('input', (e) => {
        document.getElementById('depthRangeValue').textContent = e.target.value;
    });
    
    // Size mode dropdown with proper control visibility
    const sizeModeSelect = document.getElementById('sizeMode');
    const gaussianControls = document.getElementById('gaussianControls');
    const pointSizeControl = document.getElementById('pointSize').closest('.form-group');
    
    function updateSizeControls() {
        if (sizeModeSelect.value === 'gaussian') {
            // Hide Point Size, show Mean & Std Dev
            pointSizeControl.style.display = 'none';
            gaussianControls.style.display = 'block';
        } else {
            // Show Point Size, hide Mean & Std Dev
            pointSizeControl.style.display = 'block';
            gaussianControls.style.display = 'none';
        }
    }
    
    sizeModeSelect.addEventListener('change', (e) => {
        renderer.sizeMode = e.target.value;
        updateSizeControls();
        
        if (renderer.actualPoints > 0) {
            renderer.generateSizeMultipliers();
        }
    });
    
    // Initialize size control visibility on page load
    updateSizeControls();
    
    // Also trigger when the DOM is ready
    document.addEventListener('DOMContentLoaded', updateSizeControls);
    
    // Gaussian controls
    const sizeMeanSlider = document.getElementById('sizeMean');
    const sizeStdDevSlider = document.getElementById('sizeStdDev');
    
    sizeMeanSlider.addEventListener('input', (e) => {
        renderer.sizeMean = parseFloat(e.target.value);
        document.getElementById('sizeMeanValue').textContent = e.target.value;
        if (renderer.sizeMode === 'gaussian' && renderer.actualPoints > 0) {
            renderer.generateSizeMultipliers();
        }
    });
    
    sizeStdDevSlider.addEventListener('input', (e) => {
        renderer.sizeStdDev = parseFloat(e.target.value);
        document.getElementById('sizeStdDevValue').textContent = e.target.value;
        if (renderer.sizeMode === 'gaussian' && renderer.actualPoints > 0) {
            renderer.generateSizeMultipliers();
        }
    });
    
    // Update button
    document.getElementById('updateCloud').addEventListener('click', () => {
        const newCount = parseInt(pointCountSlider.value);
        const newDepth = parseFloat(depthRangeSlider.value);
        
        renderer.updatePointCount(newCount);
        renderer.updateDepthRange(newDepth);
    });
}

function setupColorControls() {
    // Background color picker
    const backgroundColorPicker = document.getElementById('backgroundColor');
    backgroundColorPicker.addEventListener('change', (e) => {
        const hex = e.target.value;
        const rgb = hexToRgb(hex);
        renderer.backgroundColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
        renderer.updateBackgroundColor();
    });
    
    // Point color mode
    const pointColorModeSelect = document.getElementById('pointColorMode');
    const fixedColorControls = document.getElementById('fixedColorControls');
    const variableColorControls = document.getElementById('variableColorControls');
    
    pointColorModeSelect.addEventListener('change', (e) => {
        renderer.pointColorMode = e.target.value;
        
        if (e.target.value === 'fixed') {
            fixedColorControls.style.display = 'block';
            variableColorControls.style.display = 'none';
        } else {
            fixedColorControls.style.display = 'none';
            variableColorControls.style.display = 'block';
        }
    });
    
    // Point color picker (fixed mode)
    const pointColorPicker = document.getElementById('pointColor');
    pointColorPicker.addEventListener('change', (e) => {
        const hex = e.target.value;
        const rgb = hexToRgb(hex);
        renderer.pointColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    });
    
    // Point color A picker
    const pointColorAPicker = document.getElementById('pointColorA');
    pointColorAPicker.addEventListener('change', (e) => {
        const hex = e.target.value;
        const rgb = hexToRgb(hex);
        renderer.pointColorA = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    });
    
    // Point color B picker
    const pointColorBPicker = document.getElementById('pointColorB');
    pointColorBPicker.addEventListener('change', (e) => {
        const hex = e.target.value;
        const rgb = hexToRgb(hex);
        renderer.pointColorB = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    });
}

function setupCameraControls() {
    // Camera position buttons
    document.getElementById('setInitialCamera').addEventListener('click', () => {
        renderer.setInitialCamera();
        showNotification('Initial camera position set');
    });
    
    document.getElementById('setFinalCamera').addEventListener('click', () => {
        renderer.setFinalCamera();
        showNotification('Final camera position set');
    });
    
    document.getElementById('resetCamera').addEventListener('click', () => {
        renderer.cameraDistance = 600;
        renderer.cameraYaw = 0;
        renderer.cameraPitch = 0.3;
        renderer.cameraTarget = [0, 0, 0];
    });
    
    // Animate camera checkbox (handled by unified toggle system)
}

function setupAnimationControls() {
    // Max time input and set button
    const maxTimeInput = document.getElementById('maxTimeInput');
    const setTimeButton = document.getElementById('setTimeButton');
    
    setTimeButton.addEventListener('click', () => {
        const newMaxTime = parseInt(maxTimeInput.value);
        renderer.setMaxTime(newMaxTime);
        document.getElementById('maxTimeValue').textContent = newMaxTime;
        document.getElementById('durationValue').textContent = newMaxTime;
        document.getElementById('timeSlider').max = newMaxTime;
    });
    
    // Time slider
    const timeSlider = document.getElementById('timeSlider');
    timeSlider.addEventListener('input', (e) => {
        renderer.animationTime = parseInt(e.target.value);
        renderer.updatePointPositions();
        document.getElementById('timeValue').textContent = e.target.value;
        renderer.updateTimeDisplay();
    });
    
    // Play/pause button
    const playPauseButton = document.getElementById('playPause');
    playPauseButton.addEventListener('click', () => {
        if (renderer.isPlaying) {
            renderer.pauseAnimation();
        } else {
            renderer.playAnimation();
        }
    });
    
    // Reverse, Loop, Auto Pause toggles (handled by unified toggle system)
    
    // Reset animation button
    document.getElementById('resetAnimation').addEventListener('click', () => {
        renderer.resetAnimation();
    });
}

function setupEasingControls() {
    // Buffer time slider
    const bufferTimeSlider = document.getElementById('bufferTime');
    bufferTimeSlider.addEventListener('input', (e) => {
        renderer.bufferTime = parseInt(e.target.value);
        document.getElementById('bufferTimeValue').textContent = e.target.value;
    });
    
    // Ease in time slider
    const easeInTimeSlider = document.getElementById('easeInTime');
    easeInTimeSlider.addEventListener('input', (e) => {
        renderer.easeInTime = parseInt(e.target.value);
        document.getElementById('easeInTimeValue').textContent = e.target.value;
    });
    
    // Ease out time slider
    const easeOutTimeSlider = document.getElementById('easeOutTime');
    easeOutTimeSlider.addEventListener('input', (e) => {
        renderer.easeOutTime = parseInt(e.target.value);
        document.getElementById('easeOutTimeValue').textContent = e.target.value;
    });
    
    // Ease type selector
    const easeTypeSelect = document.getElementById('easeType');
    easeTypeSelect.addEventListener('change', (e) => {
        renderer.easeType = e.target.value;
    });
}

function setupMotionControls() {
    // Motion algorithm dropdown
    const motionSelect = document.getElementById('motionAlgorithm');
    motionSelect.addEventListener('change', (e) => {
        renderer.motionAlgorithm = e.target.value;
        renderer.updatePointPositions();
    });
    
    // Velocity slider
    const velocitySlider = document.getElementById('velocity');
    velocitySlider.addEventListener('input', (e) => {
        renderer.motionParams.velocity = parseFloat(e.target.value);
        document.getElementById('velocityValue').textContent = e.target.value;
    });
    
    // Intensity slider
    const intensitySlider = document.getElementById('intensity');
    intensitySlider.addEventListener('input', (e) => {
        renderer.motionParams.curveIntensity = parseFloat(e.target.value);
        document.getElementById('intensityValue').textContent = e.target.value;
    });
    
    // Ease In/Out checkboxes (handled by unified toggle system)
    
    // Apply motion button
    document.getElementById('applyMotion').addEventListener('click', () => {
        renderer.applyMotionSettings();
        showNotification('Motion settings applied');
    });
    
    // Randomize motion button
    document.getElementById('randomizeMotion').addEventListener('click', () => {
        if (renderer.sourceImage) {
            renderer.generatePointsFromImage(renderer.sourceImage);
            showNotification('Motion randomized');
        }
    });
    
    // Apply motion button
    document.getElementById('applyMotion').addEventListener('click', () => {
        renderer.applyMotionSettings();
        showNotification('Motion settings applied');
    });
}

function setupExportControls() {
    // Save PNG button
    document.getElementById('saveImage').addEventListener('click', () => {
        renderer.savePNG();
        showNotification('High-resolution PNG saved!');
    });
    
    // Record button with enhanced functionality
    document.getElementById('recordButton').addEventListener('click', () => {
        if (renderer.isRecording) {
            renderer.stopRecording();
            showNotification('Recording stopped');
        } else {
            renderer.startRecording();
            showNotification('Recording started - will auto-stop at end');
        }
    });
}

function setupSettingsControls() {
    // Export settings button
    document.getElementById('exportSettings').addEventListener('click', () => {
        renderer.exportSettings();
        showNotification('Settings exported to JSON file');
    });
    
    // Import settings file input
    document.getElementById('importSettings').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            renderer.importSettings(e.target.files[0]);
            showNotification('Settings imported and applied instantly!');
        }
        // Reset file input
        e.target.value = '';
    });
    
    // Paste JSON settings button
    document.getElementById('pasteSettings').addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            const settings = JSON.parse(text);
            renderer.applySettings(settings);
            showNotification('Settings pasted and applied instantly!');
        } catch (error) {
            console.error('Failed to paste settings:', error);
            showNotification('Invalid JSON in clipboard', 'error');
        }
    });
}

function setupToolbar() {
    // Hide GUI button
    document.getElementById('hideGUIButton').addEventListener('click', () => {
        renderer.toggleGUI();
    });
}

function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const fileUpload = document.getElementById('fileUpload');
    
    // Click to upload
    fileUpload.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            loadImageFile(e.target.files[0]);
        }
    });
    
    // Drag and drop
    fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.classList.add('drag-over');
    });
    
    fileUpload.addEventListener('dragleave', () => {
        fileUpload.classList.remove('drag-over');
    });
    
    fileUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUpload.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            loadImageFile(e.dataTransfer.files[0]);
        }
    });
}

function setupFPSCounter() {
    let frameCount = 0;
    let lastTime = Date.now();
    
    setInterval(() => {
        const now = Date.now();
        const fps = Math.round(1000 / (now - lastTime));
        document.getElementById('fps').textContent = fps;
        lastTime = now;
    }, 100);
}

function loadImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            renderer.loadImageAndGeneratePoints(img);
            showNotification('Image loaded successfully');
        };
        img.onerror = () => {
            showNotification('Failed to load image', 'error');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function loadDefaultImage() {
    // Try to load a default image if available
    const img = new Image();
    img.onload = () => {
        renderer.loadImageAndGeneratePoints(img);
    };
    img.onerror = () => {
        console.log('No default image found. Please upload an image.');
        showNotification('Please upload an image to begin');
    };
    img.src = 'data/input.png';
}

// Utility functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'error' ? 'rgba(255, 107, 107, 0.9)' : 'rgba(78, 205, 196, 0.9)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: '10000',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Collapsible sections
function setupCollapsibleSections() {
    const collapsibles = document.querySelectorAll('.collapsible');
    
    collapsibles.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isCollapsed = header.classList.contains('collapsed');
            
            if (isCollapsed) {
                header.classList.remove('collapsed');
                content.classList.remove('collapsed');
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                header.classList.add('collapsed');
                content.classList.add('collapsed');
                content.style.maxHeight = '0';
            }
        });
    });
}

// Initialize collapsible sections after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupCollapsibleSections, 100);
});
