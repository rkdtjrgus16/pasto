(function () {
  "use strict";

  var grid = document.getElementById("pasta-grid");
  if (!grid || typeof PASTA_ITEMS === "undefined") return;

  PASTA_ITEMS.forEach(function (item) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.className = "pasta-tile";
    a.href = "detail.html?id=" + encodeURIComponent(item.id);
    a.setAttribute("aria-label", item.name + " 상세 보기");

    var figure = document.createElement("div");
    figure.className = "pasta-tile__media";
    var img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;
    img.loading = "lazy";
    figure.appendChild(img);

    var cap = document.createElement("div");
    cap.className = "pasta-tile__cap";
    var t = document.createElement("h3");
    t.className = "pasta-tile__name";
    t.textContent = item.name;
    var d = document.createElement("p");
    d.className = "pasta-tile__desc";
    d.textContent = item.desc;
    cap.appendChild(t);
    cap.appendChild(d);
    a.appendChild(figure);
    a.appendChild(cap);
    li.appendChild(a);
    grid.appendChild(li);
  });
})();
