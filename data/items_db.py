# -*- coding: utf-8 -*-
"""[data/items_db.py] 라즈베리 파이 4 백엔드 - 클래스, 아이템, 상점 카탈로그 및 스킬 상수 DB"""
from typing import Any

LOGICAL_W = 900
LOGICAL_H = 600
MAX_SKILL_LEVEL = 10
SKILL_KEYS = ("basic_attack", "dodge", "heavy_attack", "magic_skill", "special_skill")
SKILL_LABELS = {
    "basic_attack": "룬 슬래시",
    "dodge": "환영 회피",
    "heavy_attack": "대지 분쇄",
    "magic_skill": "화염구 발사",
    "special_skill": "아케인 노바",
}
COOLDOWNS = {
    "basic_attack": 0.28,
    "interact": 0.25,
    "dodge": 1.00,
    "heavy_attack": 2.80,
    "magic_skill": 3.50,
    "special_skill": 7.00,
}

CLASSES = {
    "knight": {"name": "가디언 나이트", "hp": 240, "mp": 90, "atk": 30, "def": 14, "spd": 205, "crit": 0.18, "color": "#38bdf8"},
    "mage":   {"name": "아케인 메이지", "hp": 165, "mp": 190, "atk": 24, "def": 7,  "spd": 195, "crit": 0.25, "color": "#c084fc"},
    "ranger": {"name": "윈드 레인저",   "hp": 190, "mp": 125, "atk": 27, "def": 9,  "spd": 245, "crit": 0.35, "color": "#4ade80"},
}

ITEMS = {
    "warp_nearest_town":   {"id": "warp_nearest_town", "name": "📜 인근 마을 워프 주문서", "type": "warp", "warpTarget": "nearest", "price": 100, "desc": "사용 시 현재 위치에서 가장 가까운 안전지대 인근 마을로 즉시 텔레포트합니다."},
    "warp_forest_town":    {"id": "warp_forest_town", "name": "🌲 포레스트 타운 워프석", "type": "warp", "warpTarget": "forest_town", "price": 150, "desc": "사용 시 안전지대 [포레스트 타운 시티]로 즉시 텔레포트합니다."},
    "warp_oceanblue_town": {"id": "warp_oceanblue_town", "name": "🌊 오션블루 타운 워프석", "type": "warp", "warpTarget": "oceanblue_town", "price": 250, "desc": "사용 시 안전지대 [오션블루 타운]으로 즉시 텔레포트합니다."},
    "potion_hp":           {"id": "potion_hp", "name": "생명의 비약", "type": "consumable", "healHp": 95, "healMp": 0, "price": 80, "desc": "체력을 즉시 95 회복합니다."},
    "potion_elixir":       {"id": "potion_elixir", "name": "고대 엘릭서", "type": "consumable", "healHp": 200, "healMp": 120, "price": 200, "desc": "체력 200, 마나 120을 회복합니다."},
    "broken_goblin_weapon": {"id": "broken_goblin_weapon", "name": "고블린의 부서진 무기", "type": "quest", "desc": "[퀘스트 3 재료] 마을 자경단 무장을 위해 촌장이 요청한 부서진 무기입니다."},
    "iron_blade":          {"id": "iron_blade", "name": "룬 강철검", "type": "weapon", "atk": 14, "crit": 0.06, "price": 300, "desc": "공격력 +14, 치명타율 +6%"},
    "mithril_sword":       {"id": "mithril_sword", "name": "성기사단 미스릴 대검", "type": "weapon", "atk": 26, "crit": 0.09, "price": 600, "desc": "공격력 +26, 치명타율 +9%"},
    "guardian_plate":      {"id": "guardian_plate", "name": "수호자의 갑주", "type": "armor", "def": 10, "hp": 75, "price": 350, "desc": "방어력 +10, 최대 체력 +75"},
    "dragonscale_armor":   {"id": "dragonscale_armor", "name": "용비늘 수호 갑주", "type": "armor", "def": 18, "hp": 140, "price": 750, "desc": "방어력 +18, 최대 체력 +140"},
    "gyro_boots":          {"id": "gyro_boots", "name": "질풍의 자이로 각반", "type": "accessory", "spd": 38, "crit": 0.10, "price": 500, "desc": "이동속도 +38, 치명타율 +10%"},
    "abyss_crown":         {"id": "abyss_crown", "name": "심연 군주의 왕관", "type": "accessory", "atk": 32, "hp": 120, "crit": 0.15, "desc": "공격력 +32, 최대 체력 +120"},
}

SHOP_CATALOG = [
    "warp_nearest_town",
    "warp_forest_town",
    "warp_oceanblue_town",
    "potion_hp",
    "potion_elixir",
    "mithril_sword",
    "dragonscale_armor",
]


def clamp_skill_level(lv: Any) -> int:
    try:
        n = int(float(lv))
    except (TypeError, ValueError):
        return 1
    return max(1, min(MAX_SKILL_LEVEL, n))
