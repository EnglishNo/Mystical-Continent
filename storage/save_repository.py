# -*- coding: utf-8 -*-
"""[storage/save_repository.py] 라즈베리 파이 4 백엔드 - 사용자별 saves/<UUID>.json 원자적 저장소 & 하위 호환성/백업 모듈
  - 기존 saves/<UUID>.json 데이터 구조 및 하위 호환성 100% 유지
  - 새로 추가된 필드는 누락 시 안전한 기본값(fallback) 처리
  - saves/ 폴더 내 파일이나 세이브 키를 초기화하는 코드 절대 없음
"""
import asyncio
import hashlib
import json
import os
import shutil
import threading
import time
import uuid
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from core.sensor_handler import num

HERE = Path(__file__).resolve().parent.parent
SAVE_DIR = HERE / "saves"
BACKUP_DIR = SAVE_DIR / "backups"
MAX_SAVE_BYTES = 1_000_000
MAX_SNAPSHOTS = 5
MAX_SAVE_FILES = 500
USER_ID_COOKIE = "aetherblade64_uid"


def parse_uuid_str(raw_id) -> str | None:
    """유효한 UUID 문자열이면 표준 소문자 UUID 문자열을 반환하고, 아니면 None을 반환."""
    try:
        return str(uuid.UUID(str(raw_id).strip()))
    except (ValueError, AttributeError, TypeError):
        return None


def compute_device_fp(client_meta: dict | None, req_headers=None) -> str:
    """클라이언트 기기/브라우저 고유 지문(SHA-256) 계산.
    이용자마다 기기(OS/브라우저/화면해상도/GPU/코어수)가 다르므로 다른 이용자와 세이브가 섞이지 않게 구분한다."""
    if not isinstance(client_meta, dict):
        return ""
    sig = str(client_meta.get("deviceSig") or "").strip()
    if not sig:
        return ""
    ua = ""
    if req_headers is not None:
        ua = str(req_headers.get("User-Agent") or "").strip()
    raw = f"{sig}||{ua}"
    return hashlib.sha256(raw.encode("utf-8", "ignore")).hexdigest()[:32]


def is_mobile_client(client_meta: dict | None, req_headers=None) -> bool:
    if isinstance(client_meta, dict) and client_meta.get("isMobile") is True:
        return True
    ua = ""
    if req_headers is not None:
        ua = str(req_headers.get("User-Agent") or "")
    if isinstance(client_meta, dict):
        ua += " " + str(client_meta.get("deviceSig") or "")
    return any(tok in ua for tok in ("Mobile", "Android", "iPhone", "iPad", "iPod"))


def valid_save(obj, max_depth=10, max_nodes=20000, max_str=2000):
    """세이브 구조 검증: 너무 깊거나 크거나 이상한 타입이면 거부."""
    stack, nodes = [(obj, 1)], 0
    while stack:
        cur, depth = stack.pop()
        nodes += 1
        if nodes > max_nodes or depth > max_depth:
            return False
        if isinstance(cur, dict):
            for k, v in cur.items():
                if not isinstance(k, str) or len(k) > 100:
                    return False
                stack.append((v, depth + 1))
        elif isinstance(cur, list):
            stack.extend((v, depth + 1) for v in cur)
        elif isinstance(cur, str):
            if len(cur) > max_str:
                return False
        elif cur is not None and not isinstance(cur, (int, float, bool)):
            return False
    return True


