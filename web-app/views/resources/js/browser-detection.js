var $UA = new Object();

//Browser Property
//stackoverflow.com/q/5916900
$UA.browser = (function(){
    var $UA= navigator.userAgent, tem,
    M= $UA.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec($UA) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= $UA.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= $UA.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();

//Check for Mobile Operating Systems
function checkForMobileOS() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
      // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        $UA.OS = "Windows Phone";
    }

    else if (/android/i.test(userAgent)) {
        $UA.OS = "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        $UA.OS = "iOS";
    }
}

//OS Property
//javascripter.net/faq/operatin.htm
if (navigator.appVersion.indexOf("Win")!= -1) $UA.OS   = "Windows";
if (navigator.appVersion.indexOf("Mac")!= -1) $UA.OS   = "MacOS";
if (navigator.appVersion.indexOf("X11")!= -1) $UA.OS   = "UNIX";
if (navigator.appVersion.indexOf("Linux")!= -1) $UA.OS = "Linux";

//Browser Booleans
$UA.isChrome  = $UA.browser.indexOf('Chrome')  > -1;
$UA.isFirefox = $UA.browser.indexOf('Firefox') > -1;
$UA.isOpera   = $UA.browser.indexOf('Opera')   > -1;
$UA.isSafari  = $UA.browser.indexOf('Safari')  > -1;
$UA.isIE      = $UA.browser.indexOf('IE')      > -1;
$UA.isEdge    = $UA.browser.indexOf('Edge')    > -1;

checkForMobileOS();

//OS Booleans
$UA.isWindows = $UA.OS === 'Windows';
$UA.isMac     = $UA.OS === 'MacOS';
$UA.isUNIX    = $UA.OS === 'UNIX';
$UA.isLinux   = $UA.OS === 'Linux';
$UA.isWindowsPhone   = $UA.OS === 'Windows Phone';
$UA.isIOS   = $UA.OS === 'iOS';
$UA.isAndroid   = $UA.OS === 'Android';