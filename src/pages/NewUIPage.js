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
        <div>
            <ContainerScroll
                titleComponent={
                    <h1 className="text-5xl md:text-7xl font-extrabold text-black tracking-tight drop-shadow-lg">
                        Malcolm McDonald
                    </h1>
                }
            >
                <ScrollableText />
            </ContainerScroll>
            <div style={{
                padding: '20px 20px',
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                lineHeight: '1.8',
                backgroundColor: '#ffffff',
            }}>
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#000000',
                        fontFamily: 'Arial, sans-serif',
                        marginBottom: '12px',
                    }}>
                        my links
                    </h2>
                    <div style={{ marginBottom: '12px' }}>
                        <a
                            href="https://x.com/MalcolmMcD05"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#0000EE',
                                textDecoration: 'underline',
                                fontSize: '13px',
                                fontFamily: 'Arial, sans-serif',
                            }}
                        >
                            https://x.com/MalcolmMcD05
                        </a>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <a
                            href="https://www.linkedin.com/in/malcolm-mcd/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#0000EE',
                                textDecoration: 'underline',
                                fontSize: '13px',
                                fontFamily: 'Arial, sans-serif',
                            }}
                        >
                            https://www.linkedin.com/in/malcolm-mcd
                        </a>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <a
                            href="https://www.youtube.com/@MalcolmMcD/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#0000EE',
                                textDecoration: 'underline',
                                fontSize: '13px',
                                fontFamily: 'Arial, sans-serif',
                            }}
                        >
                            https://www.youtube.com/@MalcolmMcD
                        </a>
                        <span style={{ color: '#000000', fontSize: '13px', fontFamily: 'Arial, sans-serif', marginLeft: '8px' }}>
                            (just wait)
                        </span>
                    </div>
                </div>

                <div>
                    <h2 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#000000',
                        fontFamily: 'Arial, sans-serif',
                        marginBottom: '12px',
                    }}>
                        things ive done
                    </h2>
                    <div style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <a
                                href="https://www.dormparty.live/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: '#0000EE',
                                    textDecoration: 'underline',
                                    fontSize: '13px',
                                    fontFamily: 'Arial, sans-serif',
                                }}
                            >
                                https://www.dormparty.live/
                            </a>
                            <span style={{ color: '#000000', fontSize: '13px', fontFamily: 'Arial, sans-serif', marginLeft: '8px' }}>
                                (acquired)
                            </span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <a
                                href="https://www.instagram.com/kupid.live/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: '#0000EE',
                                    textDecoration: 'underline',
                                    fontSize: '13px',
                                    fontFamily: 'Arial, sans-serif',
                                }}
                            >
                                https://www.instagram.com/kupid.live/
                            </a>
                            <span style={{ color: '#000000', fontSize: '13px', fontFamily: 'Arial, sans-serif', marginLeft: '8px' }}>
                                (+41 mil views)
                            </span>
                        </div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <a
                            href="https://www.tryacneai.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#0000EE',
                                textDecoration: 'underline',
                                fontSize: '13px',
                                fontFamily: 'Arial, sans-serif',
                            }}
                        >
                            https://www.tryacneai.com/
                        </a>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <a
                            href="https://www.tryalumo.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#0000EE',
                                textDecoration: 'underline',
                                fontSize: '13px',
                                fontFamily: 'Arial, sans-serif',
                            }}
                        >
                            https://www.tryalumo.com/
                        </a>
                        <span style={{ color: '#000000', fontSize: '13px', fontFamily: 'Arial, sans-serif', marginLeft: '8px' }}>
                            (won a hackathon)
                        </span>
                    </div>
                </div>
            </div>
            <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif',
                fontSize: '13px',
                backgroundColor: '#ffffff',
            }}>
                <span style={{ color: '#000000', fontSize: '13px', fontFamily: 'Arial, sans-serif', marginRight: '8px' }}>
                    if you need me
                </span>
                <a
                    href="mailto:malcolm.e.mcdonald@gmail.com"
                    style={{
                        color: '#0000EE',
                        textDecoration: 'underline',
                        fontSize: '13px',
                        fontFamily: 'Arial, sans-serif',
                    }}
                >
                    malcolm.e.mcdonald@gmail.com
                </a>
            </div>
            <div style={{
                height: '100vh',
                backgroundColor: '#ffffff',
            }}></div>
        </div>
    );
}

export default NewUIPage;

