# -*- coding: utf-8 -*-
"""[data/zones_db.py] 라즈베리 파이 4 백엔드 - 12개 월드 구역(장애물, 보물상자, 포털, NPC) DB"""
from typing import Any

def create_world_zones() -> dict[str, dict[str, Any]]:
    return {
        "home_interior": {
            "id": "home_interior",
            "name": "🏠 집 안 [안전지대 🛡️ - 어머니의 집]",
            "isSafeZone": True,
            "obstacles": [
                {"x": 155, "y": 82, "w": 72, "h": 72, "kind": "furniture_fireplace"},
                {"x": 445, "y": 82, "w": 68, "h": 68, "kind": "furniture_bookshelf"},
                {"x": 650, "y": 86, "w": 72, "h": 68, "kind": "furniture_bed"},
            ],
            "npcs": [
                {
                    "id": "mother_maria", "name": "어머니 마리아", "x": 310, "y": 280, "questRole": "mother",
                    "lines": ['어머니 마리아: "언제나 몸 건강히 다녀오렴, 내 아들아. 다치면 집 안이나 마을 안전지대에서 푹 쉬어야 한단다."'],
                }
            ],
            "chests": [{"id": "c_home1", "x": 180, "y": 450, "opened": False, "item": "potion_hp", "gold": 50}],
            "portals": [{"x": 810, "y": 300, "r": 38, "target": "emerald_forest", "sx": 130, "sy": 300, "label": "🚪 집 밖으로 나가기 [집 앞]"}],
        },
        "emerald_forest": {
            "id": "emerald_forest",
            "name": "🌿 집 앞 (슬라임 서식지)",
            "isSafeZone": False,
            "obstacles": [
                {"x": 260, "y": 90, "w": 64, "h": 64, "kind": "tree"},
                {"x": 380, "y": 445, "w": 64, "h": 64, "kind": "tree"},
                {"x": 560, "y": 110, "w": 64, "h": 64, "kind": "tree"},
            ],
            "npcs": [],
            "chests": [
                {"id": "c_f1", "x": 290, "y": 155, "opened": False, "item": "potion_hp", "gold": 50},
                {"id": "c_f2", "x": 700, "y": 500, "opened": False, "item": "guardian_plate", "gold": 80},
            ],
            "portals": [
                {"x": 80, "y": 300, "r": 36, "target": "home_interior", "sx": 715, "sy": 300, "label": "⬅ 🏠 집 안 (어머니)"},
                {"x": 815, "y": 300, "r": 38, "target": "forest_town", "sx": 130, "sy": 300, "label": "🛡️ 포레스트 타운 ➔"},
            ],
        },
        "forest_town": {
            "id": "forest_town",
            "name": "🛡️ 포레스트 타운 시티 [안전지대 - 적 없음]",
            "isSafeZone": True,
            "obstacles": [
                {"x": 200, "y": 85, "w": 68, "h": 68, "kind": "house"},
                {"x": 410, "y": 85, "w": 68, "h": 68, "kind": "house"},
                {"x": 615, "y": 85, "w": 68, "h": 68, "kind": "house"},
                {"x": 415, "y": 350, "w": 64, "h": 64, "kind": "fountain"},
            ],
            "npcs": [
                {
                    "id": "chief_edward", "name": "포레스트 타운 촌장", "x": 445, "y": 225, "questRole": "chief",
                    "lines": ['포레스트 타운 촌장: "풍족하고 평화로운 안전지대 포레스트 타운 시티에 오신 것을 환영하오! 이곳은 몬스터가 없으며 체력과 마나가 빠르게 회복된다오."'],
                },
                {
                    "id": "lady_elina", "name": "아가씨 엘리나", "x": 635, "y": 255, "questRole": "lady",
                    "lines": ['아가씨 엘리나: "포레스트 타운에 다시 평화가 찾아오기를 매일 기도하고 있어요."'],
                },
                {
                    "id": "blacksmith_bron", "name": "대장장이 브론", "x": 245, "y": 245, "questRole": "blacksmith",
                    "lines": ['대장장이 브론: "강력한 고레벨 몬스터들을 상대하려면 인벤토리(I)에서 좋은 무기와 갑주를 꼭 챙겨 입어야 한다네!"'],
                },
                {
                    "id": "merchant_lucy", "name": "상점 주인 루시", "x": 285, "y": 425, "questRole": "merchant",
                    "lines": ['상점 주인 루시: "어서 오세요 모험가님! 사냥터에서 인근 마을로 즉시 귀환할 수 있는 [📜 인근 마을 워프 주문서]와 물약을 골드로 판매하고 있어요!"'],
                },
            ],
            "chests": [{"id": "c_ft1", "x": 225, "y": 465, "opened": False, "item": "potion_elixir", "gold": 100}],
            "portals": [
                {"x": 75, "y": 300, "r": 36, "target": "emerald_forest", "sx": 735, "sy": 300, "label": "⬅ 🌿 집 앞"},
                {"x": 815, "y": 155, "r": 36, "target": "ancient_ruins", "sx": 130, "sy": 300, "label": "🗡️ 고블린 전초기지 1 ➔"},
                {"x": 815, "y": 345, "r": 36, "target": "orc_canyon_1", "sx": 130, "sy": 300, "label": "🪓 오크 전투협곡 1 ➔"},
                {"x": 445, "y": 535, "r": 38, "target": "coastal_road_1", "sx": 130, "sy": 300, "label": "🏖️ 해변으로 향하는 길 1 ➔"},
            ],
        },
        "ancient_ruins": {
            "id": "ancient_ruins",
            "name": "🗡️ 고블린 전초기지 1구역 (Lv.3~4 고블린 사냥존)",
            "isSafeZone": False,
            "obstacles": [
                {"x": 265, "y": 135, "w": 60, "h": 60, "kind": "tree"},
                {"x": 555, "y": 135, "w": 60, "h": 60, "kind": "pillar"},
                {"x": 415, "y": 420, "w": 60, "h": 60, "kind": "tree"},
            ],
            "npcs": [
                {
                    "id": "scout_lyra", "name": "자경단 정찰병 라이라", "x": 145, "y": 170, "questRole": "scout",
                    "lines": ['정찰병 라이라: "이곳은 고블린 전초기지 1구역입니다! 동쪽으로 가면 고블린 심층 야영지 2구역이 이어집니다."'],
                }
            ],
            "chests": [{"id": "c_r1", "x": 450, "y": 95, "opened": False, "item": "iron_blade", "gold": 120}],
            "portals": [
                {"x": 75, "y": 300, "r": 38, "target": "forest_town", "sx": 735, "sy": 165, "label": "⬅ 🛡️ 포레스트 타운"},
                {"x": 815, "y": 300, "r": 38, "target": "goblin_depths", "sx": 130, "sy": 300, "label": "🏹 고블린 야영지 2구역 ➔"},
            ],
        },
        "goblin_depths": {
            "id": "goblin_depths",
            "name": "🏹 고블린 심층 야영지 2구역 (Lv.4~5 정예 고블린 사냥존)",
            "isSafeZone": False,
            "obstacles": [
                {"x": 290, "y": 160, "w": 60, "h": 60, "kind": "pillar"},
                {"x": 580, "y": 380, "w": 60, "h": 60, "kind": "pillar"},
            ],
            "npcs": [],
            "chests": [{"id": "c_gd1", "x": 740, "y": 295, "opened": False, "item": "gyro_boots", "gold": 160}],
            "portals": [{"x": 75, "y": 300, "r": 38, "target": "ancient_ruins", "sx": 735, "sy": 300, "label": "⬅ 🗡️ 고블린 전초기지 1구역"}],
        },
        "orc_canyon_1": {
            "id": "orc_canyon_1",
            "name": "🪓 오크 전투협곡 1구역 (Lv.6~7 오크 부족 사냥존)",
            "isSafeZone": False,
            "obstacles": [
                {"x": 270, "y": 145, "w": 60, "h": 60, "kind": "pillar"},
                {"x": 560, "y": 145, "w": 60, "h": 60, "kind": "pillar"},
                {"x": 415, "y": 410, "w": 60, "h": 60, "kind": "pillar"},
            ],
            "npcs": [],
            "chests": [{"id": "c_oc1", "x": 680, "y": 505, "opened": False, "item": "potion_elixir", "gold": 160}],
            "portals": [
                {"x": 75, "y": 300, "r": 38, "target": "forest_town", "sx": 735, "sy": 345, "label": "⬅ 🛡️ 포레스트 타운"},
                {"x": 815, "y": 300, "r": 38, "target": "orc_stronghold_2", "sx": 130, "sy": 300, "label": "🔥 오크 철혈 요새 2구역 ➔"},
            ],
        },
        "orc_stronghold_2": {
            "id": "orc_stronghold_2",
            "name": "🔥 오크 철혈 요새 2구역 (Lv.8~9 정예 오크 사냥존)",
            "isSafeZone": False,
            "obstacles": [
                {"x": 250, "y": 130, "w": 60, "h": 60, "kind": "pillar"},
                {"x": 580, "y": 130, "w": 60, "h": 60, "kind": "pillar"},
                {"x": 420, "y": 410, "w": 60, "h": 60, "kind": "pillar"},
            ],
            "npcs": [],
            "chests": [{"id": "c_os2", "x": 450, "y": 95, "opened": False, "item": "potion_elixir", "gold": 220}],
            "portals": [
                {"x": 75, "y": 300, "r": 38, "target": "orc_canyon_1", "sx": 735, "sy": 300, "label": "⬅ 🪓 오크 전투협곡 1구역"},
                {"x": 815, "y": 300, "r": 38, "target": "abyssal_altar", "sx": 130, "sy": 300, "label": "🐉 발록의 제단 (보스존) ➔"},
            ],
        },
        "abyssal_altar": {
            "id": "abyssal_altar",
            "name": "🐉 발록의 제단 (보스: Lv.12 오크 부족의 대장 발록)",
            "isSafeZone": False,
            "obstacles": [
                {"x": 220, "y": 110, "w": 60, "h": 60, "kind": "pillar"},
                {"x": 220, "y": 430, "w": 60, "h": 60, "kind": "pillar"},
                {"x": 660, "y": 110, "w": 60, "h": 60, "kind": "pillar"},
                {"x": 660, "y": 430, "w": 60, "h": 60, "kind": "pillar"},
            ],
            "npcs": [],
            "chests": [{"id": "c_b1", "x": 165, "y": 515, "opened": False, "item": "potion_elixir", "gold": 250}],
            "portals": [{"x": 75, "y": 300, "r": 38, "target": "orc_stronghold_2", "sx": 735, "sy": 300, "label": "⬅ 🔥 오크 철혈 요새 2구역"}],
        },
        "coastal_road_1": {
            "id": "coastal_road_1",
            "name": "🏖️ 해변으로 향하는 길 1 - 바람의 해안숲 (Lv.5~6)",
            "isSafeZone": False,
            "obstacles": [
                {"x": 250, "y": 120, "w": 64, "h": 64, "kind": "palm_tree"},
                {"x": 560, "y": 410, "w": 64, "h": 64, "kind": "palm_tree"},
            ],
            "npcs": [
                {
                    "id": "guard_kyle", "name": "해안 경비대원 카일", "x": 155, "y": 175, "questRole": "coastal_guard",
                    "lines": ['해안 경비대원 카일: "이 길은 포레스트 타운 시티에서 오션블루 타운으로 이어지는 [해변으로 향하는 길 1구역]입니다! 해변길 1·2·3을 차례로 돌파해야 오션블루 타운에 닿을 수 있습니다."'],
                }
            ],
            "chests": [{"id": "c_cr1", "x": 430, "y": 110, "opened": False, "item": "potion_hp", "gold": 130}],
            "portals": [
                {"x": 75, "y": 300, "r": 38, "target": "forest_town", "sx": 445, "sy": 465, "label": "⬅ 🛡️ 포레스트 타운"},
                {"x": 815, "y": 300, "r": 38, "target": "coastal_road_2", "sx": 130, "sy": 300, "label": "🌊 해변으로 향하는 길 2 ➔"},
            ],
        },
        "coastal_road_2": {
            "id": "coastal_road_2",
            "name": "🌊 해변으로 향하는 길 2 - 암초 해안절벽 (Lv.7~8)",
            "isSafeZone": False,
            "obstacles": [
                {"x": 290, "y": 140, "w": 60, "h": 60, "kind": "pillar"},
                {"x": 540, "y": 390, "w": 60, "h": 60, "kind": "pillar"},
            ],
            "npcs": [],
            "chests": [{"id": "c_cr2", "x": 450, "y": 500, "opened": False, "item": "potion_elixir", "gold": 180}],
            "portals": [
                {"x": 75, "y": 300, "r": 38, "target": "coastal_road_1", "sx": 735, "sy": 300, "label": "⬅ 🏖️ 해변으로 향하는 길 1"},
                {"x": 815, "y": 300, "r": 38, "target": "coastal_road_3", "sx": 130, "sy": 300, "label": "🐚 해변으로 향하는 길 3 ➔"},
            ],
        },
        "coastal_road_3": {
            "id": "coastal_road_3",
            "name": "🐚 해변으로 향하는 길 3 - 푸른 파도 모래사장 (Lv.9~10)",
            "isSafeZone": False,
            "obstacles": [
                {"x": 310, "y": 135, "w": 60, "h": 60, "kind": "pillar"},
                {"x": 570, "y": 405, "w": 60, "h": 60, "kind": "pillar"},
            ],
            "npcs": [],
            "chests": [{"id": "c_cr3", "x": 460, "y": 100, "opened": False, "item": "potion_elixir", "gold": 240}],
            "portals": [
                {"x": 75, "y": 300, "r": 38, "target": "coastal_road_2", "sx": 735, "sy": 300, "label": "⬅ 🌊 해변으로 향하는 길 2"},
                {"x": 815, "y": 300, "r": 38, "target": "oceanblue_town", "sx": 130, "sy": 300, "label": "🌊 오션블루 타운 진입 ➔"},
            ],
        },
        "oceanblue_town": {
            "id": "oceanblue_town",
            "name": "🌊 오션블루 타운 [안전지대 🛡️ - 적 없음]",
            "isSafeZone": True,
            "obstacles": [
                {"x": 230, "y": 105, "w": 68, "h": 68, "kind": "ocean_house"},
                {"x": 520, "y": 105, "w": 68, "h": 68, "kind": "ocean_house"},
                {"x": 430, "y": 360, "w": 64, "h": 64, "kind": "ocean_fountain"},
            ],
            "npcs": [
                {
                    "id": "mayor_marina", "name": "오션블루 촌장 마리나", "x": 455, "y": 245, "questRole": "ocean_mayor",
                    "lines": ['오션블루 촌장 마리나: "적이 없는 평화로운 해안 도시 오션블루 타운에 오신 것을 환영합니다!"'],
                },
                {
                    "id": "navigator_seiren", "name": "항해사 세이렌", "x": 645, "y": 315, "questRole": "navigator",
                    "lines": ['항해사 세이렌: "시원한 바닷바람이 부는 오션블루 타운 항구입니다!"'],
                },
                {
                    "id": "merchant_coral", "name": "해안 상인 코랄", "x": 285, "y": 425, "questRole": "merchant",
                    "lines": ['해안 상인 코랄: "오션블루 잡화점에 오신 걸 환영해요! 인근 마을로 즉시 텔레포트하는 [📜 인근 마을 워프 주문서]를 골드로 구매해 보세요!"'],
                },
            ],
            "chests": [{"id": "c_ob1", "x": 720, "y": 475, "opened": False, "item": "abyss_crown", "gold": 300}],
            "portals": [{"x": 75, "y": 300, "r": 38, "target": "coastal_road_3", "sx": 735, "sy": 300, "label": "⬅ 🐚 해변으로 향하는 길 3"}],
        },
    }


def get_nearest_town_zone(from_zone_id: str) -> str:
    if from_zone_id in ("coastal_road_2", "coastal_road_3", "oceanblue_town"):
        return "oceanblue_town"
    return "forest_town"
