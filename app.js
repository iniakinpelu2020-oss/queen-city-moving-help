/* Queen City Moving Help — crew stage, hourly builder, drawer and bar */

(function () {
  "use strict";

  var CFG = {
    phone: "+17048159047",
    crews: {
      two:   { name: "2 Movers + 20ft Truck",   rate: 135, short: "2 movers" },
      three: { name: "3 Movers + 26ft Truck",   rate: 175, short: "3 movers" },
      labor: { name: "Labor-Only Crew",          rate: 95,  short: "labor only" }
    },
    packRate: 110,
    safeRate: 160,
    minHours: 2,
    maxHours: 10,
    minPack: 1,
    maxPack: 6
  };

  var state = {
    crew: "two",
    hours: 3,
    packing: false,
    packHours: 2,
    safe: false
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function money(n) { return "$" + n.toLocaleString("en-US"); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  /* ---------- totals ---------- */
  function totals() {
    var crew = CFG.crews[state.crew];
    var crewAmt = crew.rate * state.hours;
    var packAmt = state.packing ? CFG.packRate * state.packHours : 0;
    var safeAmt = state.safe ? CFG.safeRate : 0;
    return {
      crew: crew,
      crewAmt: crewAmt,
      packAmt: packAmt,
      safeAmt: safeAmt,
      total: crewAmt + packAmt + safeAmt
    };
  }

  function subLine(t) {
    var parts = [state.hours + (state.hours === 1 ? " hr" : " hrs") + " \u00d7 $" + t.crew.rate + "/hr"];
    if (state.packing) parts.push("packing " + state.packHours + " hr" + (state.packHours === 1 ? "" : "s"));
    if (state.safe) parts.push("specialty lift");
    return parts.join(" \u00b7 ");
  }

  function summaryText(t) {
    var bits = [t.crew.name + ", " + state.hours + " hrs on site"];
    if (state.packing) bits.push("packing crew " + state.packHours + " hrs");
    if (state.safe) bits.push("safe/piano specialty");
    return "Hi Queen City Moving Help \u2014 I'd like to book the " + bits.join(", ") +
      ". Estimated total " + money(t.total) + ".";
  }

  var popTimer = null;
  function pop(el) {
    if (!el) return;
    el.classList.remove("pop");
    /* force reflow so the class re-applies */
    void el.offsetWidth;
    el.classList.add("pop");
    clearTimeout(popTimer);
    popTimer = setTimeout(function () { el.classList.remove("pop"); }, 240);
  }

  /* ---------- render ---------- */
  function render() {
    var t = totals();
    var total = money(t.total);

    /* stage */
    var stage = $("#stage");
    if (stage) stage.setAttribute("data-crew", state.crew);
    $$(".crewcard").forEach(function (card) {
      var on = card.getAttribute("data-crew") === state.crew;
      card.classList.toggle("is-on", on);
      card.setAttribute("aria-pressed", on ? "true" : "false");
    });

    /* crew segment */
    $$("#crewSeg .seg__btn").forEach(function (btn) {
      btn.classList.toggle("is-on", btn.getAttribute("data-crew") === state.crew);
    });

    /* hours */
    var hoursVal = $("#hoursVal");
    if (hoursVal) hoursVal.textContent = state.hours;
    var rateHint = $("#rateHint");
    if (rateHint) rateHint.textContent = "$" + t.crew.rate + " per hour";

    /* packing */
    var addonPack = $("#addonPack");
    if (addonPack) addonPack.classList.toggle("is-on", state.packing);
    var packToggle = $('[data-toggle="packing"]');
    if (packToggle) packToggle.setAttribute("aria-pressed", state.packing ? "true" : "false");
    var packBody = $("#packBody");
    if (packBody) packBody.hidden = !state.packing;
    var packHoursVal = $("#packHoursVal");
    if (packHoursVal) packHoursVal.textContent = state.packHours;
    var packPrice = $("#packPrice");
    if (packPrice) packPrice.textContent = state.packing ? money(t.packAmt) : "$0";

    /* safe */
    var addonSafe = $('[data-toggle="safe"]');
    if (addonSafe) {
      var wrap = addonSafe.closest(".addon");
      if (wrap) wrap.classList.toggle("is-on", state.safe);
      addonSafe.setAttribute("aria-pressed", state.safe ? "true" : "false");
    }
    var safePrice = $("#safePrice");
    if (safePrice) safePrice.textContent = state.safe ? money(CFG.safeRate) : "$0";

    /* panel */
    var lineCrewName = $("#lineCrewName");
    if (lineCrewName) lineCrewName.textContent = t.crew.name;
    var lineCrewAmt = $("#lineCrewAmt");
    if (lineCrewAmt) lineCrewAmt.textContent = money(t.crewAmt);

    var linePack = $("#linePack");
    if (linePack) linePack.hidden = !state.packing;
    var linePackName = $("#linePackName");
    if (linePackName) linePackName.textContent = "Packing Crew \u00b7 " + state.packHours + " hr" + (state.packHours === 1 ? "" : "s");
    var linePackAmt = $("#linePackAmt");
    if (linePackAmt) linePackAmt.textContent = money(t.packAmt);

    var lineSafe = $("#lineSafe");
    if (lineSafe) lineSafe.hidden = !state.safe;

    var panelSub = $("#panelSub");
    if (panelSub) panelSub.textContent = subLine(t);

    var totalEl = $("#total");
    if (totalEl && totalEl.textContent !== total) {
      totalEl.textContent = total;
      pop(totalEl);
    }

    /* bar */
    var barTotal = $("#barTotal");
    if (barTotal) barTotal.textContent = total;

    /* drawer */
    var drawerTitle = $("#drawerTitle");
    if (drawerTitle) drawerTitle.textContent = t.crew.name;
    var drawerTotal = $("#drawerTotal");
    if (drawerTotal) drawerTotal.textContent = total;
    var drawerSub = $("#drawerSub");
    if (drawerSub) drawerSub.textContent = subLine(t);

    var list = $("#drawerList");
    if (list) {
      var rows = [
        "<li><span>" + t.crew.name + "<small>" + state.hours + " hrs \u00d7 $" + t.crew.rate + "/hr</small></span><b>" + money(t.crewAmt) + "</b></li>"
      ];
      if (state.packing) {
        rows.push("<li><span>Packing Crew<small>" + state.packHours + " hrs \u00d7 $" + CFG.packRate + "/hr</small></span><b>" + money(t.packAmt) + "</b></li>");
      }
      if (state.safe) {
        rows.push("<li><span>Safe / Piano Specialty<small>Flat rate</small></span><b>" + money(CFG.safeRate) + "</b></li>");
      }
      if (!state.packing && !state.safe) {
        rows.push("<li><span>Crew and hours only<small>Add packing or a specialty lift any time</small></span><b>&mdash;</b></li>");
      }
      list.innerHTML = rows.join("");
    }

    /* links */
    var body = summaryText(t);
    var smsHref = "sms:" + CFG.phone + "?&body=" + encodeURIComponent(body);
    ["#textBtn", "#drawerText"].forEach(function (sel) {
      var el = $(sel);
      if (el) el.setAttribute("href", smsHref);
    });
    var callHref = "tel:" + CFG.phone;
    ["#bookBtn", "#drawerCall"].forEach(function (sel) {
      var el = $(sel);
      if (el) el.setAttribute("href", callHref);
    });

    /* crew stage note used by assistive tech */
    var panel = $(".panel");
    if (panel) panel.setAttribute("data-total", String(t.total));
  }

  /* ---------- actions ---------- */
  function setCrew(id) {
    if (!CFG.crews[id] || state.crew === id) return;
    state.crew = id;
    render();
  }

  function step(which, dir) {
    if (which === "hours") {
      state.hours = clamp(state.hours + dir, CFG.minHours, CFG.maxHours);
    } else if (which === "pack") {
      state.packHours = clamp(state.packHours + dir, CFG.minPack, CFG.maxPack);
      if (!state.packing) state.packing = true;
    }
    render();
  }

  function pick(add) {
    if (!add) return;
    if (add.indexOf("crew:") === 0) {
      setCrew(add.slice(5));
    } else if (add === "packing") {
      state.packing = true;
    } else if (add === "safe") {
      state.safe = true;
    }
    render();
    scrollToBook();
  }

  function scrollToBook() {
    if (window.matchMedia("(max-width: 1000px)").matches) {
      var book = $("#book");
      if (book) book.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function openDrawer() {
    var drawer = $("#drawer");
    var scrim = $("#scrim");
    if (!drawer) return;
    if (scrim) { scrim.hidden = false; void scrim.offsetWidth; scrim.classList.add("is-open"); }
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    var drawer = $("#drawer");
    var scrim = $("#scrim");
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (scrim) {
      scrim.classList.remove("is-open");
      setTimeout(function () { scrim.hidden = true; }, 350);
    }
    document.body.style.overflow = "";
  }

  /* ---------- wiring ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target;

    var stageCard = el.closest ? el.closest(".crewcard") : null;
    if (stageCard) {
      setCrew(stageCard.getAttribute("data-crew"));
      return;
    }

    var seg = el.closest ? el.closest("#crewSeg .seg__btn") : null;
    if (seg) {
      setCrew(seg.getAttribute("data-crew"));
      return;
    }

    var act = el.closest ? el.closest("[data-act]") : null;
    if (act) {
      var a = act.getAttribute("data-act");
      if (a === "hours-up") step("hours", 1);
      else if (a === "hours-down") step("hours", -1);
      else if (a === "pack-up") step("pack", 1);
      else if (a === "pack-down") step("pack", -1);
      return;
    }

    var toggle = el.closest ? el.closest("[data-toggle]") : null;
    if (toggle) {
      var key = toggle.getAttribute("data-toggle");
      if (key === "packing") state.packing = !state.packing;
      if (key === "safe") state.safe = !state.safe;
      render();
      return;
    }

    var chip = el.closest ? el.closest(".chip") : null;
    if (chip) {
      var filter = chip.getAttribute("data-filter");
      $$(".chip").forEach(function (c) { c.classList.toggle("is-on", c === chip); });
      $$("#rows .row").forEach(function (row) {
        var cat = row.getAttribute("data-cat");
        row.classList.toggle("is-hidden", filter !== "all" && cat !== filter);
      });
      return;
    }

    var addBtn = el.closest ? el.closest(".row__add") : null;
    if (addBtn) {
      var row = addBtn.closest(".row");
      if (row) pick(row.getAttribute("data-pick"));
      return;
    }

    var jump = el.closest ? el.closest("[data-jump]") : null;
    if (jump) {
      var target = jump.getAttribute("data-jump");
      if (target === "packing") {
        state.packing = true;
        render();
      }
      if (target === "home" || target === "apartment") {
        var crewStage = $("#crew");
        if (crewStage) crewStage.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        scrollToBook();
      }
      return;
    }

    if (el.closest && el.closest("#barOpen")) { openDrawer(); return; }
    if (el.closest && el.closest("#drawerClose")) { closeDrawer(); return; }
    if (el.closest && el.closest("#scrim")) { closeDrawer(); return; }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
    if ((e.key === "Enter" || e.key === " ") && document.activeElement && document.activeElement.classList.contains("crewcard")) {
      e.preventDefault();
      setCrew(document.activeElement.getAttribute("data-crew"));
    }
  });

  /* boot overlay failsafe */
  var boot = document.querySelector(".boot");
  if (boot) {
    setTimeout(function () {
      if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
    }, 2600);
  }

  render();
})();
