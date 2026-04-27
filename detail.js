(function () {
  "use strict";

  var REVIEWS_MAP_KEY = "restaurant-pasta-reviews-by-menu";
  var MAX_IMAGE_BYTES = 1.2 * 1024 * 1024;

  function loadJSON(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      alert("저장 공간이 부족합니다. 리뷰·사진을 줄여 주세요.");
      return false;
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  function fileToResizedDataUrl(file, maxW, maxH, quality) {
    return new Promise(function (resolve, reject) {
      if (!file || !file.type.startsWith("image/")) {
        reject(new Error("이미지 파일이 아닙니다."));
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var dataUrl = reader.result;
        var img = new Image();
        img.onload = function () {
          var w = img.naturalWidth;
          var h = img.naturalHeight;
          var scale = Math.min(1, maxW / w, maxH / h);
          var cw = Math.round(w * scale);
          var ch = Math.round(h * scale);
          var canvas = document.createElement("canvas");
          canvas.width = cw;
          canvas.height = ch;
          var ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, cw, ch);
          try {
            resolve(canvas.toDataURL("image/jpeg", quality));
          } catch (err) {
            resolve(dataUrl);
          }
        };
        img.onerror = function () {
          reject(new Error("이미지를 읽을 수 없습니다."));
        };
        img.src = dataUrl;
      };
      reader.onerror = function () {
        reject(new Error("파일을 읽을 수 없습니다."));
      };
      reader.readAsDataURL(file);
    });
  }

  function getQueryId() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get("id") || "";
    } catch (e) {
      return "";
    }
  }

  function getReviewsMap() {
    var data = loadJSON(REVIEWS_MAP_KEY);
    return data && typeof data === "object" ? data : {};
  }

  function getReviewsFor(id) {
    var map = getReviewsMap();
    var arr = map[id];
    return Array.isArray(arr) ? arr : [];
  }

  function setReviewsFor(id, list) {
    var map = getReviewsMap();
    map[id] = list;
    return saveJSON(REVIEWS_MAP_KEY, map);
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleString("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    } catch (e) {
      return "";
    }
  }

  var starInput = document.getElementById("star-input");
  var ratingValue = null;
  var ratingText = null;

  function setStarsInRow(starRow, n) {
    n = Math.max(1, Math.min(5, n | 0));
    if (ratingValue) ratingValue.value = String(n);
    if (ratingText) ratingText.textContent = n + "점";
    var btns = starRow.querySelectorAll(".star");
    btns.forEach(function (btn) {
      var v = parseInt(btn.getAttribute("data-value"), 10);
      btn.classList.toggle("is-active", v <= n);
    });
  }

  function buildStarRow() {
    starInput.innerHTML = "";
    for (var s = 1; s <= 5; s++) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "star";
      b.setAttribute("data-value", String(s));
      b.setAttribute("aria-label", s + "점");
      b.textContent = "★";
      (function (val) {
        b.addEventListener("click", function () {
          setStarsInRow(starInput, val);
        });
      })(s);
      starInput.appendChild(b);
    }
    ratingValue = document.createElement("input");
    ratingValue.type = "hidden";
    ratingValue.name = "rating";
    ratingValue.value = "5";
    starInput.appendChild(ratingValue);
    ratingText = document.createElement("span");
    ratingText.className = "stars__text";
    ratingText.setAttribute("aria-hidden", "true");
    ratingText.textContent = "5점";
    starInput.appendChild(ratingText);
    setStarsInRow(starInput, 5);
  }

  var pastaId = getQueryId();
  var pasta = typeof getPastaById === "function" ? getPastaById(pastaId) : null;

  var elError = document.getElementById("detail-error");
  var elArticle = document.getElementById("detail-article");
  var elTitle = document.getElementById("detail-title");
  var elHeaderDesc = document.getElementById("detail-header-desc");
  var elHeroImg = document.getElementById("detail-hero-img");
  var elDesc = document.getElementById("detail-desc");
  var reviewList = document.getElementById("review-list");
  var reviewEmpty = document.getElementById("review-empty");
  var reviewForm = document.getElementById("review-form");
  var reviewImageInput = document.getElementById("review-image");

  if (!pasta) {
    document.title = "메뉴를 찾을 수 없음 — 맛있는 집";
    if (elError) elError.removeAttribute("hidden");
    if (elArticle) elArticle.setAttribute("hidden", "");
  } else {
    document.title = pasta.name + " — 맛있는 집";
    if (elError) elError.setAttribute("hidden", "");
    if (elArticle) elArticle.removeAttribute("hidden");
    elTitle.textContent = pasta.name;
    if (elHeaderDesc) elHeaderDesc.textContent = "상세 & 리뷰";
    elHeroImg.src = pasta.image;
    elHeroImg.alt = pasta.name;
    elDesc.textContent = pasta.desc;
    buildStarRow();
  }

  function renderReviews() {
    if (!pasta) return;
    var reviews = getReviewsFor(pasta.id);
    reviewList.innerHTML = "";
    reviews
      .slice()
      .sort(function (a, b) {
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      })
      .forEach(function (r) {
        var li = document.createElement("li");
        li.className = "review-card";
        var head = document.createElement("div");
        head.className = "review-card__head";
        var nameEl = document.createElement("span");
        nameEl.className = "review-card__name";
        nameEl.textContent = r.name;
        var meta = document.createElement("span");
        meta.className = "review-card__meta";
        meta.textContent = formatDate(r.createdAt);
        head.appendChild(nameEl);
        head.appendChild(meta);
        var ratingLine = document.createElement("div");
        ratingLine.className = "review-card__rating";
        ratingLine.textContent =
          "★".repeat(r.rating || 0) + " " + (r.rating || 0) + "/5";
        var textEl = document.createElement("p");
        textEl.className = "review-card__text";
        textEl.textContent = r.text;
        li.appendChild(head);
        li.appendChild(ratingLine);
        li.appendChild(textEl);
        if (r.imageUrl) {
          var fig = document.createElement("div");
          fig.className = "review-card__img";
          var im = document.createElement("img");
          im.src = r.imageUrl;
          im.alt = "리뷰 사진";
          fig.appendChild(im);
          li.appendChild(fig);
        }
        var actions = document.createElement("div");
        actions.className = "review-card__actions";
        var del = document.createElement("button");
        del.type = "button";
        del.className = "btn btn--small";
        del.textContent = "삭제";
        del.addEventListener("click", function () {
          if (confirm("이 리뷰를 삭제할까요?")) {
            var next = getReviewsFor(pasta.id).filter(function (x) {
              return x.id !== r.id;
            });
            if (setReviewsFor(pasta.id, next)) renderReviews();
          }
        });
        actions.appendChild(del);
        li.appendChild(actions);
        reviewList.appendChild(li);
      });
    reviewEmpty.classList.toggle("is-visible", reviews.length === 0);
  }

  if (pasta) {
    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("reviewer-name").value || "").trim();
      var text = (document.getElementById("review-text").value || "").trim();
      var rating = parseInt(ratingValue && ratingValue.value, 10) || 5;
      if (!name || !text) return;
      var file = reviewImageInput.files && reviewImageInput.files[0];

      var finish = function (imageUrl) {
        var list = getReviewsFor(pasta.id);
        list.push({
          id: uid(),
          name: name,
          text: text,
          rating: rating,
          imageUrl: imageUrl || null,
          createdAt: new Date().toISOString()
        });
        if (!setReviewsFor(pasta.id, list)) return;
        document.getElementById("reviewer-name").value = "";
        document.getElementById("review-text").value = "";
        if (reviewImageInput) reviewImageInput.value = "";
        setStarsInRow(starInput, 5);
        renderReviews();
      };

      if (file) {
        if (file.size > MAX_IMAGE_BYTES) {
          alert("리뷰 사진이 너무 큽니다. 1MB 이하로 줄여 주세요.");
          return;
        }
        fileToResizedDataUrl(file, 1000, 1000, 0.8)
          .then(finish)
          .catch(function () {
            finish(null);
          });
      } else {
        finish(null);
      }
    });
    renderReviews();
  } else {
    if (starInput) starInput.innerHTML = "";
  }
})();
