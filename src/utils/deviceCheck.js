export const isMobileDevice = () => {
    const userAgent = navigator.userAgent || window.navigator.userAgent;

    return /android|iphone|ipod/i.test(userAgent) && !window.navigator.userAgent.includes('iPad');
};