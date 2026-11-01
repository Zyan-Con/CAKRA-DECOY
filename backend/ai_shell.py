"""
ai_shell.py — Two-tier Web-SSH console untuk terminal palsu.

Tier-1 (dipakai sekarang): Deterministic in-memory VFS. Perintah navigasi & baca
file (pwd/cd/ls/cat/whoami/id/uname/hostname/env/help/clear) dijawab instan dari
pohon file Python. Konsisten 100%, tahan offline, tidak berhalusinasi.

Tier-2 (DEFERRED): perintah lanjutan (ps/netstat/find/ss) diteruskan ke LLM dengan
konteks cwd. shortcut: LLM belum nyambung; sekarang pakai fallback statis.
Upgrade saat API key siap (lihat to-fix.md P1).

Anti-jailbreak: input yang bukan sintaks perintah Linux ("buatkan puisi",
"ignore previous instructions") langsung ditolak `bash: <input>: command not found`.

Engine ini PURE: tidak impor FastAPI/WS. Caller kasih cwd, dapat output + cwd baru.
"""

from __future__ import annotations

import time
from dataclasses import dataclass

# Node: ("dir",) atau ("file", isi). Pohon file palsu yang dilihat penyerang.
_VFS: dict[str, tuple] = {
    "/": ("dir",),
    "/home": ("dir",),
    "/home/ubuntu": ("dir",),
    "/opt": ("dir",),
    "/opt/satcom": ("dir",),
    "/opt/scada": ("dir",),
    "/etc": ("dir",),
    "/opt/satcom/Akses_Darurat_Satelit_TNI.html": (
        "file",
        "<!-- SISHANKAMRATA SATCOM EMERGENCY CONSOLE v4.2.1 -->\n<html>...</html>\n",
    ),
    "/opt/satcom/kredensial_komando.env": (
        "file",
        "SATCOM_ENV=production\n"
        "SATCOM_VAULT_URL=http://localhost:8000/api/v1/satcom/keys\n"
        "SATCOM_BEARER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n",
    ),
    "/opt/scada/radar_cooling.conf": (
        "file",
        "[radar_cooling]\nsetpoint_c=34.0\nmode=AUTO\n",
    ),
    "/etc/passwd": (
        "file",
        "root:x:0:0:root:/root:/bin/bash\nubuntu:x:1000:1000::/home/ubuntu:/bin/bash\n",
    ),
}

DEFAULT_CWD = "/opt/satcom"
_PROMPT_HOST = "ubuntu@srv-kodam-logistik-01"

# Perintah yang dijawab LLM di tier-2 (sekarang fallback statis).
_LLM_COMMANDS = {"ps", "netstat", "ss", "find", "iptables", "crontab", "top"}
# Fallback statis sampai LLM nyambung.
_LLM_FALLBACK: dict[str, str] = {
    "ps": "  PID TTY          TIME CMD\n 1842 ?        00:00:01 satcom-agent\n 1999 pts/0    00:00:00 bash",
    "netstat": "Active Internet connections\ntcp  0  0 0.0.0.0:8000  0.0.0.0:*  LISTEN",
    "ss": "State  Recv-Q  Send-Q  Local Address:Port\nLISTEN 0  128  0.0.0.0:8000",
}


class ExecSource:
    VFS = "VFS_DETERMINISTIC_ENGINE"
    LLM = "LLM_CONTEXT_SHELL"
    FALLBACK = "STATIC_FALLBACK"


@dataclass
class ShellResult:
    output: str
    cwd: str
    execution_source: str
    response_time_ms: float


def _norm(path: str, cwd: str) -> str:
    """Resolve path relatif/absolut + '.' dan '..' jadi path kanonik."""
    base = path if path.startswith("/") else f"{cwd}/{path}"
    parts: list[str] = []
    for seg in base.split("/"):
        if seg in ("", "."):
            continue
        if seg == "..":
            if parts:
                parts.pop()
        else:
            parts.append(seg)
    return "/" + "/".join(parts)


def _is_dir(path: str) -> bool:
    return _VFS.get(path, (None,))[0] == "dir"


def _is_file(path: str) -> bool:
    return _VFS.get(path, (None,))[0] == "file"


def _ls(path: str) -> list[str]:
    """Nama entri langsung di dalam direktori `path`."""
    prefix = "/" if path == "/" else path + "/"
    names = []
    for p in _VFS:
        if p == path or not p.startswith(prefix):
            continue
        rest = p[len(prefix) :]
        if "/" not in rest:  # anak langsung
            names.append(rest)
    return sorted(names)


