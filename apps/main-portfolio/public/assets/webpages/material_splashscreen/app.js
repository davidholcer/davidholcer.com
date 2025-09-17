/**
 * Advanced WebGL Point Cloud Viewer
 * Modular architecture with enhanced features
 */

class PointCloudRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = this.initWebGL();
        
        // Core parameters
        this.maxPoints = 120000;
        this.pointSize = 1.2;
        this.depthRange = 60.0;
        this.pointAlpha = 1.0;
        
        // Colors
        this.backgroundColor = [0.0, 0.0, 0.0];
        this.pointColor = [1.0, 1.0, 1.0];
        this.pointColorMode = 'fixed'; // 'fixed', 'variable', 'depth'
        this.pointColorA = [1.0, 1.0, 1.0];
        this.pointColorB = [0.0, 0.5, 1.0];
        this.pointColors = []; // Individual point colors for variable/depth modes
        
        // UI and recording
        this.isGUIHidden = false;
        this.isRecording = false;
        this.mediaRecorder = null;
        
        // Point size variation
        this.sizeMode = 'fixed'; // 'fixed' or 'gaussian'
        this.sizeMean = 1.2;
        this.sizeStdDev = 0.3;
        this.sizeMultipliers = [];
        
        // Camera state with enhanced zoom range
        this.cameraDistance = 600;
        this.cameraYaw = 0;
        this.cameraPitch = 0.3;
        this.cameraTarget = [0, 0, 0];
        
        // Enhanced camera limits for much better zoom range
        this.minCameraDistance = 0.1;    // Very close zoom
        this.maxCameraDistance = 50000;  // Very far zoom
        
        // Camera animation with keying
        this.initialCamera = {
            distance: 600,
            yaw: 0,
            pitch: 0.3,
            target: [0, 0, 0]
        };
        this.finalCamera = {
            distance: 400,
            yaw: Math.PI / 4,
            pitch: 0.5,
            target: [0, 0, 0]
        };
        this.keyedCameraTime = 0; // Time at which final camera was set
        this.animateCamera = false;
        
        // Mouse state
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Point cloud data
        this.originalPoints = [];
        this.currentPoints = [];
        this.actualPoints = 0;
        this.sourceImage = null;
        
        // Animation state (reversed time logic)
        this.animationTime = 0;
        this.animationDuration = 5000;
        this.maxTime = 5000;
        this.isPlaying = false;
        this.isReversed = false;
        this.loopAnimation = false;
        this.autoPause = true;
        
        // Easing and buffer
        this.bufferTime = 0;
        this.easeInTime = 500;
        this.easeOutTime = 500;
        this.easeType = 'sin'; // 'sin', 'quadratic', 'cubic'
        
        // Motion algorithms and parameters
        this.motionAlgorithm = 'random';
        this.motionData = [];
        this.motionParams = {
            velocity: 1.0,
            curveIntensity: 1.0,
            easeIn: false,
            easeOut: false
        };
        
        // WebGL resources
        this.program = null;
        this.vertexBuffer = null;
        this.sizeBuffer = null;
        
        // Matrices
        this.projectionMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.mvpMatrix = mat4.create();
        
        this.init();
    }
    
    initWebGL() {
        const gl = this.canvas.getContext('webgl', {
            antialias: true,
            alpha: false,
            premultipliedAlpha: false,
            depth: true
        }) || this.canvas.getContext('experimental-webgl', {
            antialias: true,
            alpha: false,
            premultipliedAlpha: false,
            depth: true
        });
        
        if (!gl) {
            throw new Error('WebGL not supported');
        }
        
        return gl;
    }
    
    async init() {
        const gl = this.gl;
        
        // Load and compile shaders
        this.program = await this.createShaderProgram();
        
        // Get attribute and uniform locations
        this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
        this.sizeMultiplierLocation = gl.getAttribLocation(this.program, 'a_sizeMultiplier');
        this.mvpLocation = gl.getUniformLocation(this.program, 'u_mvp');
        this.pointSizeLocation = gl.getUniformLocation(this.program, 'u_pointSize');
        this.sizeVariationLocation = gl.getUniformLocation(this.program, 'u_sizeVariation');
        this.pointColorLocation = gl.getUniformLocation(this.program, 'u_pointColor');
        this.alphaLocation = gl.getUniformLocation(this.program, 'u_alpha');
        this.timeLocation = gl.getUniformLocation(this.program, 'u_time');
        
        // Create buffers
        this.vertexBuffer = gl.createBuffer();
        this.sizeBuffer = gl.createBuffer();
        
        // Set up WebGL state
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this.updateBackgroundColor();
        
        // Enable extensions
        if (gl.getExtension('OES_standard_derivatives')) {
            console.log('Antialiasing enabled');
        }
        
        this.resize();
        this.setupEventListeners();
        this.animate();
    }
    
    async loadShader(url) {
        const response = await fetch(url);
        return await response.text();
    }
    
    async createShaderProgram() {
        const gl = this.gl;
        
        // Load shader sources
        const vertexShaderSource = await this.loadShader('vertex.glsl');
        const fragmentShaderSource = await this.loadShader('fragment.glsl');
        
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Shader program failed to link: ' + gl.getProgramInfoLog(program));
        }
        
        return program;
    }
    
    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error('Shader compilation error: ' + gl.getShaderInfoLog(shader));
        }
        
        return shader;
    }
    
    updateBackgroundColor() {
        const gl = this.gl;
        gl.clearColor(this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2], 1.0);
    }
    
    generateSizeMultipliers() {
        this.sizeMultipliers = [];
        
        if (this.sizeMode === 'gaussian') {
            // Generate Gaussian distributed size multipliers with stable per-point seeds
            for (let i = 0; i < this.actualPoints; i++) {
                // Use point index as seed for stable, reproducible results
                const seed = i * 17.23 + 42.7; // Arbitrary constants for variation
                const multiplier = this.gaussianRandomWithSeed(seed, this.sizeMean, this.sizeStdDev);
                this.sizeMultipliers.push(Math.max(0.1, multiplier)); // Clamp to ensure positive sizes
            }
        } else {
            // Fixed size - all multipliers are 1.0
            for (let i = 0; i < this.actualPoints; i++) {
                this.sizeMultipliers.push(1.0);
            }
        }
        
        this.updateSizeBuffer();
    }
    
    gaussianRandom(mean, stdDev) {
        // Box-Muller transform for Gaussian distribution
        if (this.hasSpareGaussian) {
            this.hasSpareGaussian = false;
            return this.spareGaussian * stdDev + mean;
        }
        
        this.hasSpareGaussian = true;
        const u1 = Math.random();
        const u2 = Math.random();
        const mag = stdDev * Math.sqrt(-2.0 * Math.log(u1));
        this.spareGaussian = mag * Math.cos(2.0 * Math.PI * u2);
        return mag * Math.sin(2.0 * Math.PI * u2) + mean;
    }
    
    gaussianRandomWithSeed(seed, mean, stdDev) {
        // Seeded Gaussian random using Box-Muller transform
        // Simple LCG (Linear Congruential Generator) for seeded random
        const seededRandom = (s) => {
            return ((s * 9301 + 49297) % 233280) / 233280;
        };
        
        let seedState = Math.floor(seed * 1000) % 233280;
        const u1 = seededRandom(seedState);
        seedState = (seedState * 9301 + 49297) % 233280;
        const u2 = seededRandom(seedState);
        
        const mag = stdDev * Math.sqrt(-2.0 * Math.log(Math.max(u1, 1e-10))); // Avoid log(0)
        return mag * Math.sin(2.0 * Math.PI * u2) + mean;
    }
    
    updateSizeBuffer() {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.sizeMultipliers), gl.STATIC_DRAW);
    }
    
    loadImageAndGeneratePoints(image) {
        document.getElementById('loading').style.display = 'block';
        this.sourceImage = image;
        
        setTimeout(() => {
            this.generatePointsFromImage(image);
            this.updateBuffers();
            document.getElementById('loading').style.display = 'none';
            this.updateStats();
        }, 10);
    }
    
    generatePointsFromImage(image) {
        // Create canvas to read pixel data
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        tempCtx.drawImage(image, 0, 0);
        
        const imageData = tempCtx.getImageData(0, 0, image.width, image.height);
        const pixels = imageData.data;
        
        // Calculate sampling step
        const totalPixels = image.width * image.height;
        const step = Math.max(1, Math.floor(Math.sqrt(totalPixels / this.maxPoints)));
        
        // Calculate scale to fit image
        const margin = 50;
        const scaleX = (this.canvas.width - margin * 2) / image.width;
        const scaleY = (this.canvas.height - margin * 2) / image.height;
        const scale = Math.min(scaleX, scaleY) * 0.8;
        
        const offsetX = -image.width * scale / 2;
        const offsetY = -image.height * scale / 2;
        
        this.originalPoints = [];
        this.currentPoints = [];
        this.motionData = [];
        
        // Sample pixels
        for (let y = 0; y < image.height; y += step) {
            for (let x = 0; x < image.width; x += step) {
                const index = (y * image.width + x) * 4;
                const r = pixels[index] / 255;
                const g = pixels[index + 1] / 255;
                const b = pixels[index + 2] / 255;
                const a = pixels[index + 3] / 255;
                
                // Skip transparent pixels
                if (a < 0.2) continue;
                
                // Only use pixels with sufficient contrast
                const brightness = (r + g + b) / 3;
                if (brightness > 0.9) continue;
                
                // Calculate 3D position (flipped Y for correct orientation)
                const px = offsetX + x * scale;
                const py = offsetY + (image.height - y) * scale;
                const pz = (Math.random() - 0.5) * this.depthRange;
                
                // Store original positions
                this.originalPoints.push(px, py, pz);
                this.currentPoints.push(px, py, pz);
                
                // Initialize motion data for each point
                this.initializeMotionData(px, py, pz);
            }
        }
        
        this.actualPoints = this.originalPoints.length / 3;
        console.log('Generated', this.actualPoints, 'points from', totalPixels, 'pixels');
        
        // Generate size multipliers
        this.generateSizeMultipliers();
        
        // Reset animation to fully dispersed state (time = 0)
        this.animationTime = 0;
        this.updatePointPositions();
    }
    
    initializeMotionData(px, py, pz) {
        const intensity = this.motionParams.curveIntensity;
        const velocity = this.motionParams.velocity;
        
        this.motionData.push({
            randomVelocity: [
                (Math.random() - 0.5) * 2 * velocity,
                (Math.random() - 0.5) * 2 * velocity,
                (Math.random() - 0.5) * 2 * velocity
            ],
            fixedDirection: [
                (Math.random() - 0.5) * velocity,
                (Math.random() - 0.5) * velocity,
                (Math.random() - 0.5) * velocity
            ],
            controlPoint1: [
                px + (Math.random() - 0.5) * 400 * intensity,
                py + (Math.random() - 0.5) * 400 * intensity,
                pz + (Math.random() - 0.5) * 200 * intensity
            ],
            controlPoint2: [
                px + (Math.random() - 0.5) * 600 * intensity,
                py + (Math.random() - 0.5) * 600 * intensity,
                pz + (Math.random() - 0.5) * 300 * intensity
            ],
            endPoint: [
                px + (Math.random() - 0.5) * 800 * intensity,
                py + (Math.random() - 0.5) * 800 * intensity,
                pz + (Math.random() - 0.5) * 400 * intensity
            ],
            spiralRadius: Math.random() * 200 * intensity + 50,
            spiralSpeed: Math.random() * 0.002 + 0.001,
            waveAmplitude: Math.random() * 100 * intensity + 20,
            waveFrequency: Math.random() * 0.01 + 0.005
        });
    }
    
    updateBuffers() {
        const gl = this.gl;
        
        // Update vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.currentPoints), gl.DYNAMIC_DRAW);
    }
    
    updatePointPositions() {
        if (this.originalPoints.length === 0) return;
        
        // Handle buffer time - during buffer, points stay at original positions
        if (this.animationTime < this.bufferTime) {
            // Copy original positions to current positions
            for (let i = 0; i < this.originalPoints.length; i++) {
                this.currentPoints[i] = this.originalPoints[i];
            }
            this.updateBuffers();
            return;
        }
        
        // Adjust time for buffer
        const adjustedTime = this.animationTime - this.bufferTime;
        const adjustedDuration = this.animationDuration - this.bufferTime;
        
        if (adjustedDuration <= 0) {
            // If buffer time >= duration, stay at original positions
            for (let i = 0; i < this.originalPoints.length; i++) {
                this.currentPoints[i] = this.originalPoints[i];
            }
            this.updateBuffers();
            return;
        }
        
        // Reversed time logic: t=0 is fully dispersed, t=1 is fully ordered
        const rawT = adjustedTime / adjustedDuration;
        const t = 1.0 - rawT; // Reverse the time
        
        // Apply easing with configurable ease types
        let easedT = this.applyEasing(t, adjustedTime, adjustedDuration);
        
        for (let i = 0; i < this.actualPoints; i++) {
            const baseIndex = i * 3;
            const originalX = this.originalPoints[baseIndex];
            const originalY = this.originalPoints[baseIndex + 1];
            const originalZ = this.originalPoints[baseIndex + 2];
            
            let newX, newY, newZ;
            
            switch (this.motionAlgorithm) {
                case 'random':
                    newX = originalX + this.motionData[i].randomVelocity[0] * easedT * 200;
                    newY = originalY + this.motionData[i].randomVelocity[1] * easedT * 200;
                    newZ = originalZ + this.motionData[i].randomVelocity[2] * easedT * 200;
                    break;
                    
                case 'fixed':
                    const distance = easedT * 300;
                    newX = originalX + this.motionData[i].fixedDirection[0] * distance;
                    newY = originalY + this.motionData[i].fixedDirection[1] * distance;
                    newZ = originalZ + this.motionData[i].fixedDirection[2] * distance;
                    break;
                    
                case 'quadratic':
                    const quadT = easedT * easedT;
                    newX = originalX + (this.motionData[i].endPoint[0] - originalX) * quadT;
                    newY = originalY + (this.motionData[i].endPoint[1] - originalY) * quadT;
                    newZ = originalZ + (this.motionData[i].endPoint[2] - originalZ) * quadT;
                    break;
                    
                case 'bezier':
                    // Cubic Bezier curve
                    const cp1 = this.motionData[i].controlPoint1;
                    const cp2 = this.motionData[i].controlPoint2;
                    const end = this.motionData[i].endPoint;
                    const invT = 1 - easedT;
                    const invT2 = invT * invT;
                    const invT3 = invT2 * invT;
                    const t2 = easedT * easedT;
                    const t3 = t2 * easedT;
                    
                    newX = invT3 * originalX + 3 * invT2 * easedT * cp1[0] + 3 * invT * t2 * cp2[0] + t3 * end[0];
                    newY = invT3 * originalY + 3 * invT2 * easedT * cp1[1] + 3 * invT * t2 * cp2[1] + t3 * end[1];
                    newZ = invT3 * originalZ + 3 * invT2 * easedT * cp1[2] + 3 * invT * t2 * cp2[2] + t3 * end[2];
                    break;
                    
                case 'spiral':
                    const angle = easedT * Math.PI * 4 + this.motionData[i].spiralSpeed * this.animationTime;
                    const radius = this.motionData[i].spiralRadius * easedT;
                    newX = originalX + Math.cos(angle) * radius;
                    newY = originalY + Math.sin(angle) * radius;
                    newZ = originalZ + easedT * 100 * Math.sin(easedT * Math.PI * 2);
                    break;
                    
                case 'wave':
                    const waveX = Math.sin(easedT * Math.PI * 2 + this.motionData[i].waveFrequency * this.animationTime) * this.motionData[i].waveAmplitude * easedT;
                    const waveY = Math.cos(easedT * Math.PI * 2 + this.motionData[i].waveFrequency * this.animationTime) * this.motionData[i].waveAmplitude * easedT;
                    newX = originalX + waveX;
                    newY = originalY + waveY;
                    newZ = originalZ + Math.sin(easedT * Math.PI * 4) * 50 * easedT;
                    break;
                    
                default:
                    newX = originalX;
                    newY = originalY;
                    newZ = originalZ;
            }
            
            this.currentPoints[baseIndex] = newX;
            this.currentPoints[baseIndex + 1] = newY;
            this.currentPoints[baseIndex + 2] = newZ;
        }
        
        this.updateBuffers();
    }
    
    applyEasing(t, adjustedTime, adjustedDuration) {
        let easedT = t;
        
        // Determine if we're in ease-in or ease-out phase
        const easeInPhase = adjustedTime < this.easeInTime;
        const easeOutPhase = adjustedTime > (adjustedDuration - this.easeOutTime);
        
        if (easeInPhase && this.easeInTime > 0) {
            // Ease-in: smooth start
            const easeProgress = adjustedTime / this.easeInTime;
            const easeFactor = this.getEaseFactor(easeProgress, this.easeType);
            const normalT = t;
            easedT = normalT * easeFactor;
        } else if (easeOutPhase && this.easeOutTime > 0) {
            // Ease-out: smooth end
            const easeProgress = (adjustedDuration - adjustedTime) / this.easeOutTime;
            const easeFactor = this.getEaseFactor(easeProgress, this.easeType);
            const normalT = t;
            easedT = normalT * easeFactor;
        }
        
        return Math.max(0, Math.min(1, easedT));
    }
    
    getEaseFactor(progress, easeType) {
        progress = Math.max(0, Math.min(1, progress));
        
        switch (easeType) {
            case 'sin':
                return 0.5 * (1 - Math.cos(progress * Math.PI));
            case 'quadratic':
                return progress * progress;
            case 'cubic':
                return progress * progress * progress;
            default:
                return progress;
        }
    }
    
    updateCamera() {
        // Interpolate camera position if animation is enabled
        if (this.animateCamera) {
            let cameraT = 0;
            
            if (this.animationTime <= this.keyedCameraTime) {
                // Interpolate from initial to final over [0, keyedCameraTime]
                if (this.keyedCameraTime > 0) {
                    cameraT = this.animationTime / this.keyedCameraTime;
                }
            } else {
                // After keyed time, stay at final position
                cameraT = 1;
            }
            
            this.cameraDistance = this.lerp(this.initialCamera.distance, this.finalCamera.distance, cameraT);
            this.cameraYaw = this.lerp(this.initialCamera.yaw, this.finalCamera.yaw, cameraT);
            this.cameraPitch = this.lerp(this.initialCamera.pitch, this.finalCamera.pitch, cameraT);
            
            for (let i = 0; i < 3; i++) {
                this.cameraTarget[i] = this.lerp(this.initialCamera.target[i], this.finalCamera.target[i], cameraT);
            }
        }
        
        // Calculate camera position
        const x = this.cameraTarget[0] + this.cameraDistance * Math.cos(this.cameraPitch) * Math.cos(this.cameraYaw);
        const y = this.cameraTarget[1] + this.cameraDistance * Math.sin(this.cameraPitch);
        const z = this.cameraTarget[2] + this.cameraDistance * Math.cos(this.cameraPitch) * Math.sin(this.cameraYaw);
        
        // Create view matrix
        mat4.lookAt(this.viewMatrix, [x, y, z], this.cameraTarget, [0, 1, 0]);
        
        // Create MVP matrix
        mat4.multiply(this.mvpMatrix, this.projectionMatrix, this.viewMatrix);
    }
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    render() {
        const gl = this.gl;
        
        // Update animation if playing
        if (this.isPlaying) {
            const deltaTime = 16; // Assume 60 FPS
            
            if (this.isReversed) {
                this.animationTime = Math.max(0, this.animationTime - deltaTime);
                if (this.animationTime <= 0) {
                    if (this.loopAnimation) {
                        this.animationTime = this.animationDuration;
                    } else if (this.autoPause) {
                        this.pauseAnimation();
                    }
                }
            } else {
                this.animationTime = Math.min(this.animationDuration, this.animationTime + deltaTime);
                if (this.animationTime >= this.animationDuration) {
                    if (this.loopAnimation) {
                        this.animationTime = 0;
                    } else if (this.autoPause) {
                        this.pauseAnimation();
                    }
                }
            }
            
            this.updatePointPositions();
            this.updateUI();
        }
        
        // Clear
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        if (this.actualPoints === 0) return;
        
        // Use shader program
        gl.useProgram(this.program);
        
        // Update camera
        this.updateCamera();
        
        // Set uniforms
        gl.uniformMatrix4fv(this.mvpLocation, false, this.mvpMatrix);
        gl.uniform1f(this.pointSizeLocation, this.pointSize);
        gl.uniform1f(this.sizeVariationLocation, this.sizeMode === 'gaussian' ? 1.0 : 0.0);
        gl.uniform3fv(this.pointColorLocation, this.pointColor);
        gl.uniform1f(this.alphaLocation, this.pointAlpha);
        gl.uniform1f(this.timeLocation, this.animationTime / 1000.0);
        
        // Bind vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 0, 0);
        
        // Bind size multiplier buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
        gl.enableVertexAttribArray(this.sizeMultiplierLocation);
        gl.vertexAttribPointer(this.sizeMultiplierLocation, 1, gl.FLOAT, false, 0, 0);
        
        // Draw points
        gl.drawArrays(gl.POINTS, 0, this.actualPoints);
    }
    
    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
        // Update projection matrix
        const aspect = this.canvas.width / this.canvas.height;
        mat4.perspective(this.projectionMatrix, Math.PI / 4, aspect, 0.001, 1000000);
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;
            
            // Scale rotation speed based on distance for better control at extreme zooms
            const rotationScale = Math.log10(Math.max(1, this.cameraDistance / 100)) * 0.003 + 0.001;
            
            this.cameraYaw -= deltaX * rotationScale;
            this.cameraPitch += deltaY * rotationScale;
            this.cameraPitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, this.cameraPitch));
            
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        // Enhanced mouse wheel with exponential zoom and distance-based scaling
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Use exponential zoom for better range coverage
            const zoomFactor = Math.pow(1.1, e.deltaY / 100);
            this.cameraDistance *= zoomFactor;
            
            // Clamp to enhanced range
            this.cameraDistance = Math.max(this.minCameraDistance, Math.min(this.maxCameraDistance, this.cameraDistance));
        });
        
        // Touch events for pinch zoom
        let lastTouchDistance = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                lastTouchDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) + 
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) + 
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                
                if (lastTouchDistance > 0) {
                    const zoomFactor = lastTouchDistance / currentDistance;
                    this.cameraDistance *= zoomFactor;
                    this.cameraDistance = Math.max(this.minCameraDistance, Math.min(this.maxCameraDistance, this.cameraDistance));
                }
                
                lastTouchDistance = currentDistance;
            }
        });
        
        this.canvas.addEventListener('touchend', () => {
            lastTouchDistance = 0;
        });
        
        // Window resize
        window.addEventListener('resize', () => this.resize());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                this.toggleGUI();
            } else if (e.key === ' ' && this.isGUIHidden) {
                e.preventDefault();
                if (this.isPlaying) {
                    this.pauseAnimation();
                } else {
                    this.playAnimation();
                }
            }
        });
    }
    
    // Animation controls
    playAnimation() {
        this.isPlaying = true;
        document.getElementById('playPause').innerHTML = '⏸';
        document.getElementById('animationStatus').textContent = 'Playing';
    }
    
    pauseAnimation() {
        this.isPlaying = false;
        document.getElementById('playPause').innerHTML = '▶';
        document.getElementById('animationStatus').textContent = 'Paused';
    }
    
    resetAnimation() {
        this.animationTime = 0; // Start at fully dispersed state
        this.isPlaying = false;
        this.updatePointPositions();
        this.updateUI();
        document.getElementById('playPause').innerHTML = '▶';
        document.getElementById('animationStatus').textContent = 'Reset';
    }
    
    setInitialCamera() {
        this.initialCamera = {
            distance: this.cameraDistance,
            yaw: this.cameraYaw,
            pitch: this.cameraPitch,
            target: [...this.cameraTarget]
        };
        console.log('Initial camera position set');
    }
    
    setFinalCamera() {
        this.finalCamera = {
            distance: this.cameraDistance,
            yaw: this.cameraYaw,
            pitch: this.cameraPitch,
            target: [...this.cameraTarget]
        };
        this.keyedCameraTime = this.animationTime; // Set keyed time to current time
        console.log('Final camera position set at time:', this.keyedCameraTime);
    }
    
    setMaxTime(newMaxTime) {
        this.maxTime = Math.max(100, newMaxTime);
        this.animationDuration = this.maxTime;
        
        // Clamp current time within new bounds
        this.animationTime = Math.max(0, Math.min(this.animationTime, this.animationDuration));
        
        // Update keyed camera time if it exceeds new duration
        if (this.keyedCameraTime > this.animationDuration) {
            this.keyedCameraTime = this.animationDuration;
        }
        
        this.updatePointPositions();
        this.updateUI();
    }
    
    playAnimation() {
        // If at end (or start when reversed), restart from opposite end
        if (this.isReversed) {
            if (this.animationTime <= 0) {
                this.animationTime = this.animationDuration;
            }
        } else {
            if (this.animationTime >= this.animationDuration) {
                this.animationTime = 0;
            }
        }
        
        this.isPlaying = true;
        document.getElementById('playPause').innerHTML = '⏸';
        document.getElementById('animationStatus').textContent = this.isReversed ? 'Playing (Reverse)' : 'Playing';
    }
    
    updateUI() {
        document.getElementById('timeSlider').value = this.animationTime;
        document.getElementById('timeValue').textContent = Math.round(this.animationTime);
        this.updateTimeDisplay();
    }
    
    updateTimeDisplay() {
        const minutes = Math.floor(this.animationTime / 60000);
        const seconds = Math.floor((this.animationTime % 60000) / 1000);
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timeDisplay').textContent = display;
    }
    
    updateStats() {
        document.getElementById('actualPoints').textContent = this.actualPoints.toLocaleString();
        document.getElementById('resolution').textContent = `${this.canvas.width}x${this.canvas.height}`;
    }
    
    // Utility methods
    updatePointCount(newCount) {
        this.maxPoints = newCount;
        if (this.sourceImage) {
            this.generatePointsFromImage(this.sourceImage);
        }
    }
    
    updateDepthRange(newRange) {
        this.depthRange = newRange;
        if (this.sourceImage) {
            this.generatePointsFromImage(this.sourceImage);
        }
    }
    
    applyMotionSettings() {
        if (this.sourceImage) {
            this.generatePointsFromImage(this.sourceImage);
        }
        this.resetAnimation();
    }
    
    // Export and recording functionality
    savePNG() {
        // Hide GUI during capture
        this.hideGUI();
        
        setTimeout(() => {
            try {
                // Create high-resolution canvas for export
                const originalWidth = this.canvas.width;
                const originalHeight = this.canvas.height;
                const pixelRatio = window.devicePixelRatio || 1;
                
                // Temporarily resize for high-DPI export
                this.canvas.width = originalWidth * pixelRatio;
                this.canvas.height = originalHeight * pixelRatio;
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                
                // Re-render at high resolution
                this.render();
                
                // Generate filename with timestamp
                const now = new Date();
                const timestamp = now.getFullYear() +
                    String(now.getMonth() + 1).padStart(2, '0') +
                    String(now.getDate()).padStart(2, '0') + '_' +
                    String(now.getHours()).padStart(2, '0') +
                    String(now.getMinutes()).padStart(2, '0') +
                    String(now.getSeconds()).padStart(2, '0');
                
                const link = document.createElement('a');
                link.download = `pointcloud_${timestamp}.png`;
                link.href = this.canvas.toDataURL('image/png');
                link.click();
                
                // Restore original canvas size
                this.canvas.width = originalWidth;
                this.canvas.height = originalHeight;
                this.gl.viewport(0, 0, originalWidth, originalHeight);
                
                console.log('PNG saved successfully:', link.download);
            } catch (error) {
                console.error('Failed to save PNG:', error);
            } finally {
                // Restore GUI
                this.showGUI();
            }
        }, 100); // Small delay to ensure GUI is hidden
    }
    
    startRecording() {
        // Safety: If already recording, stop it
        if (this.isRecording) {
            this.stopRecording();
            return;
        }
        
        this.isRecording = true;
        this.hideGUI();
        
        // Store original animation state
        this.originalAnimationState = {
            time: this.animationTime,
            isPlaying: this.isPlaying
        };
        
        // Reset to beginning based on reverse toggle
        this.animationTime = this.isReversed ? this.animationDuration : 0;
        this.updatePointPositions();
        
        // Set up MediaRecorder with high quality settings
        const stream = this.canvas.captureStream(60); // 60 FPS
        const options = {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 12000000 // 12 Mbps for higher quality
        };
        
        // Fallback to VP8 if VP9 not supported
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm;codecs=vp8';
        }
        
        this.mediaRecorder = new MediaRecorder(stream, options);
        this.recordedChunks = [];
        
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };
        
        this.mediaRecorder.onstop = () => {
            this.processRecording();
        };
        
        // Set up automatic stop when animation completes
        this.recordingCheckInterval = setInterval(() => {
            const atEnd = this.isReversed ? 
                this.animationTime <= 0 : 
                this.animationTime >= this.animationDuration;
                
            if (atEnd && !this.loopAnimation) {
                this.stopRecording();
            }
        }, 100);
        
        this.mediaRecorder.start();
        this.playAnimation(); // Start playback
        
        console.log('Recording started');
        document.getElementById('recordButton').textContent = 'Stop Recording';
        document.getElementById('recordButton').classList.add('recording');
    }
    
    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;
        
        this.isRecording = false;
        
        // Clear the recording check interval
        if (this.recordingCheckInterval) {
            clearInterval(this.recordingCheckInterval);
            this.recordingCheckInterval = null;
        }
        
        // Stop animation and MediaRecorder
        this.pauseAnimation();
        this.mediaRecorder.stop();
        
        // Reset button state
        document.getElementById('recordButton').textContent = 'Record';
        document.getElementById('recordButton').classList.remove('recording');
        
        console.log('Recording stopped');
    }
    
    processRecording() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        
        // Generate filename with timestamp
        const now = new Date();
        const timestamp = now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
        
        // Try to convert to MP4 using ffmpeg.wasm (if available)
        if (window.FFmpeg) {
            this.convertToMP4(blob, timestamp);
        } else {
            // Fallback to WebM download with clear filename
            this.downloadVideo(blob, `pointcloud_${timestamp}.webm`);
        }
        
        // Restore GUI and reset to terminal frame
        this.showGUI();
        
        // Reset to paused state at terminal frame
        this.pauseAnimation();
        
        console.log('Recording processed');
    }
    
    async convertToMP4(webmBlob, timestamp) {
        try {
            // Load FFmpeg.wasm
            const { FFmpeg } = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.7/dist/esm/index.js');
            const { fetchFile } = await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js');
            
            const ffmpeg = new FFmpeg();
            await ffmpeg.load();
            
            // Write input file
            await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
            
            // Convert to MP4 with high quality settings
            await ffmpeg.exec([
                '-i', 'input.webm',
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '18', // Higher quality
                '-pix_fmt', 'yuv420p',
                '-movflags', '+faststart',
                'output.mp4'
            ]);
            
            const outputData = await ffmpeg.readFile('output.mp4');
            const mp4Blob = new Blob([outputData.buffer], { type: 'video/mp4' });
            
            this.downloadVideo(mp4Blob, `pointcloud_${timestamp}.mp4`);
            console.log('MP4 conversion successful');
        } catch (error) {
            console.warn('MP4 conversion failed, downloading as WebM:', error);
            this.downloadVideo(webmBlob, `pointcloud_${timestamp}.webm`);
        }
    }
    
    downloadVideo(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }
    
    hideGUI() {
        this.isGUIHidden = true;
        document.getElementById('controls').style.display = 'none';
        document.getElementById('upload-area').style.display = 'none';
        const toolbar = document.getElementById('toolbar');
        if (toolbar) toolbar.style.display = 'none';
    }
    
    showGUI() {
        this.isGUIHidden = false;
        document.getElementById('controls').style.display = 'block';
        document.getElementById('upload-area').style.display = 'block';
        const toolbar = document.getElementById('toolbar');
        if (toolbar) toolbar.style.display = 'flex';
    }
    
    toggleGUI() {
        if (this.isGUIHidden) {
            this.showGUI();
        } else {
            this.hideGUI();
        }
    }
    
    // Settings save/load functionality
    exportSettings() {
        const settings = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            animation: {
                maxTime: this.maxTime,
                bufferTime: this.bufferTime,
                easeInTime: this.easeInTime,
                easeOutTime: this.easeOutTime,
                easeType: this.easeType,
                isReversed: this.isReversed,
                loopAnimation: this.loopAnimation,
                autoPause: this.autoPause
            },
            camera: {
                initial: this.initialCamera,
                final: this.finalCamera,
                keyedTime: this.keyedCameraTime,
                animateCamera: this.animateCamera
            },
            points: {
                maxPoints: this.maxPoints,
                pointSize: this.pointSize,
                depthRange: this.depthRange,
                sizeMode: this.sizeMode,
                sizeMean: this.sizeMean,
                sizeStdDev: this.sizeStdDev
            },
            colors: {
                backgroundColor: this.backgroundColor,
                pointColorMode: this.pointColorMode,
                pointColorA: this.pointColorA,
                pointColorB: this.pointColorB
            },
            motion: {
                algorithm: this.motionAlgorithm,
                params: this.motionParams
            }
        };
        
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pointcloud_settings.json';
        link.click();
        URL.revokeObjectURL(url);
        
        console.log('Settings exported');
    }
    
    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                this.applySettings(settings);
                console.log('Settings imported successfully');
            } catch (error) {
                console.error('Failed to import settings:', error);
                alert('Invalid settings file');
            }
        };
        reader.readAsText(file);
    }
    
    applySettings(settings) {
        if (!settings || !settings.version) {
            throw new Error('Invalid settings format');
        }
        
        console.log('Applying settings instantly...');
        
        // Apply animation settings
        if (settings.animation) {
            this.maxTime = settings.animation.maxTime || 5000;
            this.animationDuration = this.maxTime;
            this.bufferTime = settings.animation.bufferTime || 0;
            this.easeInTime = settings.animation.easeInTime || 500;
            this.easeOutTime = settings.animation.easeOutTime || 500;
            this.easeType = settings.animation.easeType || 'sin';
            this.isReversed = settings.animation.isReversed || false;
            this.loopAnimation = settings.animation.loopAnimation || false;
            this.autoPause = settings.animation.autoPause !== false;
            
            // Clamp current time within new bounds
            this.animationTime = Math.max(0, Math.min(this.animationTime, this.animationDuration));
        }
        
        // Apply camera settings
        if (settings.camera) {
            this.initialCamera = settings.camera.initial || this.initialCamera;
            this.finalCamera = settings.camera.final || this.finalCamera;
            this.keyedCameraTime = settings.camera.keyedTime || 0;
            this.animateCamera = settings.camera.animateCamera || false;
        }
        
        // Apply point settings
        if (settings.points) {
            this.maxPoints = settings.points.maxPoints || 120000;
            this.pointSize = settings.points.pointSize || 1.2;
            this.depthRange = settings.points.depthRange || 60;
            this.sizeMode = settings.points.sizeMode || 'fixed';
            this.sizeMean = settings.points.sizeMean || 1.2;
            this.sizeStdDev = settings.points.sizeStdDev || 0.3;
        }
        
        // Apply color settings
        if (settings.colors) {
            this.backgroundColor = settings.colors.backgroundColor || [0, 0, 0];
            this.pointColorMode = settings.colors.pointColorMode || 'fixed';
            this.pointColorA = settings.colors.pointColorA || [1, 1, 1];
            this.pointColorB = settings.colors.pointColorB || [0, 0.5, 1];
            this.updateBackgroundColor();
        }
        
        // Apply motion settings
        if (settings.motion) {
            this.motionAlgorithm = settings.motion.algorithm || 'random';
            this.motionParams = { ...this.motionParams, ...settings.motion.params };
        }
        
        // INSTANT APPLICATION: Sync GUI → State → Render in one transaction
        this.syncUIWithSettings();
        
        // Regenerate point cloud with new settings if image is loaded
        if (this.sourceImage) {
            this.generatePointsFromImage(this.sourceImage);
        }
        
        // Update visual state immediately
        this.updatePointPositions();
        this.generateSizeMultipliers();
        
        console.log('Settings applied instantly - no manual apply needed');
    }
    
    syncUIWithSettings() {
        // Update all UI elements to reflect current settings
        document.getElementById('maxTimeInput').value = this.maxTime;
        document.getElementById('bufferTime').value = this.bufferTime;
        document.getElementById('easeInTime').value = this.easeInTime;
        document.getElementById('easeOutTime').value = this.easeOutTime;
        document.getElementById('easeType').value = this.easeType;
        // Update unified toggle system
        if (typeof setToggle === 'function') {
            setToggle('reverse', this.isReversed);
            setToggle('loop', this.loopAnimation);
            setToggle('autoPause', this.autoPause);
            setToggle('animateCamera', this.animateCamera);
            setToggle('easeIn', this.motionParams.easeIn);
            setToggle('easeOut', this.motionParams.easeOut);
        }
        document.getElementById('pointCount').value = this.maxPoints;
        document.getElementById('pointSize').value = this.pointSize;
        document.getElementById('depthRange').value = this.depthRange;
        document.getElementById('sizeMode').value = this.sizeMode;
        document.getElementById('pointColorMode').value = this.pointColorMode;
        document.getElementById('motionAlgorithm').value = this.motionAlgorithm;
        
        // Update value displays
        document.getElementById('maxTimeValue').textContent = this.maxTime;
        document.getElementById('bufferTimeValue').textContent = this.bufferTime;
        document.getElementById('easeInTimeValue').textContent = this.easeInTime;
        document.getElementById('easeOutTimeValue').textContent = this.easeOutTime;
        document.getElementById('pointCountValue').textContent = this.maxPoints.toLocaleString();
        document.getElementById('pointSizeValue').textContent = this.pointSize;
        document.getElementById('depthRangeValue').textContent = this.depthRange;
        
        // Update color pickers
        document.getElementById('backgroundColor').value = this.rgbToHex(this.backgroundColor);
        document.getElementById('pointColorA').value = this.rgbToHex(this.pointColorA);
        document.getElementById('pointColorB').value = this.rgbToHex(this.pointColorB);
    }
    
    rgbToHex(rgb) {
        const r = Math.round(rgb[0] * 255);
        const g = Math.round(rgb[1] * 255);
        const b = Math.round(rgb[2] * 255);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
}

