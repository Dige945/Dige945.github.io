const showAllButton = document.querySelector("[data-show-all-publications]");

if (showAllButton) {
  showAllButton.addEventListener("click", () => {
    const isShowingAll = document.body.classList.toggle("show-all-publications");
    showAllButton.classList.toggle("is-active", isShowingAll);
    showAllButton.setAttribute("aria-pressed", String(isShowingAll));
  });
}

const figureCarousel = document.querySelector("[data-figure-carousel]");

if (figureCarousel) {
  const cylinder = figureCarousel.querySelector("[data-figure-cylinder]");
  const slides = Array.from(figureCarousel.querySelectorAll("[data-figure-slide]"));
  const captions = Array.from(figureCarousel.querySelectorAll("[data-figure-caption-text]"));
  const caption = figureCarousel.querySelector("[data-figure-caption]");
  const prevButton = figureCarousel.querySelector("[data-figure-prev]");
  const nextButton = figureCarousel.querySelector("[data-figure-next]");
  let activeIndex = 0;

  const updateFigureCarousel = (nextIndex) => {
    if (!cylinder || slides.length === 0) return;

    activeIndex = (nextIndex + slides.length) % slides.length;
    const step = 360 / slides.length;

    slides.forEach((slide, index) => {
      const image = slide.querySelector("img");

      if (image) {
        slide.style.setProperty("--figure-bg", `url("${image.currentSrc || image.src}")`);
      }

      slide.style.transform = `rotateY(${index * step}deg) translateZ(var(--figure-radius))`;
      slide.classList.toggle("is-active", index === activeIndex);
      slide.setAttribute("aria-hidden", String(index !== activeIndex));
    });

    cylinder.style.transform = `translateZ(calc(var(--figure-radius) * -1)) rotateY(${-activeIndex * step}deg)`;

    if (caption && captions[activeIndex]) {
      caption.innerHTML = captions[activeIndex].innerHTML;
    }
  };

  prevButton?.addEventListener("click", () => updateFigureCarousel(activeIndex - 1));
  nextButton?.addEventListener("click", () => updateFigureCarousel(activeIndex + 1));

  figureCarousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateFigureCarousel(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      updateFigureCarousel(activeIndex + 1);
    }
  });

  updateFigureCarousel(activeIndex);
}

const visitorStats = document.querySelector(".home-footer__stats");

if (visitorStats) {
  window.setTimeout(() => {
    const values = visitorStats.querySelectorAll("#busuanzi_value_site_uv, #busuanzi_value_site_pv");

    values.forEach((value) => {
      if (!value.textContent.trim() || value.textContent.trim() === "...") {
        value.textContent = "Unavailable";
      }
    });
  }, 5000);
}
