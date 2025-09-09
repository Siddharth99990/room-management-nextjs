'use client'
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Room } from "../api/room.service";
import  {type Booking } from "../api/booking.service";

const SmoothCarousel: React.FC<{
    title: string;
    items: (Room |Booking)[];
    currentIndex: number;
    onPrevious: () => void;
    onNext: () => void;
    renderCard: (item: Room|Booking, index: number, currentIndex: number) => React.ReactNode;
}> = ({ title, items, currentIndex, onPrevious, onNext,renderCard }) => {

    const [isSmallScreen,setIsSmallScreen]=useState(false);

    useEffect(()=>{
        const checkScreen=()=>setIsSmallScreen(window.innerWidth<768);
        checkScreen();
        window.addEventListener('resize',checkScreen);
        return ()=>window.removeEventListener('resize',checkScreen);
    },[]);

    return (
        <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">
                    {title}
                </h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {currentIndex + 1}-{Math.min(currentIndex + 2, items.length)} of {items.length}
                    </span>
                    <button onClick={onPrevious}
                        disabled={currentIndex === 0}
                        className={`p-2 rounded-full transition-all duration-300 ${
                            currentIndex === 0 
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:scale-110'
                        }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={onNext}
                        disabled={currentIndex >= items.length - 1}
                        className={`p-2 rounded-full transition-all duration-300 ${
                            currentIndex >= items.length - 1 
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:scale-110'
                        }`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="relative min-h-[500px] flex justify-center items-start pt-4 overflow-hidden">
                <div className="relative w-full max-w-6xl">
                    {items.map((item, index) => {
                        const offset = index - currentIndex;
                        const isVisible = Math.abs(offset) <= 1;
                        const isForeground = index === currentIndex;
                        const isNextBackground = index === currentIndex + 1;
                        const isBackground = !isSmallScreen && isNextBackground;

                        return (
                            <div key={index}
                                className={`absolute transition-all duration-500 ease-in-out left-1/2 ${
                                    isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                } ${
                                    isBackground ? 'pointer-events-none' : ''
                                }`}
                                style={{
                                    height:'300px',
                                    width:'330px',
                                    transform: `translateX(calc(${isSmallScreen ? '-50%' : '-66%'} + ${offset * 200}px)) scale(${isForeground ? 1 : isBackground ? 0.80 : 1})`,
                                    zIndex: isForeground ? 20 : isBackground ? 10 : 0,
                                    opacity: isForeground ? 1 : isBackground ? 0.7 : 0,
                                    filter: isBackground ? 'blur(1px)' : 'none'
                                }}>
                                {renderCard(item, index, currentIndex)}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SmoothCarousel;