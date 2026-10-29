/* ==========================================================
   1. CONFIGURATION
   Edit this section to change QR images or the number of
   GAMAU stages (the CSS must have the same number of stages)
   ========================================================== */

// QR image and description for every payment method.
// The keys (bri, gopay, ovo) must match the data-payment-method attributes in index.html
const PAYMENT_METHODS = {

    bri: {
        qrImagePath: "images/qr-bri.svg",
        qrImageDescription: "QR code transfer rekening BRI"
    },

    gopay: {
        qrImagePath: "images/qr-gopay.svg",
        qrImageDescription: "QR code Gopay"
    },

    ovo: {
        qrImagePath: "images/qr-ovo.svg",
        qrImageDescription: "QR code OVO"
    }

};

// How many times GAMAU can be clicked before the confirmation popup appears.
// Every click moves GAMAU one stage further (see "GAMAU STAGES" in style.css)
const LAST_REFUSE_STAGE = 6;

// CSS class names used by this script
const POPUP_VISIBLE_CLASS = "is-visible";
const BUTTON_BOUNCE_CLASS = "is-bouncing";


/* ==========================================================
   2. ELEMENT REFERENCES
   ========================================================== */

// Main page buttons
const buttonArea = document.getElementById("button-area");
const okayButton = document.getElementById("okay-button");
const refuseButton = document.getElementById("refuse-button");

// Popups
const paymentPopup = document.getElementById("payment-popup");
const qrPopup = document.getElementById("qr-popup");
const confirmPopup = document.getElementById("confirm-popup");
const allPopups = document.querySelectorAll(".popup-overlay");

// Elements inside the popups
const qrImage = document.getElementById("qr-image");
const paymentOptionButtons = document.querySelectorAll("[data-payment-method]");
const closePopupButtons = document.querySelectorAll("[data-close-popup]");
const cancelConfirmButton = document.getElementById("cancel-confirm-button");


/* ==========================================================
   3. STATE
   ========================================================== */

// Current GAMAU stage: 0 = initial, LAST_REFUSE_STAGE = smallest and farthest
let refuseStage = 0;

// Remembers which element was focused before a popup opened,
// so keyboard focus can return to it when the popup closes
let elementBeforePopup = null;


/* ==========================================================
   4. POPUP FUNCTIONS
   ========================================================== */

function getOpenPopup() {
    return document.querySelector(".popup-overlay." + POPUP_VISIBLE_CLASS);
}

function hideAllPopups() {
    allPopups.forEach(function (popup) {
        popup.classList.remove(POPUP_VISIBLE_CLASS);
        popup.setAttribute("aria-hidden", "true");
    });
}

function showPopup(popup) {
    const isAnotherPopupOpen = getOpenPopup() !== null;

    // Only remember the focus when the first popup opens,
    // not when one popup replaces another
    if (!isAnotherPopupOpen) {
        elementBeforePopup = document.activeElement;
    }

    hideAllPopups();

    popup.classList.add(POPUP_VISIBLE_CLASS);
    popup.setAttribute("aria-hidden", "false");

    // Move keyboard focus into the popup
    const firstFocusableElement = popup.querySelector("button, a");

    if (firstFocusableElement) {
        firstFocusableElement.focus();
    }
}

function closePopup() {
    hideAllPopups();

    // Give keyboard focus back to where the visitor was
    if (elementBeforePopup) {
        elementBeforePopup.focus();
        elementBeforePopup = null;
    }
}


/* ==========================================================
   5. PAYMENT FUNCTIONS
   ========================================================== */

function showQrCodeForPaymentMethod(paymentMethodName) {
    const paymentMethod = PAYMENT_METHODS[paymentMethodName];

    if (!paymentMethod) {
        return;
    }

    qrImage.src = paymentMethod.qrImagePath;
    qrImage.alt = paymentMethod.qrImageDescription;

    showPopup(qrPopup);
}


/* ==========================================================
   6. GAMAU FUNCTIONS
   ========================================================== */

function playRefuseButtonBounce() {
    refuseButton.classList.remove(BUTTON_BOUNCE_CLASS);

    // Reading offsetWidth forces the browser to restart the animation
    void refuseButton.offsetWidth;

    refuseButton.classList.add(BUTTON_BOUNCE_CLASS);
}

function applyRefuseStage() {
    // style.css reads this attribute to resize and move the buttons
    buttonArea.dataset.stage = refuseStage;
}

function handleRefuseClick() {
    const hasReachedLastStage = refuseStage >= LAST_REFUSE_STAGE;

    // After the last stage, the next click asks for confirmation
    if (hasReachedLastStage) {
        showPopup(confirmPopup);
        return;
    }

    refuseStage = refuseStage + 1;

    applyRefuseStage();
    playRefuseButtonBounce();
}

function resetToInitialState() {
    refuseStage = 0;
    applyRefuseStage();

    hideAllPopups();
    elementBeforePopup = null;

    okayButton.focus();
}


/* ==========================================================
   7. EVENT LISTENERS
   ========================================================== */

// ----- Main page buttons -----

// OKEE always opens the payment method popup, whatever the GAMAU stage is
okayButton.addEventListener("click", function () {
    showPopup(paymentPopup);
});

refuseButton.addEventListener("click", handleRefuseClick);

// ----- Payment method options -----

paymentOptionButtons.forEach(function (optionButton) {
    optionButton.addEventListener("click", function () {
        showQrCodeForPaymentMethod(optionButton.dataset.paymentMethod);
    });
});

// ----- Closing popups -----

// The "x" buttons
closePopupButtons.forEach(function (closeButton) {
    closeButton.addEventListener("click", closePopup);
});

// Clicking the dark area outside a popup card (only for dismissible popups)
allPopups.forEach(function (popup) {
    popup.addEventListener("click", function (event) {
        const isClickOnBackdrop = event.target === popup;
        const isDismissible = popup.hasAttribute("data-dismissible");

        if (isClickOnBackdrop && isDismissible) {
            closePopup();
        }
    });
});

// The Escape key (only for dismissible popups)
document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
        return;
    }

    const openPopup = getOpenPopup();

    if (openPopup && openPopup.hasAttribute("data-dismissible")) {
        closePopup();
    }
});

// ----- Confirmation popup -----

// ENGGA DEH sends the visitor back to the initial state.
// (YAKIN is a normal link to penjara.html, so it needs no script.)
cancelConfirmButton.addEventListener("click", resetToInitialState);
