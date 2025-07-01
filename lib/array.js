// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import addon from '../addon/include.cjs'

const { addon_rand_n } = addon

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

export function arr_shuffle(arr, off, len)
{
	let i, j, tmp

	for (i = off + len - 1; i >= off + 1; i--) {
		j = addon_rand_n(i + 1)

		tmp = arr[i]
		arr[i] = arr[j]
		arr[j] = tmp
	}
}
