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
