import { useEffect, useRef } from "react";

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = () => document.documentElement.classList.contains("dark");

    let animationId: number;
    let particles: Particle[] = [];
    const mouse = { x: -1000, y: -1000 };
    const mouseRadius = 200;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseRadius: number;
      opacity: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.baseRadius = Math.random() * 2 + 1;
        this.radius = this.baseRadius;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update(w: number, h: number) {
        // Mouse attraction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius && dist > 5) {
          const force = (mouseRadius - dist) / mouseRadius;
          this.vx += (dx / dist) * force * 0.3;
          this.vy += (dy / dist) * force * 0.3;
          this.radius = this.baseRadius + force * 3;
        } else {
          this.radius += (this.baseRadius - this.radius) * 0.1;
        }

        // Damping
        this.vx *= 0.98;
        this.vy *= 0.98;

        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }

      draw(ctx: CanvasRenderingContext2D, dark: boolean) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const particleColor = dark ? `hsla(158, 64%, 51%, ${this.opacity})` : `hsla(158, 64%, 35%, ${this.opacity})`;
        ctx.fillStyle = particleColor;
        ctx.fill();
      }
    }

    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
    particles = Array.from({ length: count }, () => new Particle(canvas.width, canvas.height));

    const maxDist = 150;

    const animate = () => {
      const dark = isDark();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (dark) {
        grad.addColorStop(0, "hsl(220, 30%, 8%)");
        grad.addColorStop(0.5, "hsl(200, 25%, 12%)");
        grad.addColorStop(1, "hsl(240, 20%, 10%)");
      } else {
        grad.addColorStop(0, "hsl(210, 30%, 96%)");
        grad.addColorStop(0.5, "hsl(200, 25%, 93%)");
        grad.addColorStop(1, "hsl(220, 20%, 95%)");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.update(canvas.width, canvas.height);
        p.draw(ctx, dark);
      }

      // Draw connections (including to mouse)
      for (let i = 0; i < particles.length; i++) {
        // Connect to mouse
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < maxDist * 1.5) {
          const alpha = (1 - mDist / (maxDist * 1.5)) * 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = dark ? `hsla(158, 64%, 60%, ${alpha})` : `hsla(158, 64%, 30%, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = dark ? `hsla(158, 64%, 51%, ${alpha})` : `hsla(158, 64%, 30%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default AnimatedBackground;
