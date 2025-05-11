.. SPDX-License-Identifier: GPL-3.0-or-later

=============
Write Command
=============

This document discrips how to add new command.

All commands exist under ``commands/``. Discot loads and caches them at start.


Command file structure
======================

Each command file exports two variables: ``meta`` and ``exec``. If either is
missing, Discot skips that file.

``meta`` is a command info object. Initialize it by calling ``cmd_meta()``.
You should call these dumbass chained methods on meta, regardless of command:

   - setName()
   - setDescription()

``exec`` is a function reference. This function does the actual work of command.
Its signature is::

	function exec(ctx: ChatInputCommandInteraction): Promise<any>

Discot ignores its return value, so you can return anything you want.


Command Feedback
================

Don't forget to reply to user. Discord gives 3 seconds for first response.
Failing to do so makes Discord reject command interaction.

Moreover, each interaction lives 15 minutes. If your task requires long-running
interaction, store return value of first reply, which is ``Message`` promise.
You can edit reply later via that message object.
