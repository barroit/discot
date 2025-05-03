// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

export function reply_user(ctx, data)
{
	if (ctx.replied || ctx.deferred)
		return ctx.followUp(data)
	else
		return ctx.reply(data)
}
