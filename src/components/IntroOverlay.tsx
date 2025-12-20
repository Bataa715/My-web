"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const IntroOverlay = () => {
    const [animationComplete, setAnimationComplete] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setAnimationComplete(false);
        const timer = setTimeout(() => setAnimationComplete(true), 1500); // Total animation duration
        return () => clearTimeout(timer);
    }, [pathname]);


    if (animationComplete) {
        return null;
    }

    const slideIn = {
        initial: { x: '0%' },
        animate: { x: '100%' },
    };

     const slideOut = {
        initial: { x: '-100%' },
        animate: { x: '0%' },
    };

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-full h-full bg-primary z-[101]"
                variants={slideIn}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.8, ease: [0.83, 0, 0.17, 1] }}
            />
            <motion.div
                className="fixed top-0 left-0 w-full h-full bg-black z-[100]"
                variants={slideOut}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.8, ease: [0.83, 0, 0.17, 1] }}
            />
        </>
    );
};

export default IntroOverlay;
