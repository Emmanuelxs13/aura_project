(() => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const revealTargets = Array.from(document.querySelectorAll("[data-reveal]"));
  const lazyImages = Array.from(
    document.querySelectorAll("img[data-lazy-src]"),
  );

  const reveal = (element) => {
    element.classList.add("is-visible");
  };

  const loadImage = (image) => {
    const nextSource = image.getAttribute("data-lazy-src");
    if (!nextSource) {
      return;
    }

    image.src = nextSource;
    image.removeAttribute("data-lazy-src");
  };

  const supportsIntersectionObserver = "IntersectionObserver" in window;

  if (!supportsIntersectionObserver) {
    revealTargets.forEach(reveal);
    lazyImages.forEach(loadImage);
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        loadImage(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "160px 0px",
    },
  );

  revealTargets.forEach((element) => {
    revealObserver.observe(element);
  });

  lazyImages.forEach((image) => {
    imageObserver.observe(image);
  });
})();
