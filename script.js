document.addEventListener('DOMContentLoaded', () => {

    // --- AUTOMATED HARDWARE-ACCELERATED FACTS SLIDER MECHANICS ---
    const bubblesList = document.querySelectorAll('.fact-bubble');
    const dotsList = document.querySelectorAll('.dot');
    let dynamicCurrentIndex = 0;
    let sliderIntervalLoop = null;

    function runSlideCycle(targetIndex) {
        bubblesList[dynamicCurrentIndex].classList.remove('active-fact');
        dotsList[dynamicCurrentIndex].classList.remove('active-dot');

        dynamicCurrentIndex = targetIndex;

        bubblesList[dynamicCurrentIndex].classList.add('active-fact');
        dotsList[dynamicCurrentIndex].classList.add('active-dot');
    }

    function initAutoTimer() {
        sliderIntervalLoop = setInterval(() => {
            let nextIndex = (dynamicCurrentIndex + 1) % bubblesList.length;
            runSlideCycle(nextIndex);
        }, 5000); // Shifts frames precisely every 5 seconds
    }

    // Bind manual toggle inputs via dots indicator items
    dotsList.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(sliderIntervalLoop); // Break countdown on manual override click
            if (index !== dynamicCurrentIndex) {
                runSlideCycle(index);
            }
            initAutoTimer(); // Restart ticker reference values safely
        });
    });

    // Fire default operational loop
    initAutoTimer();
});