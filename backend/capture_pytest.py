import subprocess, os, sys
python_exe = r'c:\Users\Media\Documents\CourierOS\backend\.venv\Scripts\python.exe'
cmd = [python_exe, '-m', 'pytest', '-q']
proc = subprocess.run(cmd, cwd=r'c:\Users\Media\Documents\CourierOS\backend', capture_output=True, text=True)
with open(r'c:\Users\Media\Documents\CourierOS\backend\pytest_output.txt', 'w', encoding='utf-8') as f:
    f.write(proc.stdout)
    f.write(proc.stderr)
print(proc.returncode)
