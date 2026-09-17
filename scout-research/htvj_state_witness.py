#!/usr/bin/env python3
"""Bounded, read-only HTvj/Orca/5rCf state witness.

This public witness captures coherent confirmed account state only. It does not
quote, construct transactions, sign, submit, suppress quotes, or control capital.
"""
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
TARGET_INTERVAL_SECONDS = 1.0
MAX_RESPONSE_BYTES = 16 * 1024 * 1024
CLOCK = "SysvarC1ock11111111111111111111111111111111"
HTVJ = "HTvjzsfX3yU6BUodCjZ5vZkUrAxMDTrBs3CJaq43ashR"
ORCA = "83v8iPyZihDEjDdY8RdZddyZNyUtXngz69Lgo9Kt5d6d"
FIVE_RCF = "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6"

KEYS = [
    "2UN8LaNw8X9TLpTdrGxq3TQh8wKsTizY7XkQm3ouvZQD",
    "2yYG3cxhA78H3LnmMpiCWdPWrFiCTMQ5RHArcZz2iSr7",
    "5NMwxeBSECqdzgJWmQkis25KAbwKze8rh1uU4meJNerK",
    "5RAj7jvQBhUS7Y9H2RVgPDGU6RhBDL61zNaZ7aWF97S9",
    FIVE_RCF,
    "7zcQSpDwJF5eFXSynU83EtTviWdDanj9k44zveRC4an6",
    ORCA,
    "8EYLSX8aKx84QQ9NQaUSYERwHeTLA9zevU87SFQp98x7",
    "8uhYx1unfNvVBW2YxEigejD3DxZKqiketJk5hmc9Jcp",
    "9HcJeBEsq5px2bYZbdo7vzQWVsPK3SHTkchy42hBn7HC",
    "ABox2k78YRLkTguhy8h8Hk7xkTxCzcgXXZSxKkxKyuCo",
    "AtfarDBg48tEo63Lo99Sagk5gGEeC5PcFoKi7wNW8NBp",
    "AupwQXRKt8bSnhr4FcpFWveTU5VqcG2ttosA3Xpy3aoK",
    "BQ5kmRybrABBWbXL9545qky232yMVfQ4WrCc5KF3nFow",
    "CD42kAepwuVNJEyd8uSTinhUnJAk7Mo3C1twot3erGHP",
    "DArpuuqJxNLRGQ8xq5ebZbobyjxSWWsPq8MqSZ2fUZLE",
    "DFhnWu6R9mRHqvQPLo57gGfFJgZseAj8tbWJAjGVfdb1",
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "GAn12mbdjPtG6PJV2z2sw7hm5wqTGvtkfHVeiCMub2bf",
    "HQH5fsUpWdDtV5m4EaJo6TNcbLq5HxFzYzGXBptgJDD3",
    HTVJ,
    "So11111111111111111111111111111111111111112",
    CLOCK,
]

