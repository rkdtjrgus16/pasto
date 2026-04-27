(function () {
  "use strict";

  var PHOTOS_KEY = "restaurant-demo-photos";
  var REVIEWS_KEY = "restaurant-demo-reviews";
  var FOOD_ITEMS_KEY = "restaurant-demo-food-items";

  var MAX_FOOD = 12;
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
      alert("저장 공간이 부족합니다. 브라우저 저장 한도(약 5MB)를 넘었을 수 있어요. 사진·리뷰를 줄이거나 항목을 지워 주세요.");
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
            var out = canvas.toDataURL("image/jpeg", quality);
            resolve(out);
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

  // ----- 이전 버전(localStorage) → 메뉴별 구조로 옮기기 (키가 아예 없을 때만 1회) -----
  function migrateLegacy() {
    try {
      if (localStorage.getItem(FOOD_ITEMS_KEY) !== null) {
        return;
      }
    } catch (e) {
      return;
    }
    var photos = loadJSON(PHOTOS_KEY);
    var oldReviews = loadJSON(REVIEWS_KEY);
    var hasPhotos = Array.isArray(photos) && photos.length;
    var hasOldReviews = Array.isArray(oldReviews) && oldReviews.length;
    if (!hasPhotos && !hasOldReviews) {
      saveJSON(FOOD_ITEMS_KEY, []);
      return;
    }
    var items = [];
    if (hasPhotos) {
      photos.forEach(function (p, i) {
        items.push({
          id: p.id || uid(),
          name: "음식 " + (i + 1),
          dataUrl: p.dataUrl || "",
          reviews: []
        });
      });
    }
    if (hasOldReviews) {
      if (items.length === 0) {
        items.push({
          id: uid(),
          name: "이전에 남긴 후기",
          dataUrl: "",
          reviews: oldReviews
        });
      } else {
        oldReviews.forEach(function (r) {
          items[0].reviews.push(r);
        });
      }
    }
    if (items.length) {
      saveJSON(FOOD_ITEMS_KEY, items);
    }
  }

  function ensureFoodItem(raw) {
    if (!raw || typeof raw !== "object") return null;
    var reviews = Array.isArray(raw.reviews) ? raw.reviews : [];
    return {
      id: String(raw.id || uid()),
      name: typeof raw.name === "string" ? raw.name : "메뉴",
      dataUrl: typeof raw.dataUrl === "string" ? raw.dataUrl : "",
      reviews: reviews
    };
  }

  function getFoodItems() {
    migrateLegacy();
    var data = loadJSON(FOOD_ITEMS_KEY);
    if (!Array.isArray(data)) return [];
    return data.map(ensureFoodItem).filter(Boolean);
  }

  function setFoodItems(arr) {
    return saveJSON(FOOD_ITEMS_KEY, arr);
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
    } catch (e) {
      return "";
    }
  }

  // ----- DOM -----
  var photoInput = document.getElementById("photo-input");
  var foodList = document.getElementById("food-list");
  var foodEmpty = document.getElementById("food-empty");
  var clearPhotosBtn = document.getElementById("clear-photos");
  var photoForm = document.getElementById("photo-form");

  function setStarsInRow(starRow, n) {
    n = Math.max(1, Math.min(5, n | 0));
    var hidden = starRow.querySelector('input[name="rating"]');
    if (hidden) hidden.value = String(n);
    var label = starRow.querySelector(".stars__text");
    if (label) label.textContent = n + "점";
    var btns = starRow.querySelectorAll(".star");
    btns.forEach(function (btn) {
      var v = parseInt(btn.getAttribute("data-value"), 10);
      btn.classList.toggle("is-active", v <= n);
    });
  }

  function bindStarRow(starRow) {
    var btns = starRow.querySelectorAll(".star");
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setStarsInRow(starRow, parseInt(btn.getAttribute("data-value"), 10));
      });
    });
  }

  function makeStarRow() {
    var wrap = document.createElement("div");
    wrap.className = "stars";
    wrap.setAttribute("role", "group");
    for (var s = 1; s <= 5; s++) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "star";
      b.setAttribute("data-value", String(s));
      b.setAttribute("aria-label", s + "점");
      b.textContent = "★";
      wrap.appendChild(b);
    }
    var hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = "rating";
    hidden.value = "5";
    wrap.appendChild(hidden);
    var t = document.createElement("span");
    t.className = "stars__text";
    t.setAttribute("aria-hidden", "true");
    t.textContent = "5점";
    wrap.appendChild(t);
    setStarsInRow(wrap, 5);
    bindStarRow(wrap);
    return wrap;
  }

  function buildReviewCard(foodId, r) {
    var li = document.createElement("li");
    li.className = "review-card review-card--nested";
    li.dataset.reviewId = r.id;
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
    ratingLine.textContent = "★".repeat(r.rating || 0) + " " + (r.rating || 0) + "/5";
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
    var delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn--small";
    delBtn.textContent = "삭제";
    delBtn.addEventListener("click", function () {
      if (confirm("이 리뷰를 삭제할까요?")) {
        removeReview(foodId, r.id);
      }
    });
    actions.appendChild(delBtn);
    li.appendChild(actions);
    return li;
  }

  function removeReview(foodId, reviewId) {
    var items = getFoodItems();
    var it = items.find(function (x) {
      return x.id === foodId;
    });
    if (!it) return;
    it.reviews = it.reviews.filter(function (r) {
      return r.id !== reviewId;
    });
    if (setFoodItems(items)) renderAll();
  }

  function saveFoodNameOnly(foodId, name) {
    var items = getFoodItems();
    var it = items.find(function (x) {
      return x.id === foodId;
    });
    if (!it) return;
    it.name = (name || "").trim() || "메뉴";
    if (!setFoodItems(items)) return;
    var card = foodList.querySelector('.food-card[data-food-id="' + foodId + '"]');
    if (card) {
      var title = card.querySelector(".food-card__reviews-title");
      if (title) title.textContent = "「" + it.name + "」에 대한 리뷰";
    }
  }

  function removeFood(foodId) {
    if (!confirm("이 메뉴 항목과 달린 리뷰를 모두 지울까요?")) return;
    var next = getFoodItems().filter(function (x) {
      return x.id !== foodId;
    });
    if (setFoodItems(next)) renderAll();
  }

  function handleReviewSubmit(foodId, form) {
    var nameIn = form.querySelector('[name="reviewer-name"]');
    var textIn = form.querySelector('[name="text"]');
    var fileIn = form.querySelector('[name="review-image"]');
    var starRow = form.querySelector(".stars");
    var name = ((nameIn && nameIn.value) || "").trim();
    var text = ((textIn && textIn.value) || "").trim();
    var rating = starRow
      ? parseInt(starRow.querySelector('input[name="rating"]').value, 10) || 5
      : 5;
    if (!name || !text) return;
    var file = fileIn && fileIn.files && fileIn.files[0];

    var finish = function (imageUrl) {
      var items = getFoodItems();
      var it = items.find(function (x) {
        return x.id === foodId;
      });
      if (!it) return;
      it.reviews.push({
        id: uid(),
        name: name,
        text: text,
        rating: rating,
        imageUrl: imageUrl || null,
        createdAt: new Date().toISOString()
      });
      if (!setFoodItems(items)) return;
      if (nameIn) nameIn.value = "";
      if (textIn) textIn.value = "";
      if (fileIn) fileIn.value = "";
      if (starRow) setStarsInRow(starRow, 5);
      renderAll();
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
  }

  function buildFoodCard(item) {
    var art = document.createElement("article");
    art.className = "food-card";
    art.dataset.foodId = item.id;
    var top = document.createElement("div");
    top.className = "food-card__top";

    var media = document.createElement("div");
    media.className = "food-card__media";
    if (item.dataUrl) {
      var im = document.createElement("img");
      im.src = item.dataUrl;
      im.alt = item.name;
      im.loading = "lazy";
      media.appendChild(im);
    } else {
      var ph = document.createElement("div");
      ph.className = "food-card__placeholder";
      ph.setAttribute("role", "img");
      ph.setAttribute("aria-label", "이미지 없음");
      ph.textContent = "이미지 없음";
      media.appendChild(ph);
    }

    var headCol = document.createElement("div");
    headCol.className = "food-card__headcol";
    var nameRow = document.createElement("div");
    nameRow.className = "food-card__name-row";
    var nameLabel = document.createElement("label");
    nameLabel.className = "field-label-inline";
    nameLabel.setAttribute("for", "food-name-" + item.id);
    nameLabel.textContent = "메뉴 이름";
    var nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "food-name-" + item.id;
    nameInput.className = "food-card__name-input";
    nameInput.value = item.name;
    nameInput.maxLength = 40;
    nameInput.placeholder = "예: 돈까스정식";
    nameInput.addEventListener("change", function () {
      saveFoodNameOnly(item.id, nameInput.value);
    });
    nameInput.addEventListener("blur", function () {
      saveFoodNameOnly(item.id, nameInput.value);
    });
    var delFood = document.createElement("button");
    delFood.type = "button";
    delFood.className = "btn btn--small food-card__delete-food";
    delFood.textContent = "이 메뉴 삭제";
    delFood.addEventListener("click", function () {
      removeFood(item.id);
    });
    nameRow.appendChild(nameLabel);
    nameRow.appendChild(nameInput);
    nameRow.appendChild(delFood);
    headCol.appendChild(nameRow);

    var sub = document.createElement("p");
    sub.className = "food-card__meta";
    var reviewCount = (item.reviews && item.reviews.length) || 0;
    sub.textContent = "이 음식 리뷰 " + reviewCount + "개";
    headCol.appendChild(sub);
    top.appendChild(media);
    top.appendChild(headCol);

    var reviewsBlock = document.createElement("div");
    reviewsBlock.className = "food-card__reviews-block";
    var reviewsTitle = document.createElement("h3");
    reviewsTitle.className = "food-card__reviews-title";
    reviewsTitle.textContent = "「" + (item.name || "메뉴") + "」에 대한 리뷰";
    var reviewsUl = document.createElement("ul");
    reviewsUl.className = "food-card__review-list";
    var sorted = (item.reviews || [])
      .slice()
      .sort(function (a, b) {
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      });
    if (sorted.length === 0) {
      var emptyLi = document.createElement("li");
      emptyLi.className = "food-card__review-empty";
      emptyLi.textContent = "아직 이 메뉴에 대한 리뷰가 없습니다.";
      reviewsUl.appendChild(emptyLi);
    } else {
      sorted.forEach(function (r) {
        reviewsUl.appendChild(buildReviewCard(item.id, r));
      });
    }
    reviewsBlock.appendChild(reviewsTitle);
    reviewsBlock.appendChild(reviewsUl);

    var form = document.createElement("form");
    form.className = "review-form review-form--compact";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      handleReviewSubmit(item.id, form);
    });
    var f1 = document.createElement("div");
    f1.className = "field";
    f1.innerHTML = '<label for="rn-' + item.id + '">닉네임</label>';
    var nameField = document.createElement("input");
    nameField.type = "text";
    nameField.id = "rn-" + item.id;
    nameField.name = "reviewer-name";
    nameField.required = true;
    nameField.maxLength = 24;
    nameField.placeholder = "예: 김**";
    f1.appendChild(nameField);

    var f2 = document.createElement("div");
    f2.className = "field";
    var lab2 = document.createElement("span");
    lab2.className = "field__label";
    lab2.textContent = "별점";
    f2.appendChild(lab2);
    f2.appendChild(makeStarRow());

    var f3 = document.createElement("div");
    f3.className = "field";
    f3.innerHTML = '<label for="rt-' + item.id + '">후기</label>';
    var ta = document.createElement("textarea");
    ta.id = "rt-" + item.id;
    ta.name = "text";
    ta.rows = 3;
    ta.required = true;
    ta.maxLength = 800;
    ta.placeholder = "이 메뉴 맛, 양, 추천 여부 등을 적어주세요.";
    f3.appendChild(ta);

    var f4 = document.createElement("div");
    f4.className = "field";
    f4.innerHTML = '<label for="ri-' + item.id + '">리뷰 사진 (선택)</label>';
    var fi = document.createElement("input");
    fi.type = "file";
    fi.id = "ri-" + item.id;
    fi.name = "review-image";
    fi.accept = "image/*";
    f4.appendChild(fi);

    var submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "btn btn--primary";
    submit.textContent = "이 메뉴에 리뷰 남기기";

    form.appendChild(f1);
    form.appendChild(f2);
    form.appendChild(f3);
    form.appendChild(f4);
    form.appendChild(submit);

    art.appendChild(top);
    art.appendChild(reviewsBlock);
    art.appendChild(form);
    return art;
  }

  function renderAll() {
    var items = getFoodItems();
    foodList.innerHTML = "";
    items.forEach(function (item) {
      foodList.appendChild(buildFoodCard(item));
    });
    foodEmpty.classList.toggle("is-visible", items.length === 0);
  }

  photoForm.addEventListener("submit", function (e) {
    e.preventDefault();
  });

  photoInput.addEventListener("change", function () {
    var files = Array.prototype.slice.call(photoInput.files || [], 0);
    if (!files.length) return;
    (function processNext(i) {
      if (i >= files.length) {
        photoInput.value = "";
        renderAll();
        return;
      }
      var file = files[i];
      if (file.size > MAX_IMAGE_BYTES) {
        alert("파일이 너무 큽니다(권장 1MB 이하): " + (file.name || "이미지"));
        processNext(i + 1);
        return;
      }
      var list = getFoodItems();
      if (list.length >= MAX_FOOD) {
        alert("최대 " + MAX_FOOD + "개 메뉴까지 추가할 수 있어요.");
        photoInput.value = "";
        renderAll();
        return;
      }
      fileToResizedDataUrl(file, 1200, 1200, 0.82)
        .then(function (dataUrl) {
          list = getFoodItems();
          if (list.length >= MAX_FOOD) return;
          var n = list.length + 1;
          list.push({
            id: uid(),
            name: "새 메뉴 " + n,
            dataUrl: dataUrl,
            reviews: []
          });
          if (!setFoodItems(list)) {
            return;
          }
        })
        .catch(function () {
          alert("이미지 처리에 실패했습니다: " + (file.name || ""));
        })
        .finally(function () {
          processNext(i + 1);
        });
    })(0);
  });

  clearPhotosBtn.addEventListener("click", function () {
    if (!getFoodItems().length) return;
    if (confirm("모든 메뉴 항목과 달린 리뷰를 지울까요?")) {
      if (setFoodItems([])) renderAll();
    }
  });

  migrateLegacy();
  renderAll();
})();
