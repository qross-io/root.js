$root.isMobile = (function() {
    let userAgent = navigator.userAgent;
    return userAgent.includes('Android') || userAgent.includes('iPhone');
})();

$root.isPc = (function() {
    let userAgent = navigator.userAgent;
    return !userAgent.includes('Android') && !userAgent.includes('iPhone');
})();