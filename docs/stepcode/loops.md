# Loops

There are several loop constructs provided:

## While

Executes the loop as long as the condition is `true`.

```stepcode
x := 0
n := 1

while n < 4 do
    x := x + n
    n := n + 1
end while
```

## Until

Executes the loop until the condition becomes `true`.

```stepcode
x := 0
n := 1

until n == 4 do
    x := x + n
    n := n + 1
end until
```

## Repeat-While

Executes the block at least once, then repeats as long as the condition is `true`.

```stepcode
x := 0
n := 1

repeat
    x := x + n
    n := n + 1
while n < 4
```

## Repeat-Until

Executes the block at least once, then repeats until the condition becomes `true`.

```stepcode
x := 0
n := 1

repeat
    x := x + n
    n := n + 1
until n == 4
```

## For Loop

Iterates through a range of values.

```stepcode
x := 0

for i = 1 to 3 do
    x := x + i
end for
```

### Decreasing For Loop

Use `downto` to count backwards:

```stepcode
x := 0

for i = 3 downto 1 do
    x := x + i
end for
```

# Loop Control Statements

## Break

Use the `break` keyword to exit any loop immediately:

```stepcode
for i = 1 to 10 do
    if i == 5 then
        break
    end if
end for
```

## Continue

Use the `continue` keyword to skip the current iteration and move to the next one:

```stepcode
x := 0

for i = 1 to 4 do
    if i == 3 then
        continue
    end if
    x := x + i
end for
```