EXPECTED_LENGTHS = {
    "2UN8LaNw8X9TLpTdrGxq3TQh8wKsTizY7XkQm3ouvZQD": 10136,
    "2yYG3cxhA78H3LnmMpiCWdPWrFiCTMQ5RHArcZz2iSr7": 10136,
    "5NMwxeBSECqdzgJWmQkis25KAbwKze8rh1uU4meJNerK": 9988,
    "5RAj7jvQBhUS7Y9H2RVgPDGU6RhBDL61zNaZ7aWF97S9": 10136,
    FIVE_RCF: 904,
    "7zcQSpDwJF5eFXSynU83EtTviWdDanj9k44zveRC4an6": 9988,
    ORCA: 653,
    "8EYLSX8aKx84QQ9NQaUSYERwHeTLA9zevU87SFQp98x7": 9988,
    "8uhYx1unfNvVBW2YxEigejD3DxZKqiketJk5hmc9Jcp": 10136,
    "9HcJeBEsq5px2bYZbdo7vzQWVsPK3SHTkchy42hBn7HC": 1576,
    "ABox2k78YRLkTguhy8h8Hk7xkTxCzcgXXZSxKkxKyuCo": 10136,
    "AtfarDBg48tEo63Lo99Sagk5gGEeC5PcFoKi7wNW8NBp": 9988,
    "AupwQXRKt8bSnhr4FcpFWveTU5VqcG2ttosA3Xpy3aoK": 9988,
    "BQ5kmRybrABBWbXL9545qky232yMVfQ4WrCc5KF3nFow": 10136,
    "CD42kAepwuVNJEyd8uSTinhUnJAk7Mo3C1twot3erGHP": 10136,
    "DArpuuqJxNLRGQ8xq5ebZbobyjxSWWsPq8MqSZ2fUZLE": 1576,
    "DFhnWu6R9mRHqvQPLo57gGfFJgZseAj8tbWJAjGVfdb1": 10136,
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": 82,
    "GAn12mbdjPtG6PJV2z2sw7hm5wqTGvtkfHVeiCMub2bf": 10136,
    "HQH5fsUpWdDtV5m4EaJo6TNcbLq5HxFzYzGXBptgJDD3": 10136,
    HTVJ: 904,
    "So11111111111111111111111111111111111111112": 82,
    CLOCK: 40,
}

METEORA_OWNER = "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo"
ORCA_OWNER = "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"
TOKEN_OWNER = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
SYSVAR_OWNER = "Sysvar1111111111111111111111111111111111111"
EXPECTED_OWNERS = {key: METEORA_OWNER for key in KEYS}
for key in [
    "5NMwxeBSECqdzgJWmQkis25KAbwKze8rh1uU4meJNerK",
    "7zcQSpDwJF5eFXSynU83EtTviWdDanj9k44zveRC4an6",
    ORCA,
    "8EYLSX8aKx84QQ9NQaUSYERwHeTLA9zevU87SFQp98x7",
    "AtfarDBg48tEo63Lo99Sagk5gGEeC5PcFoKi7wNW8NBp",
    "AupwQXRKt8bSnhr4FcpFWveTU5VqcG2ttosA3Xpy3aoK",
]:
    EXPECTED_OWNERS[key] = ORCA_OWNER
for key in [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "So11111111111111111111111111111111111111112",
]:
    EXPECTED_OWNERS[key] = TOKEN_OWNER
EXPECTED_OWNERS[CLOCK] = SYSVAR_OWNER

HTVJ_GROUP = {
    "2yYG3cxhA78H3LnmMpiCWdPWrFiCTMQ5RHArcZz2iSr7",
    "5RAj7jvQBhUS7Y9H2RVgPDGU6RhBDL61zNaZ7aWF97S9",
    "8uhYx1unfNvVBW2YxEigejD3DxZKqiketJk5hmc9Jcp",
    "9HcJeBEsq5px2bYZbdo7vzQWVsPK3SHTkchy42hBn7HC",
    "BQ5kmRybrABBWbXL9545qky232yMVfQ4WrCc5KF3nFow",
    "CD42kAepwuVNJEyd8uSTinhUnJAk7Mo3C1twot3erGHP",
    HTVJ,
}
ORCA_GROUP = {
    "5NMwxeBSECqdzgJWmQkis25KAbwKze8rh1uU4meJNerK",
    "7zcQSpDwJF5eFXSynU83EtTviWdDanj9k44zveRC4an6",
    ORCA,
    "8EYLSX8aKx84QQ9NQaUSYERwHeTLA9zevU87SFQp98x7",
    "AtfarDBg48tEo63Lo99Sagk5gGEeC5PcFoKi7wNW8NBp",
    "AupwQXRKt8bSnhr4FcpFWveTU5VqcG2ttosA3Xpy3aoK",
}
FIVE_RCF_GROUP = {
    "2UN8LaNw8X9TLpTdrGxq3TQh8wKsTizY7XkQm3ouvZQD",
    FIVE_RCF,
    "ABox2k78YRLkTguhy8h8Hk7xkTxCzcgXXZSxKkxKyuCo",
    "DArpuuqJxNLRGQ8xq5ebZbobyjxSWWsPq8MqSZ2fUZLE",
    "DFhnWu6R9mRHqvQPLo57gGfFJgZseAj8tbWJAjGVfdb1",
    "GAn12mbdjPtG6PJV2z2sw7hm5wqTGvtkfHVeiCMub2bf",
    "HQH5fsUpWdDtV5m4EaJo6TNcbLq5HxFzYzGXBptgJDD3",
}
STATIC_GROUP = {
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "So11111111111111111111111111111111111111112",
}

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


