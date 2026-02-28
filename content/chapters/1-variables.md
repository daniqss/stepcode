# Variables

You can declare and assign values using the `:=` operator.

## Assignment and Types

Variables are dynamically typed, allowing you to store numbers and booleans.

```stepcode
n := 5      # this is a comment
n := n * 2
b := true
```

## Arrays

Arrays are **one-based indexed**. Use square brackets for both declaration and accessing elements.

```stepcode
arr := [10, 11, 12, 13]
arr[2] := arr[2] + arr[3] # sets arr[2] to 11 + 12 = 23
```
