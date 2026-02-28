import sys
from parse_content import parse_config, build_site_tree, print_tree
from generate import write_output


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: stepcode <base_directory>")
        sys.exit(1)

    base_path = sys.argv[1]

    config = parse_config(base_path)
    print(f"Book: {config.name} by {config.author}\n")
    site_tree = build_site_tree(config, base_path)

    print("resulting site tree")
    print_tree(site_tree)

    write_output(site_tree, "dist")


if __name__ == "__main__":
    main()
