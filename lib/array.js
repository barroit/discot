// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

function move_left(arr, from, to, len)
{
	let i

	for (i = 0; i < len; i++)
		arr[to + i] = arr[from + i]
}

function move_right(arr, from, to, len)
{
	let i

	for (i = len - 1; i >= 0; i--)
		arr[to + i] = arr[from + i]
}

export function arr_move(arr, from, to, len)
{
	if (from > to)
		move_left(arr, from, to, len)
	else
		move_right(arr, from, to, len)
}
