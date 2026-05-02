// neural-bg.js
document.addEventListener("DOMContentLoaded", () => {
    // 1. Create and inject the canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'neural-canvas';
    
    // Style it to fill the screen and sit behind the content
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '-1',
        opacity: '0.5'
    });
    
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height;
    let mouse = { x: null, y: null, radius: 150 };

    // Detect if dark mode is active (MyST usually uses a .dark class on the html or body element)
    const isDark = () => document.documentElement.classList.contains('dark') || 
                         (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    };

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5; 
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= forceDirectionX * force * 0.5;
                    this.y -= forceDirectionY * force * 0.5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = isDark() ? '#22d3ee' : '#64748b'; 
            ctx.fill();
        }
    }

    const initParticles = () => {
        particles = [];
        const numberOfParticles = (width * height) / 15000; 
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    };

    const connect = () => {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = dx * dx + dy * dy;

                if (distance < (width/7) * (height/7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = isDark() 
                        ? `rgba(34, 211, 238, ${opacityValue * 0.5})` 
                        : `rgba(100, 116, 139, ${opacityValue * 0.5})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
            
            // Connect to mouse
            if (mouse.x != null) {
                let dx = particles[a].x - mouse.x;
                let dy = particles[a].y - mouse.y;
                let distance = dx * dx + dy * dy;
                if (distance < mouse.radius * mouse.radius) {
                    ctx.strokeStyle = isDark() ? `rgba(34, 211, 238, 0.4)` : `rgba(100, 116, 139, 0.4)`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    };

    const animate = () => {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, width, height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        connect();
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    resize();
    animate();
});