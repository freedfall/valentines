import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = {
    src: string;
    className?: string;

    fadeEnabled?: boolean;
    fadeDuration?: number; // seconds

    outlineColor?: string;
    outlineWidth?: number;

    progress?: number; // 0..1
    progressColor?: string;
    progressWidth?: number;
};

export default function HeartPhoto({
       src,
       className,
       fadeEnabled = true,
       fadeDuration = 1.05, // чуть дольше — будет “плавно”

       outlineColor = "rgba(244, 63, 94, 0.28)",
       outlineWidth = 10,

       progress = 0,
       progressColor = "#82193f",
       progressWidth = 10,
   }: Props) {
    const id = useId();
    const prevRef = useRef<string>(src);
    const [prev, setPrev] = useState<string>(src);

    useEffect(() => {
        if (src !== prevRef.current) {
            setPrev(prevRef.current);      // запоминаем прошлую
            prevRef.current = src;
        }
    }, [src]);

    const heartPath =
        "M256 448s-44.8-27.2-83.2-56.3C112 350.2 48 295.2 48 208 48 141.5 101.5 88 168 88c38.1 0 74 18.2 96 46.4C286 106.2 321.9 88 360 88c66.5 0 120 53.5 120 120 0 87.2-64 142.2-124.8 183.7C300.8 420.8 256 448 256 448z";

    const p = Math.max(0, Math.min(1, progress));

    return (
        <svg viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <clipPath id={`${id}-heart`}>
                    <path d={heartPath} />
                </clipPath>
            </defs>

            {/* Фото внутри сердца */}
            <g clipPath={`url(#${id}-heart)`}>
                <g transform="translate(256 256) scale(0.87) translate(-256 -256)">
                {!fadeEnabled ? (
                    <image href={src} x="0" y="0" width="512" height="512" preserveAspectRatio="xMidYMid slice" />
                ) : (
                    <>
                        {/* PREV: слегка приближается и размывается, исчезает */}
                        {prev && prev !== src && (
                            <motion.image
                                key={`prev-${prev}`}
                                href={prev}
                                x="0"
                                y="0"
                                width="512"
                                height="512"
                                preserveAspectRatio="xMidYMid slice"
                                initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                animate={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
                                transition={{
                                    duration: fadeDuration,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            />
                        )}

                        {/* NEXT: появляется из лёгкого зума и становится резкой */}
                        <motion.image
                            key={`next-${src}`}
                            href={src}
                            x="0"
                            y="0"
                            width="512"
                            height="512"
                            preserveAspectRatio="xMidYMid slice"
                            initial={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1.0, filter: "blur(0px)" }}
                            transition={{
                                duration: fadeDuration,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        />
                    </>
                )}
                </g>
            </g>

            {/* Базовая обводка */}
            <path
                d={heartPath}
                fill="none"
                stroke={outlineColor}
                strokeWidth={outlineWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
            />

            {/* Прогресс-обводка */}
            <path
                d={heartPath}
                fill="none"
                stroke={progressColor}
                strokeWidth={progressWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - p}
                style={{ filter: "drop-shadow(0px 4px 10px rgba(244,63,94,0.22))" }}
            />
        </svg>
    );
}
