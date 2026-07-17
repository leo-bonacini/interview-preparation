window.TOPIC_BANKS = window.TOPIC_BANKS || {};
TOPIC_BANKS.linux = {
  label: "Linux / Bash",
  compiler: "bash",
  topics: [
{
  id: "shell-variables",
  tag: "Foundations",
  level: "basic",
  title: "Variables & Quoting",
  theory: `
    <ul>
      <li>Assign with no spaces around <code>=</code> (<code>name=value</code>); read back with <code>$name</code> or <code>\${name}</code> &mdash; the braces are only required when the name would otherwise be ambiguous (e.g. next to other text).</li>
      <li>Double quotes allow expansion (<code>"$var"</code>, <code>"$(cmd)"</code>); single quotes are fully literal, no expansion at all.</li>
      <li>Unquoted expansion is subject to word splitting and globbing &mdash; a value with spaces silently becomes multiple arguments. Quoting <code>"$var"</code> almost everywhere avoids a whole class of bugs, especially with filenames.</li>
    </ul>`,
  example: `name="ground control"
echo "Hello, $name"      # one argument: quoting keeps it together
echo Hello, $name        # happens to still work here, but risky in general`,
  task: `Complete <code>describe_sensor</code> so it prints <code>Sensor: &lt;name&gt; (&lt;unit&gt;)</code> using the two parameters, quoting the expansions so a name containing spaces stays intact.`,
  starter: `describe_sensor() {
  local name="$1"
  local unit="$2"
  # TODO: print "Sensor: <name> (<unit>)" using $name and $unit, properly quoted
}

describe_sensor "front lidar" "meters"
`,
  expected: "Sensor: front lidar (meters)",
  hint: 'echo "Sensor: $name ($unit)"',
  options: ""
},
{
  id: "conditionals-test",
  tag: "Foundations",
  level: "basic",
  title: "Conditionals: test & [[ ]]",
  theory: `
    <ul>
      <li><code>[[ ]]</code> is bash's extended conditional: safer than the older <code>[ ]</code> (POSIX <code>test</code>) because it doesn't word-split or glob its operands, so unquoted variables inside it won't blow up on spaces or empty values.</li>
      <li>Use <code>-eq</code>/<code>-lt</code>/<code>-gt</code> for numeric comparison inside <code>[[ ]]</code>/<code>[ ]</code>, and <code>==</code>/<code>!=</code> for string comparison &mdash; or use <code>(( ))</code> directly for numeric conditions, which reads closer to C.</li>
      <li><code>if cmd; then ... fi</code> branches on <em>any</em> command's exit status, not just <code>test</code> &mdash; a conditional in bash is really just "did this command succeed."</li>
    </ul>`,
  example: `check_range() {
  local n=$1
  if (( n >= 0 && n <= 100 )); then
    echo "in range"
  else
    echo "out of range"
  fi
}
check_range 50`,
  task: `Complete <code>battery_status</code> so it prints <code>"low"</code> if <code>level</code> is less than <code>20</code>, otherwise <code>"ok"</code>, using <code>[[ ]]</code>.`,
  starter: `battery_status() {
  local level=$1
  # TODO: if level < 20 print "low", else print "ok"
}

battery_status 15
battery_status 80
`,
  expected: "low\nok",
  hint: 'if [[ $level -lt 20 ]]; then echo "low"; else echo "ok"; fi',
  options: ""
},
{
  id: "loops-arrays",
  tag: "Foundations",
  level: "basic",
  title: "For & C-Style Loops",
  theory: `
    <ul>
      <li><code>for x in list; do ... done</code> iterates over a fixed list of words &mdash; the shell equivalent of a range-for over values, not indices.</li>
      <li><code>for (( i=0; i&lt;n; i++ )); do ... done</code> is the C-style form, used when you need an index/counter rather than iterating values directly.</li>
      <li><code>while cond; do ... done</code> loops until the condition fails; <code>break</code>/<code>continue</code> work the same as in most other languages.</li>
    </ul>`,
  example: `for i in 1 2 3; do
  echo "tick $i"
done`,
  task: `Complete <code>sum_range</code> so it prints the sum of the integers <code>1</code> through <code>n</code> using a loop.`,
  starter: `sum_range() {
  local n=$1
  local total=0
  # TODO: loop from 1 to n, adding each value to total
  echo "$total"
}

sum_range 5
`,
  expected: "15",
  hint: 'for ((i=1; i<=n; i++)); do total=$((total + i)); done',
  options: ""
},
{
  id: "functions-exit-status",
  tag: "Foundations",
  level: "intermediate",
  title: "Functions & Exit Status",
  theory: `
    <ul>
      <li>Functions signal success/failure via <code>return N</code> (0&ndash;255), read afterward as <code>$?</code> &mdash; not via arbitrary return values like other languages. Use stdout (captured with <code>$(...)</code>) when you need to "return" data instead of a status.</li>
      <li><code>local</code> scopes a variable to the function; omitting it silently leaks/overwrites a global of the same name.</li>
      <li>Convention: <code>0</code> means success, non-zero means failure, mirroring every Unix command &mdash; that's exactly what lets <code>if my_func; then ...</code> work without ever mentioning <code>$?</code>.</li>
    </ul>`,
  example: `is_even() {
  (( $1 % 2 == 0 ))
}
if is_even 4; then echo "even"; fi`,
  task: `Complete <code>validate_reading</code> so it returns <code>0</code> if <code>value</code> is between <code>0</code> and <code>100</code> inclusive, or <code>1</code> otherwise.`,
  starter: `validate_reading() {
  local value=$1
  # TODO: return 0 if 0 <= value <= 100, else return 1
}

if validate_reading 42; then echo "42 valid"; else echo "42 invalid"; fi
if validate_reading 150; then echo "150 valid"; else echo "150 invalid"; fi
`,
  expected: "42 valid\n150 invalid",
  hint: 'if (( value >= 0 && value <= 100 )); then return 0; else return 1; fi',
  options: ""
},
{
  id: "command-substitution",
  tag: "Foundations",
  level: "basic",
  title: "Command Substitution",
  theory: `
    <ul>
      <li><code>$(cmd)</code> captures a command's stdout as a string, letting you use another program's output as data &mdash; the shell's closest thing to a function call.</li>
      <li>Old-style backtick syntax does the same thing but doesn't nest cleanly; <code>$()</code> is the modern, preferred form.</li>
      <li>Piping into a filter before capturing (<code>$(cmd | tail -n 1)</code>) is a common pattern for turning a multi-line pipeline's output into a single scalar value.</li>
    </ul>`,
  example: `count=$(printf "a\\nb\\nc\\n" | wc -l)
echo "count: $count"`,
  task: `Complete <code>latest_reading</code> so it uses command substitution with <code>tail -n 1</code> to grab the last line of <code>readings</code> into <code>latest</code>.`,
  starter: `latest_reading() {
  local readings="10
20
30"
  # TODO: use command substitution with tail -n 1 to get the last line of $readings, store it in "latest"
  echo "Latest: $latest"
}

latest_reading
`,
  expected: "Latest: 30",
  hint: "local latest=$(printf '%s\\n' \"$readings\" | tail -n 1)",
  options: ""
},
{
  id: "string-manipulation",
  tag: "Foundations",
  level: "intermediate",
  title: "Parameter Expansion & String Manipulation",
  theory: `
    <ul>
      <li><code>\${var#pattern}</code> / <code>\${var%pattern}</code> strip the shortest match from the front/back (<code>##</code> / <code>%%</code> for the longest match) &mdash; the standard way to strip a path prefix or file extension without spawning <code>basename</code>/<code>dirname</code>.</li>
      <li><code>\${var/old/new}</code> replaces the first match, <code>\${var//old/new}</code> replaces every occurrence &mdash; an inline substitute for simple <code>sed</code> use cases.</li>
      <li><code>\${#var}</code> gives the string length; <code>\${var:offset:length}</code> slices it &mdash; building blocks for parsing a fixed-format string without reaching for <code>awk</code>.</li>
    </ul>`,
  example: `path="/var/log/robot.log"
echo "\${path##*/}"     # robot.log (strip everything up to the last /)
echo "\${path%.log}"    # /var/log/robot (strip the .log suffix)`,
  task: `Complete <code>extract_extension</code> so it prints the file extension (without the dot) of <code>filename</code> using parameter expansion.`,
  starter: `extract_extension() {
  local filename=$1
  # TODO: print the extension of filename (the text after the last dot, no dot)
}

extract_extension "telemetry.csv"
`,
  expected: "csv",
  hint: 'echo "${filename##*.}"',
  options: ""
},
{
  id: "bash-arrays",
  tag: "Foundations",
  level: "intermediate",
  title: "Bash Arrays",
  theory: `
    <ul>
      <li>Indexed arrays: <code>arr=(a b c)</code>; <code>"\${arr[@]}"</code> expands to every element as a separate, quoted word &mdash; always quote it, or word splitting/globbing can mangle entries with spaces.</li>
      <li><code>\${#arr[@]}</code> is the element count; <code>arr+=(x)</code> appends without needing to track the current length yourself.</li>
      <li>Associative arrays (<code>declare -A</code>) map string keys to values &mdash; bash's built-in dict, useful for a name-to-value sensor table.</li>
    </ul>`,
  example: `sensors=(imu lidar gps)
sensors+=(camera)
echo "\${#sensors[@]}"
echo "\${sensors[@]}"`,
  task: `Complete <code>average</code> so it prints the average (integer division) of the values in the <code>readings</code> array.`,
  starter: `average() {
  local readings=(10 20 30 40)
  local total=0
  # TODO: sum all elements of readings into total
  echo $(( total / \${#readings[@]} ))
}

average
`,
  expected: "25",
  hint: 'for v in "${readings[@]}"; do total=$((total + v)); done',
  options: ""
},
{
  id: "heredoc",
  tag: "Foundations",
  level: "basic",
  title: "Here-Documents & Here-Strings",
  theory: `
    <ul>
      <li>A heredoc (<code>&lt;&lt;EOF ... EOF</code>) feeds multi-line literal text to a command's stdin &mdash; handy for a config block or a multi-line message without a pile of <code>echo</code> calls.</li>
      <li>A here-string (<code>&lt;&lt;&lt; "text"</code>) does the same for a single value, most often paired with <code>read</code> to parse one line without a subshell or pipe.</li>
      <li>Quoting the heredoc delimiter (<code>&lt;&lt;'EOF'</code>) disables variable/command expansion inside it &mdash; use that when the literal text itself contains <code>$</code> characters you don't want expanded.</li>
    </ul>`,
  example: `cat <<EOF
Robot status: ready
Battery: 87%
EOF`,
  task: `Complete <code>parse_command</code> so it reads <code>input</code> into two variables <code>cmd</code> and <code>arg</code> using a here-string, then prints them.`,
  starter: `parse_command() {
  local input="movef 10"
  # TODO: read input into "cmd" and "arg" using a here-string
  echo "cmd=$cmd arg=$arg"
}

parse_command
`,
  expected: "cmd=movef arg=10",
  hint: 'read -r cmd arg <<< "$input"',
  options: ""
},
{
  id: "arithmetic",
  tag: "Foundations",
  level: "basic",
  title: "Arithmetic Expansion",
  theory: `
    <ul>
      <li><code>$(( expr ))</code> evaluates integer arithmetic &mdash; <code>+ - * / %</code> and comparisons. Bash has no native floating point, so division truncates toward zero.</li>
      <li><code>(( expr ))</code> is the statement form: no <code>$</code> needed, and its exit status doubles as a boolean (success if the result is non-zero) &mdash; that's why <code>if (( x > 0 ))</code> works directly.</li>
      <li>Increment shorthand (<code>((i++))</code>) and compound assignment (<code>((total += v))</code>) read the same as in C.</li>
    </ul>`,
  example: `a=17
b=5
echo $((a / b))
echo $((a % b))`,
  task: `Complete <code>ticks_to_seconds</code> so it prints <code>ticks</code> converted to whole seconds given <code>rate</code> (ticks per second), using integer arithmetic.`,
  starter: `ticks_to_seconds() {
  local ticks=$1
  local rate=$2
  # TODO: print ticks / rate using arithmetic expansion
}

ticks_to_seconds 250 50
`,
  expected: "5",
  hint: "echo $((ticks / rate))",
  options: ""
},
{
  id: "grep-regex",
  tag: "Text Processing",
  level: "basic",
  title: "grep & Regular Expressions",
  theory: `
    <ul>
      <li><code>grep</code> prints lines matching a pattern; <code>-c</code> counts matches, <code>-v</code> inverts (prints non-matching lines), <code>-i</code> ignores case &mdash; flags reached for constantly when scanning logs.</li>
      <li><code>-E</code> enables extended regex so alternation (<code>a|b</code>) and quantifiers (<code>{2,3}</code>) work without backslash-escaping them.</li>
      <li><code>-o</code> prints only the matched portion of each line rather than the whole line &mdash; useful for pulling one value (like a timestamp) out of a larger log line.</li>
    </ul>`,
  example: `printf "ERROR: timeout\\nINFO: ok\\nERROR: crc fail\\n" | grep -c "ERROR"`,
  task: `Complete <code>count_errors</code> so it prints how many lines in <code>log</code> contain <code>"ERROR"</code> or <code>"WARN"</code>, using extended grep.`,
  starter: `count_errors() {
  local log="INFO boot ok
WARN low battery
ERROR sensor timeout
INFO moving"
  # TODO: print the count of lines matching ERROR or WARN, using grep -E
}

count_errors
`,
  expected: "2",
  hint: 'printf \'%s\\n\' "$log" | grep -Ec "ERROR|WARN"',
  options: ""
},
{
  id: "sed-basics",
  tag: "Text Processing",
  level: "intermediate",
  title: "sed Stream Editing",
  theory: `
    <ul>
      <li><code>sed 's/old/new/'</code> replaces the first match per line; add a trailing <code>g</code> to replace every match on the line.</li>
      <li><code>sed -n 'Np'</code> (with <code>-n</code> suppressing default output) prints just line <code>N</code> &mdash; a quick way to grab one line out of a stream without <code>awk</code>.</li>
      <li>Because <code>sed</code> streams line by line, it's a natural fit mid-pipeline for reshaping log output, e.g. redacting a field or normalizing a delimiter before the next stage.</li>
    </ul>`,
  example: `echo "speed=3.5,heading=90" | sed 's/,/ /'`,
  task: `Complete <code>redact_token</code> so it replaces every digit in <code>token</code> with <code>#</code> using <code>sed</code>.`,
  starter: `redact_token() {
  local token="key12345"
  # TODO: use sed to replace every digit in $token with '#', print the result
}

redact_token
`,
  expected: "key#####",
  hint: "echo \"$token\" | sed 's/[0-9]/#/g'",
  options: ""
},
{
  id: "awk-basics",
  tag: "Text Processing",
  level: "intermediate",
  title: "awk Field Processing",
  theory: `
    <ul>
      <li><code>awk</code> splits each input line into fields (<code>$1</code>, <code>$2</code>, ...) on whitespace (or <code>-F</code> for a custom delimiter) and runs a block per line &mdash; a natural fit for column-oriented data like a CSV log.</li>
      <li><code>END { ... }</code> runs once after all lines are processed, the usual place to print an accumulated total or average.</li>
      <li>Built-in variables like <code>NR</code> (current line number) and <code>NF</code> (number of fields on the current line) are available without tracking them yourself.</li>
    </ul>`,
  example: `printf "a 1\\nb 2\\nc 3\\n" | awk '{print $1, $2 * 10}'`,
  task: `Complete <code>total_distance</code> so it sums the second column of <code>log</code> using <code>awk</code> and prints the total.`,
  starter: `total_distance() {
  local log="leg1 12
leg2 8
leg3 15"
  # TODO: use awk to sum the second field of each line and print the total
}

total_distance
`,
  expected: "35",
  hint: "printf '%s\\n' \"$log\" | awk '{sum += $2} END {print sum}'",
  options: ""
},
{
  id: "cut-sort-uniq",
  tag: "Text Processing",
  level: "basic",
  title: "cut, sort & uniq",
  theory: `
    <ul>
      <li><code>cut -d&lt;delim&gt; -f&lt;n&gt;</code> pulls out one column from delimited text without the overhead of <code>awk</code> when you only need a single field.</li>
      <li><code>sort</code> orders lines (numerically with <code>-n</code>, reversed with <code>-r</code>); <code>uniq</code> collapses <em>adjacent</em> duplicate lines, so it's almost always used right after <code>sort</code> (<code>sort | uniq</code>).</li>
      <li><code>uniq -c</code> prefixes each line with its occurrence count &mdash; a quick frequency table without a full scripting language.</li>
    </ul>`,
  example: `printf "b\\na\\nb\\nc\\n" | sort | uniq -c`,
  task: `Complete <code>unique_sensors</code> so it prints the distinct, sorted sensor names (first comma-delimited field) from <code>log</code>.`,
  starter: `unique_sensors() {
  local log="imu,10
lidar,5
imu,12
gps,3"
  # TODO: extract the first comma-delimited field from each line, then print the sorted unique values
}

unique_sensors
`,
  expected: "gps\nimu\nlidar",
  hint: "printf '%s\\n' \"$log\" | cut -d',' -f1 | sort -u",
  options: ""
},
{
  id: "wc-tr",
  tag: "Text Processing",
  level: "basic",
  title: "wc & tr",
  theory: `
    <ul>
      <li><code>wc</code> counts lines (<code>-l</code>), words (<code>-w</code>), or bytes (<code>-c</code>) in its input &mdash; the standard way to size up a file or a pipeline's output.</li>
      <li><code>tr</code> transliterates or deletes characters one-to-one, e.g. <code>tr 'a-z' 'A-Z'</code> for case conversion, or <code>tr -d '\\n'</code> to strip newlines &mdash; it works on a character stream, not lines, unlike <code>sed</code>.</li>
      <li>Both compose naturally in a pipeline, e.g. normalizing whitespace with <code>tr -s</code> before counting words.</li>
    </ul>`,
  example: `echo "hello world" | tr 'a-z' 'A-Z'`,
  task: `Complete <code>word_count</code> so it prints the number of whitespace-separated words in <code>sentence</code> using <code>wc</code>.`,
  starter: `word_count() {
  local sentence="initiate startup sequence now"
  # TODO: print the number of words in $sentence using wc -w
}

word_count
`,
  expected: "4",
  hint: 'echo "$sentence" | wc -w',
  options: ""
},
{
  id: "permissions-chmod",
  tag: "Filesystem",
  level: "basic",
  title: "File Permissions & chmod",
  theory: `
    <ul>
      <li>Permissions are three triplets (owner/group/other) of read/write/execute, shown as <code>rwxrwxrwx</code> by <code>ls -l</code> and settable numerically (<code>chmod 750 file</code>) or symbolically (<code>chmod u+x file</code>).</li>
      <li>On robotics hardware this matters directly: a serial device like <code>/dev/ttyUSB0</code> is a file, and a user without read/write permission on it (or without membership in the right group, e.g. <code>dialout</code>) simply can't talk to the motor controller.</li>
      <li><code>stat -c "%a"</code> prints just the numeric permission bits &mdash; handy for asserting permissions in a script instead of parsing the full <code>ls -l</code> line.</li>
    </ul>`,
  example: `touch f.txt
chmod 644 f.txt
stat -c "%a" f.txt`,
  task: `Complete <code>make_executable</code> so it adds owner-execute permission to <code>script.sh</code> (<code>chmod u+x</code>), then prints its resulting numeric permissions.`,
  starter: `make_executable() {
  touch script.sh
  chmod 644 script.sh
  # TODO: add owner execute permission to script.sh, then print its numeric permissions with stat -c "%a"
}

make_executable
`,
  expected: "744",
  hint: 'chmod u+x script.sh; stat -c "%a" script.sh',
  options: ""
},
{
  id: "find-xargs",
  tag: "Filesystem",
  level: "intermediate",
  title: "find & xargs",
  theory: `
    <ul>
      <li><code>find &lt;dir&gt; -name &lt;pattern&gt;</code> walks a directory tree looking for names matching a glob-style pattern &mdash; a recursive <code>ls</code> with a filter.</li>
      <li><code>xargs</code> turns lines/words from stdin into arguments for another command, letting you feed <code>find</code>'s output straight into e.g. <code>rm</code> or <code>wc</code> without a manual loop.</li>
      <li><code>-print0</code> / <code>xargs -0</code> (or <code>find -exec ... +</code>) is the correct null-delimited combo for filenames that might contain spaces or newlines; a plain pipe is fine for the simple, space-free case.</li>
    </ul>`,
  example: `mkdir -p logs && touch logs/a.log logs/b.txt
find logs -name "*.log"`,
  task: `Complete <code>count_log_files</code> so it counts how many <code>.log</code> files exist anywhere under <code>data/</code>, using <code>find</code> piped into <code>wc -l</code>.`,
  starter: `count_log_files() {
  mkdir -p data/2024 data/2025
  touch data/2024/a.log data/2024/b.txt data/2025/c.log
  # TODO: count the .log files under data/ (recursively) using find | wc -l
}

count_log_files
`,
  expected: "2",
  hint: 'find data -name "*.log" | wc -l',
  options: ""
},
{
  id: "symlinks",
  tag: "Filesystem",
  level: "intermediate",
  title: "Hard vs Symbolic Links",
  theory: `
    <ul>
      <li><code>ln src dst</code> makes a hard link: another name for the exact same inode/data &mdash; deleting the original name leaves the data reachable via the link.</li>
      <li><code>ln -s src dst</code> makes a symbolic link: a separate file that just stores a path &mdash; deleting or moving the original leaves it "dangling," and unlike a hard link it can point across filesystems or at a directory.</li>
      <li><code>[[ -L path ]]</code> checks whether a path is a symlink; <code>readlink path</code> prints what it points to &mdash; both come up when a script needs to tell a real config/device file from a symlinked one (e.g. a udev-created <code>/dev/ttyROBOT -&gt; /dev/ttyUSB0</code>).</li>
    </ul>`,
  example: `echo "data" > real.txt
ln -s real.txt link.txt
readlink link.txt`,
  task: `Complete <code>check_link</code> so it creates a symlink <code>latest.log -&gt; current.log</code>, then prints <code>"symlink"</code> if <code>latest.log</code> is a symlink, else <code>"regular"</code>.`,
  starter: `check_link() {
  echo "boot ok" > current.log
  # TODO: create a symlink named latest.log pointing to current.log
  if [[ -L latest.log ]]; then
    echo "symlink"
  else
    echo "regular"
  fi
}

check_link
`,
  expected: "symlink",
  hint: "ln -s current.log latest.log",
  options: ""
},
{
  id: "exit-codes",
  tag: "Process Control",
  level: "basic",
  title: "Exit Codes & $?",
  theory: `
    <ul>
      <li>Every command returns an exit status of <code>0</code>&ndash;<code>255</code> on completion: <code>0</code> means success, anything else means failure, checked via <code>$?</code> or directly in an <code>if</code>.</li>
      <li><code>$?</code> is overwritten by the very next command, so capture it into a variable immediately if you need it later.</li>
      <li><code>cmd1 &amp;&amp; cmd2</code> runs <code>cmd2</code> only if <code>cmd1</code> succeeded; <code>cmd1 || cmd2</code> runs <code>cmd2</code> only if it failed &mdash; short-circuit chaining built directly on exit codes.</li>
    </ul>`,
  example: `grep -q "ERROR" <<< "all good"
echo "exit code: $?"`,
  task: `Complete <code>safe_divide</code> so it prints the quotient if <code>b</code> is non-zero, or prints <code>"error: division by zero"</code> and returns <code>1</code> if <code>b</code> is zero.`,
  starter: `safe_divide() {
  local a=$1
  local b=$2
  # TODO: if b is 0, print "error: division by zero" and return 1; otherwise print a / b
}

safe_divide 10 2
safe_divide 5 0 || true
`,
  expected: "5\nerror: division by zero",
  hint: 'if (( b == 0 )); then echo "error: division by zero"; return 1; fi; echo $((a / b))',
  options: ""
},
{
  id: "background-jobs",
  tag: "Process Control",
  level: "intermediate",
  title: "Background Jobs & wait",
  theory: `
    <ul>
      <li>Appending <code>&amp;</code> runs a command in the background and immediately returns control to the script; <code>$!</code> holds the PID of the most recently backgrounded job.</li>
      <li><code>wait</code> (no arguments) blocks until every background job launched by the current shell finishes &mdash; the standard way to fan out independent work (e.g. polling several sensors) and then join before continuing.</li>
      <li>Because backgrounded jobs run concurrently, their output can interleave; if you need each job's result, have it write to its own file rather than relying on print ordering.</li>
    </ul>`,
  example: `(sleep 0.05; echo "done1") &
(sleep 0.02; echo "done2") &
wait
echo "all finished"`,
  task: `Complete <code>poll_sensors</code> so it launches <code>poll imu</code> and <code>poll gps</code> in the background, waits for both, then prints <code>"all polled"</code>.`,
  starter: `poll() {
  echo "polled $1" >> results.txt
}

poll_sensors() {
  rm -f results.txt
  # TODO: run "poll imu" and "poll gps" in the background, then wait for both to finish
  echo "all polled"
  sort results.txt
}

poll_sensors
`,
  expected: "all polled\npolled gps\npolled imu",
  hint: "poll imu & poll gps & wait",
  options: ""
},
{
  id: "process-substitution",
  tag: "Process Control",
  level: "advanced",
  title: "Process Substitution",
  theory: `
    <ul>
      <li><code>&lt;(command)</code> runs <code>command</code> and presents its output as a filename &mdash; lets a program that expects file arguments (like <code>diff</code>) consume a pipeline's output directly, with no temp file.</li>
      <li><code>diff &lt;(cmd1) &lt;(cmd2)</code> is the classic use: compare two commands' output as if they were two files, no manual <code>&gt; tmp1; &gt; tmp2; diff tmp1 tmp2</code> dance.</li>
      <li>This differs from a pipe: a pipe feeds one command's stdout into another's stdin, while process substitution gives you a pseudo-file you can pass anywhere a filename is expected &mdash; including twice, to two different arguments.</li>
    </ul>`,
  example: `diff <(echo -e "a\\nb") <(echo -e "a\\nc") || echo "differ"`,
  task: `Complete <code>configs_match</code> so it prints <code>"match"</code> if the sorted contents of <code>expected</code> and <code>actual</code> are identical, or <code>"differ"</code> otherwise, using <code>diff</code> with process substitution (no temp files).`,
  starter: `configs_match() {
  local expected="gps
imu
lidar"
  local actual="lidar
imu
gps"
  # TODO: use diff with process substitution on the sorted expected/actual, print "match" or "differ"
}

configs_match
`,
  expected: "match",
  hint: 'if diff <(sort <<< "$expected") <(sort <<< "$actual") > /dev/null; then echo "match"; else echo "differ"; fi',
  options: ""
},
{
  id: "signals-trap",
  tag: "Process Control",
  level: "advanced",
  title: "Signals & trap",
  theory: `
    <ul>
      <li>Signals are asynchronous notifications sent to a process (Ctrl-C sends <code>SIGINT</code>, plain <code>kill</code> sends <code>SIGTERM</code>) &mdash; <code>trap 'handler' SIGNAL</code> lets a script intercept one instead of dying immediately.</li>
      <li><code>trap 'cleanup' EXIT</code> runs <code>cleanup</code> no matter how the script ends (normal exit, an error, or a caught signal) &mdash; the shell-script equivalent of a destructor, commonly used to release a lock file or close a serial connection.</li>
      <li>A script can send itself a signal with <code>kill -SIGNAL $$</code> (its own PID) &mdash; useful for testing a trap handler without a second process.</li>
    </ul>`,
  example: `trap 'echo "cleaning up"' EXIT
echo "working"`,
  task: `Complete the script so <code>trap</code> registers <code>handle_shutdown</code> as the handler for <code>SIGTERM</code>, then the script sends itself <code>SIGTERM</code> to trigger it.`,
  starter: `handle_shutdown() {
  echo "shutting down safely"
}

# TODO: register handle_shutdown as the handler for SIGTERM
echo "running"
kill -TERM $$
sleep 0.1
`,
  expected: "running\nshutting down safely",
  hint: "trap handle_shutdown TERM",
  options: ""
},
{
  id: "redirection",
  tag: "Pipes & Redirection",
  level: "basic",
  title: "I/O Redirection & stderr",
  theory: `
    <ul>
      <li><code>&gt;</code> overwrites a file with a command's stdout, <code>&gt;&gt;</code> appends; <code>&lt;</code> feeds a file to a command's stdin.</li>
      <li>File descriptor 2 is stderr, separate from stdout (fd 1); <code>2&gt;&amp;1</code> duplicates stderr onto wherever stdout currently points &mdash; it must come <em>after</em> the stdout redirect (<code>cmd &gt; out.log 2&gt;&amp;1</code>) to actually merge both into the same file.</li>
      <li>Redirecting to <code>/dev/null</code> discards output entirely &mdash; the standard way to silence a command's stdout and/or stderr in a script that only cares about its exit code.</li>
    </ul>`,
  example: `echo "ok" > out.log
echo "boom" >&2
cat out.log`,
  task: `Complete <code>run_quietly</code> so it runs <code>noisy_check</code>, redirecting both its stdout and stderr into <code>all.log</code>, then prints how many lines the log ended up with.`,
  starter: `noisy_check() {
  echo "starting check"
  echo "warning: low signal" >&2
  echo "check complete"
}

run_quietly() {
  # TODO: run noisy_check, redirecting both stdout and stderr into all.log
  wc -l < all.log
}

run_quietly
`,
  expected: "3",
  hint: "noisy_check > all.log 2>&1",
  options: ""
},
{
  id: "pipes-tee",
  tag: "Pipes & Redirection",
  level: "intermediate",
  title: "Pipes & tee",
  theory: `
    <ul>
      <li>A pipe (<code>|</code>) connects one command's stdout directly to the next command's stdin, building a processing pipeline without intermediate files.</li>
      <li><code>tee file</code> copies its stdin to both a file and its own stdout unchanged &mdash; useful mid-pipeline when you want to save a snapshot of the data at that stage and keep processing it.</li>
      <li>Each stage of a pipeline runs as its own concurrent process, which is why a long pipeline can start producing output before the first stage has finished.</li>
    </ul>`,
  example: `printf "3\\n1\\n2\\n" | sort | tee sorted.log | tail -n 1`,
  task: `Complete <code>pipeline</code> so it filters <code>data</code> for lines containing <code>"OK"</code>, saves that filtered result to <code>ok.log</code> with <code>tee</code>, and also prints the count of matching lines.`,
  starter: `pipeline() {
  local data="OK imu
FAIL lidar
OK gps
FAIL camera"
  # TODO: filter lines containing "OK" from $data, save them to ok.log via tee, and print the count of matching lines
}

pipeline
`,
  expected: "2",
  hint: "printf '%s\\n' \"$data\" | grep \"OK\" | tee ok.log | wc -l",
  options: ""
},
{
  id: "env-config",
  tag: "System",
  level: "basic",
  title: "Environment Variables & export",
  theory: `
    <ul>
      <li>A variable is local to the current shell until <code>export</code>ed, which copies it into the environment every child process inherits &mdash; how config like <code>ROBOT_ID</code> passes from a parent script into the programs it launches.</li>
      <li><code>\${VAR:-default}</code> expands to <code>VAR</code>'s value if set (and non-empty), or <code>default</code> otherwise, without mutating <code>VAR</code> &mdash; the standard way to give a config variable a fallback.</li>
      <li>Child processes get a <em>copy</em> of the environment: anything a child exports or modifies never propagates back up to the parent shell that launched it.</li>
    </ul>`,
  example: `export ROBOT_ID="rx200"
bash -c 'echo "child sees: $ROBOT_ID"'`,
  task: `Complete <code>resolve_log_level</code> so it prints the value of <code>LOG_LEVEL</code> if set, otherwise <code>"info"</code>, using <code>\${VAR:-default}</code> (no <code>if</code> statement).`,
  starter: `resolve_log_level() {
  # TODO: print $LOG_LEVEL if set, otherwise "info", using parameter expansion default
}

unset LOG_LEVEL
resolve_log_level
LOG_LEVEL="debug"
resolve_log_level
`,
  expected: "info\ndebug",
  hint: 'echo "${LOG_LEVEL:-info}"',
  options: ""
},
{
  id: "log-parsing-pipeline",
  tag: "Robotics Ops",
  level: "advanced",
  title: "Multi-Stage Log Parsing Pipeline",
  theory: `
    <ul>
      <li>Real log analysis is rarely one tool: filter with <code>grep</code>, extract fields with <code>awk</code> or <code>cut</code>, then aggregate with <code>sort</code>/<code>uniq</code> &mdash; chained together through pipes into one pipeline.</li>
      <li>Building it left to right and checking each stage's output independently (piping into <code>head</code>/<code>wc -l</code> while developing) is far easier than writing the whole pipeline blind and debugging it as one unit.</li>
      <li>This filter &rarr; extract &rarr; aggregate shape is exactly what you'd run over an exported text log or a journal dump to answer "which node logged the most errors."</li>
    </ul>`,
  example: `log="node_a ERROR crc fail
node_b INFO ok
node_a ERROR timeout
node_c WARN retry"
printf '%s\\n' "$log" | grep ERROR | awk '{print $1}' | sort | uniq -c`,
  task: `Complete <code>top_error_node</code> so it prints just the node name (first field) that logged the most <code>ERROR</code> lines in <code>log</code>.`,
  starter: `top_error_node() {
  local log="node_a ERROR crc fail
node_b INFO ok
node_a ERROR timeout
node_c WARN retry
node_a ERROR watchdog"
  # TODO: filter for ERROR lines, extract the first field, count occurrences per node, and print the node with the most errors
}

top_error_node
`,
  expected: "node_a",
  hint: "printf '%s\\n' \"$log\" | grep ERROR | awk '{print $1}' | sort | uniq -c | sort -rn | head -n 1 | awk '{print $2}'",
  options: ""
},
{
  id: "retry-loop",
  tag: "Robotics Ops",
  level: "advanced",
  title: "Retry Loop with Backoff",
  theory: `
    <ul>
      <li>A transient failure (a serial port not ready yet, a flaky network call) is often best handled by retrying a few times rather than failing immediately &mdash; loop up to a max attempt count, breaking out as soon as the command succeeds.</li>
      <li>Checking the command's exit status directly in the loop condition (<code>if cmd; then break; fi</code>) reads more naturally than capturing <code>$?</code> into a variable first.</li>
      <li>A real implementation would <code>sleep</code> an increasing amount between attempts; the shape here (bounded retries, then a final failure message) is what matters for a script reconnecting to a device that starts up a moment after the script does.</li>
    </ul>`,
  example: `attempt=0
until (( attempt >= 3 )); do
  echo "attempt $((attempt + 1))"
  attempt=$((attempt + 1))
done`,
  task: `Complete <code>connect_with_retry</code> so it calls <code>try_connect</code> up to <code>max</code> times, printing <code>"connected"</code> and stopping as soon as it succeeds, or printing <code>"failed after 3 attempts"</code> if every attempt fails.`,
  starter: `attempt_count=0
try_connect() {
  attempt_count=$((attempt_count + 1))
  # Succeeds only on the 3rd attempt
  (( attempt_count >= 3 ))
}

connect_with_retry() {
  local max=3
  # TODO: call try_connect up to max times; print "connected" and stop as soon as it succeeds,
  # or print "failed after 3 attempts" if it never succeeds within max tries
}

connect_with_retry
`,
  expected: "connected",
  hint: 'for ((i=0; i<max; i++)); do if try_connect; then echo "connected"; return; fi; done; echo "failed after $max attempts"',
  options: ""
}
  ]
};
