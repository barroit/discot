// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

#include "calc.h"
#include "compiler.h"
#include "funcdef.h"
#include "iter.h"

#define REGISTER(x) { .func = x, .name = STRINGIFY(x) }

struct func_data {
	napi_callback func;
	const char *name;
};

struct func_data func_list[] = {
	REGISTER(addon_rand),
	REGISTER(addon_rand_n),
};

napi_value Init(napi_env env, napi_value mod)
{
	unsigned i;

	idx_for_each(i, sizeof_array(func_list)) {
		napi_value node_func;
		struct func_data *data = &func_list[i];

		napi_create_function(env, NULL, 0,
				     data->func, NULL, &node_func);
		napi_set_named_property(env, mod, data->name, node_func);
	}

	return mod;
}

/*
 * Don't forget to update the damn Node.js.
 */
NAPI_MODULE(discot, Init)
