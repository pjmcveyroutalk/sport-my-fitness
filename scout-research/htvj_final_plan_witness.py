#!/usr/bin/env python3
"""Bounded read-only witness for the current 23-account HTvj timing plans."""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import ssl
import time
import urllib.error
import urllib.request
from decimal import Decimal, getcontext
from pathlib import Path
from typing import Any

RPC = "https://api.mainnet-beta.solana.com"
MAX_POLLS = 60
INTERVAL_SECONDS = 1.0
MAX_RESPONSE_BYTES = 16 * 1024 * 1024
CLOCK = "SysvarC1ock11111111111111111111111111111111"
SOL = "So11111111111111111111111111111111111111112"
USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
HTVJ = "HTvjzsfX3yU6BUodCjZ5vZkUrAxMDTrBs3CJaq43ashR"
ORCA = "83v8iPyZihDEjDdY8RdZddyZNyUtXngz69Lgo9Kt5d6d"
FIVE = "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6"

ORCA_GROUP = {
    ORCA,
    "3LmiP7tfyVcccDDjadBSp5ieCk1v4utYbYnfhMDQuZk4",
    "5NMwxeBSECqdzgJWmQkis25KAbwKze8rh1uU4meJNerK",
    "8EYLSX8aKx84QQ9NQaUSYERwHeTLA9zevU87SFQp98x7",
    "ApCYDC3Hycn7Lcnyy1Hs3FxYozExr9TdJ6Cd3bwibdTS",
    "FVLpPDrtzhJnsTnoq22Nsu8XsYK5kwcjb94cgPPtUw6Z",
}
HTVJ_GROUP = {
    HTVJ,
    "2UPShXtS5aW8EspsHLsU6JSncCo1mzffqzzYX9KkCqzk",
    "9HcJeBEsq5px2bYZbdo7vzQWVsPK3SHTkchy42hBn7HC",
    "AwxUrtTCCnq5szwH7D7d2hoiw43uRFktmrNH4jiV4fLE",
    "BQ5kmRybrABBWbXL9545qky232yMVfQ4WrCc5KF3nFow",
    "CD42kAepwuVNJEyd8uSTinhUnJAk7Mo3C1twot3erGHP",
    "DxyNRLdPkPsaV73w6qe9Ytau8siAnzBXfTFaaJD8UegD",
}
FIVE_GROUP = {
    FIVE,
    "2UN8LaNw8X9TLpTdrGxq3TQh8wKsTizY7XkQm3ouvZQD",
    "6MeamjT3xB2symUVrndFiu9bCU375m8vniQEpEwngyLM",
    "DArpuuqJxNLRGQ8xq5ebZbobyjxSWWsPq8MqSZ2fUZLE",
    "DFhnWu6R9mRHqvQPLo57gGfJgZseAj8tbWJAjGVfdb1",
    "GAn12mbdjPtG6PJV2z2sw7hm5wqTGvtkfHVeiCMub2bf",
    "HQH5fsUpWdDtV5m4EaJo6TNcbLq5HxFzYzGXBptgJDD3",
}
STATIC = {SOL, USDC}
KEYS = sorted(ORCA_GROUP | HTVJ_GROUP | FIVE_GROUP | STATIC | {CLOCK})

ORCA_OWNER = "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"
METEORA_OWNER = "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo"
TOKEN_OWNER = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
SYSVAR_OWNER = "Sysvar1111111111111111111111111111111111111"
EXPECTED_OWNER = {key: ORCA_OWNER for key in ORCA_GROUP}
EXPECTED_OWNER.update({key: METEORA_OWNER for key in HTVJ_GROUP | FIVE_GROUP})
EXPECTED_OWNER.update({SOL: TOKEN_OWNER, USDC: TOKEN_OWNER, CLOCK: SYSVAR_OWNER})
EXPECTED_LENGTH = {key: 9988 for key in ORCA_GROUP}
EXPECTED_LENGTH[ORCA] = 653
EXPECTED_LENGTH.update({key: 10136 for key in HTVJ_GROUP | FIVE_GROUP})
EXPECTED_LENGTH.update({HTVJ: 904, FIVE: 904})
EXPECTED_LENGTH.update({
    "9HcJeBEsq5px2bYZbdo7vzQWVsPK3SHTkchy42hBn7HC": 1576,
    "DArpuuqJxNLRGQ8xq5ebZbobyjxSWWsPq8MqSZ2fUZLE": 1576,
    SOL: 82,
    USDC: 82,
    CLOCK: 40,
})
AUTHORITY = {
    "execution_authority": False,
    "transaction_submission_authority": False,
    "signing_authority": False,
    "quote_suppression_authority": False,
    "capital_authority": False,
    "read_only": True,
}
getcontext().prec = 80


