.. SPDX-License-Identifier: GPL-3.0-or-later

================
The Install Tool
================

This document describes the install tool. Before run this tool, make sure your
command file exports ``meta`` and ``exec``, or Discot may silently ignore them.

Usage
=====

::

	install <name>

``name`` can be wildcard character ``*``. In this case, tool installs all valid
commands under ``commands/``. But you should also provide a ``SANDBOX`` file,
which records guild id of test-specific commands. Failing to do so breaks
entire command installation.

For named installations (not using wildcard character), Due to Discord's
'smart' caching strategy, changes may take a while to be visible across guilds.

So it's better to use ``remove *`` followed by a ``install *``. This forces
Discord to drop its cache, and updated commands become visible to guilds
immediately.