def now_ms() -> int:
    return time.time_ns() // 1_000_000


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def emit(path: Path, value: dict[str, Any]) -> None:
    with path.open("a", encoding="utf-8") as stream:
        stream.write(canonical(value) + "\n")
        stream.flush()
        os.fsync(stream.fileno())


def account_fingerprint(value: dict[str, Any]) -> str:
    return sha256_bytes(canonical(value).encode("utf-8"))


def decode_account(value: dict[str, Any]) -> bytes:
    data = value.get("data")
    if not isinstance(data, list) or len(data) != 2 or data[1] != "base64":
        raise ValueError("account encoding is not base64")
    return base64.b64decode(data[0], validate=True)


def u16(data: bytes, offset: int) -> int:
    return int.from_bytes(data[offset : offset + 2], "little", signed=False)


def u32(data: bytes, offset: int) -> int:
    return int.from_bytes(data[offset : offset + 4], "little", signed=False)


def i32(data: bytes, offset: int) -> int:
    return int.from_bytes(data[offset : offset + 4], "little", signed=True)


def u128(data: bytes, offset: int) -> int:
    return int.from_bytes(data[offset : offset + 16], "little", signed=False)


def i64(data: bytes, offset: int) -> int:
    return int.from_bytes(data[offset : offset + 8], "little", signed=True)


def decode_meteora(data: bytes) -> dict[str, Any]:
    if len(data) != 904:
        raise ValueError(f"Meteora pool length {len(data)} != 904")
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


def decode_orca(data: bytes) -> dict[str, Any]:
    if len(data) != 653:
        raise ValueError(f"Orca Whirlpool length {len(data)} != 653")
    return {
        "tick_spacing": u16(data, 41),
        "fee_tier_index_seed": u16(data, 43),
        "fee_rate": u16(data, 45),
        "protocol_fee_rate": u16(data, 47),
        "liquidity": u128(data, 49),
        "sqrt_price_q64": u128(data, 65),
        "tick_current_index": i32(data, 81),
    }


def price_move_bps(previous: dict[str, Any], current: dict[str, Any], venue: str) -> str | None:
    try:
        if venue == "orca":
            old = Decimal(previous["sqrt_price_q64"])
            new = Decimal(current["sqrt_price_q64"])
            return str(((new * new) / (old * old) - Decimal(1)) * Decimal(10_000))
        step = int(current["bin_step"])
        if int(previous["bin_step"]) != step:
            return None
        delta = int(current["active_id"]) - int(previous["active_id"])
        ratio = (Decimal(1) + Decimal(step) / Decimal(10_000)) ** delta
        return str((ratio - Decimal(1)) * Decimal(10_000))
    except Exception:
        return None


