
import copy
import datetime
import hashlib
import json
from typing import Any, Dict, List, Optional, Tuple


class ForensicBlock:
    def __init__(
        self,
        block_index: int,
        timestamp: str,
        session_id: str,
        action_summary: str,
        previous_hash: str,
        details: Optional[Dict[str, Any]] = None,
        current_hash: Optional[str] = None,
    ):
        self.block_index = block_index
        self.timestamp = timestamp
        self.session_id = session_id
        self.action_summary = action_summary
        self.previous_hash = previous_hash
        self.details = details or {}
        self.current_hash = current_hash or self.compute_hash()

    def compute_hash(self) -> str:
        """
        Computes SHA-256 digest over standard concatenated string:
        Index + Timestamp + SessionID + ActionSummary + PreviousHash
        """
        raw_string = f"{self.block_index}|{self.timestamp}|{self.session_id}|{self.action_summary}|{self.previous_hash}"
        return hashlib.sha256(raw_string.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "block_index": self.block_index,
            "timestamp": self.timestamp,
            "session_id": self.session_id,
            "action_summary": self.action_summary,
            "previous_hash": self.previous_hash,
            "current_hash": self.current_hash,
            "details": self.details,
        }


class ForensicLedger:
    _instance: Optional["ForensicLedger"] = None

    def __init__(self):
        self.chain: List[ForensicBlock] = []
        self._verified_snapshot: List[ForensicBlock] = []
        self.init_genesis()

    @classmethod
    def get_instance(cls) -> "ForensicLedger":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def init_genesis(self) -> None:
        """
        Initializes Genesis Block #0 signed by PUSSIBERAD Security Gateway.
        """
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        genesis_prev = "0000000000000000000000000000000000000000000000000000000000000000"
        genesis_block = ForensicBlock(
            block_index=0,
            timestamp=now,
            session_id="SYSTEM_CORE",
            action_summary="GENESIS_BLOCK: CAKRA-DECOY 2.0 FORENSIC CHAIN INITIALIZED",
            previous_hash=genesis_prev,
            details={"operator": "PUSSIBERAD_ROOT_ORCHESTRATOR", "clearance": "RESTRICTED_CHAIN"},
        )
        self.chain = [genesis_block]
        self._save_snapshot()

    def add_block(
        self,
        session_id: str,
        action_summary: str,
        details: Optional[Dict[str, Any]] = None,
        custom_timestamp: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Appends a new immutable action block linked to the previous block's SHA-256 hash.
        """
        timestamp = custom_timestamp or datetime.datetime.now(datetime.timezone.utc).isoformat()
        prev_block = self.chain[-1]
        new_index = len(self.chain)

        new_block = ForensicBlock(
            block_index=new_index,
            timestamp=timestamp,
            session_id=session_id,
            action_summary=action_summary,
            previous_hash=prev_block.current_hash,
            details=details or {},
        )
        self.chain.append(new_block)
        self._save_snapshot()
        return self.get_latest_block_envelope()

    def verify_chain(self) -> Tuple[bool, Optional[int], str]:
        """
        Verifies the full cryptographic hash-chain from Genesis to tip.
        Returns:
            (True, None, "VALID_IMMUTABLE") if intact.
            (False, tampered_block_index, "TAMPERED_CRITICAL") if corrupted.
        """
        if not self.chain:
            return False, 0, "TAMPERED_CRITICAL"

        for i in range(len(self.chain)):
            current = self.chain[i]
            # Check recalculation of own hash
            recomputed = current.compute_hash()
            if current.current_hash != recomputed:
                return False, i, "TAMPERED_CRITICAL"

            # Check link to previous block
            if i > 0:
                prev = self.chain[i - 1]
                if current.previous_hash != prev.current_hash:
                    return False, i, "TAMPERED_CRITICAL"

        return True, None, "VALID_IMMUTABLE"

    def simulate_tamper(
        self,
        block_index: int = 1,
        malicious_summary: str = "ALTERED_BY_INSIDER: Log record deleted/manipulated to conceal attack vector",
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Simulates an unauthorized database alteration (e.g. attacker editing SQL table or log file)
        without updating subsequent hash chains. Used during live jury demo to show real-time tamper alert.
        """
        if block_index < 0 or block_index >= len(self.chain):
            # Fallback to last block or genesis
            block_index = max(0, len(self.chain) - 1)

        target_block = self.chain[block_index]
        # Modify the content directly without recomputing current_hash or subsequent hashes
        target_block.action_summary = malicious_summary
        target_block.details["tamper_flag"] = True
        target_block.details["tampered_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

        is_valid, bad_idx, status = self.verify_chain()
        return is_valid, {
            "chain_integrity": status,
            "tampered_block_index": bad_idx,
            "message": f"Demonstrasi Manipulasi Bukti: Blok #{block_index} berhasil diubah, rantai bukti terdeteksi {status}!",
        }

    def restore_verified_chain(self) -> Tuple[bool, Dict[str, Any]]:
        """
        Restores the ledger to the verified backup snapshot.
        Demonstrates self-healing / immutable snapshot recovery to the jury.
        """
        self.chain = copy.deepcopy(self._verified_snapshot)
        is_valid, bad_idx, status = self.verify_chain()
        return is_valid, {
            "chain_integrity": status,
            "tampered_block_index": None,
            "message": "Pemulihan Berhasil: Rantai bukti forensik dipulihkan ke status Snapshot Sah (VALID_IMMUTABLE).",
        }

    def _save_snapshot(self) -> None:
        """Saves a deep copy of the currently valid chain as a recovery baseline."""
        is_valid, _, _ = self.verify_chain()
        if is_valid:
            self._verified_snapshot = copy.deepcopy(self.chain)

    def get_latest_block_envelope(self) -> Dict[str, Any]:
        """Returns the tip block formatted for WebSocket Unified C4ISR Schema v2.0 forensic_block."""
        if not self.chain:
            self.init_genesis()

        latest = self.chain[-1]
        is_valid, bad_idx, status = self.verify_chain()
        return {
            "block_index": latest.block_index,
            "timestamp": latest.timestamp,
            "session_id": latest.session_id,
            "action_summary": latest.action_summary,
            "previous_hash": latest.previous_hash,
            "current_hash": latest.current_hash,
            "chain_integrity": status,
            "tampered_block_index": bad_idx,
            "details": latest.details,
        }

    def get_all_blocks(self) -> List[Dict[str, Any]]:
        """Returns all blocks in the ledger."""
        return [b.to_dict() for b in self.chain]


# Global singleton instance for convenient access across endpoints
forensic_ledger = ForensicLedger.get_instance()
