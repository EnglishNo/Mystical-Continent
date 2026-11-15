# -*- coding: utf-8 -*-
"""[core/state_engine.py] 라즈베리 파이 4 백엔드 - 플레이어 월드 세션 상태 & 세이브 슬롯 직렬화/역직렬화 모듈"""
from __future__ import annotations
import copy
import time
from typing import Any
from data.items_db import CLASSES, ITEMS, MAX_SKILL_LEVEL, SKILL_KEYS, COOLDOWNS, clamp_skill_level
from data.quests_db import create_initial_quest_states
from data.zones_db import create_world_zones, get_nearest_town_zone
from data.monsters_db import create_initial_monsters
from .combat_and_quests import CombatAndQuestsMixin
from .physics_and_ai import PhysicsAndAIMixin


class PlayerWorldSession(CombatAndQuestsMixin, PhysicsAndAIMixin):
    """사용자(UUID)별 라즈베리 파이 4 서버 권한 게임 월드 & 전투/AI/퀘스트 엔진"""

    def __init__(self, user_id: str):
        self.user_id = user_id
        self.zones = create_world_zones()
        self.monsters = create_initial_monsters()
        self.projectiles: list[dict[str, Any]] = []
        self.zone_id = "home_interior"
        self.selected_class = "knight"
        self.kills = 0
        self.boss_defeated = False
        self.game_over = False
        self.player_dead = False
        self.respawn_town_id = "forest_town"
        self.last_exp_lost = 0
        self.is_talking_to_npc = False
        self.is_modal_open = False
        self.is_game_view = False
        self.hit_stop_timer = 0.0
        self.bullet_time_timer = 0.0
        self.screen_shake = 0.0

        self.cooldown_left = {k: 0.0 for k in COOLDOWNS}
        self.quest = {"currentId": 1, "progress": 0, "allCompleted": False, "talkedChiefQ6": False}
        self.quest_states = create_initial_quest_states()

        c = CLASSES["knight"]
        self.player: dict[str, Any] = {
            "name": "에이든",
            "gender": "male",
            "customCreated": False,
            "adventureStarted": False,
            "x": 210.0,
            "y": 300.0,
            "r": 18.0,
            "fx": 1.0,
            "fy": 0.0,
            "level": 1,
            "exp": 0,
            "expNext": 100,
            "gold": 50,
            "sp": 1,
            "baseHp": c["hp"],
            "baseMp": c["mp"],
            "baseAtk": c["atk"],
            "baseDef": c["def"],
            "baseSpd": c["spd"],
            "baseCrit": c["crit"],
            "hp": float(c["hp"]),
            "mp": float(c["mp"]),
            "skills": {k: 1 for k in SKILL_KEYS},
            "equipment": {"weapon": None, "armor": None, "accessory": None},
            "inventory": [
                {**ITEMS["potion_hp"], "count": 3},
                {**ITEMS["iron_blade"], "count": 1},
            ],
            "comboStep": 0,
            "comboTimer": 0.0,
            "hitCount": 0,
            "hitComboDecay": 0.0,
            "dodgeTimer": 0.0,
            "invulnTimer": 0.0,
            "hitFlash": 0.0,
        }

        # 입력 상태 (브라우저 키보드/가상 조이스틱 + ESP32 하드웨어 조이스틱)
        self.joy_x = 0.0
        self.joy_y = 0.0
        self.ext_joy_x = 0.0
        self.ext_joy_y = 0.0

        # 세이브 슬롯 번들 상태 (saves/<UUID>.json 과 100% 호환)
        self.char_slots: list[dict[str, Any]] = []
        self.active_slot_idx = 0
        self.save_dirty = False
        # [네트워크 패킷 최적화] 인벤토리·장비·퀘스트·보물상자처럼 용량이 큰 데이터는 변경 시에만 전송
        self.meta_dirty = True

        # 프레임 동안 발생한 시각/사운드/로그/모달 이벤트 큐 (브라우저로 전송)
        self.pending_events: list[dict[str, Any]] = []
        self.tick_seq = 0
        # [투사체 고유 ID 발급기] 각 화염구·적 탄막에 고유 ID를 부여해 브라우저가 60fps로 끊김 없이 추적하도록 함
        self.next_proj_id = 1

    def emit_event(self, ev: dict[str, Any]):
        self.pending_events.append(ev)

    def add_log(self, msg: str):
        self.emit_event({"kind": "log", "msg": msg})

    def play_sound(self, sound_name: str):
        self.emit_event({"kind": "sound", "name": sound_name})

    def spawn_particles(self, x: float, y: float, count: int, colors: list[str], speed_max: float = 190, size_max: int = 5, ttl_max: float = 0.55):
        self.emit_event({
            "kind": "particles",
            "x": round(x, 1), "y": round(y, 1),
            "count": count, "colors": colors,
            "speedMax": speed_max, "sizeMax": size_max, "ttlMax": ttl_max,
        })

    def push_effect(self, ef: dict[str, Any]):
        self.emit_event({"kind": "effect", "effect": ef})

    def push_slash_arc(self, arc: dict[str, Any]):
        self.emit_event({"kind": "slash_arc", "arc": arc})

    def get_derived_stats(self) -> dict[str, Any]:
        p = self.player
        eq = p["equipment"]
        w = eq.get("weapon") or {}
        a = eq.get("armor") or {}
        ac = eq.get("accessory") or {}
        max_hp = int(p["baseHp"] + a.get("hp", 0) + ac.get("hp", 0))
        max_mp = int(p["baseMp"])
        atk = int(p["baseAtk"] + w.get("atk", 0) + ac.get("atk", 0))
        df = int(p["baseDef"] + a.get("def", 0))
        spd = float(p["baseSpd"] + ac.get("spd", 0))
        crit = min(0.85, float(p["baseCrit"] + w.get("crit", 0.0) + ac.get("crit", 0.0)))
        return {"maxHp": max_hp, "maxMp": max_mp, "atk": atk, "def": df, "spd": spd, "crit": crit}

    def sync_from_save_bundle(self, bundle: dict[str, Any] | None):
        """saves/<UUID>.json 데이터에서 활성 캐릭터 슬롯을 안전하게(fallback 포함) 로드"""
        if not isinstance(bundle, dict):
            return
        slots = bundle.get("slots")
        if not isinstance(slots, list) or not slots:
            return
        self.char_slots = copy.deepcopy(slots)
        idx = int(bundle.get("activeSlotIdx", 0) or 0)
        self.active_slot_idx = max(0, min(len(self.char_slots) - 1, idx))
        self.apply_slot_payload(self.char_slots[self.active_slot_idx])

    def apply_slot_payload(self, data: dict[str, Any]):
        """기존 saves/<UUID>.json 슬롯 데이터를 하위 호환(fallback) 보장하며 월드 상태에 적용"""
        if not isinstance(data, dict):
            return
        cls_key = data.get("charClass") if data.get("charClass") in CLASSES else "knight"
        self.selected_class = cls_key
        c = CLASSES[cls_key]
        p = self.player

        p["name"] = str(data.get("charName") or "에이든")[:16]
        p["gender"] = "female" if data.get("gender") == "female" else "male"
        p["customCreated"] = bool(data.get("customCreated", False))
        p["adventureStarted"] = bool(data.get("adventureStarted", False))
        p["level"] = max(1, int(data.get("level", 1) or 1))
        p["exp"] = max(0, int(data.get("exp", 0) or 0))
        p["expNext"] = max(10, int(data.get("expToNext", 100) or 100))
        p["gold"] = max(0, int(data.get("gold", 50) if data.get("gold") is not None else 50))
        p["sp"] = max(0, int(data.get("skillPoints", 1) if data.get("skillPoints") is not None else 1))

        p["baseHp"] = int(data.get("baseMaxHp") or (c["hp"] + (p["level"] - 1) * 34))
        p["baseMp"] = int(data.get("baseMaxMp") or c["mp"])
        p["baseAtk"] = int(data.get("baseAtk") or (c["atk"] + (p["level"] - 1) * 7))
        p["baseDef"] = int(data.get("baseDef") or (c["def"] + (p["level"] - 1) * 3))
        p["baseSpd"] = float(data.get("baseSpeed") or c["spd"])
        p["baseCrit"] = float(data.get("baseCrit") or c["crit"])

        raw_skills = data.get("skillLevels") if isinstance(data.get("skillLevels"), dict) else {}
        refunded_sp = 0
        for k in SKILL_KEYS:
            try:
                raw_lv = int(float(raw_skills.get(k, 1)))
            except (TypeError, ValueError):
                raw_lv = 1
            safe_lv = max(1, raw_lv)
            if safe_lv > MAX_SKILL_LEVEL:
                refunded_sp += (safe_lv - MAX_SKILL_LEVEL)
                p["skills"][k] = MAX_SKILL_LEVEL
            else:
                p["skills"][k] = safe_lv
        if refunded_sp > 0:
            p["sp"] += refunded_sp

        if isinstance(data.get("equipment"), dict):
            p["equipment"] = {
                "weapon": data["equipment"].get("weapon"),
                "armor": data["equipment"].get("armor"),
                "accessory": data["equipment"].get("accessory"),
            }
        if isinstance(data.get("inventory"), list):
            p["inventory"] = copy.deepcopy(data["inventory"])

        derived = self.get_derived_stats()
        was_dead = bool(data.get("playerDead")) or (data.get("hp") is not None and float(data.get("hp", 1)) <= 0)
        self.player_dead = was_dead
        self.game_over = False
        self.respawn_town_id = str(data.get("respawnTownId") or get_nearest_town_zone(str(data.get("currentZone") or "forest_town")))

        prev_zone = self.zone_id
        if was_dead:
            self.zone_id = self.respawn_town_id if self.respawn_town_id in self.zones else "forest_town"
            p["x"] = 310.0
            p["y"] = 300.0
            p["hp"] = float(derived["maxHp"])
            p["mp"] = float(derived["maxMp"])
            self.player_dead = False
        else:
            cur_z = str(data.get("currentZone") or "home_interior")
            if cur_z in self.zones:
                self.zone_id = cur_z
            p["x"] = float(data.get("playerX", 210) or 210)
            p["y"] = float(data.get("playerY", 300) or 300)
            p["hp"] = max(1.0, min(float(derived["maxHp"]), float(data.get("hp") or derived["maxHp"])))
            p["mp"] = max(0.0, min(float(derived["maxMp"]), float(data.get("mp") if data.get("mp") is not None else derived["maxMp"])))

        if self.zone_id != prev_zone:
            self.monsters = create_initial_monsters()
            self.projectiles = []

        opened_set = set(data.get("openedChests") or [])
        for z in self.zones.values():
            for ch in z["chests"]:
                ch["opened"] = ch["id"] in opened_set

        self.kills = max(0, int(data.get("kills", 0) or 0))
        self.boss_defeated = bool(data.get("bossDefeated", False))
        if isinstance(data.get("quest"), dict):
            self.quest = {**self.quest, **data["quest"]}
        self.quest_states = create_initial_quest_states()
        if isinstance(data.get("questStates"), dict):
            for k, v in data["questStates"].items():
                if k in self.quest_states and isinstance(v, dict):
                    self.quest_states[k] = {**self.quest_states[k], **v}

    def export_slot_payload(self) -> dict[str, Any]:
        """현재 플레이어/월드 상태를 saves/<UUID>.json 슬롯 포맷으로 직렬화 (100% 하위 호환)"""
        p = self.player
        opened_chests: list[str] = []
        for z in self.zones.values():
            for ch in z["chests"]:
                if ch.get("opened"):
                    opened_chests.append(ch["id"])
        now_ms = int(time.time() * 1000)
        now_str = time.strftime("%H:%M:%S")
        return {
            "charName": p["name"] or "에이든",
            "gender": p["gender"] or "male",
            "charClass": self.selected_class,
            "customCreated": bool(p["customCreated"]),
            "adventureStarted": bool(p["adventureStarted"]),
            "level": int(p["level"]),
            "exp": int(p["exp"]),
            "expToNext": int(p["expNext"]),
            "gold": int(p["gold"]),
            "skillPoints": int(p["sp"]),
            "baseMaxHp": int(p["baseHp"]),
            "baseMaxMp": int(p["baseMp"]),
            "baseAtk": int(p["baseAtk"]),
            "baseDef": int(p["baseDef"]),
            "baseSpeed": float(p["baseSpd"]),
            "baseCrit": float(p["baseCrit"]),
            "hp": int(round(p["hp"])),
            "mp": int(round(p["mp"])),
            "skillLevels": {k: clamp_skill_level(p["skills"].get(k, 1)) for k in SKILL_KEYS},
            "maxSkillLevel": MAX_SKILL_LEVEL,
            "equipment": copy.deepcopy(p["equipment"]),
            "inventory": copy.deepcopy(p["inventory"]),
            "currentZone": self.zone_id,
            "playerX": int(round(p["x"])),
            "playerY": int(round(p["y"])),
            "openedChests": opened_chests,
            "kills": int(self.kills),
            "bossDefeated": bool(self.boss_defeated),
            "playerDead": bool(self.player_dead),
            "respawnTownId": self.respawn_town_id or "forest_town",
            "quest": copy.deepcopy(self.quest),
            "questStates": copy.deepcopy(self.quest_states),
            "v": 2,
            "savedAtMs": now_ms,
            "lastSavedAt": now_str,
        }

    def export_save_bundle(self) -> dict[str, Any]:
        slot_payload = self.export_slot_payload()
        if not self.char_slots:
            self.char_slots = [slot_payload]
            self.active_slot_idx = 0
        else:
            self.active_slot_idx = max(0, min(len(self.char_slots) - 1, self.active_slot_idx))
            self.char_slots[self.active_slot_idx] = slot_payload
        return {
            "v": 2,
            "activeSlotIdx": self.active_slot_idx,
            "slots": copy.deepcopy(self.char_slots),
            "savedAtMs": slot_payload["savedAtMs"],
            "lastSavedAt": slot_payload["lastSavedAt"],
        }

    def mark_save_dirty(self):
        self.save_dirty = True
        self.meta_dirty = True

    def add_item_to_inventory(self, item_id: str, count: int = 1):
        tpl = ITEMS.get(item_id)
        if not tpl:
            return
        for item in self.player["inventory"]:
            if item.get("id") == item_id:
                item["count"] = int(item.get("count", 0)) + count
                return
        self.player["inventory"].append({**tpl, "count": count})


    def build_snapshot_packet(self) -> dict[str, Any]:
        """브라우저 렌더러로 전송할 경량 실시간 월드 스냅샷 패킷"""
        p = self.player
        # [몬스터 실시간 상태 및 이동 속도 벡터(mvx, mvy) 패킷 구성]
        # 브라우저가 패킷 사이에도 몬스터의 이동 방향과 속도를 예측(Dead-Reckoning)할 수 있도록 mvx, mvy를 함께 전송합니다.
        zone_monsters = [
            {
                "id": m["id"],
                "x": round(m["x"], 1),
                "y": round(m["y"], 1),
                "vx": round(m["vx"], 1),
                "vy": round(m["vy"], 1),
                "mvx": round(m.get("mvx", 0.0), 1),
                "mvy": round(m.get("mvy", 0.0), 1),
                "hp": int(m["hp"]),
                "maxHp": int(m["maxHp"]),
                "state": m["state"],
                "timer": round(m["timer"], 2),
                "alive": bool(m["alive"]),
                "enraged": bool(m.get("enraged", False)),
                "flash": round(m.get("flash", 0.0), 2),
                "animPhase": round(m.get("animPhase", 0.0), 2),
            }
            for m in self.monsters if m["zone"] == self.zone_id
        ]
        # [투사체 고유 ID 기반 스냅샷 패킷]
        # 각 투사체마다 고유 ID(id)를 포함해 브라우저가 이미 날아가고 있는 투사체를 과거 위치로 되돌리지 않도록 합니다.
        projs = [
            {
                "id": pr.get("id", "p_0"),
                "x": round(pr["x"], 1),
                "y": round(pr["y"], 1),
                "vx": round(pr["vx"], 1),
                "vy": round(pr["vy"], 1),
                "r": pr["r"],
                "dmg": pr["dmg"],
                "color": pr.get("color", "#f97316"),
                "ttl": round(pr["ttl"], 2),
                "isEnemy": bool(pr.get("isEnemy", False)),
            }
            for pr in self.projectiles
        ]
        events = self.pending_events
        self.pending_events = []
        opened_chests = [
            ch["id"]
            for z in self.zones.values()
            for ch in z["chests"]
            if ch.get("opened")
        ]
        # [패킷 경량화] 매 30Hz마다 변하는 실시간 전투 수치만 기본 패킷에 담고,
        # 인벤토리·장비·퀘스트·상자 목록은 변동이 있을 때(meta_dirty)만 포함해 패킷 크기를 85% 줄입니다.
        include_meta = bool(getattr(self, "meta_dirty", True) or self.save_dirty or (self.tick_seq % 90 == 1))
        self.meta_dirty = False

        player_pkt: dict[str, Any] = {
            "x": round(p["x"], 1),
            "y": round(p["y"], 1),
            "fx": round(p["fx"], 2),
            "fy": round(p["fy"], 2),
            "hp": round(p["hp"], 1),
            "mp": round(p["mp"], 1),
            "level": p["level"],
            "exp": p["exp"],
            "expNext": p["expNext"],
            "gold": p["gold"],
            "sp": p["sp"],
            "comboStep": p["comboStep"],
            "comboTimer": round(p["comboTimer"], 2),
            "hitCount": p["hitCount"],
            "dodgeTimer": round(p["dodgeTimer"], 2),
            "invulnTimer": round(p["invulnTimer"], 2),
            "hitFlash": round(p["hitFlash"], 2),
        }
        if include_meta:
            player_pkt.update({
                "baseHp": p["baseHp"],
                "baseMp": p["baseMp"],
                "baseAtk": p["baseAtk"],
                "baseDef": p["baseDef"],
                "baseSpd": p["baseSpd"],
                "baseCrit": p["baseCrit"],
                "skills": dict(p["skills"]),
                "equipment": p["equipment"],
                "inventory": p["inventory"],
            })

        pkt: dict[str, Any] = {
            "type": "backend_state",
            "seq": self.tick_seq,
            "zoneId": self.zone_id,
            "kills": self.kills,
            "bossDefeated": self.boss_defeated,
            "gameOver": self.game_over,
            "playerDead": self.player_dead,
            "respawnTownId": self.respawn_town_id,
            "isTalkingToNpc": self.is_talking_to_npc,
            "bulletTimeTimer": round(self.bullet_time_timer, 2),
            "screenShake": round(self.screen_shake, 1),
            "cooldownLeft": {k: round(v, 2) for k, v in self.cooldown_left.items()},
            "player": player_pkt,
            "monsters": zone_monsters,
            "projectiles": projs,
            "events": events,
        }
        if include_meta:
            pkt["questStates"] = self.quest_states
            pkt["openedChests"] = opened_chests
        return pkt
