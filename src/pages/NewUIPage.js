import React from 'react';
import { ContainerScroll } from '../components/ContainerScroll';

function NewUIPage() {
    return (
        <ContainerScroll
            titleComponent={
                <h1 className="text-5xl md:text-7xl font-extrabold text-black tracking-tight drop-shadow-lg">
                    Malcolm McDonald
                </h1>
            }
        >
            <div className="h-full w-full flex items-center justify-center">
                {/* Your content here */}
            </div>
        </ContainerScroll>
    );
}

export default NewUIPage;

