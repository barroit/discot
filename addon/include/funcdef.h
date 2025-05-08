/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

#ifndef ADDCALL_H
#define ADDCALL_H

#include <node_api.h>

napi_value addon_rand(napi_env env, napi_callback_info info);

napi_value addon_rand_n(napi_env env, napi_callback_info info);

#endif /* ADDCALL_H */
