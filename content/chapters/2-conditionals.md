# Conditionals

To implement conditional use the following syntax:

```pseudocode
x := -2

if x < 0 then
    x := -x
end if
```

You can also add an else clause:

```
x := 2

if x < 0 then
    x := 0
else
    x := x * 2
end if
```

or even chain multiple conditions:

```pseudocode
x := 4

if x < 0 then
    x := -1
else if x > 0 then
    x := 1
else
    x := 0
end if
```
