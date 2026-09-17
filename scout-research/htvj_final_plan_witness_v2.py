#!/usr/bin/env python3
"""Correct one frozen 5rCf bin-array address, then run the bounded v1 witness."""
from __future__ import annotations

import importlib.util
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("htvj_final_plan_witness.py")
SPEC = importlib.util.spec_from_file_location("htvj_final_plan_witness_v1", MODULE_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"could not load {MODULE_PATH}")
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)

WRONG = "DFhnWu6R9mRHqvQPLo57gGfJgZseAj8tbWJAjGVfdb1"
RIGHT = "DFhnWu6R9mRHqvQPLo57gGfFJgZseAj8tbWJAjGVfdb1"
if WRONG not in module.FIVE_GROUP or RIGHT in module.FIVE_GROUP:
    raise RuntimeError("unexpected v1 five-pool account set; refusing silent mutation")

module.FIVE_GROUP.remove(WRONG)
module.FIVE_GROUP.add(RIGHT)
module.KEYS = sorted(module.ORCA_GROUP | module.HTVJ_GROUP | module.FIVE_GROUP | module.STATIC | {module.CLOCK})
module.EXPECTED_OWNER.pop(WRONG)
module.EXPECTED_OWNER[RIGHT] = module.METEORA_OWNER
module.EXPECTED_LENGTH.pop(WRONG)
module.EXPECTED_LENGTH[RIGHT] = 10136

if __name__ == "__main__":
    raise SystemExit(module.main())
