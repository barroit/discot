// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

export function CURRENT(ctx)
{
	return ctx.guild.current
}

export function PLAYLIST(ctx)
{
	return CURRENT(ctx).playlist
}

export function FETCHLIST(ctx)
{
	return PLAYLIST(ctx).fetch
}

export function PLAYER(ctx)
{
	return CURRENT(ctx).player
}

export function REPLY(ctx)
{
	return CURRENT(ctx).reply
}

export function OPTION(ctx)
{
	return CURRENT(ctx).opts
}
