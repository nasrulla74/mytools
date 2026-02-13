import sys
sys.path.insert(0, r'C:\DEV\mytools202')
from backend.code_runner import CodeRunner
runner = CodeRunner()
result = runner.execute('print(42)')
print(result)
