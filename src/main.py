from parse_content import parse_content_folder
from generate import write_output


def main() -> None:
    parsed = parse_content_folder("content")
    write_output(parsed, "dist")


if __name__ == "__main__":
    main()
