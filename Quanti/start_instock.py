import os
import subprocess
import time
import webbrowser
import sys

# Beállítjuk az aktuális könyvtárat, hogy onnan fusson minden
base_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(base_dir)

# Ha kell, hozzáadjuk a PYTHONPATH-hoz a projektet (pl. manage.py miatt)
if base_dir not in sys.path:
    sys.path.append(base_dir)

def run_django():
    subprocess.Popen(["python", "manage.py", "runserver"], shell=True)
    time.sleep(3)
    webbrowser.open("http://127.0.0.1:8000")

if __name__ == "__main__":
    run_django()