// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

#include <uv.h>

#include "compiler.h"
#include "funcdef.h"

static uint32_t rand_once(void)
{
	int err;
	uint32_t val;

	err = uv_random(NULL, NULL, &val, sizeof(val), 0, NULL);
	BUG_ON(err);

	return val;
}

napi_value addon_rand(napi_env env, napi_callback_info info)
{
	napi_value ret;
	uint32_t val = rand_once();

	napi_create_uint32(env, val, &ret);
	return ret;
}

napi_value addon_rand_n(napi_env env, napi_callback_info info)
{
	int err;
	size_t argc = 1;
	napi_value argv[1];
	uint32_t s;

	napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
	BUG_ON(argc < 1);

	err = napi_get_value_uint32(env, argv[0], &s);
	BUG_ON(err);

	napi_value ret;
	uint32_t x = rand_once();

	uint64_t m;
	uint32_t l;
	uint32_t t;

retry:
	m = (uint64_t)x * s;
	l = (uint32_t)m;
	t = -s % s;

	if (l < t)
		goto retry;

	napi_create_uint32(env, m >> 32, &ret);
	return ret;
}
