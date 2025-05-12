.. SPDX-License-Identifier: GPL-3.0-or-later

=======
Install
=======
--------------------------------
Upload command to Discord guilds
--------------------------------

SYNOPSIS
========

**install** *NAME*

DESCRIPTION
===========

Register command from file to Discord. Requires `meta` and `exec` export in
command file. Without either, Discot skips that file without warning.

Name
====

Command file basename. Supports prefix abbreviation.

If *NAME* is `*`, scans and installs all commands in `commands/`. Requires
`SANDBOX` file to exist in working directory. It must contain the test guild
ID. Missing `SANDBOX` breaks install entirely.

Avoid Discord cache delay
==========================

Named installs (without wildcard) may not take effect immediately. Discord
caches commands per guild, so changes may be delayed.

Run `remove *` before `install *` to force cache drop. This ensures updated
commands are visible right away.