def canonical(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"))


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def now_ms() -> int:
    return time.time_ns() // 1_000_000


def append(path: Path, value: dict[str, Any]) -> None:
    with path.open("a", encoding="utf-8") as stream:
        stream.write(canonical(value) + "\n")
        stream.flush()
        os.fsync(stream.fileno())


def decode(value: dict[str, Any]) -> bytes:
    encoded = value.get("data")
    if not isinstance(encoded, list) or len(encoded) != 2 or encoded[1] != "base64":
        raise ValueError("account is not base64 encoded")
    return base64.b64decode(encoded[0], validate=True)


def u16(data: bytes, offset: int) -> int:
    return int.from_bytes(data[offset : offset + 2], "little")


def u32(data: bytes, offset: int) -> int:
    return int.from_bytes(data[offset : offset + 4], "little")


def i32(data: bytes, offset: int) -> int:
    return int.from_bytes(data[offset : offset + 4], "little", signed=True)


def u128(data: bytes, offset: int) -> int:
    return int.from_bytes(data[offset : offset + 16], "little")


def i64(data: bytes, offset: int) -> int:
    return int.from_bytes(data[offset : offset + 8], "little", signed=True)


def meteora(data: bytes) -> dict[str, Any]:
    return {
        "base_factor": u16(data, 8),
        "filter_period": u16(data, 10),
        "decay_period": u16(data, 12),
        "reduction_factor": u16(data, 14),
        "variable_fee_control": u32(data, 16),
        "max_volatility_accumulator": u32(data, 20),
        "protocol_share": u16(data, 32),
        "base_fee_power_factor": data[34],
        "collect_fee_mode": data[36],
        "volatility_accumulator": u32(data, 40),
        "volatility_reference": u32(data, 44),
        "index_reference": i32(data, 48),
        "last_update_timestamp": i64(data, 56),
        "active_id": i32(data, 76),
        "bin_step": u16(data, 80),
    }


def orca(data: bytes) -> dict[str, Any]:
    return {
        "tick_spacing": u16(data, 41),
        "fee_tier_index_seed": u16(data, 43),
        "fee_rate": u16(data, 45),
        "protocol_fee_rate": u16(data, 47),
        "liquidity": u128(data, 49),
        "sqrt_price_q64": u128(data, 65),
        "tick_current_index": i32(data, 81),
    }


def bps(previous: dict[str, Any], current: dict[str, Any], venue: str) -> str:
    if venue == "orca":
        old, new = Decimal(previous["sqrt_price_q64"]), Decimal(current["sqrt_price_q64"])
        return str(((new * new) / (old * old) - Decimal(1)) * Decimal(10_000))
    step = int(current["bin_step"])
    delta = int(current["active_id"]) - int(previous["active_id"])
    return str((((Decimal(1) + Decimal(step) / Decimal(10_000)) ** delta) - Decimal(1)) * Decimal(10_000))


def change_class(changed: set[str], primary: set[str]) -> str:
    primary_changed = bool(changed & primary)
    htvj_changed = bool(changed & HTVJ_GROUP)
    if primary_changed and htvj_changed:
        return "both_legs_changed"
    if primary_changed:
        return "primary_only"
    if htvj_changed:
        return "htvj_only"
    if changed & STATIC:
        return "mint_state_changed"
    return "unchanged"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=False)
    rpc_log = out / "watch-rpc.jsonl"
    obs_log = out / "watch-observations.jsonl"
    (out / "authority.json").write_text(json.dumps(AUTHORITY, indent=2, sort_keys=True) + "\n")
    (out / "contract.json").write_text(json.dumps({
        "schema": "scout_htvj_current_final_plan_witness_contract_v1",
        "rpc_endpoint": RPC,
        "commitment": "confirmed",
        "account_count": len(KEYS),
        "max_polls": MAX_POLLS,
        "target_interval_ms": 1000,
        "max_response_bytes": MAX_RESPONSE_BYTES,
        "automatic_retries": 0,
        "htvj_orca_plan_accounts": len(ORCA_GROUP | HTVJ_GROUP | STATIC | {CLOCK}),
        "five_htvj_plan_accounts": len(FIVE_GROUP | HTVJ_GROUP | STATIC | {CLOCK}),
        **AUTHORITY,
    }, indent=2, sort_keys=True) + "\n")

    opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ssl.create_default_context()))
    previous: dict[str, str] | None = None
    previous_primary: dict[str, dict[str, Any]] | None = None
    min_slot = 1
    valid = 0
    invalid = 0
    distinct: set[str] = set()
    counts: dict[str, int] = {}
    started = time.monotonic()
    prior_start: float | None = None

    for poll in range(1, MAX_POLLS + 1):
        if prior_start is not None:
            target = prior_start + INTERVAL_SECONDS
            if target > time.monotonic():
                time.sleep(target - time.monotonic())
        prior_start = time.monotonic()
        request_value = {
            "jsonrpc": "2.0",
            "id": poll,
            "method": "getMultipleAccounts",
            "params": [KEYS, {"encoding": "base64", "commitment": "confirmed", "minContextSlot": max(1, min_slot)}],
        }
        body = canonical(request_value).encode()
        begin = now_ms()
        append(rpc_log, {
            "kind": "scout_htvj_final_plan_rpc_request_v1",
            "poll": poll,
            "endpoint": RPC,
            "request_body": body.decode(),
            "request_sha256": sha(body),
            "started_at_unix_ms": begin,
            **AUTHORITY,
        })
        raw = b""
        status: int | None = None
        error: str | None = None
        complete = False
        try:
            request = urllib.request.Request(RPC, data=body, headers={
                "Content-Type": "application/json",
                "User-Agent": "Scout-HTvj-Final-Plan-Witness/1",
            }, method="POST")
            with opener.open(request, timeout=30) as response:
                status = int(response.status)
                raw = response.read(MAX_RESPONSE_BYTES + 1)
                complete = len(raw) <= MAX_RESPONSE_BYTES
                if not complete:
                    raw = raw[:MAX_RESPONSE_BYTES]
                    error = "response exceeded 16 MiB"
        except urllib.error.HTTPError as exc:
            status = int(exc.code)
            raw = exc.read(MAX_RESPONSE_BYTES + 1)[:MAX_RESPONSE_BYTES]
            complete = True
            error = f"HTTP {exc.code}: {exc.reason}"
        except Exception as exc:
            error = f"{type(exc).__name__}: {exc}"
        end = now_ms()
        append(rpc_log, {
            "kind": "scout_htvj_final_plan_rpc_response_v1",
            "poll": poll,
            "http_status": status,
            "response_body_base64": base64.b64encode(raw).decode(),
            "response_sha256": sha(raw) if raw else None,
            "body_complete": complete,
            "error": error,
            "finished_at_unix_ms": end,
            **AUTHORITY,
        })
        observation: dict[str, Any] = {
            "kind": "scout_htvj_final_plan_observation_v1",
            "poll": poll,
            "valid": False,
            "slot": None,
            "started_at_unix_ms": begin,
            "finished_at_unix_ms": end,
            "error": error,
            **AUTHORITY,
        }
        if error is not None or status != 200 or not complete:
            invalid += 1
            append(obs_log, observation)
            continue
        try:
            payload = json.loads(raw)
            if payload.get("id") != poll or "error" in payload:
                raise ValueError(f"RPC identity/error mismatch: {payload.get('error')}")
            slot = payload["result"]["context"]["slot"]
            values = payload["result"]["value"]
            if not isinstance(slot, int) or slot < min_slot:
                raise ValueError("slot regressed")
            if not isinstance(values, list) or len(values) != len(KEYS):
                raise ValueError("account count mismatch")
            fingerprints: dict[str, str] = {}
            primary: dict[str, dict[str, Any]] = {}
            account_meta: dict[str, dict[str, Any]] = {}
            for key, value in zip(KEYS, values):
                if not isinstance(value, dict):
                    raise ValueError(f"missing account {key}")
                if value.get("owner") != EXPECTED_OWNER[key]:
                    raise ValueError(f"owner mismatch for {key}: {value.get('owner')}")
                if value.get("executable") is not False:
                    raise ValueError(f"unexpected executable account {key}")
                data = decode(value)
                if len(data) != EXPECTED_LENGTH[key]:
                    raise ValueError(f"length mismatch for {key}: {len(data)} != {EXPECTED_LENGTH[key]}")
                fingerprints[key] = sha(canonical(value).encode())
                account_meta[key] = {"owner": value["owner"], "space": len(data), "fingerprint": fingerprints[key]}
                if key in (HTVJ, FIVE):
                    primary[key] = meteora(data)
                elif key == ORCA:
                    primary[key] = orca(data)
            state = sha("|".join(f"{key}:{fingerprints[key]}" for key in KEYS if key != CLOCK).encode())
            distinct.add(state)
            changed = set() if previous is None else {key for key in KEYS if key != CLOCK and fingerprints[key] != previous[key]}
            classes = {"htvj_orca": "baseline", "5rcf_htvj": "baseline"} if previous is None else {
                "htvj_orca": change_class(changed, ORCA_GROUP),
                "5rcf_htvj": change_class(changed, FIVE_GROUP),
            }
            for item in classes.values():
                counts[item] = counts.get(item, 0) + 1
            moves = {"orca_bps": None, "htvj_bps": None, "5rcf_bps": None}
            if previous_primary is not None:
                moves = {
                    "orca_bps": bps(previous_primary[ORCA], primary[ORCA], "orca"),
                    "htvj_bps": bps(previous_primary[HTVJ], primary[HTVJ], "meteora"),
                    "5rcf_bps": bps(previous_primary[FIVE], primary[FIVE], "meteora"),
                }
            observation.update({
                "valid": True,
                "slot": slot,
                "error": None,
                "state_fingerprint": state,
                "changed_accounts": sorted(changed),
                "change_classes": classes,
                "primary_price_moves_bps_from_previous": moves,
                "decoded_primary_state": {"htvj": primary[HTVJ], "orca_83v8": primary[ORCA], "meteora_5rcf": primary[FIVE]},
                "account_meta": account_meta,
            })
            append(obs_log, observation)
            valid += 1
            min_slot = slot
            previous = fingerprints
            previous_primary = primary
        except Exception as exc:
            observation["error"] = f"validation: {type(exc).__name__}: {exc}"
            invalid += 1
            append(obs_log, observation)

    summary = {
        "schema": "scout_htvj_current_final_plan_witness_summary_v1",
        "request_starts": MAX_POLLS,
        "valid_polls": valid,
        "missing_or_invalid_polls": invalid,
        "distinct_non_clock_states": len(distinct),
        "change_class_counts": counts,
        "last_confirmed_slot": min_slot if valid else None,
        "elapsed_ms": int((time.monotonic() - started) * 1000),
        "economic_quotes_computed": False,
        "interpretation_boundary": "Coherent final-plan account state only; exact economics are computed separately by the retained private Scout binary.",
        **AUTHORITY,
    }
    (out / "summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n")
    print(json.dumps(summary, sort_keys=True))
    return 0 if valid else 2


if __name__ == "__main__":
    raise SystemExit(main())
