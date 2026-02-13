import { useEffect, useMemo, useRef } from "react";

type Heart = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
    blur: number;
    rot: number;
    rotSpeed: number;
    depth: number; // 0..1 (0 = far, 1 = near)
};

function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

const COLORS = [
    "rgba(244,63,94,0.45)",
    "rgba(251,113,133,0.38)",
    "rgba(236,72,153,0.34)",
    "rgba(255,140,175,0.32)",
];

export default function FloatingHearts({
       count = 50,
       baseUpSpeed = 0.55,
       drift = 0.2,
       repelRadius = 80,
       repelForce = 0.55,
       friction = 0.96,
       parallax = 18, // px амплитуда параллакса
   }: {
    count?: number;
    baseUpSpeed?: number;
    drift?: number;
    repelRadius?: number;
    repelForce?: number;
    friction?: number;
    parallax?: number;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const heartRefs = useRef<(HTMLDivElement | null)[]>([]);
    const heartsRef = useRef<Heart[]>([]);
    const rafRef = useRef<number | null>(null);

    const mouse = useRef({ x: -9999, y: -9999 });
    const par = useRef({ x: 0, y: 0 }); // текущий параллакс-офсет

    const initHearts = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        heartsRef.current = Array.from({ length: count }).map(() => {
            const depth = Math.pow(Math.random(), 1.8); // чаще “дальние”
            const size = rand(24, 38) * (0.65 + depth * 0.65);
            return {
                x: rand(0, w),
                y: rand(0, h),
                vx: rand(-0.15, 0.15),
                vy: rand(-0.1, 0.1),
                size,
                color: COLORS[Math.floor(rand(0, COLORS.length))],
                opacity: (0.40 + depth * 0.30) * rand(0.8, 1.05),
                blur: rand(0, 1.2) * (1 - depth * 0.65),
                rot: rand(-18, 18),
                rotSpeed: rand(-0.12, 0.12) * (0.7 + depth * 0.6),
                depth,
            };
        });
    };

    useMemo(() => {
        initHearts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onMove = (e: PointerEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;

            const w = window.innerWidth;
            const h = window.innerHeight;

            // желаемый параллакс относительно центра
            const tx = ((e.clientX - w / 2) / (w / 2)) * parallax;
            const ty = ((e.clientY - h / 2) / (h / 2)) * parallax;

            // чуть сглаживаем
            par.current.x += (tx - par.current.x) * 0.08;
            par.current.y += (ty - par.current.y) * 0.08;
        };

        const onLeave = () => {
            mouse.current.x = -9999;
            mouse.current.y = -9999;
        };

        container.addEventListener("pointermove", onMove);
        container.addEventListener("pointerleave", onLeave);

        const tick = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const mx = mouse.current.x;
            const my = mouse.current.y;

            // если мышь не двигается — медленно возвращаем параллакс к 0
            par.current.x += (0 - par.current.x) * 0.02;
            par.current.y += (0 - par.current.y) * 0.02;

            for (let i = 0; i < heartsRef.current.length; i++) {
                const heart = heartsRef.current[i];
                const el = heartRefs.current[i];
                if (!el) continue;

                // глубина влияет на скорость
                const depthSpeed = 0.6 + heart.depth * 0.9; // ближние быстрее

                // 1) постоянный подъём
                heart.y -= baseUpSpeed * depthSpeed;

                // 2) лёгкий дрейф
                heart.vx += rand(-drift, drift) * 0.02 * depthSpeed;

                // 3) отталкивание курсором
                const dx = heart.x - mx;
                const dy = heart.y - my;
                const dist = Math.hypot(dx, dy);

                if (dist < repelRadius) {
                    const t = 1 - dist / repelRadius;
                    const nx = dx / (dist || 1);
                    const ny = dy / (dist || 1);

                    // ближние реагируют сильнее
                    const depthForce = repelForce * (0.45 + heart.depth * 0.9);

                    heart.vx += nx * depthForce * t;
                    heart.vy += ny * depthForce * t;
                }

                // 4) импульсы
                heart.x += heart.vx;
                heart.y += heart.vy;

                // 5) трение (чуть сильнее для дальних — чтобы не “летали”)
                const depthFriction = friction - (1 - heart.depth) * 0.02;
                heart.vx *= depthFriction;
                heart.vy *= depthFriction;

                // 6) вращение
                heart.rot += heart.rotSpeed;

                // 7) респавн снизу
                if (heart.y < -160) {
                    heart.y = h + rand(60, 240);
                    heart.x = rand(0, w);
                    heart.vx = rand(-0.15, 0.15);
                    heart.vy = rand(-0.1, 0.1);
                }

                // wrap по горизонтали
                if (heart.x < -180) heart.x = w + 180;
                if (heart.x > w + 180) heart.x = -180;

                // параллакс: ближние двигаются сильнее
                const px = par.current.x * (0.25 + heart.depth * 0.75);
                const py = par.current.y * (0.25 + heart.depth * 0.75);

                el.style.transform = `translate3d(${heart.x + px}px, ${heart.y + py}px, 0) rotate(${heart.rot}deg)`;
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        const onResize = () => {
            // можно не делать ничего, но при резайзе приятнее пересчитать
            initHearts();
        };
        window.addEventListener("resize", onResize);

        return () => {
            container.removeEventListener("pointermove", onMove);
            container.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("resize", onResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [baseUpSpeed, drift, repelRadius, repelForce, friction, parallax]);

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden">
            {heartsRef.current.map((h, i) => (
                <div
                    key={i}
                    ref={(el) => {
                        heartRefs.current[i] = el;
                    }}
                    className="absolute pointer-events-none"
                    style={{
                        width: h.size,
                        height: h.size,
                        opacity: h.opacity,
                        color: h.color,
                        filter: `blur(${h.blur}px)`,
                        transform: `translate3d(${h.x}px, ${h.y}px, 0) rotate(${h.rot}deg)`,
                        willChange: "transform",
                    }}
                >
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                        <path
                            d="M12 21s-6.716-4.35-9.428-7.063C.787 12.152 0 10.94 0 9.5 0 6.462 2.462 4 5.5 4c1.74 0 3.37.81 4.5 2.09C11.13 4.81 12.76 4 14.5 4 17.538 4 20 6.462 20 9.5c0 1.44-.787 2.652-2.572 4.437C18.716 16.65 12 21 12 21z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
            ))}
        </div>
    );
}
