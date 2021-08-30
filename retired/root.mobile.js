$root.isMobile = (function() {
    return navigator.userAgent.includes('Android') || navigator.userAgent.includes('iPhone');
})();

$root.isPc = (function() {
    return !navigator.userAgent.includes('Android') && !navigator.userAgent.includes('iPhone');
})();