// Simple matrix library
const mat4 = {
    create() {
        return new Float32Array(16);
    },
    
    perspective(out, fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = (far + near) / (near - far);
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = (2 * far * near) / (near - far);
        out[15] = 0;
        return out;
    },
    
    lookAt(out, eye, center, up) {
        const eyex = eye[0], eyey = eye[1], eyez = eye[2];
        const upx = up[0], upy = up[1], upz = up[2];
        const centerx = center[0], centery = center[1], centerz = center[2];
        
        if (Math.abs(eyex - centerx) < 0.000001 &&
            Math.abs(eyey - centery) < 0.000001 &&
            Math.abs(eyez - centerz) < 0.000001) {
            return mat4.identity(out);
        }
        
        let z0 = eyex - centerx;
        let z1 = eyey - centery;
        let z2 = eyez - centerz;
        let len = 1 / Math.hypot(z0, z1, z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;
        
        let x0 = upy * z2 - upz * z1;
        let x1 = upz * z0 - upx * z2;
        let x2 = upx * z1 - upy * z0;
        len = Math.hypot(x0, x1, x2);
        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }
        
        let y0 = z1 * x2 - z2 * x1;
        let y1 = z2 * x0 - z0 * x2;
        let y2 = z0 * x1 - z1 * x0;
        
        out[0] = x0;
        out[1] = y0;
        out[2] = z0;
        out[3] = 0;
        out[4] = x1;
        out[5] = y1;
        out[6] = z1;
        out[7] = 0;
        out[8] = x2;
        out[9] = y2;
        out[10] = z2;
        out[11] = 0;
        out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        out[15] = 1;
        
        return out;
    },
    
    multiply(out, a, b) {
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        
        let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
        
        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
        
        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
        
        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
        return out;
    },
    
    identity(out) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
};

// Global variables
let renderer;

// Initialize application
function init() {
    const canvas = document.getElementById('canvas');
    
    try {
        renderer = new PointCloudRenderer(canvas);
        console.log('WebGL Point Cloud Renderer initialized');
    } catch (error) {
        alert('Failed to initialize WebGL: ' + error.message);
        return;
    }
    
    setupUI();
    loadDefaultImage();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