def is_slot_untouched_default(slot: dict) -> bool:
    """아무 진행도 하지 않은 초기 기본 캐릭터(Lv.1 남성 나이트 에이든) 상태인지 판별."""
    if not isinstance(slot, dict):
        return True
    if slot.get("customCreated") or slot.get("adventureStarted"):
        return False
    lv = int(num(slot.get("level"), 1, 1, 1000))
    exp = int(num(slot.get("exp"), 0, 0, 1e9))
    kills = int(num(slot.get("kills"), 0, 0, 1e9))
    gold = int(num(slot.get("gold"), 50, 0, 1e9))
    sp = int(num(slot.get("skillPoints"), 1, 0, 1e6))
    name = str(slot.get("charName") or "에이든").strip()
    gender = str(slot.get("gender") or "male").strip()
    cls = str(slot.get("charClass") or "knight").strip()
    zone = str(slot.get("currentZone") or "home_interior").strip()
    px = num(slot.get("playerX"), 210, 0, 10000)
    py = num(slot.get("playerY"), 300, 0, 10000)
    if (lv > 1 or exp > 0 or kills > 0 or gold != 50 or sp != 1
            or slot.get("bossDefeated") or slot.get("playerDead")
            or name != "에이든" or gender != "male" or cls != "knight"
            or zone != "home_interior" or abs(px - 210) > 5 or abs(py - 300) > 5):
        return False
    eq = slot.get("equipment")
    if isinstance(eq, dict) and any(v is not None for v in eq.values()):
        return False
    opened = slot.get("openedChests")
    if isinstance(opened, list) and len(opened) > 0:
        return False
    qstates = slot.get("questStates")
    if isinstance(qstates, dict):
        for qv in qstates.values():
            if isinstance(qv, dict) and (qv.get("status", "unaccepted") != "unaccepted" or num(qv.get("progress"), 0) > 0):
                return False
    return True


def bundle_has_progress(data: dict) -> bool:
    """세이브 번들에 실제 캐릭터 생성 또는 플레이 진행 내역이 있는지 확인."""
    if not isinstance(data, dict):
        return False
    slots = data.get("slots")
    if not isinstance(slots, list) or len(slots) == 0:
        return False
    if len(slots) > 1:
        return True
    return any(not is_slot_untouched_default(s) for s in slots if isinstance(s, dict))


def save_progress_score(data: dict, mtime: float = 0.0) -> tuple:
    """세이브 파일의 진행도 및 최신도 점수 튜플."""
    if not isinstance(data, dict):
        return (0, 0, 0, 0, 0, 0.0, 0)
    slots = data.get("slots") if isinstance(data.get("slots"), list) else []
    valid_slots = [s for s in slots if isinstance(s, dict)]
    has_prog = 1 if bundle_has_progress(data) else 0
    max_lv = max((int(num(s.get("level"), 1, 1, 1000)) for s in valid_slots), default=0)
    total_activity = sum(
        int(num(s.get("level"), 1, 1, 1000) - 1) * 1000
        + int(num(s.get("exp"), 0, 0, 1e9))
        + int(num(s.get("kills"), 0, 0, 1e9)) * 50
        + abs(int(num(s.get("gold"), 50, 0, 1e9)) - 50)
        for s in valid_slots
    )
    slot_times = [int(num(s.get("savedAtMs"), 0, 0, 1e16)) for s in valid_slots]
    saved_ms = max([int(num(data.get("savedAtMs"), 0, 0, 1e16))] + slot_times)
    rev = int(num(data.get("serverRev"), 0, 0, 1e12))
    return (has_prog, len(valid_slots), max_lv, total_activity, saved_ms, float(mtime), rev)


def normalize_save_bundle(data: dict) -> dict:
    """단일 슬롯 구버전 포맷(slots 키 없음)도 슬롯 배열 포맷으로 정규화."""
    if not isinstance(data, dict):
        return data
    if not isinstance(data.get("slots"), list):
        if any(k in data for k in ("charName", "charClass", "level", "inventory", "questStates")):
            wrapped = {
                "v": 1,
                "activeSlotIdx": 0,
                "slots": [data],
                "savedAtMs": int(num(data.get("savedAtMs"), 0, 0, 1e16)),
                "lastSavedAt": str(data.get("lastSavedAt") or ""),
            }
            if "serverRev" in data:
                wrapped["serverRev"] = data["serverRev"]
            return wrapped
    return data


