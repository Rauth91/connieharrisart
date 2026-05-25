const SITE_PHOTOS = {
  home: {
    hero: "images/home/hero.jpg",
    aboutMain: "images/home/about-main.jpg",
    aboutSample: "images/home/about-sample.jpg",
    work: {
      basRelief: "images/work/bas-relief.jpg",
      fauxFinishes: "images/work/faux-finishes.jpg",
      cabinetFinishes: "images/work/cabinet-finishes.jpg",
      ceilingsFloors: "images/work/ceilings-floors.jpg",
      murals: "images/work/murals.jpg",
    },
    videos: {
      studio: "images/videos/studio-process.jpg",
      material: "images/videos/material-detail.jpg",
      finished: "images/videos/finished-atmosphere.jpg",
    },
  },
  classes: {
    hero: "images/classes/hero.jpg",
    signature: "images/classes/signature.jpg",
  },
  gallery: {
    murals: {
      slides: [
        "images/gallery/murals/slide-01.jpg",
        "images/gallery/murals/slide-02.jpg",
        "images/gallery/murals/slide-03.jpg",
        "images/gallery/murals/slide-04.jpg",
      ],
      gallery: [
        "images/gallery/murals/gallery-01.jpg",
        "images/gallery/murals/gallery-02.jpg",
        "images/gallery/murals/gallery-03.jpg",
        "images/gallery/murals/gallery-04.jpg",
        "images/gallery/murals/gallery-05.jpg",
        "images/gallery/murals/gallery-06.jpg",
      ],
      beforeAfter: {
        before: "images/gallery/murals/before.jpg",
        after: "images/gallery/murals/after.jpg",
      },
    },
    fauxFinishes: {
      slides: [
        "images/gallery/faux-finishes/slide-01.jpg",
        "images/gallery/faux-finishes/slide-02.jpg",
        "images/gallery/faux-finishes/slide-03.jpg",
        "images/gallery/faux-finishes/slide-04.jpg",
      ],
      gallery: [
        "images/gallery/faux-finishes/gallery-01.jpg",
        "images/gallery/faux-finishes/gallery-02.jpg",
        "images/gallery/faux-finishes/gallery-03.jpg",
        "images/gallery/faux-finishes/gallery-04.jpg",
        "images/gallery/faux-finishes/gallery-05.jpg",
        "images/gallery/faux-finishes/gallery-06.jpg",
      ],
      beforeAfter: {
        before: "images/gallery/faux-finishes/before.jpg",
        after: "images/gallery/faux-finishes/after.jpg",
      },
    },
    basRelief: {
      slides: [
        "images/gallery/bas-relief/slide-01.jpg",
        "images/gallery/bas-relief/slide-02.jpg",
        "images/gallery/bas-relief/slide-03.jpg",
        "images/gallery/bas-relief/slide-04.jpg",
      ],
      gallery: [
        "images/gallery/bas-relief/gallery-01.jpg",
        "images/gallery/bas-relief/gallery-02.jpg",
        "images/gallery/bas-relief/gallery-03.jpg",
        "images/gallery/bas-relief/gallery-04.jpg",
        "images/gallery/bas-relief/gallery-05.jpg",
        "images/gallery/bas-relief/gallery-06.jpg",
        "images/gallery/bas-relief/gallery-07.jpg",
        "images/gallery/bas-relief/gallery-08.jpg",
        "images/gallery/bas-relief/gallery-09.jpg",
      ],
      beforeAfter: {
        before: "images/gallery/bas-relief/before.jpg",
        after: "images/gallery/bas-relief/after.jpg",
      },
    },
    cabinetFinishes: {
      slides: [
        "images/gallery/cabinet-finishes/slide-01.jpg",
        "images/gallery/cabinet-finishes/slide-02.jpg",
        "images/gallery/cabinet-finishes/slide-03.jpg",
        "images/gallery/cabinet-finishes/slide-04.jpg",
      ],
      gallery: [
        "images/gallery/cabinet-finishes/gallery-01.jpg",
        "images/gallery/cabinet-finishes/gallery-02.jpg",
        "images/gallery/cabinet-finishes/gallery-03.jpg",
        "images/gallery/cabinet-finishes/gallery-04.jpg",
        "images/gallery/cabinet-finishes/gallery-05.jpg",
        "images/gallery/cabinet-finishes/gallery-06.jpg",
      ],
      beforeAfter: {
        before: "images/gallery/cabinet-finishes/before.jpg",
        after: "images/gallery/cabinet-finishes/after.jpg",
      },
    },
    ceilingsFloors: {
      slides: [
        "images/gallery/ceilings-floors/slide-01.jpg",
        "images/gallery/ceilings-floors/slide-02.jpg",
        "images/gallery/ceilings-floors/slide-03.jpg",
        "images/gallery/ceilings-floors/slide-04.jpg",
      ],
      gallery: [
        "images/gallery/ceilings-floors/gallery-01.jpg",
        "images/gallery/ceilings-floors/gallery-02.jpg",
        "images/gallery/ceilings-floors/gallery-03.jpg",
        "images/gallery/ceilings-floors/gallery-04.jpg",
        "images/gallery/ceilings-floors/gallery-05.jpg",
        "images/gallery/ceilings-floors/gallery-06.jpg",
      ],
      beforeAfter: {
        before: "images/gallery/ceilings-floors/before.jpg",
        after: "images/gallery/ceilings-floors/after.jpg",
      },
    },
  },
  contact: {
    hero: "images/contact/hero.jpg",
  },
};

if (typeof window !== "undefined") {
  window.SITE_PHOTOS = SITE_PHOTOS;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = SITE_PHOTOS;
}
