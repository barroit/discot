# SPDX-License-Identifier: GPL-3.0-or-later

project = 'Discot'
copyright = '%Y Jiamu Sun'
author = 'Jiamu Sun'

with open('../VERSION') as file:
	version = file.read()
	release = version

needs_sphinx = '8.2'
smartquotes_action = 'q'

extensions = []

primary_domain = 'js'
highlight_language = 'none'

templates_path = [ 'sphinx/templates' ]
exclude_patterns = [ 'build' ]

html_theme = 'alabaster'
html_static_path = [ 'sphinx/static' ]

html_logo = 'images/logo.svg'
html_favicon = 'images/favicon.png'

html_css_files = [
	'layout.css',
	'toc.css',
]

html_theme_options = {
	'description': version,
	'page_width': '80rem',
	'sidebar_width': '20rem',
	'fixed_sidebar': 'true',
	'font_family': 'serif',
}

html_sidebars = {
	'**': [
		'about.html',
		'searchbox.html',
		'discot-toc.html',
		'sourcelink.html',
	],
}
