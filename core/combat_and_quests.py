# -*- coding: utf-8 -*-
"""[core/combat_and_quests.py] 라즈베리 파이 4 백엔드 - 전투 판정, 스킬, 퀘스트, 상점, 인벤토리/장비 연산 모듈"""
from __future__ import annotations
import math
import random
from typing import Any
from data.items_db import CLASSES, ITEMS, SHOP_CATALOG, MAX_SKILL_LEVEL, SKILL_KEYS, SKILL_LABELS, COOLDOWNS, clamp_skill_level
from data.quests_db import QUESTS, format_gender_dialog
from data.zones_db import get_nearest_town_zone
from data.monsters_db import create_initial_monsters


class CombatAndQuestsMixin:
    """라즈베리 파이 4 서버에서 수행하는 전투/스킬 데미지 계산, 보스 카운터, 퀘스트 진행, 상점/장비 처리 믹스인"""

    def is_quest_prerequisite_met(self, q: dict[str, Any]) -> bool:
        if self.player["level"] < int(q.get("prereqMinLevel", 1)):
            return False
        pre_id = q.get("prereqQuestId")
        if pre_id:
            pre = self.quest_states.get(pre_id)
            if not pre or pre.get("status") != "completed":
                return False
        return True

    def get_quest_state(self, q_id: str) -> dict[str, Any]:
        if q_id not in self.quest_states:
            self.quest_states[q_id] = {"status": "unaccepted", "progress": 0}
        return self.quest_states[q_id]

    def check_level_up(self) -> bool:
        p = self.player
        leveled = False
        while p["exp"] >= p["expNext"]:
            p["exp"] -= p["expNext"]
            p["level"] += 1
            p["expNext"] = int(round(p["expNext"] * 1.35))
            p["baseHp"] += 34
            p["baseAtk"] += 7
            p["baseDef"] += 3
            p["sp"] += 1
            derived = self.get_derived_stats()
            p["hp"] = float(derived["maxHp"])
            p["mp"] = float(derived["maxMp"])
            leveled = True
            self.play_sound("levelup")
            self.push_effect({"kind": "dmg_text", "x": p["x"], "y": p["y"] - 46, "text": f"🎉 LEVEL UP! Lv.{p['level']}", "color": "#fde047", "ttl": 1.15})
            self.add_log(f"🎉 [RPi4 백엔드 레벨업] Lv.{p['level']} 달성! (체력/공격력/방어력 상승 & SP +1)")
        return leveled

    def trigger_player_death(self):
        p = self.player
        p["hp"] = 0.0
        exp_loss = max(1, int(round(p["exp"] * 0.05))) if p["exp"] > 0 else 0
        p["exp"] = max(0, p["exp"] - exp_loss)
        self.last_exp_lost = exp_loss
        self.game_over = True
        self.player_dead = True
        self.respawn_town_id = get_nearest_town_zone(self.zone_id)
        town_name = self.zones.get(self.respawn_town_id, {}).get("name", "포레스트 타운")
        self.add_log(f"💀 [전투 불능] 플레이어가 쓰러졌습니다! 경험치 5%(-{exp_loss} EXP)가 감소했으며, 부활 시 인근 마을 [{town_name}]에서 시작합니다.")
        self.emit_event({"kind": "player_death", "expLoss": exp_loss, "respawnTownId": self.respawn_town_id})
        self.mark_save_dirty()

    def revive_at_nearest_town(self):
        derived = self.get_derived_stats()
        target_town = self.respawn_town_id or get_nearest_town_zone(self.zone_id)
        if target_town not in self.zones:
            target_town = "forest_town"
        self.game_over = False
        self.player_dead = False
        self.player["hp"] = float(derived["maxHp"])
        self.player["mp"] = float(derived["maxMp"])
        self.projectiles = []
        self.switch_zone(target_town, 310.0, 300.0)
        self.add_log(f"✨ [인근 마을 부활] 안전지대 [{self.zones[target_town]['name']}]에서 체력과 마나를 모두 회복하고 부활했습니다!")
        self.mark_save_dirty()

    def switch_zone(self, target_zone_id: str, sx: float = 120.0, sy: float = 300.0):
        if target_zone_id not in self.zones:
            return
        self.zone_id = target_zone_id
        self.player["x"] = float(sx)
        self.player["y"] = float(sy)
        self.is_talking_to_npc = False
        self.projectiles = []
        self.monsters = create_initial_monsters()
        self.spawn_particles(sx, sy, 25, ["#38bdf8", "#c084fc", "#ffffff"], 180, 5, 0.5)

        q6 = self.get_quest_state("main_6")
        if q6["status"] == "active" and target_zone_id == "oceanblue_town":
            q6["progress"] = 1
            self.add_log("🌊 [오션블루 타운 도착!] 메인 6장 목표 달성! [오션블루 촌장 마리나]와 대화(Enter/F)하여 퀘스트를 완료하세요!")

        z_obj = self.zones[target_zone_id]
        safe_note = " (🛡️ 적이 없는 안전지대 - HP/MP 자동 회복)" if z_obj.get("isSafeZone") else ""
        self.add_log(f"📍 [지역 이동] {z_obj['name']}{safe_note}(으)로 진입했습니다!")
        self.mark_save_dirty()

    def on_monster_defeated(self, m: dict[str, Any]):
        m["alive"] = False
        m["timer"] = 9999.0 if m.get("isBoss") else 3.2
        self.kills += 1
        p = self.player
        p["gold"] += int(m["gold"])
        p["exp"] += int(m["exp"])
        self.add_item_to_inventory(m["drop"], 1)
        self.spawn_particles(m["x"], m["y"], 40, ["#fde047", "#f43f5e", "#a855f7", "#4ade80"], 260, 6, 0.7)
        drop_name = ITEMS.get(m["drop"], {}).get("name", m["drop"])
        self.add_log(f"🏆 [처치] Lv.{m['lv']} {m['name']} 처치! +{m['exp']} EXP, +{m['gold']}G, [{drop_name}] 획득!")

        kind = str(m.get("kind", ""))
        is_goblin = kind.startswith("goblin")
        is_orc = kind == "elite_orc" or kind.startswith("orc_")
        is_heavy = kind in ("goblin_brute", "orc_juggernaut")
        is_coastal = self.zone_id.startswith("coastal_road_")

        for q in QUESTS:
            qs = self.get_quest_state(q["id"])
            if qs["status"] != "active" or qs["progress"] >= q["targetCount"]:
                continue
            tt = q["targetType"]
            matched = (
                (tt == "slime_kill" and kind == "slime")
                or (tt == "goblin_kill" and is_goblin)
                or (tt == "broken_weapon" and is_goblin)
                or (tt == "orc_kill" and is_orc)
                or (tt == "balrog_kill" and bool(m.get("isBoss")))
                or (tt == "sub_goblin_kill" and is_goblin)
                or (tt == "sub_heavy_kill" and is_heavy)
                or (tt == "sub_coastal_kill" and is_coastal)
                or (tt == "sub_sea_orc_kill" and is_coastal and is_orc)
            )
            if matched:
                qs["progress"] = min(q["targetCount"], int(qs["progress"]) + 1)
                short_title = q["title"].split("]")[1] if "]" in q["title"] else q["title"]
                self.push_effect({
                    "kind": "dmg_text",
                    "x": p["x"], "y": p["y"] - 44,
                    "text": f"📜 {short_title} ({qs['progress']}/{q['targetCount']})",
                    "color": "#38bdf8", "ttl": 0.95,
                })
                if qs["progress"] >= q["targetCount"]:
                    self.play_sound("levelup")
                    self.add_log(f"✨ [퀘스트 목표 달성!] \"{q['title']}\" ({qs['progress']}/{q['targetCount']}) 달성! 의뢰인 [{q['giver']}]에게 돌아가 대화하세요!")

        self.check_level_up()
        if m.get("isBoss"):
            self.boss_defeated = True
            self.play_sound("levelup")
            self.add_log("👑 [보스 토벌 완료!] 오크 부족의 대장 발록을 물리쳤습니다! 포레스트 타운의 촌장님께 돌아가 보고하세요!")
        self.mark_save_dirty()

    def perform_melee_hit(self, ox: float, oy: float, fx: float, fy: float, radius: float, mult: float, label: str, is_heavy_counter: bool, knockback: float = 120.0):
        p = self.player
        derived = self.get_derived_stats()
        cx = ox + (fx * 26.0 if radius < 100 else 0.0)
        cy = oy + (fy * 26.0 if radius < 100 else 0.0)
        hit_any = False

        for m in self.monsters:
            if m["zone"] != self.zone_id or not m["alive"]:
                continue
            dist = math.hypot(m["x"] - cx, m["y"] - cy)
            if dist <= radius + m["r"]:
                hit_any = True
                is_crit = random.random() < derived["crit"]
                dmg = int(round(derived["atk"] * mult * (1.55 if is_crit else 1.0)))
                is_counter = False

                if is_heavy_counter and m.get("isBoss") and m.get("state") == "VULNERABLE":
                    dmg = int(round(dmg * 2.5))
                    is_counter = True
                    m["state"] = "CHASE"
                    self.screen_shake = 22.0
                    self.add_log(f"⚡ [2.5배 보스 카운터 작렬!!] {m['name']}에게 {dmg} 극대 피해!")
                else:
                    crit_str = " (치명타!)" if is_crit else ""
                    self.add_log(f"{label} ➔ [Lv.{m['lv']} {m['name']}]에게 {dmg}{crit_str} 피해!")

                m["hp"] = max(0, int(m["hp"]) - dmg)
                m["flash"] = 0.18

                if m.get("isBoss") and not m.get("enraged") and m["hp"] > 0 and (m["hp"] / max(1, m["maxHp"])) <= 0.5:
                    m["enraged"] = True
                    self.screen_shake = 20.0
                    self.spawn_particles(m["x"], m["y"], 50, ["#f43f5e", "#fde047", "#ffffff"], 300, 7, 0.8)
                    self.add_log("🔥 [보스 광폭화 돌입!!] 오크 부족의 대장 발록의 공격 속도와 화염 탄막이 대폭 강화됩니다!")

                nx = (m["x"] - ox) / max(1.0, dist)
                ny = (m["y"] - oy) / max(1.0, dist)
                kb = knockback * (0.22 if m.get("isBoss") else 0.65)
                m["vx"] = nx * kb
                m["vy"] = ny * kb

                p["hitCount"] = int(p.get("hitCount", 0)) + 1
                p["hitComboDecay"] = 3.0

                self.spawn_particles(
                    m["x"], m["y"],
                    35 if is_counter else 16,
                    ["#fde047", "#f43f5e", "#ffffff"] if is_counter else ["#f43f5e", "#fbbf24", "#ffffff"],
                    220, 5, 0.45,
                )
                self.push_effect({
                    "kind": "dmg_text",
                    "x": round(m["x"] + (random.random() * 16 - 8), 1),
                    "y": round(m["y"] - 24, 1),
                    "text": f"⚡COUNTER -{dmg}!" if is_counter else (f"💥CRIT -{dmg}!" if is_crit else f"-{dmg}"),
                    "color": "#fde047" if is_counter else ("#fb923c" if is_crit else "#ffffff"),
                    "ttl": 0.65,
                })

                if m["hp"] <= 0:
                    self.on_monster_defeated(m)

        if hit_any:
            self.play_sound("hit")
            self.hit_stop_timer = 0.028

    def accept_quest(self, q: dict[str, Any], npc_name: str):
        qs = self.get_quest_state(q["id"])
        qs["status"] = "active"
        qs["progress"] = 0
        if q["id"] == "main_3":
            for item in self.player["inventory"]:
                if item.get("id") == "broken_goblin_weapon":
                    qs["progress"] = min(q["targetCount"], int(item.get("count", 0)))
        if q["id"] == "main_6" and self.zone_id == "oceanblue_town":
            qs["progress"] = 1

        self.play_sound("levelup")
        self.spawn_particles(self.player["x"], self.player["y"], 28, ["#38bdf8", "#fde047", "#ffffff"], 210, 5, 0.6)
        self.push_effect({
            "kind": "dmg_text",
            "x": self.player["x"], "y": self.player["y"] - 42,
            "text": f"📜 퀘스트 수락: {q['title']}", "color": "#38bdf8", "ttl": 1.15,
        })
        self.is_talking_to_npc = True
        self.emit_event({
            "kind": "npc_dialog",
            "speaker": f"❗ {npc_name} — 새로운 퀘스트 수락",
            "text": format_gender_dialog(q["startDialog"], self.player["gender"]),
        })
        self.add_log(f"📜 [퀘스트 수락] {npc_name}에게서 \"{q['title']}\" 퀘스트를 받았습니다! (목표: {q['objectiveLabel']})")
        self.mark_save_dirty()

    def complete_quest_by_id(self, q_id: str, npc_name: str = ""):
        q = next((item for item in QUESTS if item["id"] == q_id), None)
        if not q:
            return
        qs = self.get_quest_state(q_id)
        if qs["status"] != "active" or int(qs["progress"]) < q["targetCount"]:
            self.add_log(f"[퀘스트 미달성] \"{q['title']}\" 목표를 먼저 달성한 뒤 해당 NPC와 대화하세요 ({qs['progress']}/{q['targetCount']}).")
            return

        if q_id == "main_3":
            inv = self.player["inventory"]
            for i, item in enumerate(inv):
                if item.get("id") == "broken_goblin_weapon":
                    item["count"] = int(item.get("count", 0)) - 10
                    if item["count"] <= 0:
                        inv.pop(i)
                    break

        qs["status"] = "completed"
        qs["progress"] = q["targetCount"]
        self.play_sound("levelup")
        self.spawn_particles(self.player["x"], self.player["y"], 45, ["#fde047", "#34d399", "#38bdf8", "#ffffff"], 280, 6, 0.85)
        self.push_effect({
            "kind": "dmg_text",
            "x": self.player["x"], "y": self.player["y"] - 44,
            "text": f"🎁 퀘스트 완료! +{q['rewardExp']} EXP / +{q['rewardGold']}G",
            "color": "#34d399", "ttl": 1.25,
        })
        self.is_talking_to_npc = True
        speaker = npc_name or q["giver"]
        self.emit_event({
            "kind": "npc_dialog",
            "speaker": f"🎁 {speaker} — 퀘스트 클리어!",
            "text": f"{format_gender_dialog(q['completeDialog'], self.player['gender'])} (보상 지급: 경험치 +{q['rewardExp']} / 골드 +{q['rewardGold']}G)",
        })
        self.add_log(f"🎊 [퀘스트 완료!] \"{q['title']}\" 클리어! 경험치 +{q['rewardExp']}, 골드 +{q['rewardGold']}G 획득!")
        self.player["exp"] += q["rewardExp"]
        self.player["gold"] += q["rewardGold"]
        self.check_level_up()
        self.mark_save_dirty()

    def handle_world_interaction(self):
        if self.is_talking_to_npc:
            self.is_talking_to_npc = False
            self.emit_event({"kind": "close_npc_dialog"})
            return

        p = self.player
        z = self.zones[self.zone_id]

        for portal in z["portals"]:
            if math.hypot(p["x"] - portal["x"], p["y"] - portal["y"]) <= portal["r"] + 45:
                self.play_sound("levelup")
                self.switch_zone(portal["target"], portal["sx"], portal["sy"])
                return

        for chest in z["chests"]:
            if not chest["opened"] and math.hypot(p["x"] - chest["x"], p["y"] - chest["y"]) <= 60:
                chest["opened"] = True
                p["gold"] += int(chest["gold"])
                self.add_item_to_inventory(chest["item"], 1)
                self.play_sound("levelup")
                item_name = ITEMS.get(chest["item"], {}).get("name", chest["item"])
                self.spawn_particles(chest["x"], chest["y"], 30, ["#fde047", "#38bdf8", "#ffffff"], 200, 5, 0.6)
                self.push_effect({"kind": "dmg_text", "x": chest["x"], "y": chest["y"] - 24, "text": f"🎁 +{item_name}", "color": "#fde047", "ttl": 0.9})
                self.add_log(f"🎁 [보물상자 개봉] {item_name} 및 {chest['gold']}G 획득!")
                self.mark_save_dirty()
                return

        for npc in z["npcs"]:
            if math.hypot(p["x"] - npc["x"], p["y"] - npc["y"]) <= 75:
                if npc.get("questRole") == "merchant":
                    self.emit_event({"kind": "open_shop", "merchantName": npc["name"]})
                    return

                turn_in_q = next(
                    (q for q in QUESTS if self.get_quest_state(q["id"])["status"] == "active"
                     and int(self.get_quest_state(q["id"])["progress"]) >= q["targetCount"]
                     and q["turnInNpcId"] == npc["id"]),
                    None,
                )
                if turn_in_q:
                    self.complete_quest_by_id(turn_in_q["id"], npc["name"])
                    return

                avail_q = next(
                    (q for q in QUESTS if self.get_quest_state(q["id"])["status"] == "unaccepted"
                     and q["giverId"] == npc["id"]
                     and self.is_quest_prerequisite_met(q)),
                    None,
                )
                if avail_q:
                    self.accept_quest(avail_q, npc["name"])
                    return

                self.is_talking_to_npc = True
                self.emit_event({
                    "kind": "npc_dialog",
                    "speaker": f"💬 {npc['name']}",
                    "text": format_gender_dialog(" ".join(npc.get("lines", [])), p["gender"]),
                })
                self.add_log(f"⏸️ [NPC {npc['name']} 대화 중] 대사에 집중할 수 있도록 게임 월드가 일시정지되었습니다.")
                return

        self.add_log("[상호작용 안내] 포털, 보물상자, 또는 NPC 가까이 이동한 뒤 Enter(또는 F) 키를 누르세요.")

    def trigger_action(self, action_key: str, source_label: str = "BACKEND"):
        if self.game_over or self.is_modal_open:
            return
        if self.is_talking_to_npc:
            if action_key == "interact":
                self.is_talking_to_npc = False
                self.emit_event({"kind": "close_npc_dialog"})
            return
        if action_key not in COOLDOWNS:
            return
        if self.cooldown_left.get(action_key, 0.0) > 0:
            return

        p = self.player
        derived = self.get_derived_stats()
        if action_key == "magic_skill" and p["mp"] < 15:
            self.add_log("[마나 부족] 3연발 화염구 발사에 마나 15가 필요합니다.")
            return
        if action_key == "special_skill" and p["mp"] < 30:
            self.add_log("[마나 부족] 아케인 마법진 소환에 마나 30이 필요합니다.")
            return

        self.cooldown_left[action_key] = COOLDOWNS[action_key]
        aim_angle = math.atan2(p["fy"], p["fx"])

        if action_key == "dodge":
            dodge_lv = clamp_skill_level(p["skills"].get("dodge", 1))
            invuln_sec = round(0.52 + (dodge_lv - 1) * 0.025, 2)
            mp_bonus = 25 + (dodge_lv - 1) * 3
            self.play_sound("dodge")
            p["dodgeTimer"] = 0.26
            p["invulnTimer"] = invuln_sec

            near_telegraph = any(
                m["zone"] == self.zone_id and m["alive"] and m["state"] == "TELEGRAPH"
                and math.hypot(m["x"] - p["x"], m["y"] - p["y"]) <= 185
                for m in self.monsters
            )
            if near_telegraph:
                self.bullet_time_timer = 1.45
                p["mp"] = min(float(derived["maxMp"]), p["mp"] + mp_bonus)
                self.screen_shake = 8.0
                self.spawn_particles(p["x"], p["y"], 32, ["#34d399", "#38bdf8", "#ffffff"], 240, 6, 0.6)
                self.push_effect({"kind": "dmg_text", "x": p["x"], "y": p["y"] - 32, "text": f"⚡ PERFECT DODGE! (MP+{mp_bonus})", "color": "#34d399", "ttl": 0.9})
                self.add_log(f"⚡ [저스트 회피 성공!] 자이로 급회전으로 적의 공격을 흘려보내 슬로우모션(Bullet-Time) 및 MP +{mp_bonus} 회복이 발동합니다!")
            else:
                self.spawn_particles(p["x"], p["y"], 16, ["#34d399", "#38bdf8"], 150, 4, 0.35)
                self.add_log(f"💨 [환영 회피 Lv.{dodge_lv}] 환영 잔상 대시! ({invuln_sec}초 무적)")

        elif action_key == "basic_attack":
            if p["comboTimer"] > 0:
                p["comboStep"] = (int(p["comboStep"]) + 1) % 3
            else:
                p["comboStep"] = 0
            p["comboTimer"] = 0.95
            step = int(p["comboStep"])
            basic_lv = clamp_skill_level(p["skills"].get("basic_attack", 1))
            lv_bonus = 1.0 + 0.20 * (basic_lv - 1)
            cls_color = CLASSES.get(self.selected_class, CLASSES["knight"])["color"]

            if step == 0:
                self.play_sound("slash1")
                self.push_slash_arc({
                    "x": p["x"] + p["fx"] * 10, "y": p["y"] + p["fy"] * 10,
                    "angle": aim_angle, "sweep": math.pi * 0.85,
                    "radius": 70 + basic_lv * 3, "dir": 1,
                    "color": cls_color, "coreColor": "#ffffff", "ttl": 0.18, "maxTtl": 0.18,
                })
                self.perform_melee_hit(p["x"], p["y"], p["fx"], p["fy"], 74 + basic_lv * 3, 1.0 * lv_bonus, "⚔️ [1단 베기]", False, 95)
            elif step == 1:
                self.play_sound("slash2")
                self.push_slash_arc({
                    "x": p["x"] + p["fx"] * 12, "y": p["y"] + p["fy"] * 12,
                    "angle": aim_angle, "sweep": math.pi * 0.95,
                    "radius": 78 + basic_lv * 3, "dir": -1,
                    "color": "#fbbf24", "coreColor": "#ffffff", "ttl": 0.20, "maxTtl": 0.20,
                })
                self.perform_melee_hit(p["x"], p["y"], p["fx"], p["fy"], 82 + basic_lv * 3, 1.30 * lv_bonus, "⚔️ [2단 교차참]", False, 130)
            else:
                self.play_sound("slash3")
                self.screen_shake = 7.0
                self.push_slash_arc({
                    "x": p["x"], "y": p["y"],
                    "angle": aim_angle, "sweep": math.pi * 1.95,
                    "radius": 96 + basic_lv * 4, "dir": 1,
                    "color": "#f43f5e", "coreColor": "#fde047", "ttl": 0.26, "maxTtl": 0.26,
                })
                self.spawn_particles(p["x"], p["y"], 24, ["#f43f5e", "#fbbf24", "#ffffff"], 220, 5, 0.45)
                self.perform_melee_hit(p["x"], p["y"], p["fx"], p["fy"], 98 + basic_lv * 4, 1.80 * lv_bonus, "🌪️ [3단 회전참!]", False, 210)

        elif action_key == "heavy_attack":
            heavy_lv = clamp_skill_level(p["skills"].get("heavy_attack", 1))
            self.play_sound("heavy")
            self.screen_shake = 14.0
            rad = 126 + (heavy_lv - 1) * 6
            self.push_effect({"kind": "quake_crater", "x": p["x"], "y": p["y"], "r": rad, "ttl": 0.55, "maxTtl": 0.55})
            self.spawn_particles(p["x"], p["y"], 42, ["#f43f5e", "#f97316", "#fde047", "#ffffff"], 280, 6, 0.65)
            self.perform_melee_hit(p["x"], p["y"], p["fx"], p["fy"], rad, 2.40 + 0.32 * (heavy_lv - 1), "💥 [가속도 2.65G 대지 분쇄]", True, 280)

        elif action_key == "magic_skill":
            magic_lv = clamp_skill_level(p["skills"].get("magic_skill", 1))
            self.play_sound("magic")
            p["mp"] = max(0.0, p["mp"] - 15.0)
            dmg = int(round(derived["atk"] * (1.40 + 0.25 * (magic_lv - 1))))
            # [플레이어 3연발 화염구 생성] 각 투사체에 고유 ID(p_1, p_2...)를 부여하여
            # 클라이언트 화면에서 뒤로 끌려가는 현상(러버밴딩) 없이 끝까지 매끄럽게 날아가도록 처리합니다.
            for offset in (-0.22, 0.0, 0.22):
                ang = aim_angle + offset
                pid = f"p_{getattr(self, 'next_proj_id', 1)}"
                self.next_proj_id = getattr(self, "next_proj_id", 1) + 1
                self.projectiles.append({
                    "id": pid,
                    "x": p["x"] + math.cos(ang) * 20.0,
                    "y": p["y"] + math.sin(ang) * 20.0,
                    "vx": math.cos(ang) * 430.0,
                    "vy": math.sin(ang) * 430.0,
                    "r": 12.0,
                    "dmg": dmg,
                    "color": "#f97316",
                    "ttl": 1.5,
                    "isEnemy": False,
                })
            self.spawn_particles(p["x"] + p["fx"] * 20, p["y"] + p["fy"] * 20, 18, ["#f97316", "#fde047", "#c084fc"], 170, 5, 0.4)
            self.add_log("🔥 [터치 센서 T0] 3연발 확산 플라즈마 화염구 발사!")

        elif action_key == "special_skill":
            spec_lv = clamp_skill_level(p["skills"].get("special_skill", 1))
            self.play_sound("heavy")
            p["mp"] = max(0.0, p["mp"] - 30.0)
            self.screen_shake = 18.0
            rad = 190 + (spec_lv - 1) * 7
            self.push_effect({"kind": "arcane_circle", "x": p["x"], "y": p["y"], "r": rad, "ttl": 0.85, "maxTtl": 0.85})
            self.spawn_particles(p["x"], p["y"], 60, ["#c084fc", "#38bdf8", "#fde047", "#ffffff"], 340, 7, 0.8)
            self.perform_melee_hit(p["x"], p["y"], p["fx"], p["fy"], rad, 3.20 + 0.42 * (spec_lv - 1), "✨ [터치 센서 T3 아케인 마법진]", True, 320)

        elif action_key == "interact":
            self.handle_world_interaction()

    def use_or_equip_item(self, item_id: str):
        p = self.player
        inv = p["inventory"]
        idx = next((i for i, it in enumerate(inv) if it.get("id") == item_id), -1)
        if idx == -1:
            return
        item = inv[idx]
        derived = self.get_derived_stats()
        itype = item.get("type")

        if itype == "quest":
            self.add_log(f"📜 [퀘스트 아이템] {item.get('name')}: 포레스트 타운의 촌장님께 전달할 무장 재료입니다.")
            return
        if itype == "warp":
            wt = item.get("warpTarget")
            dest_town = get_nearest_town_zone(self.zone_id) if (not wt or wt == "nearest") else wt
            item["count"] = int(item.get("count", 1)) - 1
            if item["count"] <= 0:
                inv.pop(idx)
            self.play_sound("levelup")
            self.switch_zone(dest_town, 320.0, 300.0)
            self.mark_save_dirty()
            return
        if itype == "consumable":
            p["hp"] = min(float(derived["maxHp"]), p["hp"] + float(item.get("healHp", 0)))
            p["mp"] = min(float(derived["maxMp"]), p["mp"] + float(item.get("healMp", 0)))
            self.add_log(f"🧪 [아이템 사용] {item.get('name')} 사용! (체력/마나 회복)")
        elif itype in ("weapon", "armor", "accessory"):
            prev = p["equipment"].get(itype)
            p["equipment"][itype] = {**item, "count": 1}
            if prev and prev.get("id"):
                self.add_item_to_inventory(prev["id"], 1)
            new_derived = self.get_derived_stats()
            p["hp"] = min(float(new_derived["maxHp"]), p["hp"] + float(item.get("hp", 0)))
            self.add_log(f"🛡️ [장비 장착] {item.get('name')} 장착 완료! (RPi4 백엔드 자동 저장)")

        item["count"] = int(item.get("count", 1)) - 1
        if item["count"] <= 0 and idx < len(inv) and inv[idx] is item:
            inv.pop(idx)
        self.play_sound("levelup")
        self.mark_save_dirty()

    def buy_shop_item(self, item_id: str):
        if item_id not in SHOP_CATALOG:
            return
        tpl = ITEMS.get(item_id)
        if not tpl:
            return
        price = int(tpl.get("price", 100))
        if self.player["gold"] < price:
            self.add_log(f"❗ [골드 부족] [{tpl['name']}] 구매에 {price}G가 필요합니다. (현재 보유: {self.player['gold']}G)")
            return
        self.player["gold"] -= price
        self.add_item_to_inventory(item_id, 1)
        self.play_sound("levelup")
        self.add_log(f"🛒 [상점 구매 완료] {price}G를 지불하고 [{tpl['name']}] 1개를 구매했습니다!")
        self.mark_save_dirty()

    def upgrade_skill(self, skill_key: str):
        if skill_key not in SKILL_KEYS:
            return
        cur_lv = clamp_skill_level(self.player["skills"].get(skill_key, 1))
        self.player["skills"][skill_key] = cur_lv
        kor_name = SKILL_LABELS.get(skill_key, skill_key)
        if cur_lv >= MAX_SKILL_LEVEL:
            self.add_log(f"✨ [최대 레벨 도달] \"{kor_name}\" 스킬은 이미 최고 레벨(Lv.{MAX_SKILL_LEVEL} MAX)입니다!")
            return
        if self.player["sp"] <= 0:
            self.add_log("[스킬 포인트 부족] 몬스터를 처치하고 레벨을 올려 SP를 획득하세요.")
            return
        self.player["sp"] -= 1
        next_lv = min(MAX_SKILL_LEVEL, cur_lv + 1)
        self.player["skills"][skill_key] = next_lv
        self.play_sound("levelup")
        max_tag = " (MAX!)" if next_lv >= MAX_SKILL_LEVEL else ""
        self.add_log(f"⬆️ [스킬 강화] \"{kor_name}\" 스킬이 Lv.{next_lv}/{MAX_SKILL_LEVEL}{max_tag}(으)로 강화되었습니다!")
        self.mark_save_dirty()

    def _sync_client_transform(self, m: dict[str, Any]):
        """[포털 이동 충돌 방지 & 실시간 위치 동기화]
        - 일반 이동 패킷(input)에 담긴 이전 맵(zoneId) 정보가 포털 이동 직후의 새 맵을 덮어쓰지 않도록 보호합니다.
        - 클라이언트와 서버의 현재 맵(zoneId)이 일치할 때만 실시간 좌표(px, py)를 반영합니다."""
        client_zone = m.get("zoneId")
        if client_zone and client_zone != self.zone_id:
            return
        if "px" in m and "py" in m and m["px"] is not None and m["py"] is not None:
            px = max(26.0, min(874.0, float(m["px"])))
            py = max(26.0, min(574.0, float(m["py"])))
            self.player["x"] = px
            self.player["y"] = py
            self.resolve_obstacle_overlap()
            self.client_pos_synced = True
        if "fx" in m and "fy" in m and m["fx"] is not None and m["fy"] is not None:
            fx, fy = float(m.get("fx") or 0.0), float(m.get("fy") or 0.0)
            mag = math.hypot(fx, fy)
            if mag > 0.01:
                self.player["fx"] = fx / mag
                self.player["fy"] = fy / mag

    def handle_client_command(self, m: dict[str, Any]):
        """브라우저에서 전달된 백엔드 명령(backend_action / backend_input)을 라즈베리 파이에서 처리"""
        cmd = str(m.get("cmd") or m.get("action") or "")
        if cmd == "input":
            if "joyX" in m:
                self.joy_x = max(-1.0, min(1.0, float(m.get("joyX") or 0.0)))
            if "joyY" in m:
                self.joy_y = max(-1.0, min(1.0, float(m.get("joyY") or 0.0)))
            self._sync_client_transform(m)
            if "isGameView" in m:
                self.is_game_view = bool(m.get("isGameView"))
            if "isModalOpen" in m:
                self.is_modal_open = bool(m.get("isModalOpen"))
            if "isTalkingToNpc" in m:
                self.is_talking_to_npc = bool(m.get("isTalkingToNpc"))
        elif cmd in COOLDOWNS:
            self._sync_client_transform(m)
            self.trigger_action(cmd, str(m.get("source") or "CLIENT"))
        elif cmd == "use_item":
            self.use_or_equip_item(str(m.get("itemId") or ""))
        elif cmd == "buy_item":
            self.buy_shop_item(str(m.get("itemId") or ""))
        elif cmd == "upgrade_skill":
            self.upgrade_skill(str(m.get("skillKey") or ""))
        elif cmd == "switch_zone":
            self.switch_zone(
                str(m.get("targetZone") or "forest_town"),
                float(m.get("sx", 130.0) or 130.0),
                float(m.get("sy", 300.0) or 300.0),
            )
        elif cmd == "revive":
            self.revive_at_nearest_town()
        elif cmd == "complete_quest":
            q_id = str(m.get("questId") or "")
            if q_id:
                self.complete_quest_by_id(q_id)
            else:
                ready_q = next(
                    (q for q in QUESTS if self.get_quest_state(q["id"])["status"] == "active"
                     and int(self.get_quest_state(q["id"])["progress"]) >= q["targetCount"]),
                    None,
                )
                if ready_q:
                    self.complete_quest_by_id(ready_q["id"], ready_q["giver"])

