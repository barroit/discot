// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import deasync from 'deasync'

export default function wrapper(fn)
{
	return function (...args)
	{
		let done = false
		let err = false
		let res

		fn(...args).then(r => {
			res = r
			done = true
		}).catch(e => {
			res = e
			done = true
			err = true
		})

		while (!done)
			deasync.loopWhile(() => !done)

		return {
			err,
			res,
		}
	}
}

async function __import(path)
{
	return await import(path)
}

export function deasync_import(path)
{
	const fn = wrapper(__import)

	return fn(path)
}