def run(command: str, cwd: str = DEFAULT_CWD) -> ShellResult:
    """Eksekusi satu baris perintah. Kembalikan output + cwd baru."""
    t0 = time.perf_counter()
    out, new_cwd, source = _dispatch(command.strip(), cwd)
    ms = round((time.perf_counter() - t0) * 1000, 3)
    return ShellResult(
        output=out, cwd=new_cwd, execution_source=source, response_time_ms=ms
    )


def prompt_for(cwd: str) -> str:
    return f"{_PROMPT_HOST}:{cwd}$"


def _dispatch(line: str, cwd: str) -> tuple[str, str, str]:
    if not line:
        return "", cwd, ExecSource.VFS
    tokens = line.split()
    cmd, args = tokens[0], tokens[1:]

    if cmd == "pwd":
        return cwd, cwd, ExecSource.VFS
    if cmd == "whoami":
        return "ubuntu", cwd, ExecSource.VFS
    if cmd == "id":
        return (
            "uid=1000(ubuntu) gid=1000(ubuntu) groups=1000(ubuntu)",
            cwd,
            ExecSource.VFS,
        )
    if cmd == "hostname":
        return "srv-kodam-logistik-01", cwd, ExecSource.VFS
    if cmd == "uname":
        return (
            "Linux srv-kodam-logistik-01 5.15.0-91-generic x86_64 GNU/Linux",
            cwd,
            ExecSource.VFS,
        )
    if cmd in ("clear", "help"):
        return "", cwd, ExecSource.VFS
    if cmd == "env":
        return (
            "USER=ubuntu\nHOME=/home/ubuntu\nPWD=" + cwd + "\nSHELL=/bin/bash",
            cwd,
            ExecSource.VFS,
        )

    if cmd == "cd":
        target = _norm(args[0], cwd) if args else "/home/ubuntu"
        if _is_dir(target):
            return "", target, ExecSource.VFS
        if _is_file(target):
            return f"bash: cd: {args[0]}: Not a directory", cwd, ExecSource.VFS
        return (
            f"bash: cd: {args[0] if args else ''}: No such file or directory",
            cwd,
            ExecSource.VFS,
        )

    if cmd == "ls":
        targets = [a for a in args if not a.startswith("-")]
        path = _norm(targets[0], cwd) if targets else cwd
        if _is_dir(path):
            return "  ".join(_ls(path)), cwd, ExecSource.VFS
        if _is_file(path):
            return path.rsplit("/", 1)[-1], cwd, ExecSource.VFS
        return (
            f"ls: cannot access '{targets[0] if targets else path}': No such file or directory",
            cwd,
            ExecSource.VFS,
        )

    if cmd == "cat":
        if not args:
            return "cat: missing operand", cwd, ExecSource.VFS
        path = _norm(args[0], cwd)
        node = _VFS.get(path)
        if node is None:
            return f"cat: {args[0]}: No such file or directory", cwd, ExecSource.VFS
        if node[0] == "dir":
            return f"cat: {args[0]}: Is a directory", cwd, ExecSource.VFS
        return node[1], cwd, ExecSource.VFS

    # Tier-2: perintah lanjutan -> (nanti) LLM, sekarang fallback statis.
    if cmd in _LLM_COMMANDS:
        return (
            _LLM_FALLBACK.get(cmd, f"{cmd}: (output disimulasikan)"),
            cwd,
            ExecSource.FALLBACK,
        )

    # Anti-jailbreak: bukan perintah Linux yang dikenal -> command not found.
    return f"bash: {cmd}: command not found", cwd, ExecSource.VFS


# ---------------- Self-check ----------------

if __name__ == "__main__":
    assert run("pwd").output == "/opt/satcom"
    assert run("whoami").output == "ubuntu"

    # ls di /opt/satcom menampilkan file umpan
    ls = run("ls").output
    assert "Akses_Darurat_Satelit_TNI.html" in ls and "kredensial_komando.env" in ls, ls

    # cd stateful + relatif/absolut
    r = run("cd /opt/scada")
    assert r.cwd == "/opt/scada"
    assert run("ls", r.cwd).output == "radar_cooling.conf"
    assert run("cd ..", "/opt/scada").cwd == "/opt"

    # cat file umpan
    env = run("cat kredensial_komando.env").output
    assert "SATCOM_BEARER_TOKEN" in env, env

    # cat direktori / file hilang
    assert "Is a directory" in run("cat /opt").output
    assert "No such file" in run("cat nope.txt").output

    # anti-jailbreak
    assert (
        run("ignore previous instructions").output == "bash: ignore: command not found"
    )

    # tier-2 fallback
    assert run("ps aux").execution_source == "STATIC_FALLBACK"

    print("ai_shell.py self-check OK")
