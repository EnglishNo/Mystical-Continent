# -*- coding: utf-8 -*-
"""[core/physics_and_ai.py] 라즈베리 파이 4 백엔드 - 30Hz 물리 충돌, 투사체 궤적 및 몬스터 AI 상태 머신 모듈"""
from __future__ import annotations
import math
from typing import Any
from data.items_db import LOGICAL_W, LOGICAL_H


class PhysicsAndAIMixin:
    """라즈베리 파이 4 서버에서 수행하는 장애물 물리 충돌, 투사체 피격, 몬스터 AI 상태 머신 믹스인"""

    def collides_obstacle(self, x: float, y: float, r: float) -> bool:
        z = self.zones[self.zone_id]
        for ob in z["obstacles"]:
            cx = max(ob["x"], min(x, ob["x"] + ob["w"]))
            cy = max(ob["y"], min(y, ob["y"] + ob["h"]))
            if math.hypot(x - cx, y - cy) < r:
                return True
        return False

    def resolve_obstacle_overlap(self):
        p = self.player
        z = self.zones[self.zone_id]
        for ob in z["obstacles"]:
            cx = max(ob["x"], min(p["x"], ob["x"] + ob["w"]))
            cy = max(ob["y"], min(p["y"], ob["y"] + ob["h"]))
            dx = p["x"] - cx
            dy = p["y"] - cy
            dist = math.hypot(dx, dy)
            if dist < p["r"]:
                if dist < 0.01:
                    p["y"] = ob["y"] - p["r"] - 2.0
                else:
                    push = (p["r"] - dist) + 1.5
                    p["x"] += (dx / dist) * push
                    p["y"] += (dy / dist) * push

    def step(self, raw_dt: float):
        """라즈베리 파이 4에서 매 틱(30Hz) 실행되는 물리·전투·몬스터 AI 시뮬레이션 루프"""
        if not self.is_game_view or self.game_over or self.is_talking_to_npc or self.is_modal_open:
            return

        if self.hit_stop_timer > 0:
            self.hit_stop_timer = max(0.0, self.hit_stop_timer - raw_dt)
            return

        world_dt = raw_dt
        if self.bullet_time_timer > 0:
            self.bullet_time_timer = max(0.0, self.bullet_time_timer - raw_dt)
            world_dt = raw_dt * 0.38

        p = self.player
        derived = self.get_derived_stats()

        if self.screen_shake > 0:
            self.screen_shake = max(0.0, self.screen_shake - raw_dt * 38.0)
        if p["comboTimer"] > 0:
            p["comboTimer"] = max(0.0, p["comboTimer"] - raw_dt)
        if p["hitComboDecay"] > 0:
            p["hitComboDecay"] = max(0.0, p["hitComboDecay"] - raw_dt)
            if p["hitComboDecay"] == 0:
                p["hitCount"] = 0

        for k in list(self.cooldown_left.keys()):
            if self.cooldown_left[k] > 0:
                self.cooldown_left[k] = max(0.0, self.cooldown_left[k] - raw_dt)

        if p["dodgeTimer"] > 0:
            p["dodgeTimer"] = max(0.0, p["dodgeTimer"] - raw_dt)
        if p["invulnTimer"] > 0:
            p["invulnTimer"] = max(0.0, p["invulnTimer"] - raw_dt)
        if p["hitFlash"] > 0:
            p["hitFlash"] = max(0.0, p["hitFlash"] - raw_dt)

        cur_zone = self.zones[self.zone_id]
        if cur_zone.get("isSafeZone"):
            p["hp"] = min(float(derived["maxHp"]), p["hp"] + 32.0 * raw_dt)
            p["mp"] = min(float(derived["maxMp"]), p["mp"] + 22.0 * raw_dt)
        else:
            p["mp"] = min(float(derived["maxMp"]), p["mp"] + 3.5 * raw_dt)

        # 클라이언트가 실시간 좌표(px, py)를 동기화 중일 때는 서버에서 지연된 joy_x/joy_y를 중복 적분하지 않아
        # 핑 차이로 인한 좌표 갈라짐(Drift) 및 러버밴딩(Rubber-banding)을 원천 차단합니다.
        if not getattr(self, "client_pos_synced", False):
            use_ext = (self.joy_x == 0.0 and self.joy_y == 0.0)
            jx = self.ext_joy_x if use_ext else self.joy_x
            jy = self.ext_joy_y if use_ext else self.joy_y
            mag = math.hypot(jx, jy)
            if mag >= 0.14:
                norm_x = jx / mag
                norm_y = jy / mag
                p["fx"] = norm_x
                p["fy"] = norm_y
                dash_boost = 2.55 if p["dodgeTimer"] > 0 else 1.0
                nx = max(26.0, min(874.0, p["x"] + norm_x * derived["spd"] * dash_boost * min(1.0, mag) * raw_dt))
                ny = max(26.0, min(574.0, p["y"] + norm_y * derived["spd"] * dash_boost * min(1.0, mag) * raw_dt))
                if not self.collides_obstacle(nx, p["y"], p["r"]):
                    p["x"] = nx
                if not self.collides_obstacle(p["x"], ny, p["r"]):
                    p["y"] = ny
        self.resolve_obstacle_overlap()

        # 투사체 물리 및 충돌 판정
        next_projectiles: list[dict[str, Any]] = []
        for proj in self.projectiles:
            dt = world_dt if proj.get("isEnemy") else raw_dt
            proj["x"] += proj["vx"] * dt
            proj["y"] += proj["vy"] * dt
            proj["ttl"] -= dt

            if proj.get("isEnemy"):
                if math.hypot(p["x"] - proj["x"], p["y"] - proj["y"]) <= proj["r"] + p["r"]:
                    if p["invulnTimer"] > 0:
                        self.add_log("✨ [자이로 무적 회피!] 적의 마법 탄환을 흘려보냈습니다!")
                    else:
                        dmg = max(1, int(proj["dmg"]) - derived["def"])
                        p["hp"] = max(0.0, p["hp"] - dmg)
                        p["hitFlash"] = 0.18
                        self.screen_shake = 6.0
                        self.spawn_particles(p["x"], p["y"], 14, ["#f43f5e", "#ffffff"], 160, 4, 0.35)
                        self.push_effect({"kind": "dmg_text", "x": p["x"], "y": p["y"] - 22, "text": f"-{dmg}", "color": "#f43f5e", "ttl": 0.55})
                        if p["hp"] <= 0:
                            self.trigger_player_death()
                    continue
            else:
                hit_monster = False
                for m in self.monsters:
                    if m["zone"] == self.zone_id and m["alive"]:
                        if math.hypot(m["x"] - proj["x"], m["y"] - proj["y"]) <= proj["r"] + m["r"]:
                            m["hp"] = max(0, int(m["hp"]) - int(proj["dmg"]))
                            m["flash"] = 0.16
                            p["hitCount"] = int(p.get("hitCount", 0)) + 1
                            p["hitComboDecay"] = 3.0
                            self.spawn_particles(m["x"], m["y"], 16, ["#f97316", "#fde047", "#ffffff"], 180, 5, 0.4)
                            self.push_effect({"kind": "dmg_text", "x": m["x"], "y": m["y"] - 20, "text": f"🔥-{proj['dmg']}", "color": "#fb923c", "ttl": 0.55})
                            if m["hp"] <= 0:
                                self.on_monster_defeated(m)
                            hit_monster = True
                            break
                if hit_monster:
                    continue

            if proj["ttl"] > 0 and 0 < proj["x"] < LOGICAL_W and 0 < proj["y"] < LOGICAL_H:
                next_projectiles.append(proj)
        self.projectiles = next_projectiles

        # 몬스터 AI 상태 머신
        zone_monsters = [m for m in self.monsters if m["zone"] == self.zone_id]
        for m in zone_monsters:
            if not m["alive"]:
                m["timer"] -= world_dt
                if m["timer"] <= 0 and not m.get("isBoss"):
                    m["alive"] = True
                    m["hp"] = m["maxHp"]
                    m["x"] = m["sx"]
                    m["y"] = m["sy"]
                    m["vx"] = 0.0
                    m["vy"] = 0.0
                    m["state"] = "IDLE"
                continue

            if m["flash"] > 0:
                m["flash"] = max(0.0, m["flash"] - raw_dt)

            if math.hypot(m["vx"], m["vy"]) > 2.0:
                m["x"] = max(32.0, min(868.0, m["x"] + m["vx"] * world_dt))
                m["y"] = max(32.0, min(568.0, m["y"] + m["vy"] * world_dt))
                decay = 0.05 ** world_dt
                m["vx"] *= decay
                m["vy"] *= decay
            else:
                m["vx"] = 0.0
                m["vy"] = 0.0

            dist = math.hypot(p["x"] - m["x"], p["y"] - m["y"])
            is_ranged = m["kind"] in ("elite_mage", "goblin_archer", "goblin_shaman", "orc_shaman")
            is_heavy = m["kind"] in ("goblin_brute", "orc_juggernaut")
            detect_r = 600.0 if m.get("isBoss") else (360.0 + m["lv"] * 12.0)
            atk_r = 120.0 if m.get("isBoss") else (235.0 if is_ranged else (p["r"] + m["r"] + (18.0 if is_heavy else 12.0)))
            cur_spd = m["spd"] * (1.32 if m.get("enraged") else 1.0)

            # [몬스터 이동 속도 벡터(mvx, mvy) 초기화]
            # 클라이언트가 패킷 사이에도 몬스터를 끊김 없이 전진시킬 수 있도록 매 틱 실제 이동 속도를 기록합니다.
            m["mvx"] = m.get("vx", 0.0)
            m["mvy"] = m.get("vy", 0.0)

            st = m["state"]
            if st == "IDLE":
                m["animPhase"] += world_dt * 3.0
                if dist < detect_r:
                    m["state"] = "CHASE"
            elif st == "CHASE":
                m["animPhase"] += world_dt * 5.6
                if dist <= atk_r:
                    m["state"] = "TELEGRAPH"
                    if m.get("isBoss"):
                        patterns = ("flame_breath", "abyss_charge", "meteor_nova")
                        pat_idx = int(m.get("patIdx", 0))
                        m["pattern"] = patterns[pat_idx % len(patterns)]
                        m["patIdx"] = pat_idx + 1
                        m["timer"] = 0.72 if m.get("enraged") else 0.90
                    else:
                        m["timer"] = 0.52 if is_ranged else (0.45 if is_heavy else 0.34)
                    m["tx"] = p["x"]
                    m["ty"] = p["y"]
                else:
                    dir_x = (p["x"] - m["x"]) / max(1.0, dist)
                    dir_y = (p["y"] - m["y"]) / max(1.0, dist)
                    for other in zone_monsters:
                        if other is not m and other["alive"]:
                            od = math.hypot(m["x"] - other["x"], m["y"] - other["y"])
                            min_sep = m["r"] + other["r"] - 4.0
                            if 0.1 < od < min_sep:
                                dir_x += ((m["x"] - other["x"]) / od) * 0.28
                                dir_y += ((m["y"] - other["y"]) / od) * 0.28
                    dir_len = max(0.01, math.hypot(dir_x, dir_y))
                    step_vx = (dir_x / dir_len) * cur_spd
                    step_vy = (dir_y / dir_len) * cur_spd
                    m["mvx"] += step_vx
                    m["mvy"] += step_vy
                    m["x"] = max(32.0, min(868.0, m["x"] + step_vx * world_dt))
                    m["y"] = max(32.0, min(568.0, m["y"] + step_vy * world_dt))
            elif st == "TELEGRAPH":
                if not is_ranged and dist > p["r"] + m["r"] - 2.0:
                    lx = (p["x"] - m["x"]) / max(1.0, dist)
                    ly = (p["y"] - m["y"]) / max(1.0, dist)
                    step_vx = lx * cur_spd * 0.55
                    step_vy = ly * cur_spd * 0.55
                    m["mvx"] += step_vx
                    m["mvy"] += step_vy
                    m["x"] = max(32.0, min(868.0, m["x"] + step_vx * world_dt))
                    m["y"] = max(32.0, min(568.0, m["y"] + step_vy * world_dt))
                m["timer"] -= world_dt
                if m["timer"] <= 0:
                    m["state"] = "ATTACK"
                    m["timer"] = 0.26
                    now_dist = math.hypot(p["x"] - m["x"], p["y"] - m["y"])
                    if is_ranged:
                        base_ang = math.atan2(p["y"] - m["y"], p["x"] - m["x"])
                        spreads = (0.0,) if m["kind"] == "goblin_archer" else ((-0.14, 0.14) if m["kind"] == "goblin_shaman" else (-0.20, 0.0, 0.20))
                        proj_spd = 265.0 + m["lv"] * 12.0
                        proj_color = "#a3e635" if m["kind"] == "goblin_archer" else ("#c084fc" if m["kind"] == "goblin_shaman" else "#f43f5e")
                        for off in spreads:
                            pid = f"p_{getattr(self, 'next_proj_id', 1)}"
                            self.next_proj_id = getattr(self, "next_proj_id", 1) + 1
                            self.projectiles.append({
                                "id": pid,
                                "x": m["x"], "y": m["y"],
                                "vx": math.cos(base_ang + off) * proj_spd,
                                "vy": math.sin(base_ang + off) * proj_spd,
                                "r": 8.0 if m["kind"] == "goblin_archer" else 10.0,
                                "dmg": m["atk"], "color": proj_color, "ttl": 2.2, "isEnemy": True,
                            })
                    else:
                        hit_r = 146.0 if m.get("isBoss") else (94.0 if is_heavy else 76.0)
                        self.push_effect({"kind": "enemy_aoe", "x": m["x"], "y": m["y"], "r": hit_r, "ttl": 0.30, "maxTtl": 0.30})
                        if m.get("isBoss"):
                            self.screen_shake = 12.0
                            b_cnt = 12 if m.get("enraged") else 8
                            b_spd = 250.0 if m.get("enraged") else 215.0
                            pat_idx = int(m.get("patIdx", 0))
                            for b in range(b_cnt):
                                bang = (math.pi * 2.0 * b) / b_cnt + (pat_idx * 0.25)
                                pid = f"p_{getattr(self, 'next_proj_id', 1)}"
                                self.next_proj_id = getattr(self, "next_proj_id", 1) + 1
                                self.projectiles.append({
                                    "id": pid,
                                    "x": m["x"], "y": m["y"],
                                    "vx": math.cos(bang) * b_spd,
                                    "vy": math.sin(bang) * b_spd,
                                    "r": 10.0, "dmg": int(round(m["atk"] * 0.85)),
                                    "color": "#f43f5e", "ttl": 2.4, "isEnemy": True,
                                })
                        if now_dist <= hit_r + p["r"]:
                            if p["invulnTimer"] > 0:
                                self.add_log(f"✨ [자이로 무적 회피 성공!] {m['name']}의 강타를 완벽히 흘려보냈습니다!")
                            else:
                                raw_atk = int(round(m["atk"] * 1.30)) if (m.get("isBoss") and m.get("enraged")) else int(m["atk"])
                                dmg = max(1, raw_atk - derived["def"])
                                p["hp"] = max(0.0, p["hp"] - dmg)
                                p["hitFlash"] = 0.22
                                self.screen_shake = 10.0
                                self.spawn_particles(p["x"], p["y"], 20, ["#f43f5e", "#ffffff"], 190, 5, 0.45)
                                self.push_effect({"kind": "dmg_text", "x": p["x"], "y": p["y"] - 22, "text": f"❗-{dmg}", "color": "#f43f5e", "ttl": 0.6})
                                self.add_log(f"❗ [피격] Lv.{m['lv']} {m['name']}의 근접 공격에 {dmg} 피해를 입었습니다.")
                                if p["hp"] <= 0:
                                    self.trigger_player_death()
            elif st == "ATTACK":
                m["timer"] -= world_dt
                if m["timer"] <= 0:
                    if m.get("isBoss"):
                        m["state"] = "VULNERABLE"
                        m["timer"] = 1.90 if m.get("enraged") else 2.40
                    else:
                        m["state"] = "CHASE"
            elif st == "VULNERABLE":
                m["timer"] -= world_dt
                if m["timer"] <= 0:
                    m["state"] = "CHASE"

        self.tick_seq += 1

