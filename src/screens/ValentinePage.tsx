import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import HeartHalf from "../components/HeartHalf";
import FloatingHearts from "../components/FloatingHearts";
import HeartPhoto from "../components/HeartPhoto";

type Spread = { left: string; right: string };

const SPREADS: Spread[] = [
    { left: "/photos/IMG_0019.JPG", right: "/photos/IMG_0949.JPG" },
    { left: "/photos/IMG_1662.JPG", right: "/photos/IMG_1786.JPG" },
    { left: "/photos/IMG_2064.JPG", right: "/photos/IMG_2417.JPG" },
    { left: "/photos/IMG_2435.JPG", right: "/photos/IMG_5029.JPG" },
    { left: "/photos/IMG_0872.JPG", right: "/photos/IMG_1120.JPG" },
    { left: "/photos/IMG_2296.JPG", right: "/photos/IMG_2306.JPG" },
    { left: "/photos/IMG_5562.JPG", right: "/photos/IMG_5563.JPG" },
];

const MUSIC_SRC = "/music/love.mp3";

export default function ValentinePage() {
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [, setMusicOn] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const openMV = useMotionValue(0); // 0 = closed, 1 = open
    const [shuffleOn, setShuffleOn] = useState(false);
    const [shufflePair, setShufflePair] = useState<Spread>(SPREADS[0]);
    const shuffleTimerRef = useRef<number | null>(null);
    const autoTimerRef = useRef<number | null>(null);
    const spread = useMemo(() => SPREADS[page % SPREADS.length], [page]);
    const activeSpread = shuffleOn ? shufflePair : spread;

    const [progress, setProgress] = useState(0);

    const SLIDE_MS = 5500;          // интервал между сменами
    const FADE_SEC = 1.5;           // длительность fade (должна совпасть с HeartPhoto fadeDuration)
    const PROGRESS_MS = SLIDE_MS;   // заполняем весь интервал (можно SLIDE_MS - FADE*1000)

    useEffect(() => {
        // прогресс не должен идти во время шаффла или когда закрыто
        if (!open || shuffleOn) return;

        // сброс
        setProgress(0);

        const start = performance.now();
        let raf = 0;

        const tick = () => {
            const t = Math.min(1, (performance.now() - start) / PROGRESS_MS);
            setProgress(t);
            if (t < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [page, open, shuffleOn]);


    const pickRandomSpread = (avoid?: Spread) => {
        if (SPREADS.length === 1) return SPREADS[0];
        let s = SPREADS[Math.floor(Math.random() * SPREADS.length)];
        // простая попытка не повторяться
        if (avoid && s.left === avoid.left && s.right === avoid.right) {
            s = SPREADS[(Math.floor(Math.random() * (SPREADS.length - 1)) + 1) % SPREADS.length];
        }
        return s;
    };

    const stopAuto = () => {
        if (autoTimerRef.current) {
            window.clearInterval(autoTimerRef.current);
            autoTimerRef.current = null;
        }
    };

    const startAuto = () => {
        stopAuto();
        autoTimerRef.current = window.setInterval(() => {
            setPage((p) => (p + 1) % SPREADS.length);
        }, SLIDE_MS);
    };


    const stopShuffle = () => {
        setShuffleOn(false);
        if (shuffleTimerRef.current) {
            window.clearTimeout(shuffleTimerRef.current);
            shuffleTimerRef.current = null;
        }
    };

    const startShuffle = (finalPage: number) => {
        setProgress(0);
        stopAuto();

        setShuffleOn(true);

        const start = performance.now();
        const totalMs = 2200;      // общая длительность эффекта
        const minInterval = 60;    // стартовая скорость (мс)
        const maxInterval = 260;   // конечная скорость (мс)

        const step = () => {
            const now = performance.now();
            const elapsed = now - start;

            // прогресс 0..1
            const t = Math.min(1, elapsed / totalMs);

            // интервал растёт к концу (замедление)
            const interval = Math.round(minInterval + (maxInterval - minInterval) * (t * t));

            // подбираем случайную пару
            setShufflePair((prev) => pickRandomSpread(prev));

            if (elapsed < totalMs) {
                shuffleTimerRef.current = window.setTimeout(step, interval);
            } else {
                // фиксируем на нужной странице
                setShufflePair(SPREADS[finalPage]);
                setShuffleOn(false);
                shuffleTimerRef.current = null;
                startAuto();
            }
        };

        // небольшой стартовый тик “сразу”
        step();
    };


    const openHeart = async () => {
        setOpen(true); // нужно, чтобы кнопки/контролы появились
        animate(openMV, 1, { duration: 1.05, ease: [0.22, 1, 0.36, 1] }); // smooth “book open”
        startShuffle(page);

        const a = audioRef.current;
        if (!a) return;
        try {
            a.volume = 0.0;
            await a.play();
            setMusicOn(true);
            // плавный fade-in громкости
            const start = performance.now();
            const tick = () => {
                const t = Math.min(1, (performance.now() - start) / 800);
                a.volume = 0.3 * t;
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        } catch {
            setMusicOn(false);
        }
    };

    const closeHeart = () => {
        stopAuto();
        stopShuffle();

        animate(openMV, 0, {
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
            onComplete: () => setOpen(false),
        });

        const a = audioRef.current;
        if (a) a.pause();
        setMusicOn(false);
    };

    return (
        <div className="min-h-screen relative bg-gradient-to-b from-pink-50 via-rose-50 to-rose-100 flex items-center justify-center p-6">
            <audio ref={audioRef} src={MUSIC_SRC} loop />

            <FloatingHearts count={40} />

            <div className="w-full max-w-3xl">
                <div className="text-center mb-8">
                    <h1 className="font-love text-5xl md:text-6xl font-semibold text-rose-900">
                        My Valentine
                    </h1>
                </div>

                <div className="flex justify-center">
                    <div className="perspective-1000">
                        <div className="relative w-[360px] h-[340px] md:w-[620px] md:h-[620px]">

                            {/* BOOK WRAPPER: чуть сдвигается вправо во время открытия */}
                            <motion.div
                                className="absolute inset-0 preserve-3d"
                                animate={!open ? { scale: [1, 1.02, 1, 1.035, 1] } : { scale: 1 }}
                                transition={!open ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 3 }}
                                style={{
                                    x: useTransform(openMV, [0, 1], [0, 48]),  // подстрой 30..70
                                    rotateZ: useTransform(openMV, [0, 1], [0, -1.2]),
                                }}
                            >
                                {/* RIGHT PAGE (статичная) */}
                                <div className="absolute inset-0">
                                    {/* front cover of right page (виден в закрытом) */}
                                    <motion.div
                                        className="absolute ≠inset-0 backface-hidden"
                                        style={{
                                            opacity: useTransform(openMV, [1, 1], [1, 0])}}
                                    >
                                        <HeartHalf side="full" fill="#fb2c68" className="w-full h-full drop-shadow-2xl" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                        </div>
                                    </motion.div>

                                    {/* inside of right page (виден при открытии) */}
                                    <motion.div
                                        className="absolute inset-0 preserve-3d"
                                        style={{
                                            transformOrigin: "69.9%",
                                            rotateY: "180deg",
                                            opacity: useTransform(openMV, [0.25, 0.6, 1], [0, 1, 1]),
                                        }}
                                    >
                                        <HeartPhoto
                                            src={activeSpread.right}            // или right
                                            className="w-full h-full drop-shadow-2xl"
                                            fadeEnabled={!shuffleOn}           // во время шаффла без fade, после — плавно
                                            fadeDuration={FADE_SEC}
                                            progress={progress}                // общий прогресс на обе стороны
                                            outlineWidth={3}
                                            progressWidth={2}
                                        />
                                    </motion.div>
                                </div>

                                {/* LEFT PAGE (вращается) */}
                                <motion.div
                                    className="absolute inset-0 preserve-3d"
                                    style={{
                                        transformOrigin: "26.2% 50%",
                                        rotateY: useTransform(openMV, [0, 1], [0, 180]),
                                    }}
                                >
                                    {/* front cover of left page (виден в закрытом) */}
                                    <div className="absolute inset-0 backface-hidden">
                                        <HeartHalf side="full" fill="#fb2c68" className="w-full h-full drop-shadow-2xl" />
                                    </div>

                                    {/* inside of left page (виден при открытии) */}
                                    <motion.div
                                        className="absolute inset-0 backface-hidden"
                                        style={{
                                            transform: "rotateY(180deg)",
                                            opacity: useTransform(openMV, [0.25, 0.6, 1], [0, 1, 1]),
                                        }}
                                    >
                                        <HeartPhoto
                                            src={activeSpread.left}            // или right
                                            className="w-full h-full drop-shadow-2xl"
                                            fadeEnabled={!shuffleOn}           // во время шаффла без fade, после — плавно
                                            fadeDuration={FADE_SEC}
                                            progress={progress}                // общий прогресс на обе стороны
                                            outlineWidth={3}
                                            progressWidth={2}
                                        />
                                    </motion.div>

                                    {/* тень на сгибе, чтобы было “бумажно” */}
                                    <motion.div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            opacity: useTransform(openMV, [0, 0.5, 1], [0, 0.25, 0]),
                                        }}
                                    >
                                        <div className="absolute left-1/2 top-[10%] bottom-[10%] w-16 -translate-x-1/2 bg-gradient-to-r from-black/25 via-transparent to-black/25" />
                                    </motion.div>
                                </motion.div>

                                {/* Click layer */}
                                <button
                                    type="button"
                                    onClick={() => (open ? closeHeart() : openHeart())}
                                    className="absolute inset-0"
                                    aria-label="Toggle"
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
