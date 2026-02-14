import { useMemo } from "react";
import { motion } from "framer-motion";

type Props = {
    messages?: string[];
    speedSec?: number; // чем меньше — тем быстрее
};

export default function LoveTicker({
       messages = [
           "Я очень тебя люблю ",
           "Спасибо за то, что ты есть ",
           "Ты - мой дом ",
           "Каждый раз тону в твоих глазах",
           "Моя принцесса",
           "Каждый день рядом с тобой - подарок ",
           "Ты - моё счастье ",
       ],
       speedSec = 50,
   }: Props) {
    const line = useMemo(() => {
        // соединяем с разделителями
        const sep = "  💗  ";
        return messages.join(sep);
    }, [messages]);

    // Дублируем строку 2 раза, чтобы бесшовно ехала
    const content = `${line}   💗   ${line}   💗   `;

    return (
        <motion.div
            className="pointer-events-none fixed top-3 left-0 right-0 z-50 px-4"
            initial={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="mx-auto max-w-3xl rounded-full border border-white/40 bg-white/25 backdrop-blur-md shadow-sm overflow-hidden">
                <div className="relative h-9">
                    <motion.div
                        className="absolute top-0 left-0 h-9 flex items-center whitespace-nowrap"
                        initial={{ x: "0%" }}
                        animate={{ x: "-50%" }}
                        transition={{
                            duration: speedSec,
                            ease: "linear",
                            repeat: Infinity,
                        }}
                    >
            <span className="px-4 text-sm text-rose-900/90">
              {content}
            </span>
                        <span className="px-4 text-sm text-rose-900/90">
              {content}
            </span>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
