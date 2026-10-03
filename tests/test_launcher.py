"""Exercise the real build/start/stop lifecycle with a hidden launcher window."""
import time
import unittest
from unittest.mock import patch
import launcher


class LauncherTests(unittest.TestCase):
    def test_start_and_stop(self):
        if launcher.healthy():
            self.skipTest('A user launcher is already running; leave it untouched.')
        original = launcher.tk.Tk
        observed = []

        def window():
            root = original()
            root.withdraw()
            deadline = time.monotonic() + 45

            def check():
                if launcher.healthy() or time.monotonic() > deadline:
                    observed.append(launcher.healthy())
                    root.tk.call(root.protocol('WM_DELETE_WINDOW'))
                else:
                    root.after(250, check)
            root.after(500, check)
            return root

        with patch.object(launcher.tk, 'Tk', window), patch.object(launcher.webbrowser, 'open'):
            launcher.main()
        self.assertEqual(observed, [True], 'Launcher did not start the API; check data/launcher.log')
        self.assertFalse(launcher.healthy(), 'Owned API was not stopped')


if __name__ == '__main__':
    unittest.main()
