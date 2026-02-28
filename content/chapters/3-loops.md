# Loops

There are multiple definitions for loops:

## While

```pseudocode
x := 0
n := 1

while n < 4 do
    x := x + n
    n := n + 1
end while
```

## Until

```pseudocode
x := 0
n := 1

until n == 4 do
    x := x + n
    n := n + 1
end while
```

## Repeat-While

Behaves `while` but gets executed at least once.

```pseudocode
x := 0
n := 1

repeat
    x := x + n
    n := n + 1
while n := n < 4
```

## Repeat-Until

Behaves like `until` but gets executed at least once.

```pseudocode
x := 0
n := 1

repeat
    x := x + n
    n := n + 1
until n == 4
```

## For

```pseudocode
x := 0

for i = 1 to 3 do
    x := x + i
end for
```

`for` loops can also be decreasing:

```pseudocode
x := 0

for i = 3 downto 1 do
    x := x + i
end for
```

# Break

Use the `break` keyword for exiting any loop:

```pseudocode
for i = 0 to 10 do
    if i == 5 do
        break
    end if
end for
```

# Continue

Use the `continue` keyword for skipping an iteration of a loop

```pseudocode
x := 0

for i = 1 to 4 do
    if i == 3 then
        continue
    end if
    x := x + i
end for
```
