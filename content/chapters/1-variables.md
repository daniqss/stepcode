# Variables

## Assignment and Types

You can declare and assign values using the `:=` operator.

Variables are dynamically typed, allowing you to store numbers and booleans.

```stepcode
n := 5      # this is a comment
n := n * 2
b := true
```

## Operators

**stepcode** supports a variety of operators to perform calculations, compare values, and handle logic.

### Arithmetic & Comparison

| Operator | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `+` | Arithmetic | Addition | `5 + 2 = 7` |
| `-` | Arithmetic | Subtraction | `5 - 2 = 3` |
| `*` | Arithmetic | Multiplication | `5 * 2 = 10` |
| `/` | Arithmetic | Division | `5 / 2 = 2.5` |
| `//` | Arithmetic | Floor Division | `5 // 2 = 2` |
| `%` | Arithmetic | Modulo (Remainder) | `5 % 2 = 1` |
| `==` | Comparison | Equal to | `x == 5` |
| `!=` | Comparison | Not equal to | `x != 5` |
| `<` | Comparison | Less than | `x < 10` |
| `>` | Comparison | Greater than | `x > 10` |
| `<=` | Comparison | Less or equal | `x <= 10` |
| `>=` | Comparison | Greater or equal | `x >= 10` |

### Logical Operators

| Operator | Description | Example |
| :--- | :--- | :--- |
| `and` | True if both are true | `(x > 0) and (x < 10)` |
| `or` | True if at least one is true | `(x == 0) or (y == 0)` |
| `not` | Inverts the boolean value | `not is_ready` |

### Usage Example

```stepcode
x := 10
y := 3

is_valid := (x > 5) and (y < 5)
quotient := x // y
remainder := x % y
is_not_equal := x != y
```

## Arrays

Arrays are **one-based indexed**. Use square brackets for both declaration and accessing elements.

```stepcode
arr := [10, 11, 12, 13]
arr[2] := arr[2] + arr[3] # sets arr[2] to 11 + 12 = 23
```
