# stepcode: specialized tool for generating static books with interactive pseudocode.
# Copyright (C) 2026  stepcode authors
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

import sys

from generate import write_output
from parse_content import build_site_tree, parse_config, print_tree


def main() -> None:
    if len(sys.argv) < 2:
        print('Usage: stepcode <base_directory>')
        sys.exit(1)

    base_path = sys.argv[1]

    config = parse_config(base_path)
    print(f'Book: {config.name} by {config.author}\n')
    site_tree = build_site_tree(config, base_path)

    print('resulting site tree')
    print_tree(site_tree)

    write_output(site_tree, 'dist')


if __name__ == '__main__':
    main()