def user_save_path(user_id: str) -> Path:
    """브라우저별 UUID에 대응하는 개별 저장 파일 경로."""
    SAVE_DIR.mkdir(parents=True, exist_ok=True)
    return SAVE_DIR / f"{user_id}.json"


def _bak_path(path: Path) -> Path:
    return path.with_name(path.name + ".bak")


def _reject_const(name):
    raise ValueError(f"invalid JSON constant: {name}")     # NaN / Infinity 거부


def _read_state(path: Path):
    """('missing', None) | ('ok', dict) | ('corrupt', None)"""
    try:
        data = json.loads(path.read_text(encoding="utf-8"), parse_constant=_reject_const)
    except FileNotFoundError:
        return "missing", None
    except (OSError, ValueError) as exc:
        print(f"[save] 읽기 실패 {path.name}: {exc}")
        return "corrupt", None
    if not isinstance(data, dict):
        return "corrupt", None
    return "ok", normalize_save_bundle(data)


_file_locks_guard = threading.Lock()
_user_file_locks: dict[str, threading.Lock] = {}


def get_user_file_lock(user_id: str) -> threading.Lock:
    """파일 I/O 직렬화용 스레드 락 (WebSocket to_thread 및 HTTP /api/save 공통)."""
    with _file_locks_guard:
        lock = _user_file_locks.get(user_id)
        if lock is None:
            if len(_user_file_locks) > 1000:
                for uid in [u for u, l in _user_file_locks.items() if not l.locked()]:
                    del _user_file_locks[uid]
            lock = _user_file_locks[user_id] = threading.Lock()
        return lock


def _stamp_device_metadata(user_id: str, data: dict, device_fp: str, bound_host: str):
    """세이브 파일의 게임 데이터와 serverRev는 건드리지 않고 기기 지문(ownerDeviceFp)과 호스트(boundHost)만 기록."""
    if not device_fp and not bound_host:
        return
    with get_user_file_lock(user_id):
        path = user_save_path(user_id)
        status, cur = _read_state(path)
        if status != "ok":
            return
        changed = False
        if device_fp and cur.get("ownerDeviceFp") != device_fp:
            cur["ownerDeviceFp"] = device_fp
            data["ownerDeviceFp"] = device_fp
            changed = True
        if bound_host and cur.get("boundHost") != bound_host:
            cur["boundHost"] = bound_host
            data["boundHost"] = bound_host
            changed = True
        if changed:
            tmp = path.with_name(path.name + ".tmp")
            try:
                with open(tmp, "w", encoding="utf-8") as f:
                    f.write(json.dumps(cur, ensure_ascii=False))
                    f.flush()
                    os.fsync(f.fileno())
                os.replace(tmp, path)
            except OSError:
                pass


def load_user_save(user_id: str):
    """(세이브 dict 또는 None, 읽기 오류 여부). 본 파일이 손상됐으면 .bak 에서 복구해 제공."""
    with get_user_file_lock(user_id):
        path = user_save_path(user_id)
        status, data = _read_state(path)
        if status == "ok":
            return data, False
        if status == "missing":
            return None, False
        bstatus, bdata = _read_state(_bak_path(path))
        if bstatus == "ok":
            print(f"[save] {user_id[:8]} 본 파일 손상 -> .bak 에서 복구하여 제공")
            return bdata, False
        return None, True


