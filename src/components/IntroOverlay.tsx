
"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const IntroOverlay = () => {
    const [isAnimationComplete, setIsAnimationComplete] = useState(false);

    useEffect(() => {
        // This effect runs only once on the client
        const hasAnimationPlayed = sessionStorage.getItem('introAnimationPlayed');

        if (hasAnimationPlayed) {
            setIsAnimationComplete(true);
        } else {
            sessionStorage.setItem('introAnimationPlayed', 'true');
        }
    }, []);

    if (isAnimationComplete) {
        return null;
    }

    return (
        <>
            {/* First layer */}
            <motion.div
                className="fixed top-0 left-0 w-full h-full bg-black z-[101]"
                initial={{ height: '100vh' }}
                animate={{ height: 0 }}
                transition={{ duration: 0.8, ease: [0.83, 0, 0.17, 1], delay: 1 }}
                onAnimationComplete={() => setIsAnimationComplete(true)}
            />
            {/* Second layer */}
             <motion.div
                className="fixed top-0 left-0 w-full h-full bg-primary z-[100]"
                initial={{ height: '100vh' }}
                animate={{ height: 0 }}
                transition={{ duration: 0.8, ease: [0.83, 0, 0.17, 1], delay: 1.2 }}
            />
        </>
    );
};

export default IntroOverlay;
