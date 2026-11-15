# -*- coding: utf-8 -*-
"""[data/quests_db.py] 라즈베리 파이 4 백엔드 - 메인 퀘스트 1~6장 & 서브 퀘스트 1~4 DB"""
from typing import Any

QUESTS = [
    {
        "id": "main_1", "num": 1, "category": "main",
        "title": "[메인 1장] 어머니의 심부름 (슬라임 5마리)",
        "giver": "어머니 마리아 (🏠 집 안)", "giverId": "mother_maria", "turnInNpcId": "mother_maria",
        "zoneId": "emerald_forest", "turnInZoneId": "home_interior",
        "prereqQuestId": None, "prereqMinLevel": 1,
        "objectiveLabel": "집 앞 초원 슬라임 5마리 처치 후 어머니께 보고",
        "targetType": "slime_kill", "targetCount": 5, "rewardExp": 200, "rewardGold": 500,
        "startDialog": '어머니 마리아: "첫 모험을 떠나는 우리 아들! 모험을 떠나기 전에 오른쪽 문으로 나가 [집 앞] 초원에 있는 슬라임 5마리를 잡아 심부름을 마쳐주렴! 다 잡으면 다시 집 안으로 들어와 나에게 알려주렴."',
        "completeDialog": '어머니 마리아: "장하구나 내 아들아! 슬라임 5마리를 거뜬히 잡아내다니 이제 안심하고 보내줄 수 있겠구나. 집 밖 동쪽 포털을 타고 안전지대인 [포레스트 타운]으로 가서 촌장님을 만나보렴!"',
    },
    {
        "id": "main_2", "num": 2, "category": "main",
        "title": "[메인 2장] 납치된 아이들 구출 (고블린 10마리)",
        "giver": "포레스트 타운 촌장 (🛡️ 포레스트 타운)", "giverId": "chief_edward", "turnInNpcId": "chief_edward",
        "zoneId": "ancient_ruins", "turnInZoneId": "forest_town",
        "prereqQuestId": "main_1", "prereqMinLevel": 1,
        "objectiveLabel": "고블린 사냥존(1·2구역) 고블린 10마리 처치 후 촌장에게 보고",
        "targetType": "goblin_kill", "targetCount": 10, "rewardExp": 350, "rewardGold": 500,
        "startDialog": '포레스트 타운 촌장: "오오, 마리아 부인의 아들이군! 마침 큰일이 생겼다네. 사악한 고블린 무리가 우리 마을 아이들을 납치해 갔소! 북동쪽 [고블린 전초기지]로 가서 고블린 10마리를 잡아 아이들이 탈출할 수 있게 도와주게!"',
        "completeDialog": '포레스트 타운 촌장: "고맙소 모험가여! 자네가 고블린 10마리를 소탕해 준 덕분에 납치되었던 마을 아이들이 모두 무사히 품으로 돌아왔소!"',
    },
    {
        "id": "main_3", "num": 3, "category": "main",
        "title": "[메인 3장] 마을 자경단의 무기 (부서진 무기 10개)",
        "giver": "포레스트 타운 촌장 (🛡️ 포레스트 타운)", "giverId": "chief_edward", "turnInNpcId": "chief_edward",
        "zoneId": "goblin_depths", "turnInZoneId": "forest_town",
        "prereqQuestId": "main_2", "prereqMinLevel": 1,
        "objectiveLabel": "고블린들의 부서진 무기 10개 수집 후 촌장에게 전달",
        "targetType": "broken_weapon", "targetCount": 10, "rewardExp": 400, "rewardGold": 500,
        "startDialog": '포레스트 타운 촌장: "자네가 싸우는 모습을 보니 우리도 스스로 마을을 지켜야겠다는 다짐이 들었소! 마을 자경단의 무기를 제련할 수 있도록 고블린들을 처치해 [고블린의 부서진 무기] 10개를 구해주시겠소?"',
        "completeDialog": '포레스트 타운 촌장: "고블린들의 부서진 무기 10개를 모두 구해왔군! 그런데 큰일 났소... 자네가 무기를 구하는 사이 고블린의 복수를 위해 오크 부족이 마을을 습격했소! 옆에 있는 아가씨 엘리나의 이야기를 들어주게!"',
    },
    {
        "id": "main_4", "num": 4, "category": "main",
        "title": "[메인 4장] 아가씨의 복수 염원 (오크 10마리)",
        "giver": "아가씨 엘리나 (🛡️ 포레스트 타운)", "giverId": "lady_elina", "turnInNpcId": "lady_elina",
        "zoneId": "orc_canyon_1", "turnInZoneId": "forest_town",
        "prereqQuestId": "main_3", "prereqMinLevel": 1,
        "objectiveLabel": "오크 사냥존(1·2구역) 오크 10마리 처치 후 아가씨에게 보고",
        "targetType": "orc_kill", "targetCount": 10, "rewardExp": 750, "rewardGold": 750,
        "startDialog": '아가씨 엘리나: "촌장님께 말씀 들으셨나요...? 잔혹한 오크 부족이 마을을 습격해 소중한 이웃들이 희생당했어요. 제발 저를 대신해 동쪽 [오크 전투협곡]의 오크 10마리를 잡아 그분들의 원한을 풀어주세요!"',
        "completeDialog": '아가씨 엘리나: "정말 감사합니다, 모험가님...! 덕분에 희생당한 마을 분들의 넋을 위로할 수 있게 되었어요. 촌장님께서 오크 부족을 완전히 끝장낼 중요한 말씀을 전하고 싶어 하세요."',
    },
    {
        "id": "main_5", "num": 5, "category": "main",
        "title": "[메인 5장] 오크 부족의 대장 발록 처단 (발록 1마리)",
        "giver": "포레스트 타운 촌장 (🛡️ 포레스트 타운)", "giverId": "chief_edward", "turnInNpcId": "chief_edward",
        "zoneId": "abyssal_altar", "turnInZoneId": "forest_town",
        "prereqQuestId": "main_4", "prereqMinLevel": 1,
        "objectiveLabel": "오크 요새 2구역 너머 [발록의 제단]의 대장 발록 처치 후 촌장에게 보고",
        "targetType": "balrog_kill", "targetCount": 1, "rewardExp": 1000, "rewardGold": 1000,
        "startDialog": '포레스트 타운 촌장: "오크 무리를 격퇴해 주었으나, 오크들의 기세를 완전히 꺾으려면 오크 철혈 요새 깊은 곳에 있는 [오크 부족의 대장 발록]을 잡아야만 하오! 포레스트 타운의 영원한 안전을 위해 발록을 처단해 주게!"',
        "completeDialog": '포레스트 타운 촌장: "세상에... 그 무시무시한 오크 부족의 대장 발록을 물리치고 돌아오다니! 자네는 우리 포레스트 타운의 영원한 구원자요!"',
    },
    {
        "id": "main_6", "num": 6, "category": "main",
        "title": "[메인 6장] 촌장의 감사와 오션블루 타운으로의 여정",
        "giver": "포레스트 타운 촌장 ➔ 오션블루 촌장 마리나", "giverId": "chief_edward", "turnInNpcId": "mayor_marina",
        "zoneId": "coastal_road_1", "turnInZoneId": "oceanblue_town",
        "prereqQuestId": "main_5", "prereqMinLevel": 1,
        "objectiveLabel": "해변으로 향하는 길 1·2·3을 돌파해 오션블루 타운의 촌장 마리나와 대화",
        "targetType": "arrive_oceanblue", "targetCount": 1, "rewardExp": 500, "rewardGold": 250,
        "startDialog": '포레스트 타운 촌장: "발록을 쓰러뜨려 준 것에 깊이 감사하오! 이제 더 넓은 세상으로 나아갈 때구려. 우리 마을 남쪽 포털로 나가 [해변으로 향하는 길 1·2·3]을 따라가면 푸른 항구 도시 [오션블루 타운]이 나온다오. 그곳의 마리나 촌장에게 내 안부를 전해 주게!"',
        "completeDialog": '오션블루 촌장 마리나: "포레스트 타운의 에드워드 촌장님께 이야기를 들었습니다! 험난한 해변으로 향하는 길 1·2·3을 뚫고 안전지대 [오션블루 타운]에 오신 것을 환영합니다!"',
    },
    {
        "id": "sub_1", "num": 1, "category": "sub",
        "title": "[서브 1] 정찰병의 긴급 지원 (원거리 고블린 6마리)",
        "giver": "자경단 정찰병 라이라 (🗡️ 고블린 전초기지 1구역)", "giverId": "scout_lyra", "turnInNpcId": "scout_lyra",
        "zoneId": "ancient_ruins", "turnInZoneId": "ancient_ruins",
        "prereqQuestId": "main_1", "prereqMinLevel": 2,
        "objectiveLabel": "고블린 사냥존의 고블린 6마리 처치 후 라이라에게 보고",
        "targetType": "sub_goblin_kill", "targetCount": 6, "rewardExp": 320, "rewardGold": 450,
        "startDialog": '정찰병 라이라: "모험가님! 고블린 궁수들의 독화살과 주술사들의 마법탄 때문에 정찰대가 고립되었어요. 이곳의 고블린 6마리를 소탕해 길을 열어주실 수 있나요?"',
        "completeDialog": '정찰병 라이라: "와, 단숨에 고블린 6마리를 정리해 주시다니 정말 든든해요! 약속드린 정찰대 지원 보상입니다!"',
    },
    {
        "id": "sub_2", "num": 2, "category": "sub",
        "title": "[서브 2] 대장장이의 강철 재료 (중갑 몬스터 5마리)",
        "giver": "대장장이 브론 (🛡️ 포레스트 타운)", "giverId": "blacksmith_bron", "turnInNpcId": "blacksmith_bron",
        "zoneId": "goblin_depths", "turnInZoneId": "forest_town",
        "prereqQuestId": "main_2", "prereqMinLevel": 3,
        "objectiveLabel": "중갑 돌격병(고블린/오크) 5마리 처치 후 대장장이 브론에게 보고",
        "targetType": "sub_heavy_kill", "targetCount": 5, "rewardExp": 480, "rewardGold": 600,
        "startDialog": '대장장이 브론: "이봐 젊은 모험가! 더 단단한 갑옷을 벼려내려면 [고블린 중갑 돌격병]이나 [오크 중갑 방패병] 녀석들의 철갑 조각이 필요하네. 중갑 몬스터 5마리를 잡고 돌아오게!"',
        "completeDialog": '대장장이 브론: "하하하! 이만한 최상급 강철 갑주 조각이라니 훌륭하군! 자네 몫의 두둑한 보수일세!"',
    },
    {
        "id": "sub_3", "num": 3, "category": "sub",
        "title": "[서브 3] 해변길 안전 확보 작전 (해안 몬스터 8마리)",
        "giver": "해안 경비대원 카일 (🏖️ 해변으로 향하는 길 1)", "giverId": "guard_kyle", "turnInNpcId": "guard_kyle",
        "zoneId": "coastal_road_1", "turnInZoneId": "coastal_road_1",
        "prereqQuestId": "main_3", "prereqMinLevel": 4,
        "objectiveLabel": "해변으로 향하는 길(1~3)의 몬스터 8마리 처치 후 카일에게 보고",
        "targetType": "sub_coastal_kill", "targetCount": 8, "rewardExp": 680, "rewardGold": 750,
        "startDialog": '해안 경비대원 카일: "오션블루 타운으로 이어지는 [해변으로 향하는 길 1·2·3]에 난폭한 해안 몬스터들이 들끓고 있습니다! 상인들이 지나갈 수 있도록 해변길 몬스터 8마리를 처치해 주십시오!"',
        "completeDialog": '해안 경비대원 카일: "해변길의 몬스터 8마리를 소탕해 주셔서 감사합니다! 이제 해안 교역로가 한결 안전해졌습니다!"',
    },
    {
        "id": "sub_4", "num": 4, "category": "sub",
        "title": "[서브 4] 항해로의 심해 주술 차단 (심해 오크 6마리)",
        "giver": "항해사 세이렌 (🌊 오션블루 타운)", "giverId": "navigator_seiren", "turnInNpcId": "navigator_seiren",
        "zoneId": "coastal_road_3", "turnInZoneId": "oceanblue_town",
        "prereqQuestId": "main_6", "prereqMinLevel": 5,
        "objectiveLabel": "해변길 2·3의 오크 부족 6마리 처치 후 세이렌에게 보고",
        "targetType": "sub_sea_orc_kill", "targetCount": 6, "rewardExp": 900, "rewardGold": 950,
        "startDialog": '항해사 세이렌: "오션블루 타운에 오신 모험가님! 사실 [해변으로 향하는 길 2·3]의 심해 오크 주술사들과 광전사들이 폭풍우를 부르고 있어요. 오크 6마리를 처치해 바다를 잠재워 주세요!"',
        "completeDialog": '항해사 세이렌: "바다가 다시 잔잔해졌어요! 오션블루 타운의 모든 선원들을 대표해 감사의 보상을 드립니다!"',
    },
]


def create_initial_quest_states() -> dict[str, dict[str, Any]]:
    return {q["id"]: {"status": "unaccepted", "progress": 0} for q in QUESTS}


def format_gender_dialog(text: str, gender: str) -> str:
    if gender == "female":
        return (
            text.replace("우리 아들", "우리 딸")
            .replace("내 아들아", "내 딸아")
            .replace("마리아 부인의 아들이군", "마리아 부인의 딸이군")
        )
    return text
