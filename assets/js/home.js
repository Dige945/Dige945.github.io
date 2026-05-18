const showAllButton = document.querySelector("[data-show-all-publications]");

if (showAllButton) {
  showAllButton.addEventListener("click", () => {
    const isShowingAll = document.body.classList.toggle("show-all-publications");
    showAllButton.classList.toggle("is-active", isShowingAll);
    showAllButton.setAttribute("aria-pressed", String(isShowingAll));
  });
}
