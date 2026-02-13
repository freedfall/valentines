import { useId } from "react";

type Side = "left" | "right" | "full";

type Props = {
    side: Side;
    className?: string;
    fill?: string;          // если нужен цвет
    imageHref?: string;     // если нужна картинка
    rounded?: boolean;
};

export default function HeartHalf({
                                      side,
                                      className,
                                      fill,
                                      imageHref,
                                  }: Props) {
    const id = useId();

    // Heart path (классический)
    const heartPath =
        "M256 448s-44.8-27.2-83.2-56.3C112 350.2 48 295.2 48 208 48 141.5 101.5 88 168 88c38.1 0 74 18.2 96 46.4C286 106.2 321.9 88 360 88c66.5 0 120 53.5 120 120 0 87.2-64 142.2-124.8 183.7C300.8 420.8 256 448 256 448z";

    const halfRect =
        side === "left"
            ? { x: 0, y: 0, w: 256, h: 512 }
            : side === "right"
                ? { x: 256, y: 0, w: 256, h: 512 }
                : { x: 0, y: 0, w: 512, h: 512 };

    return (
        <svg
            viewBox="0 0 512 512"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <defs>
                <clipPath id={`${id}-heart`}>
                    <path d={heartPath} />
                </clipPath>
                <clipPath id={`${id}-half`}>
                    <rect x={halfRect.x} y={halfRect.y} width={halfRect.w} height={halfRect.h} />
                </clipPath>
            </defs>

            {/* Сначала ограничиваем сердцем, потом половиной */}
            <g clipPath={`url(#${id}-heart)`}>
                <g clipPath={`url(#${id}-half)`}>
                    {imageHref ? (
                        <image
                            href={imageHref}
                            x="0"
                            y="0"
                            width="480"
                            height="480"
                            preserveAspectRatio="xMidYMid slice"
                        />
                    ) : (
                        <rect x="0" y="0" width="620" height="620" fill={fill ?? "#fb7185"} />
                    )}
                </g>
            </g>
        </svg>
    );
}
