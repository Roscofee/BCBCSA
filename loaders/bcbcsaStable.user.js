// ==UserScript==
// @name BCBCSA Stable
// @namespace https://www.bondageprojects.com/
// @version 1.0.0
// @description BCBCSA Violentmonkey / Tampermonkey stable branch loader
// @author MayaTheFoxy
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @run-at document-end
// @icon https://mayathefoxy.github.io/MPA/paw64.png
// @grant none
// ==/UserScript==

setTimeout(
    () => {
        const script = document.createElement("script");
        script.setAttribute("language", "JavaScript");
        script.setAttribute("crossorigin", "anonymous");
        script.setAttribute("src", `https://Roscofee.github.io/BCBCSA/stableBundle.js?${Date.now()}`);
        document.head.appendChild(script);
    },
    2000
);
