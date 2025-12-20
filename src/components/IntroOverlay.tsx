"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const IntroOverlay = () => {
    const [animationComplete, setAnimationComplete] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient || animationComplete) {
        return null;
    }

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-full h-full bg-primary z-[101]"
                initial={{ y: '0%' }}
                animate={{ y: '-100%' }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
            />
            <motion.div
                className="fixed top-0 left-0 w-full h-full bg-black z-[100]"
                initial={{ y: '0%' }}
                animate={{ y: '-100%' }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                onAnimationComplete={() => setAnimationComplete(true)}
            />
        </>
    );
};

export default IntroOverlay;
