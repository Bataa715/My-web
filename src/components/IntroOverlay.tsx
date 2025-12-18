
"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const IntroOverlay = () => {
    const [animationComplete, setAnimationComplete] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setAnimationComplete(false);
        const timer = setTimeout(() => setAnimationComplete(true), 1400); // Animation duration + delay
        return () => clearTimeout(timer);
    }, [pathname]);


    if (animationComplete) {
        return null;
    }

    return (
        <>
            {/* First layer */}
            <motion.div
                className="fixed top-0 left-0 w-full h-full bg-black z-[101]"
                initial={{ height: '100vh' }}
                animate={{ height: 0 }}
                transition={{ duration: 0.6, ease: [0.83, 0, 0.17, 1], delay: 0.6 }}
            />
            {/* Second layer */}
             <motion.div
                className="fixed top-0 left-0 w-full h-full bg-primary z-[100]"
                initial={{ height: '100vh' }}
                animate={{ height: 0 }}
                transition={{ duration: 0.6, ease: [0.83, 0, 0.17, 1], delay: 0.8 }}
            />
        </>
    );
};

export default IntroOverlay;
