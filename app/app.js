// DealHunt app: render the checked deals and make search, filters and
// sorting work. The deals come from data.js (window.DEALHUNT_DEALS); this
// file never fetches anything, so the page works with no network at all.

(function () {
  "use strict";

  var DEALS = window.DEALHUNT_DEALS || [];
  var META = window.DEALHUNT_META || {};

  var VERDICT_RANK = { "new-low": 0, strong: 1, good: 2, routine: 3 };
  var VERDICT_LABEL = {
    "new-low": "\u2605 New low",
    strong: "Strong deal",
    good: "Good deal",
    routine: "Routine sale",
  };
  var STORE_CLASS = {
    Amazon: "store-amazon",
    "Best Buy": "store-best-buy",
    Walmart: "store-walmart",
    Target: "store-target",
    Nintendo: "store-nintendo",
  };

  var state = { q: "", category: "All", store: "All", minDiscount: 0, sort: "best" };

  var grid = document.getElementById("deal-grid");
  var countEl = document.getElementById("result-count");
  var emptyEl = document.getElementById("empty-state");
  var searchEl = document.getElementById("search");
  var storeEl = document.getElementById("store-filter");
  var discountEl = document.getElementById("discount-filter");
  var sortEl = document.getElementById("sort");
  var chipsEl = document.getElementById("category-chips");

  // ---------- small helpers ----------

  function esc(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function money(n) {
    var rounded = Math.round(n * 100) / 100;
    return "$" + (rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2));
  }

  function discountPct(deal) {
    return Math.round((1 - deal.sale / deal.usual) * 100);
  }

  function savedAmount(deal) {
    return deal.usual - deal.sale;
  }

  function checkedLabel(iso) {
    var d = new Date(iso);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var hh = String(d.getUTCHours()).padStart(2, "0");
    var mm = String(d.getUTCMinutes()).padStart(2, "0");
    return d.getUTCDate() + " " + months[d.getUTCMonth()] + " " + d.getUTCFullYear() + " \u00b7 " + hh + ":" + mm + " UTC";
  }

  // ---------- stats ----------

  function renderStats() {
    var stores = {};
    var total = 0;
    var best = 0;
    DEALS.forEach(function (deal) {
      stores[deal.store] = true;
      var pct = discountPct(deal);
      total += pct;
      if (pct > best) best = pct;
    });
    var avg = DEALS.length ? Math.round(total / DEALS.length) : 0;
    var set = function (id, value) {
      var el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    set("stat-deals", String(DEALS.length));
    set("stat-stores", String(Object.keys(stores).length));
    set("stat-avg", "\u2212" + avg + "%");
    set("stat-best", "\u2212" + best + "%");
    var note = document.getElementById("topbar-note");
    if (note) note.textContent = DEALS.length + " deals \u00b7 checked today";
  }

  // ---------- controls ----------

  function uniqueInOrder(values) {
    var seen = {};
    var out = [];
    values.forEach(function (value) {
      if (!seen[value]) {
        seen[value] = true;
        out.push(value);
      }
    });
    return out;
  }

  function buildControls() {
    var categories = uniqueInOrder(DEALS.map(function (d) { return d.category; }));
    var stores = uniqueInOrder(DEALS.map(function (d) { return d.store; }));

    var chipsHtml = ['<button type="button" class="chip" data-category="All" aria-pressed="true">All categories</button>'];
    categories.forEach(function (category) {
      chipsHtml.push(
        '<button type="button" class="chip" data-category="' + esc(category) + '" aria-pressed="false">' + esc(category) + "</button>"
      );
    });
    chipsEl.innerHTML = chipsHtml.join("");

    var storeHtml = ['<option value="All">All stores</option>'];
    stores.forEach(function (store) {
      storeHtml.push('<option value="' + esc(store) + '">' + esc(store) + "</option>");
    });
    storeEl.innerHTML = storeHtml.join("");
  }

  // ---------- filtering and sorting ----------

  function matchesQuery(deal, q) {
    if (!q) return true;
    var hay = (deal.name + " " + deal.store + " " + deal.category + " " + (deal.keywords || "")).toLowerCase();
    return q.split(/\s+/).every(function (word) {
      return word === "" || hay.indexOf(word) !== -1;
    });
  }

  function visibleDeals() {
    var q = state.q.trim().toLowerCase();
    var list = DEALS.filter(function (deal) {
      if (state.category !== "All" && deal.category !== state.category) return false;
      if (state.store !== "All" && deal.store !== state.store) return false;
      if (discountPct(deal) < state.minDiscount) return false;
      return matchesQuery(deal, q);
    });
    if (state.sort === "discount") {
      list.sort(function (a, b) { return discountPct(b) - discountPct(a); });
    } else if (state.sort === "price-asc") {
      list.sort(function (a, b) { return a.sale - b.sale; });
    } else if (state.sort === "price-desc") {
      list.sort(function (a, b) { return b.sale - a.sale; });
    } else {
      list.sort(function (a, b) {
        var byVerdict = VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict];
        if (byVerdict !== 0) return byVerdict;
        var byDiscount = discountPct(b) - discountPct(a);
        if (byDiscount !== 0) return byDiscount;
        return a.sale - b.sale;
      });
    }
    return list;
  }

  // ---------- rendering ----------

  function cardHtml(deal) {
    var pct = discountPct(deal);
    var storeClass = STORE_CLASS[deal.store] || "";
    var alsoAt = "";
    if (deal.alsoAt && deal.alsoAt.length) {
      var parts = deal.alsoAt.map(function (other) {
        return esc(other.store) + " " + money(other.price);
      });
      alsoAt = '<p class="also-at">Also at ' + parts.join(" \u00b7 ") + " — same deal, checked today.</p>";
    }
    return (
      '<article class="card" data-id="' + esc(deal.id) + '">' +
      '<div class="card-top">' +
      '<span class="store-pill ' + storeClass + '">' + esc(deal.store) + "</span>" +
      '<span class="card-category">' + esc(deal.category) + "</span>" +
      '<span class="discount-badge">\u2212' + pct + "%</span>" +
      "</div>" +
      '<h3 class="card-name">' + esc(deal.name) + "</h3>" +
      '<p class="verdict verdict-' + esc(deal.verdict) + '">' +
      '<span class="verdict-label">' + esc(VERDICT_LABEL[deal.verdict] || "Deal") + "</span> — " +
      esc(deal.verdictNote) +
      "</p>" +
      '<p class="price">' +
      '<span class="sale">' + money(deal.sale) + "</span>" +
      '<s class="usual">' + money(deal.usual) + "</s>" +
      '<span class="save">Save ' + money(savedAmount(deal)) + "</span>" +
      "</p>" +
      alsoAt +
      '<p class="checked">Checked ' + esc(checkedLabel(deal.checkedAt)) +
      " \u00b7 Source: " +
      '<a href="' + esc(deal.sourceUrl) + '" target="_blank" rel="noopener">' + esc(deal.source) + "</a></p>" +
      '<a class="store-link" href="' + esc(deal.url) + '" target="_blank" rel="noopener">View at ' + esc(deal.store) + " \u2192</a>" +
      "</article>"
    );
  }

  function render() {
    var list = visibleDeals();
    grid.innerHTML = list.map(cardHtml).join("");
    countEl.textContent = "Showing " + list.length + " of " + DEALS.length + " deals";
    emptyEl.hidden = list.length !== 0;
    grid.hidden = list.length === 0;
  }

  // ---------- events ----------

  searchEl.addEventListener("input", function () {
    state.q = searchEl.value;
    render();
  });

  storeEl.addEventListener("change", function () {
    state.store = storeEl.value;
    render();
  });

  discountEl.addEventListener("change", function () {
    state.minDiscount = Number(discountEl.value) || 0;
    render();
  });

  sortEl.addEventListener("change", function () {
    state.sort = sortEl.value;
    render();
  });

  chipsEl.addEventListener("click", function (event) {
    var button = event.target.closest(".chip");
    if (!button) return;
    state.category = button.getAttribute("data-category");
    var chips = chipsEl.querySelectorAll(".chip");
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip === button ? "true" : "false");
    });
    render();
  });

  document.getElementById("reset-filters").addEventListener("click", function () {
    state.q = "";
    state.category = "All";
    state.store = "All";
    state.minDiscount = 0;
    state.sort = "best";
    searchEl.value = "";
    storeEl.value = "All";
    discountEl.value = "0";
    sortEl.value = "best";
    var chips = chipsEl.querySelectorAll(".chip");
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.getAttribute("data-category") === "All" ? "true" : "false");
    });
    render();
  });

  // ---------- boot ----------

  renderStats();
  buildControls();
  render();
})();
