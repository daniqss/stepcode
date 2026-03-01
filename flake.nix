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
{
  description = "stepcode";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.11";
  };

  outputs = {nixpkgs, ...}: let
    eachSystem = f:
      nixpkgs.lib.genAttrs ["x86_64-linux" "aarch64-linux"]
      (system: f (import nixpkgs {inherit system;}));
  in {
    devShells = eachSystem (pkgs: {
      default = pkgs.mkShell {
        buildInputs = with pkgs; [
          python314
          uv
          ruff
          alejandra

          nodejs
        ];

        shellHook = ''
          uv sync
        '';
      };
    });

    formatter = eachSystem (pkgs:
      with pkgs;
        writeShellScriptBin "format" ''
          set -e
          ${alejandra}/bin/alejandra .

          ${ruff}/bin/ruff format .
          ${ruff}/bin/ruff check --fix .

          npm run format
          npm run lint:fix
        '');

    templates.default = {
      path = ./template;
      description = "basic template to create a new stepcode book";
    };
  };
}
