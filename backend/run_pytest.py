import subprocess, os, sys
cmd = [r'c:\Users\Media\Documents\CourierOS\backend\.venv\Scripts\python.exe', '-m', 'pytest', 'tests/test_shipment_labels.py', '-q']
proc = subprocess.run(cmd, cwd=r'c:\Users\Media\Documents\CourierOS\backend', capture_output=True, text=True)
print(proc.stdout)
print(proc.stderr)
raise SystemExit(proc.returncode)
