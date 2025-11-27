import React from 'react';
import { ContainerScroll } from '../components/ContainerScroll';
import { useTransform, motion } from 'framer-motion';

function ScrollableText({ scrollYProgress }) {
    const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
    const y = useTransform(scrollYProgress, [0, 0.1], [20, 0]);

    return (
        <div className="h-full w-full flex items-center justify-center">
            <motion.p
                className="text-xl md:text-2xl text-white"
                style={{
                    opacity,
                    y,
                }}
            >
                excessive web resumes are dumb
            </motion.p>
        </div>
    );
}

function NewUIPage() {
    return (
        <ContainerScroll
            titleComponent={
                <h1 className="text-5xl md:text-7xl font-extrabold text-black tracking-tight drop-shadow-lg">
                    Malcolm McDonald
                </h1>
            }
        >
            <ScrollableText />
        </ContainerScroll>
    );
}

export default NewUIPage;