def find_matching_device_save(client_fp: str, client_host: str, is_mobile: bool):
    """Cloudflare Quick Tunnel 재시작으로 도메인이 바뀐 경우,
    동일한 기기 지문(ownerDeviceFp == client_fp)을 가진 본인의 세이브 파일만 찾아서 반환한다.
    다른 사람(다른 폰/PC/브라우저)에게는 절대 다른 사람의 세이브를 반환하지 않는다."""
    if not client_fp:
        return None, None
    SAVE_DIR.mkdir(parents=True, exist_ok=True)
    exact_matches = []
    unclaimed_legacy = []
    try:
        for p in SAVE_DIR.glob("*.json"):
            uid = parse_uuid_str(p.stem)
            if not uid:
                continue
            status, data = _read_state(p)
            if status != "ok":
                bstatus, data = _read_state(_bak_path(p))
                if bstatus != "ok":
                    continue
            if not isinstance(data.get("slots"), list) or len(data["slots"]) == 0:
                continue
            owner_fp = str(data.get("ownerDeviceFp") or "")
            bound_host = str(data.get("boundHost") or "").strip().lower()
            try:
                mtime = p.stat().st_mtime
            except OSError:
                mtime = 0.0

            if owner_fp:
                # 같은 도메인에서 이미 연결된 세이브는 시크릿 창/타 브라우저에 중복 할당하지 않음
                if owner_fp == client_fp and (not client_host or bound_host != client_host):
                    exact_matches.append((save_progress_score(data, mtime), uid, data))
            else:
                # 아직 ownerDeviceFp 가 기록되지 않은 최초 레거시 세이브(노트북 주인 전용, 모바일 제외)
                if not is_mobile and (not client_host or bound_host != client_host):
                    unclaimed_legacy.append((save_progress_score(data, mtime), uid, data))
    except OSError:
        pass

    if exact_matches:
        exact_matches.sort(key=lambda item: item[0], reverse=True)
        _, best_uid, best_data = exact_matches[0]
        return best_uid, best_data

    if len(unclaimed_legacy) == 1:
        _, best_uid, best_data = unclaimed_legacy[0]
        return best_uid, best_data

    return None, None


def resolve_user_save_for_client(user_id: str, client_meta=None, req_headers=None):
    """브라우저별 개별 세이브 조회.
    1) 각 이용자는 자기 UUID의 세이브만 조회한다 (타인의 세이브 노출 원천 차단).
    2) 만약 다른 기기(예: 이전에 쿠키가 공유됐던 지인의 휴대폰)가 타인의 세이브 UUID로 접근하면
       즉시 새로운 고유 UUID를 발급(forceNewUser=True)하여 계정을 완벽히 분리한다.
    3) Cloudflare Quick Tunnel 도메인이 바뀌어 새 도메인에서 처음 접속한 경우에만,
       기기 지문(ownerDeviceFp)이 일치하는 본인 세이브를 자동 복원한다."""
    save, load_error = load_user_save(user_id)
    if not isinstance(client_meta, dict):
        return user_id, save, load_error, False

    client_fp = compute_device_fp(client_meta, req_headers)
    client_host = str(client_meta.get("host") or "").strip().lower()
    id_was_stored = bool(client_meta.get("idWasStored"))
    local_has_progress = bool(client_meta.get("localHasProgress"))
    is_mobile = is_mobile_client(client_meta, req_headers)

    if save is not None:
        owner_fp = str(save.get("ownerDeviceFp") or "")
        # 이미 다른 기기 지문이 등록된 세이브 파일에 다른 기기가 같은 UUID로 접근한 경우 -> 즉시 새 계정으로 분리!
        if owner_fp and client_fp and owner_fp != client_fp:
            new_uid = str(uuid.uuid4())
            print(f"[save] 다른 기기 접속 감지 -> 개별 세이브 분리: {user_id[:8]} -> {new_uid[:8]}")
            return new_uid, None, False, True
        # 레거시 세이브(a75b6a8b 등)에 ownerDeviceFp가 아직 없을 때 모바일 기기가 공유된 UUID로 접근한 경우 -> 즉시 분리!
        if not owner_fp and is_mobile and bundle_has_progress(save):
            new_uid = str(uuid.uuid4())
            print(f"[save] 모바일 기기에서 PC 세이브 접근 감지 -> 개별 세이브 분리: {user_id[:8]} -> {new_uid[:8]}")
            return new_uid, None, False, True
        # 본인 기기 확인 완료 -> 기기 지문 및 현재 호스트 기록
        if client_fp:
            _stamp_device_metadata(user_id, save, client_fp, client_host)
        return user_id, save, load_error, False

    # 세이브 파일이 없고, 새 도메인 첫 접속(idWasStored == False)이며 로컬 진행도도 없는 경우:
    # 오직 기기 지문(client_fp)이 일치하는 본인의 세이브만 찾는다. (일치하지 않으면 None을 반환해 신규 계정으로 시작)
    if not load_error and not id_was_stored and not local_has_progress and client_fp:
        matched_uid, matched_data = find_matching_device_save(client_fp, client_host, is_mobile)
        if matched_uid and matched_data is not None:
            _stamp_device_metadata(matched_uid, matched_data, client_fp, client_host)
            print(f"[save] 동일 기기 터널 도메인 변경 복원: {user_id[:8]} -> {matched_uid[:8]}")
            return matched_uid, matched_data, False, False

    return user_id, None, load_error, False


