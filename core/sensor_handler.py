"""
센서 입력 처리 (엣지 서버 역할)
ESP32가 보낸 원시 패킷을 검증·정규화해서 "게임 명령"으로 바꾼다.

  1) 값 검증      : NaN/무한대/문자열/범위 초과 값 제거 (잘못된 패킷이 게임을 망치지 못하게)
  2) 데드존 보정  : 조이스틱 미세 떨림 제거 + 대각선 속도 정규화
  3) 임계값 재판정: 펌웨어 판정과 별개로 gyroVec / accelG 원시값으로 서버가 한 번 더 판정
  4) Rising-Edge  : 버튼을 계속 누르고 있어도 한 번만 발동
  5) 쿨타임 검증  : 서버 측 2차 쿨타임 (펌웨어 쿨타임 우회/오작동 방지)
"""
import math

# 쿨타임은 HTML 게임의 COOLDOWNS 와 맞춤 (+0.05초 여유: 네트워크 지터로 HTML 쪽에서 거절되지 않도록)
SENSOR_CONFIG = {
    "joystick_deadzone": 0.14,
    "gyro_dodge_threshold_deg": 150.0,
    "accel_heavy_threshold_g": 2.1,
    "cooldowns": {
        "basic_attack": 0.33,
        "interact": 0.30,
        "dodge": 1.05,
        "heavy_attack": 2.85,
        "magic_skill": 3.55,
        "special_skill": 7.05,
    },
}

# (게임 액션, 패킷 플래그 이름, 이벤트 출처 라벨)
ACTION_FLAGS = (
    ("basic_attack", "btnAttack", "btn"),
    ("interact", "btnInteract", "joysw"),
    ("dodge", "gyroDodge", "gyro"),
    ("heavy_attack", "accelHeavy", "accel"),
    ("magic_skill", "touchMagic", "touch0"),
    ("special_skill", "touchSpecial", "touch3"),
)


def num(value, default=0.0, lo=-1e6, hi=1e6):
    """어떤 값이 들어와도 유한한 float 로 변환하고 [lo, hi]로 제한."""
    try:
        v = float(value)
    except (TypeError, ValueError):
        return default
    if not math.isfinite(v):
        return default
    return max(lo, min(hi, v))


class SensorHandler:
    def __init__(self, config=SENSOR_CONFIG):
        self.cfg = config
        self.deadzone = config["joystick_deadzone"]
        self.cooldowns = config["cooldowns"]
        self.last_trigger = {a: -1e9 for a, _, _ in ACTION_FLAGS}
        self.prev = {f: False for _, f, _ in ACTION_FLAGS}
        self.rejected = 0      # 쿨타임으로 거절한 이벤트 수 (통계용)

    def normalize(self, x, y):
        mag = math.hypot(x, y)
        if mag < self.deadzone:
            return 0.0, 0.0
        eff = min(1.0, (mag - self.deadzone) / (1.0 - self.deadzone))
        return (x / mag) * eff, (y / mag) * eff

    def _trigger(self, action, flag, active, now):
        was = self.prev[flag]
        self.prev[flag] = active
        if not active or was:           # Rising-Edge 만 허용
            return False
        if now - self.last_trigger[action] >= self.cooldowns[action]:
            self.last_trigger[action] = now
            return True
        self.rejected += 1
        return False

    def process(self, packet, now):
        """packet(dict) -> {"axis":(x,y), "events":[(action,src)...], "telemetry":{...}}"""
        jx = num(packet.get("joyX"), 0.0, -1.0, 1.0)
        jy = num(packet.get("joyY"), 0.0, -1.0, 1.0)
        ax, ay = self.normalize(jx, jy)

        gv = packet.get("gyroVec")
        gx = num(gv[0], 0.0, -2000, 2000) if isinstance(gv, (list, tuple)) and len(gv) >= 1 else 0.0
        gy = num(gv[1], 0.0, -2000, 2000) if isinstance(gv, (list, tuple)) and len(gv) >= 2 else 0.0
        gyro_mag = max(abs(gx), abs(gy))
        accel_g = num(packet.get("accelG"), 1.0, 0.0, 16.0)

        raw = {
            "btnAttack": packet.get("btnAttack") is True,
            "btnInteract": packet.get("btnInteract") is True,
            "gyroDodge": packet.get("gyroDodge") is True or gyro_mag >= self.cfg["gyro_dodge_threshold_deg"],
            "accelHeavy": packet.get("accelHeavy") is True or accel_g >= self.cfg["accel_heavy_threshold_g"],
            "touchMagic": packet.get("touchMagic") is True,
            "touchSpecial": packet.get("touchSpecial") is True,
        }
        # 흔들기(강공격) 중에는 회전값도 커지므로 같은 순간의 회피는 무시
        if raw["accelHeavy"] and not self.prev["accelHeavy"]:
            raw["gyroDodge"] = False

        events = []
        for action, flag, src in ACTION_FLAGS:
            if self._trigger(action, flag, raw[flag], now):
                events.append((action, src))

        telemetry = {
            "gyroDeg": round(gyro_mag, 1),
            "accelG": round(accel_g, 2),
            "touch0": raw["touchMagic"],
            "touch3": raw["touchSpecial"],
        }
        return {"axis": (round(ax, 3), round(ay, 3)), "events": events, "telemetry": telemetry}
