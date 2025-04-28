// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

export async function fetch_channel(ctx)
{
	return ctx.channel ?? await ctx.client.channels.fetch(ctx.channelId)
}