def count_save_files() -> int:
    try:
        return sum(1 for _ in SAVE_DIR.glob("*.json"))
    except OSError:
        return 0


def _fsync_dir(directory: Path):
    try:
        fd = os.open(directory, os.O_RDONLY)
        try:
            os.fsync(fd)
        finally:
            os.close(fd)
    except OSError:
        pass


def _refresh_bak(path: Path):
    """교체 직전의 본 파일을 .bak 으로 보존 (하드링크라 복사 비용 없음, 실패 시 복사)."""
    bak = _bak_path(path)
    tmp = path.with_name(path.name + ".bak.tmp")
    try:
        try:
            tmp.unlink()
        except FileNotFoundError:
            pass
        os.link(path, tmp)
        os.replace(tmp, bak)
    except OSError:
        shutil.copyfile(path, bak)


_snapshotted: set = set()


def _snapshot(user_id: str, path: Path):
    """서버 실행 후 첫 덮어쓰기 / 슬롯 수 감소 시 이전 세이브를 saves/backups/ 에 보관."""
    try:
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, BACKUP_DIR / f"{user_id}.{time.strftime('%Y%m%d_%H%M%S')}.json")
        for old in sorted(BACKUP_DIR.glob(f"{user_id}.*.json"))[:-MAX_SNAPSHOTS]:
            old.unlink()
    except OSError as exc:
        print(f"[save] 스냅샷 실패 ({user_id[:8]}): {exc}")


