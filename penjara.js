/* ==========================================================
   1. CONFIGURATION
   CSS class names used by this script (must match penjara.css)
   ========================================================== */

const ACTIVE_SCREEN_CLASS = "is-active";
const POPUP_VISIBLE_CLASS = "is-visible";


/* ==========================================================
   2. ELEMENT REFERENCES
   ========================================================== */

// Everything behind the popups (made "inert" while a popup is open)
const mainContent = document.querySelector("main");

// Screens
const gateScreen = document.getElementById("gate-screen");
const prisonScreen = document.getElementById("prison-screen");

// Buttons on the screens
const enterPrisonButton = document.getElementById("enter-prison-button");
const exitPrisonButton = document.getElementById("exit-prison-button");

// Popups
const fullscreenPopup = document.getElementById("fullscreen-popup");
const paymentPopup = document.getElementById("payment-popup");

// Buttons inside the fullscreen popup
const fullscreenAcceptButton = document.getElementById("fullscreen-accept-button");
const fullscreenDeclineButton = document.getElementById("fullscreen-decline-button");


/* ==========================================================
   3. FULLSCREEN HELPERS
   Includes the "webkit" versions for older Safari browsers
   ========================================================== */

function isFullscreenSupported() {
    const pageElement = document.documentElement;

    return Boolean(pageElement.requestFullscreen || pageElement.webkitRequestFullscreen);
}

function isInFullscreenMode() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

// Always returns a Promise, so the caller can use .catch() for every browser
function requestFullscreenMode() {
    const pageElement = document.documentElement;

    if (pageElement.requestFullscreen) {
        return pageElement.requestFullscreen();
    }

    if (pageElement.webkitRequestFullscreen) {
        return Promise.resolve(pageElement.webkitRequestFullscreen());
    }

    return Promise.reject(new Error("Fullscreen is not supported in this browser"));
}


/* ==========================================================
   4. SCREEN FUNCTIONS
   ========================================================== */

function showGateScreen() {
    prisonScreen.classList.remove(ACTIVE_SCREEN_CLASS);
    gateScreen.classList.add(ACTIVE_SCREEN_CLASS);

    // The payment popup belongs to the prison screen, so it closes too
    hidePopup(paymentPopup);
}

function showPrisonScreen() {
    gateScreen.classList.remove(ACTIVE_SCREEN_CLASS);
    prisonScreen.classList.add(ACTIVE_SCREEN_CLASS);
}


/* ==========================================================
   5. POPUP FUNCTIONS
   ========================================================== */

function showPopup(popup) {
    popup.classList.add(POPUP_VISIBLE_CLASS);
    popup.setAttribute("aria-hidden", "false");

    // Block clicks and keyboard focus on everything behind the popup
    mainContent.inert = true;

    // Move keyboard focus into the popup (to its first button, or to the card itself)
    const focusTarget = popup.querySelector("button") || popup.querySelector("[tabindex]");

    if (focusTarget) {
        focusTarget.focus();
    }
}

function hidePopup(popup) {
    popup.classList.remove(POPUP_VISIBLE_CLASS);
    popup.setAttribute("aria-hidden", "true");

    // Only unlock the page when no other popup is still open
    const isAnyPopupOpen = document.querySelector(".popup-overlay." + POPUP_VISIBLE_CLASS) !== null;

    if (!isAnyPopupOpen) {
        mainContent.inert = false;
    }
}


/* ==========================================================
   6. FULLSCREEN FLOW
   ========================================================== */

// Asks the browser for fullscreen mode.
// This must run inside a click handler, because browsers refuse
// to enter fullscreen without a click from the visitor.
function startFullscreenRequest() {
    requestFullscreenMode().catch(function () {
        // The browser refused, so stay on the gate screen
        showGateScreen();
    });
}

// Runs every time the browser enters or leaves fullscreen mode
function handleFullscreenChange() {
    if (isInFullscreenMode()) {
        showPrisonScreen();
        exitPrisonButton.focus();
        return;
    }

    // The visitor left fullscreen (for example by pressing Esc),
    // so send them back to the gate screen
    showGateScreen();
    enterPrisonButton.focus();
}


/* ==========================================================
   7. EVENT LISTENERS
   ========================================================== */

// ----- Fullscreen popup -----

// OKE: request fullscreen. The prison screen appears
// automatically once the browser confirms fullscreen mode.
fullscreenAcceptButton.addEventListener("click", function () {
    startFullscreenRequest();
    hidePopup(fullscreenPopup);
});

// NO: close the popup and go back to the gate screen with its button
fullscreenDeclineButton.addEventListener("click", function () {
    hidePopup(fullscreenPopup);
    enterPrisonButton.focus();
});

// ----- Gate screen -----

// MASUK KE PENJARA: try fullscreen again
enterPrisonButton.addEventListener("click", function () {
    // Some browsers (such as Safari on iPhone) cannot do fullscreen at all.
    // Let the visitor in anyway instead of leaving them stuck on this screen.
    if (!isFullscreenSupported()) {
        showPrisonScreen();
        exitPrisonButton.focus();
        return;
    }

    startFullscreenRequest();
});

// ----- Prison screen -----

// KELUAR DARI PENJARA: open the payment popup.
// The popup has no cancel button, no "x" and does not close when clicked outside.
exitPrisonButton.addEventListener("click", function () {
    showPopup(paymentPopup);
});

// ----- Browser fullscreen events -----

document.addEventListener("fullscreenchange", handleFullscreenChange);
document.addEventListener("webkitfullscreenchange", handleFullscreenChange);


/* ==========================================================
   8. INITIAL SETUP
   ========================================================== */

// Ask about fullscreen mode right away when the page opens
if (isFullscreenSupported()) {
    showPopup(fullscreenPopup);
}
