# Conditionals

## Basic If Statement

The basic `if` statement uses the `then` and `end if` keywords:

```stepcode
x := -2

if x < 0 then
    x := -x
end if
```

## Adding an Else Clause

You can provide an alternative branch using `else`:

```stepcode
x := 2

if x < 0 then
    x := 0
else
    x := x * 2
end if
```

## Chaining Multiple Conditions

To check multiple conditions, use the `else if` syntax:

```stepcode
x := 4

if x < 0 then
    x := -1
else if x > 0 then
    x := 1
else
    x := 0
end if
```
