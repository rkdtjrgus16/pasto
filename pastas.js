/* 파스타 메뉴(홈·상세 공용). 이미지는 Unsplash(외부)입니다. */
var PASTA_ITEMS = [
  {
    id: "pasta-tomato",
    name: "토마토 파스타",
    desc: "진한 토마토 소스에 바질을 더해 산뜻하게.",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "pasta-cream",
    name: "크림 파스타",
    desc: "부드러운 크림과 버섯이 어우러진 든든한 한 접시.",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "pasta-pesto",
    name: "페스토 파스타",
    desc: "바질 페스토와 올리브유의 향이 살아 있는 메뉴.",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "pasta-aglio",
    name: "알리오 올리오",
    desc: "올리브유와 마늘의 조화, 담백한 클래식.",
    image:
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "pasta-carbonara",
    name: "까르보나라",
    desc: "계란 노른자와 페코리노 치즈의 진한 풍미.",
    image:
      "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "pasta-seafood",
    name: "해산물 파스타",
    desc: "신선한 해산물과 토마토 베이스의 시원한 맛.",
    image:
      "https://images.unsplash.com/photo-1563371353-b7a8d2a0a6b2?auto=format&fit=crop&w=900&q=80"
  }
];

function getPastaById(id) {
  if (!id) return null;
  for (var i = 0; i < PASTA_ITEMS.length; i++) {
    if (PASTA_ITEMS[i].id === id) return PASTA_ITEMS[i];
  }
  return null;
}