def classify(changed: set[str], primary: set[str]) -> str:
    if changed & STATIC_GROUP:
        return "static_identity_changed"
    primary_changed = bool(changed & primary)
    htvj_changed = bool(changed & HTVJ_GROUP)
    if primary_changed and htvj_changed:
        return "both_legs_changed"
    if primary_changed:
        return "primary_only"
    if htvj_changed:
        return "htvj_only"
    return "unchanged"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=False)
    rpc_path = out / "watch-rpc.jsonl"
    obs_path = out / "watch-observations.jsonl"
    (out / "authority.json").write_text(json.dumps(AUTHORITY, indent=2, sort_keys=True) + "\n")
    (out / "contract.json").write_text(json.dumps({
        "schema": "scout_htvj_public_state_witness_contract_v1",
        "rpc_endpoint": RPC,
        "commitment": "confirmed",
        "account_count": len(KEYS),
        "max_polls": MAX_POLLS,
        "target_interval_ms": int(TARGET_INTERVAL_SECONDS * 1000),
        "max_response_bytes": MAX_RESPONSE_BYTES,
        "automatic_retries": 0,
        **AUTHORITY,
    }, indent=2, sort_keys=True) + "\n")

    opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ssl.create_default_context()))
    previous_fingerprints: dict[str, str] | None = None
    previous_decoded: dict[str, dict[str, Any]] | None = None
    previous_slot = 1
    valid_polls = 0
    missing_polls = 0
    distinct_states: set[str] = set()
    change_counts: dict[str, int] = {}
    started_mono = time.monotonic()
    last_start: float | None = None

    for poll in range(1, MAX_POLLS + 1):
        if last_start is not None:
            target = last_start + TARGET_INTERVAL_SECONDS
            if target > time.monotonic():
                time.sleep(target - time.monotonic())
        last_start = time.monotonic()
        request_value = {
            "jsonrpc": "2.0",
            "id": poll,
            "method": "getMultipleAccounts",
            "params": [KEYS, {
                "encoding": "base64",
                "commitment": "confirmed",
                "minContextSlot": max(1, previous_slot),
            }],
        }
        request_body = canonical(request_value).encode("utf-8")
        request_started = now_ms()
        emit(rpc_path, {
            "kind": "scout_htvj_public_rpc_request_v1",
            "poll": poll,
            "endpoint": RPC,
            "request_body": request_body.decode("utf-8"),
            "request_sha256": sha256_bytes(request_body),
            "started_at_unix_ms": request_started,
            **AUTHORITY,
        })

        status: int | None = None
        raw = b""
        error: str | None = None
        complete = False
        try:
            request = urllib.request.Request(
                RPC,
                data=request_body,
                headers={"Content-Type": "application/json", "User-Agent": "Scout-HTvj-Public-State-Witness/1"},
                method="POST",
            )
            with opener.open(request, timeout=30) as response:
                status = int(response.status)
                raw = response.read(MAX_RESPONSE_BYTES + 1)
                complete = len(raw) <= MAX_RESPONSE_BYTES
                if not complete:
                    raw = raw[:MAX_RESPONSE_BYTES]
                    error = "response exceeded 16 MiB; retained bounded prefix"
        except urllib.error.HTTPError as exc:
            status = int(exc.code)
            raw = exc.read(MAX_RESPONSE_BYTES + 1)[:MAX_RESPONSE_BYTES]
            complete = True
            error = f"HTTP {exc.code}: {exc.reason}"
        except Exception as exc:
            error = f"{type(exc).__name__}: {exc}"
        request_finished = now_ms()
        emit(rpc_path, {
            "kind": "scout_htvj_public_rpc_response_v1",
            "poll": poll,
            "http_status": status,
            "response_body_base64": base64.b64encode(raw).decode("ascii"),
            "response_sha256": sha256_bytes(raw) if raw else None,
            "body_complete": complete,
            "error": error,
            "finished_at_unix_ms": request_finished,
            **AUTHORITY,
        })

        observation: dict[str, Any] = {
            "kind": "scout_htvj_public_observation_v1",
            "poll": poll,
            "valid": False,
            "slot": None,
            "started_at_unix_ms": request_started,
            "finished_at_unix_ms": request_finished,
            "error": error,
            **AUTHORITY,
        }
        if error is not None or status != 200 or not complete:
            missing_polls += 1
            emit(obs_path, observation)
            continue

        try:
            payload = json.loads(raw)
            if payload.get("jsonrpc") != "2.0" or payload.get("id") != poll or "error" in payload:
                raise ValueError(f"RPC identity/error mismatch: {payload.get('error')}")
            slot = payload["result"]["context"]["slot"]
            values = payload["result"]["value"]
            if not isinstance(slot, int) or slot < max(1, previous_slot):
                raise ValueError("context slot regressed below minContextSlot")
            if not isinstance(values, list) or len(values) != len(KEYS):
                raise ValueError("account count mismatch")

            fingerprints: dict[str, str] = {}
            decoded: dict[str, dict[str, Any]] = {}
            for key, value in zip(KEYS, values):
                if not isinstance(value, dict):
                    raise ValueError(f"missing account {key}")
                if value.get("executable") is not False:
                    raise ValueError(f"unexpected executable account {key}")
                if value.get("owner") != EXPECTED_OWNERS[key]:
                    raise ValueError(f"owner changed for {key}")
                data = decode_account(value)
                if len(data) != EXPECTED_LENGTHS[key]:
                    raise ValueError(f"length changed for {key}: {len(data)}")
                fingerprints[key] = account_fingerprint(value)
                if key in (HTVJ, FIVE_RCF):
                    decoded[key] = decode_meteora(data)
                elif key == ORCA:
                    decoded[key] = decode_orca(data)

            full_fp = sha256_bytes("|".join(f"{key}:{fingerprints[key]}" for key in KEYS if key != CLOCK).encode())
            distinct_states.add(full_fp)
            changed = set() if previous_fingerprints is None else {
                key for key in KEYS if key != CLOCK and fingerprints[key] != previous_fingerprints.get(key)
            }
            if previous_fingerprints is None:
                classes = {"htvj_orca": "baseline", "5rcf_htvj": "baseline"}
            else:
                classes = {
                    "htvj_orca": classify(changed, ORCA_GROUP),
                    "5rcf_htvj": classify(changed, FIVE_RCF_GROUP),
                }
            for value in classes.values():
                change_counts[value] = change_counts.get(value, 0) + 1

            moves: dict[str, str | None] = {"orca_bps": None, "htvj_bps": None, "5rcf_bps": None}
            if previous_decoded is not None:
                moves = {
                    "orca_bps": price_move_bps(previous_decoded[ORCA], decoded[ORCA], "orca"),
                    "htvj_bps": price_move_bps(previous_decoded[HTVJ], decoded[HTVJ], "meteora"),
                    "5rcf_bps": price_move_bps(previous_decoded[FIVE_RCF], decoded[FIVE_RCF], "meteora"),
                }

            observation.update({
                "valid": True,
                "slot": slot,
                "error": None,
                "state_fingerprint": full_fp,
                "changed_accounts": sorted(changed),
                "change_classes": classes,
                "decoded_primary_state": {
                    "htvj": decoded[HTVJ],
                    "orca_83v8": decoded[ORCA],
                    "meteora_5rcf": decoded[FIVE_RCF],
                },
                "primary_price_moves_bps_from_previous": moves,
            })
            emit(obs_path, observation)
            valid_polls += 1
            previous_slot = slot
            previous_fingerprints = fingerprints
            previous_decoded = decoded
        except Exception as exc:
            observation["error"] = f"validation: {type(exc).__name__}: {exc}"
            missing_polls += 1
            emit(obs_path, observation)

    elapsed_ms = int((time.monotonic() - started_mono) * 1000)
    summary = {
        "schema": "scout_htvj_public_state_witness_summary_v1",
        "request_starts": MAX_POLLS,
        "valid_polls": valid_polls,
        "missing_or_invalid_polls": missing_polls,
        "distinct_non_clock_states": len(distinct_states),
        "change_class_counts": change_counts,
        "last_confirmed_slot": previous_slot if valid_polls else None,
        "elapsed_ms": elapsed_ms,
        "economic_quotes_computed": False,
        "interpretation_boundary": "Raw coherent state and timing evidence only; exact economics are computed separately by the retained private Scout binary.",
        **AUTHORITY,
    }
    (out / "summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n")
    print(json.dumps(summary, sort_keys=True))
    return 0 if valid_polls > 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
