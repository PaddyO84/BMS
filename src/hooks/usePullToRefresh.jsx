import { useState, useEffect, useCallback } from 'react';

const PULL_THRESHOLD = 80; // The distance in pixels to trigger a refresh

export const usePullToRefresh = (onRefresh) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullPosition, setPullPosition] = useState(0);
    const [startY, setStartY] = useState(0);

    const handleTouchStart = useCallback((e) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].clientY);
        } else {
            setStartY(0);
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (startY === 0) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (diff > 0) {
            // Prevent default scroll behavior only when pulling down
            e.preventDefault();
            setPullPosition(diff);
        }
    }, [startY]);

    const handleTouchEnd = useCallback(async () => {
        if (pullPosition > PULL_THRESHOLD) {
            setIsRefreshing(true);
            await onRefresh();
            // A short delay to allow the indicator to spin
            setTimeout(() => {
                setIsRefreshing(false);
                setPullPosition(0);
            }, 500);
        } else {
            setPullPosition(0);
        }
        setStartY(0);
    }, [pullPosition, onRefresh]);

    useEffect(() => {
        const options = { passive: false };
        window.addEventListener('touchstart', handleTouchStart, options);
        window.addEventListener('touchmove', handleTouchMove, options);
        window.addEventListener('touchend', handleTouchEnd, options);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return { isRefreshing, pullPosition };
};

export const PullToRefreshIndicator = ({ isRefreshing, pullPosition }) => {
    const pullRotation = Math.min(pullPosition, PULL_THRESHOLD) * 2;
    const opacity = Math.min(pullPosition / PULL_THRESHOLD, 1);

    return (
        <div
            className="fixed top-0 left-0 right-0 flex justify-center items-center transition-transform duration-200 ease-out"
            style={{
                transform: `translateY(${isRefreshing ? '30px' : Math.min(pullPosition, PULL_THRESHOLD + 20) - 50}px)`,
                height: '50px',
                zIndex: 1000,
                opacity: isRefreshing ? 1 : opacity,
            }}
        >
            <div className="bg-white rounded-full shadow-lg p-2">
                {isRefreshing ? (
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600"></div>
                ) : (
                    <div style={{ transform: `rotate(${pullRotation}deg)` }}>
                        <svg className="h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};