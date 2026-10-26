$(document).ready(function () {
    'use strict'
    let getChattingNewNotificationCheckRoute = $('#getChattingNewNotificationCheckRoute').data('route');
    let chattingNewNotificationAlert = $('#chatting-new-notification-check');
    let chattingNewNotificationAlertMsg = $('#chatting-new-notification-check-message');
    setInterval(function () {
        $.get({
            url: getChattingNewNotificationCheckRoute,
            dataType: 'json',
            success: function (response) {
                if (response.newMessagesExist !== 0 && response.message) {
                    chattingNewNotificationAlertMsg.html(response.message)
                    chattingNewNotificationAlert.addClass('active');
                    playAudio();
                    setTimeout(function () {
                        chattingNewNotificationAlert.removeClass('active')
                    }, 5000);
                }
            },
        });

    }, 20000);

    // ---- Text Collapse
    function shortenText(text, maxLength = 100) {
        return text.length > maxLength ?
            text.substring(0, maxLength).trim() + "... " :
            text;
    }

    $(".short_text").each(function () {
        const $textEl = $(this);
        const originalText = $textEl.text().replace(/\s+/g, " ").trim();
        const maxLength = parseInt($textEl.data("maxlength")) || 100;

        const croppedText = shortenText(originalText, maxLength);

        $textEl.data("full-text", originalText);
        $textEl.text(croppedText);
    });

    $(".see_more_btn").on("click", function () {
        const $wrapper = $(this).closest(".short_text_wrapper");
        const $textEl = $wrapper.find(".short_text");

        const fullText = $textEl.data("full-text");
        const maxLength = parseInt($textEl.data("maxlength")) || 100;
        const seeMoreText = $textEl.data("see-more-text") || "See More";
        const seeLessText = $textEl.data("see-less-text") || "See Less";

        const isExpanded = $textEl.hasClass("expanded");

        if (isExpanded) {
            // Collapse
            $textEl.text(shortenText(fullText, maxLength)).removeClass("expanded");
            $(this).text(seeMoreText);
        } else {
            // Expand
            $textEl.text(fullText).addClass("expanded");
            $(this).text(seeLessText);
        }
    });

    // ---- swipper slider and zoom
    function initSliderWithZoom() {
        $(".easyzoom").each(function () {
            $(this).easyZoom();
        });

        new Swiper(".quickviewSlider2", {
            slidesPerView: 1,
            spaceBetween: 10,
            loop: false,
            thumbs: {
                swiper: new Swiper(".quickviewSliderThumb2", {
                    spaceBetween: 10,
                    slidesPerView: 'auto',
                    watchSlidesProgress: true,
                    navigation: {
                        nextEl: ".swiper-quickview-button-next",
                        prevEl: ".swiper-quickview-button-prev",
                    },
                }),
            },
        });
    }
    initSliderWithZoom();
})

document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("input", function (event) {
        const input = event.target;
        if (input.matches('input[type="number"], .no-negative-input')) {
            if (input.value < 0) {
                input.value = input.value.replace(/^-/, ""); // Remove minus sign
            }
        }
    });

    document.addEventListener("keydown", function (event) {
        const input = event.target;
        if (input.matches('input[type="number"], .no-negative-input')) {
            if (event.key === "-" || event.key === "Subtract") {
                event.preventDefault();
            }
        }
    });

    document.addEventListener("keydown", function (event) {
        const input = event.target;
        if (input.classList.contains("only-number-input")) {
            if (
                event.key === "+" ||
                event.key === "-" ||
                event.key === "Subtract" ||
                event.key === "Add" ||
                event.key === "." ||  // block decimal point
                event.key === ","     // block comma (if user tries)
            ) {
                event.preventDefault();
            }
        }
    });

    document.addEventListener("input", function (event) {
        const input = event.target;
        if (input.classList.contains("only-number-input")) {
            input.value = input.value.replace(/[^0-9]/g, "");
        }
    });
});
