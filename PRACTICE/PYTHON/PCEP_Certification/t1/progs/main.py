from pathlib import Path
from sys import path

modules_dir = Path(__file__).resolve().parent.parent / "modules"
print(modules_dir)
path.append(str(modules_dir))

import module  # pyrefly: ignore[missing-import]

zeroes = [0 for i in range(5)]
ones = [1 for i in range(5)]
print(module.suml(zeroes))
print(module.prodl(ones))

