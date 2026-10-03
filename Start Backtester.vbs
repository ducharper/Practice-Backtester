Option Explicit
Dim shell, files, root, python
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
root = files.GetParentFolderName(WScript.ScriptFullName)
python = root & "\.venv\Scripts\pythonw.exe"
If Not files.FileExists(python) Then
    MsgBox "The project's Python environment is missing. Set up .venv first.", 16, "Practice Backtester"
    WScript.Quit 1
End If
shell.CurrentDirectory = root
shell.Run Chr(34) & python & Chr(34) & " " & Chr(34) & root & "\launcher.py" & Chr(34), 0, False
