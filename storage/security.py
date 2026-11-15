# -*- coding: utf-8 -*-
"""[storage/security.py] 라즈베리 파이 4 백엔드 - ESP32 기기 토큰(auth.json), Origin 검증, 브루트포스 방지 및 속도 제한 모듈"""
import hmac
import json
import os
import secrets
import time
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent.parent
AUTH_PATH = HERE / "auth.json"
LOCK_AFTER_FAILS, LOCK_SECONDS, FAIL_WINDOW = 5, 60, 60


def load_or_create_auth():
    """ESP32 기기 토큰. 환경변수 > auth.json > 새로 생성(파일 권한 600).
    auth.json 에 유효한 토큰이 있으면 파일을 수정하지 않는다."""
    data = {}
    try:
        data = json.loads(AUTH_PATH.read_text(encoding="utf-8"))
    except Exception:
        pass
    if not isinstance(data, dict):
        data = {}
    env = os.environ.get("AETHER_DEVICE_TOKEN")
    if env:
        return env
    token = data.get("device_token")
    if isinstance(token, str) and len(token) >= 8:
        return token
    data = {"device_token": secrets.token_urlsafe(12)}
    fd = os.open(AUTH_PATH, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(data, f)
    return data["device_token"]


DEVICE_TOKEN = load_or_create_auth()


def same_secret(given: str, expected: str) -> bool:
    return hmac.compare_digest(given.encode("utf-8", "ignore"), expected.encode("utf-8"))


class FailGuard:
    """인증 실패가 반복되는 IP를 잠시 차단."""
    def __init__(self):
        self.fails = {}      # ip -> (횟수, 첫 실패 시각)
        self.blocked = {}    # ip -> 차단 해제 시각

    def is_blocked(self, ip):
        until = self.blocked.get(ip)
        if until and time.monotonic() < until:
            return True
        self.blocked.pop(ip, None)
        return False

    def record(self, ip):
        now = time.monotonic()
        cnt, first = self.fails.get(ip, (0, now))
        if now - first > FAIL_WINDOW:
            cnt, first = 0, now
        cnt += 1
        self.fails[ip] = (cnt, first)
        if cnt >= LOCK_AFTER_FAILS:
            self.blocked[ip] = now + LOCK_SECONDS
            self.fails.pop(ip, None)
            print(f"[보안] {ip} 인증 {LOCK_AFTER_FAILS}회 실패 -> {LOCK_SECONDS}초 차단")


guard = FailGuard()


class RateLimiter:
    """1초 단위 메시지 수 제한."""
    def __init__(self, per_sec):
        self.per_sec, self.win, self.count = per_sec, time.monotonic(), 0

    def allow(self):
        now = time.monotonic()
        if now - self.win >= 1.0:
            self.win, self.count = now, 0
        self.count += 1
        return self.count <= self.per_sec


def is_same_origin(origin: str | None, host_header: str) -> bool:
    """WebSocket / HTTP 요청의 Origin 헤더가 현재 호스트와 일치하는지 검사.
    cloudflared tunnel --url http://localhost:8081 사용 시 Host 헤더가 localhost로 변환되어
    들어오므로 trycloudflare.com 및 사설망(192.168.*, 10.*, 172.*) Origin을 안전하게 허용."""
    if not origin or origin == "null":
        return True
    orig_host = (urlparse(origin).hostname or "").lower()
    req_host = (urlparse("//" + (host_header or "")).hostname or "").lower()
    local_hosts = {"127.0.0.1", "localhost", "::1", "0.0.0.0"}
    if orig_host in local_hosts and req_host in local_hosts:
        return True
    if orig_host and orig_host == req_host:
        return True
    if req_host in local_hosts or orig_host in local_hosts:
        if (
            orig_host.endswith(".trycloudflare.com")
            or orig_host in local_hosts
            or orig_host.startswith("192.168.")
            or orig_host.startswith("10.")
            or orig_host.startswith("172.")
        ):
            return True
    if orig_host.endswith(".trycloudflare.com") and req_host.endswith(".trycloudflare.com"):
        return True
    return False
