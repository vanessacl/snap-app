export function isIOs(){
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        // should work on older ipad, iphone, ipod
        return true;
    } else if (navigator.platform === 'iPad' || navigator.platform === 'iPhone' || navigator.platform === 'iPod') {
        // should work on older ipad, iphone, ipod
        return true;
    } else if(navigator.platform === 'MacIntel' && ((navigator.maxTouchPoints > 0) || ('ontouchstart') in window)){
        // newer iOS return MacIntel as platform, so check touchpoints
        return true;
    }
    return false;
}