def write_user_save(user_id: str, bundle: dict, base_rev: int, writer: str, device_fp: str = "", bound_host: str = ""):
    """사용자별 파일에 원자적으로 저장 (스레드/프로세스 안전).
    반환: ("ok", 새 rev) | ("conflict", 현재 rev) | ("empty", 현재 rev) | ("full", 0)"""
    with get_user_file_lock(user_id):
        path = user_save_path(user_id)
        status, existing = _read_state(path)
        cur_rev, old_slots = 0, []
        existing_fp, existing_host = "", ""
        if status == "ok":
            cur_rev = int(num(existing.get("serverRev"), 0, 0, 1e12))
            existing_fp = str(existing.get("ownerDeviceFp") or "")
            existing_host = str(existing.get("boundHost") or "")
            # 다른 기기가 기존 소유자의 세이브 파일을 덮어쓰려 하면 차단
            if existing_fp and device_fp and existing_fp != device_fp:
                return "conflict", cur_rev
            # 같은 화면(writer)의 재전송은 허용 (응답 유실 후 재시도), 다른 화면이 먼저 저장했다면 거부
            if base_rev != cur_rev and existing.get("lastWriter") != writer:
                return "conflict", cur_rev
            old_slots = existing.get("slots") if isinstance(existing.get("slots"), list) else []
            if not bundle["slots"] and old_slots:
                return "empty", cur_rev
            # 이미 진행도가 저장된 파일을 초기 기본 캐릭터(Lv.1)로 덮어쓰려는 비정상 요청 차단 (명시적 초기화 제외)
            if (bundle_has_progress(existing)
                    and not bundle_has_progress(bundle)
                    and not bundle.get("allowReset")):
                return "conflict", cur_rev
            # 동일 writer에서 지연 도착한 이전 타임스탬프 패킷이 최신 데이터를 덮어쓰지 않도록 보호
            old_ms = int(num(existing.get("savedAtMs"), 0, 0, 1e16))
            new_ms = int(num(bundle.get("savedAtMs"), 0, 0, 1e16))
            if existing.get("lastWriter") == writer and old_ms > 0 and 0 < new_ms < old_ms:
                return "ok", cur_rev
        elif status == "missing":
            if count_save_files() >= MAX_SAVE_FILES:
                return "full", 0
        else:                                              # 손상된 본 파일: 지우지 않고 보관
            keep = path.with_name(f"{path.name}.corrupt_{int(time.time())}")
            try:
                os.replace(path, keep)
                print(f"[save] {user_id[:8]} 손상 파일을 {keep.name} 으로 보관")
            except OSError:
                pass
            bstatus, bdata = _read_state(_bak_path(path))
            if bstatus == "ok":
                cur_rev = int(num(bdata.get("serverRev"), 0, 0, 1e12))
                existing_fp = str(bdata.get("ownerDeviceFp") or "")
                existing_host = str(bdata.get("boundHost") or "")

        new_rev = cur_rev + 1
        data = dict(bundle)
        data.pop("allowReset", None)
        if not data.get("savedAtMs"):
            data["savedAtMs"] = int(time.time() * 1000)
        data["serverRev"] = new_rev
        data["lastWriter"] = writer
        if device_fp or existing_fp:
            data["ownerDeviceFp"] = device_fp or existing_fp
        if bound_host or existing_host:
            data["boundHost"] = bound_host or existing_host
        payload = json.dumps(data, ensure_ascii=False)

        if status == "ok" and (user_id not in _snapshotted or len(bundle["slots"]) < len(old_slots)):
            _snapshot(user_id, path)
            _snapshotted.add(user_id)

        tmp = path.with_name(path.name + ".tmp")
        with open(tmp, "w", encoding="utf-8") as f:
            f.write(payload)
            f.flush()
            os.fsync(f.fileno())
        if status == "ok":
            _refresh_bak(path)
        os.replace(tmp, path)                              # 원자적 교체: 중간에 꺼져도 옛 파일 또는 새 파일만 존재
        _fsync_dir(path.parent)
        return "ok", new_rev


user_locks: dict = {}


def get_user_lock(user_id: str) -> asyncio.Lock:
    """같은 사용자의 저장/불러오기를 한 줄로 세운다 (여러 탭/연결이 동시에 와도 파일이 섞이지 않게)."""
    lock = user_locks.get(user_id)
    if lock is None:
        if len(user_locks) > 1000:
            for uid in [u for u, l in user_locks.items() if not l.locked()]:
                del user_locks[uid]
        lock = user_locks[user_id] = asyncio.Lock()
    return lock


def get_browser_user_id(request_path: str):
    """URL의 user 값을 UUID로 검증해 안전한 파일 이름으로 사용한다."""
    q = parse_qs(urlparse(request_path).query)
    return parse_uuid_str(q.get("user", [""])[0])


def validate_and_extract_save_request(m: dict, raw_len: int):
    save_id = m.get("saveId")
    if not isinstance(save_id, int) or isinstance(save_id, bool):
        save_id = None
    data = m.get("saveData")
    slots = data.get("slots") if isinstance(data, dict) else None
    if (raw_len > MAX_SAVE_BYTES or not isinstance(data, dict) or not valid_save(data)
            or not isinstance(slots, list) or len(slots) > 20
            or any(not isinstance(slot, dict) for slot in slots)):
        return False, save_id, None, 0, "", "세이브 데이터 형식이 올바르지 않습니다"
    base_rev = int(num(m.get("baseRev"), 0, 0, 1e12))
    writer = str(m.get("writer") or "")[:64]
    if not writer:
        return False, save_id, None, 0, "", "저장 요청 정보가 올바르지 않습니다"
    return True, save_id, data, base_rev, writer, ""
