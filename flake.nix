{
  description = "stepcode";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.11";
    fenix.url = "github:nix-community/fenix";
  };

  outputs = {
    self,
    nixpkgs,
    fenix,
    ...
  }: let
    eachSystem = f:
      nixpkgs.lib.genAttrs ["x86_64-linux" "aarch64-linux"]
      (system:
        f system (import nixpkgs {
          inherit system;
          overlays = [fenix.overlays.default];
        }));
  in {
    devShells = eachSystem (system: pkgs: {
      default = pkgs.mkShell {
        buildInputs = with pkgs; [
          alejandra

          nodejs

          cargo
          cargo-expand
          rust-analyzer
          rustc
          clippy
          fenix.packages.${system}.latest.rustfmt
        ];

        env.RUST_SRC_PATH = "${pkgs.rustPlatform.rustLibSrc}";
      };
    });

    packages = eachSystem (
      system: pkgs: let
        inherit
          ((pkgs.lib.importTOML ./Cargo.toml).package)
          name
          version
          description
          repository
          ;
      in {
        default = pkgs.rustPlatform.buildRustPackage {
          pname = name;
          inherit version;

          src = self;

          cargoLock.lockFile = ./Cargo.lock;

          meta = with pkgs.lib; {
            mainProgram = name;
            inherit description;
            homepage = repository;
            license = licenses.mit;
            platforms = platforms.linux;
          };

          nativeBuildInputs = with pkgs; [
            pkg-config
          ];

          buildInputs = with pkgs; [
            openssl
          ];
        };
      }
    );

    formatter = eachSystem (
      system: pkgs:
        pkgs.writeShellScriptBin "format" ''
          set -e

          ${pkgs.alejandra}/bin/alejandra .

          npm run format
          npm run lint:fix

          cargo fmt --all
        ''
    );

    templates.default = {
      path = ./template;
      description = "basic template to create a new stepcode book";
    };
  };
}
