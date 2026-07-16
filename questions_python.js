window.TOPIC_BANKS = window.TOPIC_BANKS || {};
TOPIC_BANKS.python = {
  label: "Python",
  compiler: "cpython-3.12.7",
  topics: [
{
  id: "mutability-aliasing",
  tag: "Foundations",
  level: "basic",
  title: "Mutable vs Immutable Types & Aliasing",
  theory: `
    <ul>
      <li>Lists, dicts, and sets are <strong>mutable</strong> and passed by object reference · mutating one inside a function (e.g. <code>.append()</code>) is visible to the caller.</li>
      <li>Numbers, strings, and tuples are <strong>immutable</strong> · "modifying" them (e.g. <code>x += 1</code>) rebinds the local name to a new object and does not affect the caller.</li>
      <li>In robotics code this matters for shared state like a sensor log or a ring buffer: append/mutate in place if the caller should see the update, or explicitly return a new object if you want a pure function.</li>
    </ul>`,
  example: `def normalize(readings):
    # Pure: returns a new list, does not mutate the caller's list
    total = sum(readings)
    return [r / total for r in readings]

original = [1, 2, 3]
scaled = normalize(original)
print(original)  # unchanged
print(scaled)`,
  task: `Complete <code>add_reading</code> so it appends <code>value</code> onto <code>sensor_log</code> <em>in place</em> (do not reassign the parameter or return a new list).`,
  starter: `def add_reading(sensor_log, value):
    # TODO: append value to sensor_log in place (do not reassign sensor_log)
    pass

def main():
    log = [10, 12]
    add_reading(log, 15)
    print(log)

main()
`,
  expected: "[10, 12, 15]",
  hint: "sensor_log.append(value)",
  options: ""
},
{
  id: "comprehensions",
  tag: "Foundations",
  level: "basic",
  title: "Comprehensions",
  theory: `
    <ul>
      <li>List/dict/set comprehensions build a new collection from an iterable in one expression, e.g. <code>[r for r in readings if r &gt; 0]</code>.</li>
      <li>They're generally faster and more readable than an equivalent <code>for</code> loop with <code>.append()</code>, but avoid nesting more than one or two levels · that's when a plain loop reads better.</li>
      <li>A dict comprehension <code>{k: f(v) for k, v in d.items()}</code> is the idiomatic way to transform every value of a mapping, e.g. converting a batch of sensor readings to different units.</li>
    </ul>`,
  example: `readings = [1, -2, 3, -4, 5]
positive = [r for r in readings if r > 0]
print(positive)`,
  task: `Complete <code>scale_readings</code> using a dict comprehension that maps each sensor name to its reading multiplied by <code>2</code>.`,
  starter: `def scale_readings(readings):
    # TODO: return a dict comprehension mapping name -> value * 2
    pass

def main():
    readings = {"imu": 3, "lidar": 5, "gps": 2}
    scaled = scale_readings(readings)
    for k in sorted(scaled):
        print(k, scaled[k])

main()
`,
  expected: "gps 4\nimu 6\nlidar 10",
  hint: "return {k: v * 2 for k, v in readings.items()}",
  options: ""
},
{
  id: "generators",
  tag: "Foundations",
  level: "intermediate",
  title: "Generators & yield",
  theory: `
    <ul>
      <li>A function with <code>yield</code> is a generator: calling it returns an iterator that produces values lazily, one at a time, instead of building a whole list up front.</li>
      <li>This matters for streaming data · e.g. reading sensor samples off a serial port · where you don't want to (or can't) hold the entire stream in memory at once.</li>
      <li><code>list(gen(...))</code> forces full evaluation, which is fine in tests but defeats the memory benefit in production use.</li>
    </ul>`,
  example: `def sensor_stream(values):
    for v in values:
        yield v * 1.0

for reading in sensor_stream([1, 2, 3]):
    print(reading)`,
  task: `Complete the generator <code>squares_up_to</code> so it yields <code>i * i</code> for every <code>i</code> in <code>range(n)</code>.`,
  starter: `def squares_up_to(n):
    # TODO: yield i * i for i in range(n)
    pass

def main():
    print(list(squares_up_to(5)))

main()
`,
  expected: "[0, 1, 4, 9, 16]",
  hint: "for i in range(n): yield i * i",
  options: ""
},
{
  id: "decorators",
  tag: "Foundations",
  level: "intermediate",
  title: "Decorators",
  theory: `
    <ul>
      <li>A decorator is a function that takes a function and returns a wrapped version of it · <code>@log_call</code> above a <code>def</code> is sugar for <code>read_battery = log_call(read_battery)</code>.</li>
      <li>Common uses: logging, timing, retries, caching (<code>functools.lru_cache</code>), and access control · all without touching the wrapped function's body.</li>
      <li>The wrapper must forward <code>*args, **kwargs</code> and return the inner function's result, or callers silently lose arguments/return values.</li>
    </ul>`,
  example: `def log_call(func):
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper`,
  task: `Complete <code>log_call</code> so the returned wrapper is actually used as the decorator (it currently defines <code>wrapper</code> but doesn't return it).`,
  starter: `def log_call(func):
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    # TODO: return wrapper
    pass

@log_call
def read_battery():
    return 87

read_battery()
`,
  expected: "calling read_battery\nread_battery returned 87",
  hint: "return wrapper",
  options: ""
},
{
  id: "context-managers",
  tag: "Foundations",
  level: "intermediate",
  title: "Context Managers (with statement)",
  theory: `
    <ul>
      <li>A <code>with obj:</code> block calls <code>obj.__enter__()</code> on entry and <code>obj.__exit__(exc_type, exc_val, exc_tb)</code> on exit &mdash; <strong>even if the block raises</strong>.</li>
      <li>This is the right way to guarantee cleanup for anything with an open/close lifecycle: files, network sockets, locks, or a serial connection to a motor controller.</li>
      <li>If <code>__exit__</code> returns a truthy value, the exception is <strong>suppressed</strong>; returning <code>None</code>/<code>False</code> (the default) lets it propagate.</li>
    </ul>`,
  example: `class Timer:
    def __enter__(self):
        print("start")
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("stop")

with Timer():
    print("working")`,
  task: `Complete <code>Device.__exit__</code> so it prints <code>"Disconnected"</code> on the way out of the <code>with</code> block.`,
  starter: `class Device:
    def __enter__(self):
        print("Connected")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # TODO: print "Disconnected"
        pass

with Device():
    print("Reading sensor")
`,
  expected: "Connected\nReading sensor\nDisconnected",
  hint: 'print("Disconnected")',
  options: ""
},
{
  id: "args-kwargs",
  tag: "Foundations",
  level: "basic",
  title: "*args and **kwargs",
  theory: `
    <ul>
      <li><code>*args</code> collects extra positional arguments into a tuple; <code>**kwargs</code> collects extra keyword arguments into a dict.</li>
      <li>The mirror operation · <code>func(*args, **kwargs)</code> at a call site · unpacks them back out, which is exactly what a generic dispatcher/callback router needs to forward a call it doesn't know the shape of.</li>
      <li>Common in robotics middleware: a callback registry that dispatches sensor-event handlers without knowing each handler's exact signature.</li>
    </ul>`,
  example: `def call_with_logging(func, *args, **kwargs):
    print("dispatching", func.__name__)
    return func(*args, **kwargs)`,
  task: `Complete <code>dispatch</code> so it calls <code>handler</code> forwarding whatever positional and keyword arguments it received, and returns the result.`,
  starter: `def dispatch(handler, *args, **kwargs):
    # TODO: call handler with the given args and kwargs, and return its result
    pass

def add(a, b, scale=1):
    return (a + b) * scale

def main():
    result = dispatch(add, 3, 4, scale=2)
    print(result)

main()
`,
  expected: "14",
  hint: "return handler(*args, **kwargs)",
  options: ""
},
{
  id: "oop-dunder",
  tag: "OOP",
  level: "intermediate",
  title: "Classes & Dunder Methods",
  theory: `
    <ul>
      <li>Dunder ("double underscore") methods let a class hook into Python's built-in syntax: <code>__init__</code> for construction, <code>__repr__</code> for debug printing, <code>__eq__</code> for <code>==</code>, <code>__add__</code> for <code>+</code>, and so on.</li>
      <li>This is Python's equivalent of C++ operator overloading · implementing <code>__add__</code> on a <code>Vector2D</code> lets you write <code>a + b</code> instead of a named method.</li>
      <li>Prefer returning a <em>new</em> instance from operators rather than mutating <code>self</code>, so <code>a + b</code> behaves the way callers expect value types to behave.</li>
    </ul>`,
  example: `class Vector2D:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __repr__(self):
        return f"Vector2D({self.x}, {self.y})"`,
  task: `Complete <code>Vector2D.__add__</code> so <code>a + b</code> returns a new <code>Vector2D</code> that is the componentwise sum.`,
  starter: `class Vector2D:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        # TODO: return a new Vector2D that is the componentwise sum
        pass

    def __repr__(self):
        return f"Vector2D({self.x}, {self.y})"

def main():
    a = Vector2D(1, 2)
    b = Vector2D(3, 4)
    print(a + b)

main()
`,
  expected: "Vector2D(4, 6)",
  hint: "return Vector2D(self.x + other.x, self.y + other.y)",
  options: ""
},
{
  id: "inheritance-polymorphism",
  tag: "OOP",
  level: "intermediate",
  title: "Inheritance & Polymorphism",
  theory: `
    <ul>
      <li><code>abc.ABC</code> plus <code>@abstractmethod</code> defines an interface: subclasses must override every abstract method or they can't be instantiated at all · Python's answer to C++'s pure virtual functions.</li>
      <li>This is the standard shape for a sensor/driver abstraction layer: a <code>Sensor</code> base class declares <code>read()</code>, and each concrete sensor (<code>Lidar</code>, <code>Imu</code>, ...) implements it differently.</li>
      <li>Calling <code>s.read()</code> in a loop over a mixed list of sensor objects dispatches to the right subclass automatically · that's polymorphism, no <code>if isinstance(...)</code> chain needed.</li>
    </ul>`,
  example: `from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        ...

class Square(Shape):
    def __init__(self, side):
        self.side = side
    def area(self):
        return self.side ** 2`,
  task: `Complete <code>Lidar.read</code> so it overrides the abstract <code>Sensor.read</code> and returns <code>3.5</code> (a simulated distance in meters).`,
  starter: `from abc import ABC, abstractmethod

class Sensor(ABC):
    @abstractmethod
    def read(self):
        ...

class Lidar(Sensor):
    def read(self):
        # TODO: return 3.5
        pass

def main():
    sensors = [Lidar()]
    for s in sensors:
        print(s.read())

main()
`,
  expected: "3.5",
  hint: "return 3.5",
  options: ""
},
{
  id: "exceptions",
  tag: "Foundations",
  level: "basic",
  title: "Exceptions & Error Handling",
  theory: `
    <ul>
      <li>Custom exception classes (subclassing <code>Exception</code>) let callers catch <em>specific</em> failure modes · e.g. <code>SensorTimeoutError</code> · instead of a bare <code>except Exception</code> that would also swallow real bugs.</li>
      <li><code>try/except/else/finally</code>: <code>else</code> runs only if no exception was raised, <code>finally</code> always runs (cleanup), regardless of what happened in <code>try</code>.</li>
      <li>Catch the narrowest exception type you can act on; let everything else propagate so it's visible instead of silently hidden.</li>
    </ul>`,
  example: `class SensorTimeoutError(Exception):
    pass

def read_sensor(timed_out):
    if timed_out:
        raise SensorTimeoutError("no response")
    return 42`,
  task: `Complete the <code>except</code> block so it prints <code>"error: "</code> followed by the exception's message.`,
  starter: `class SensorTimeoutError(Exception):
    pass

def read_sensor(timed_out):
    if timed_out:
        raise SensorTimeoutError("no response from sensor")
    return 42

def main():
    try:
        value = read_sensor(True)
        print(value)
    except SensorTimeoutError as e:
        # TODO: print "error: " followed by the exception message
        pass

main()
`,
  expected: "error: no response from sensor",
  hint: 'print(f"error: {e}")',
  options: ""
},
{
  id: "closures-scope",
  tag: "Foundations",
  level: "advanced",
  title: "Closures & Scope",
  theory: `
    <ul>
      <li>A nested function that references a variable from its enclosing function forms a <strong>closure</strong> &mdash; it keeps that variable alive after the outer function returns.</li>
      <li><code>nonlocal</code> is required to <em>rebind</em> (not just read) an enclosing-scope variable from inside the nested function; without it, <code>total += value</code> would raise <code>UnboundLocalError</code>.</li>
      <li>Closures are a lightweight alternative to a full class when you just need a stateful callable, e.g. a running-average filter or a rate limiter.</li>
    </ul>`,
  example: `def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment`,
  task: `Complete <code>add</code> inside <code>make_averager</code> so it updates the running total/count and returns the running average.`,
  starter: `def make_averager():
    total = 0
    count = 0
    def add(value):
        nonlocal total, count
        # TODO: update total and count, then return the running average (total / count)
        pass
    return add

def main():
    avg = make_averager()
    avg(10)
    avg(20)
    print(avg(30))

main()
`,
  expected: "20.0",
  hint: "total += value; count += 1; return total / count",
  options: ""
},
{
  id: "enum-state-machine",
  tag: "Foundations",
  level: "intermediate",
  title: "Enum State Machines",
  theory: `
    <ul>
      <li><code>enum.Enum</code> gives named, comparable constants instead of magic strings/ints · <code>RobotState.MOVING</code> is safer and more readable than <code>"moving"</code> scattered through the code.</li>
      <li>A robot supervisor is almost always a small state machine (<code>IDLE</code>, <code>MOVING</code>, <code>ESTOPPED</code>, ...): a pure function computes the next state from the current state and inputs, which is easy to unit test without any real hardware.</li>
      <li><code>auto()</code> assigns increasing values automatically so you don't have to hand-number each member.</li>
    </ul>`,
  example: `from enum import Enum, auto

class Light(Enum):
    RED = auto()
    GREEN = auto()

print(Light.RED.name, Light.RED.value)`,
  task: `Complete <code>next_state</code> so that from <code>IDLE</code>, with no e-stop pressed, it transitions to <code>MOVING</code>.`,
  starter: `from enum import Enum, auto

class RobotState(Enum):
    IDLE = auto()
    MOVING = auto()
    ESTOPPED = auto()

def next_state(state, estop_pressed):
    if estop_pressed:
        return RobotState.ESTOPPED
    if state == RobotState.IDLE:
        # TODO: return RobotState.MOVING
        pass
    return state

def main():
    s = next_state(RobotState.IDLE, False)
    print(s.name)

main()
`,
  expected: "MOVING",
  hint: "return RobotState.MOVING",
  options: ""
},
{
  id: "dataclasses",
  tag: "Foundations",
  level: "basic",
  title: "Dataclasses",
  theory: `
    <ul>
      <li><code>@dataclass</code> auto-generates <code>__init__</code>, <code>__repr__</code>, and <code>__eq__</code> from a list of typed fields, removing the usual constructor boilerplate for a simple value object.</li>
      <li>Good fit for small immutable-ish records that show up constantly in robotics code: a 2D point, an IMU sample, a waypoint &mdash; each is really just a bundle of fields plus a couple of methods.</li>
      <li>Type annotations (<code>x: float</code>) are what <code>@dataclass</code> reads to know which fields to generate for &mdash; they're not enforced at runtime by default.</li>
    </ul>`,
  example: `from dataclasses import dataclass

@dataclass
class Reading:
    sensor: str
    value: float

r = Reading("imu", 3.2)
print(r)`,
  task: `Complete <code>Point.distance_from_origin</code> so it returns the Euclidean distance of <code>(x, y)</code> from <code>(0, 0)</code>.`,
  starter: `from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

    def distance_from_origin(self):
        # TODO: return the Euclidean distance from (0, 0) using self.x and self.y
        pass

def main():
    p = Point(3.0, 4.0)
    print(p.distance_from_origin())

main()
`,
  expected: "5.0",
  hint: "return (self.x ** 2 + self.y ** 2) ** 0.5",
  options: ""
},
{
  id: "threading-gil",
  tag: "Concurrency",
  level: "advanced",
  title: "Threading & the GIL",
  theory: `
    <ul>
      <li>CPython's Global Interpreter Lock (GIL) means only one thread executes Python bytecode at a time &mdash; threads don't give you CPU parallelism, but they're still useful for I/O-bound work (waiting on a socket, a serial port, a sensor).</li>
      <li>Even without true parallelism, concurrent access to shared mutable state (like a shared counter) is still a race: the GIL can switch threads mid-<code>+=</code>, so unsynchronized increments from multiple threads can lose updates.</li>
      <li>A <code>threading.Lock</code> used via <code>with lock:</code> makes the increment atomic, exactly like a mutex would in C++.</li>
    </ul>`,
  example: `import threading

lock = threading.Lock()
total = 0

def add(n):
    global total
    with lock:
        total += n`,
  task: `Complete the loop body in <code>increment</code> so each iteration increments the shared <code>counter</code> safely using <code>lock</code>.`,
  starter: `import threading

counter = 0
lock = threading.Lock()

def increment(n):
    global counter
    for _ in range(n):
        # TODO: safely increment counter using "with lock:"
        pass

def main():
    threads = [threading.Thread(target=increment, args=(10000,)) for _ in range(4)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    print(counter)

main()
`,
  expected: "40000",
  hint: "with lock:\n    counter += 1",
  options: ""
},
{
  id: "asyncio-basics",
  tag: "Concurrency",
  level: "advanced",
  title: "asyncio Basics",
  theory: `
    <ul>
      <li><code>async def</code> defines a coroutine; <code>await</code> yields control back to the event loop while waiting on something (like <code>asyncio.sleep</code> standing in for a network/serial read), instead of blocking the whole process.</li>
      <li><code>asyncio.gather(a, b)</code> runs multiple coroutines <strong>concurrently</strong> on a single thread &mdash; useful for polling several sensors' I/O at once without the overhead of real threads.</li>
      <li>Unlike threading, there's no GIL contention to reason about here since only one coroutine actually runs at a time between <code>await</code> points &mdash; but you do need every blocking call in the chain to be the async version, or it defeats the point.</li>
    </ul>`,
  example: `import asyncio

async def wait_and_return(x):
    await asyncio.sleep(0.01)
    return x

async def main():
    print(await wait_and_return(1))

asyncio.run(main())`,
  task: `Complete <code>main</code> so it runs <code>poll_sensor("imu", 0.01)</code> and <code>poll_sensor("gps", 0.01)</code> concurrently with <code>asyncio.gather</code>, storing the results list in <code>results</code>.`,
  starter: `import asyncio

async def poll_sensor(name, delay):
    await asyncio.sleep(delay)
    return f"{name}:ok"

async def main():
    # TODO: results = await asyncio.gather(poll_sensor("imu", 0.01), poll_sensor("gps", 0.01))
    results = None
    print(results)

asyncio.run(main())
`,
  expected: "['imu:ok', 'gps:ok']",
  hint: 'results = await asyncio.gather(poll_sensor("imu", 0.01), poll_sensor("gps", 0.01))',
  options: ""
},
{
  id: "pid-controller",
  tag: "Robotics Math",
  level: "advanced",
  title: "PID Controller (Python)",
  theory: `
    <ul>
      <li>A PID controller outputs <code>kp*error + ki*integral(error) + kd*derivative(error)</code>: proportional response to the current error, integral to eliminate steady-state offset, derivative to damp overshoot.</li>
      <li>The integral term needs to accumulate <code>error * dt</code> across calls, and the derivative term needs the error from the <em>previous</em> call &mdash; so a PID controller almost always needs to be an object (or closure) that carries state between updates, not a stateless function.</li>
      <li>Same math as the equivalent C++ implementation; Python just makes the state explicit as <code>self.integral</code>/<code>self.prev_error</code> instead of member variables on a struct.</li>
    </ul>`,
  example: `class PID:
    def __init__(self, kp, ki, kd):
        self.kp, self.ki, self.kd = kp, ki, kd
        self.integral = 0.0
        self.prev_error = 0.0`,
  task: `Complete <code>PID.update</code> so it returns <code>kp*error + ki*integral + kd*derivative</code>.`,
  starter: `class PID:
    def __init__(self, kp, ki, kd):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.integral = 0.0
        self.prev_error = 0.0

    def update(self, error, dt):
        self.integral += error * dt
        derivative = (error - self.prev_error) / dt
        self.prev_error = error
        # TODO: return self.kp * error + self.ki * self.integral + self.kd * derivative
        pass

def main():
    pid = PID(2.0, 0.5, 0.1)
    output = pid.update(1.0, 0.1)
    print(round(output, 3))

main()
`,
  expected: "3.05",
  hint: "return self.kp * error + self.ki * self.integral + self.kd * derivative",
  options: ""
},
{
  id: "kalman-1d",
  tag: "Robotics Math",
  level: "advanced",
  title: "1D Kalman Filter (Python)",
  theory: `
    <ul>
      <li>A 1D Kalman update fuses a prior estimate (<code>prior_mean</code>, <code>prior_var</code>) with a new noisy measurement (<code>measurement</code>, <code>meas_var</code>) into a posterior estimate.</li>
      <li>The Kalman gain <code>k = prior_var / (prior_var + meas_var)</code> controls the blend: near 1 when the measurement is trusted more (low <code>meas_var</code>), near 0 when the prior is trusted more.</li>
      <li>Posterior mean is the prior nudged toward the measurement by <code>k</code>; posterior variance always <em>shrinks</em> &mdash; fusing a measurement in can only make you more certain, never less.</li>
    </ul>`,
  example: `def blend(prior, measurement, gain):
    return prior + gain * (measurement - prior)`,
  task: `Complete <code>kalman_update</code> so it computes and returns <code>(posterior_mean, posterior_var)</code>.`,
  starter: `def kalman_update(prior_mean, prior_var, measurement, meas_var):
    kalman_gain = prior_var / (prior_var + meas_var)
    # TODO: compute posterior_mean and posterior_var and return them as (posterior_mean, posterior_var)
    pass

def main():
    mean, var = kalman_update(0.0, 1.0, 2.0, 0.5)
    print(round(mean, 3), round(var, 3))

main()
`,
  expected: "1.333 0.333",
  hint: "posterior_mean = prior_mean + kalman_gain * (measurement - prior_mean)\nposterior_var = (1 - kalman_gain) * prior_var\nreturn posterior_mean, posterior_var",
  options: ""
},
{
  id: "diff-drive-kinematics",
  tag: "Robotics Math",
  level: "intermediate",
  title: "Differential-Drive Kinematics (Python)",
  theory: `
    <ul>
      <li>A differential-drive robot (two independently driven wheels) has linear velocity <code>(v_left + v_right) / 2</code> and angular velocity <code>(v_right - v_left) / wheel_base</code>.</li>
      <li>Equal wheel speeds &rarr; pure straight-line motion (angular velocity 0); opposite-signed equal speeds &rarr; pure in-place rotation (linear velocity 0).</li>
      <li>This pair of equations is the forward kinematics used every control-loop tick to convert wheel commands/encoder readings into the robot's actual body-frame velocity.</li>
    </ul>`,
  example: `def straight_line_speed(v_left, v_right):
    return (v_left + v_right) / 2.0`,
  task: `Complete <code>diff_drive_velocity</code> so <code>angular</code> is computed as <code>(v_right - v_left) / wheel_base</code>.`,
  starter: `def diff_drive_velocity(v_left, v_right, wheel_base):
    linear = (v_left + v_right) / 2.0
    # TODO: assign angular = (v_right - v_left) / wheel_base
    angular = None
    return linear, angular

def main():
    linear, angular = diff_drive_velocity(1.0, 1.5, 0.5)
    print(round(linear, 3), round(angular, 3))

main()
`,
  expected: "1.25 1.0",
  hint: "angular = (v_right - v_left) / wheel_base",
  options: ""
},
{
  id: "frame-transform-2d",
  tag: "Robotics Math",
  level: "intermediate",
  title: "2D Frame Transforms (Python)",
  theory: `
    <ul>
      <li>Sensor detections usually arrive in the sensor's own frame and need to be rotated (and translated) into the robot or world frame before fusion or planning can use them.</li>
      <li>A 2D rotation by <code>theta</code> is <code>x' = x*cos(theta) - y*sin(theta)</code>, <code>y' = x*sin(theta) + y*cos(theta)</code> &mdash; the 2D special case of a rotation matrix.</li>
      <li>In 3D this generalizes to rotation matrices/quaternions and homogeneous transforms (rotation + translation in one 4x4 matrix) &mdash; same idea, just more entries.</li>
    </ul>`,
  example: `import math

def translate(x, y, dx, dy):
    return x + dx, y + dy`,
  task: `Complete <code>rotate_point</code> so it returns the rotated <code>(x', y')</code> using the 2D rotation formula.`,
  starter: `import math

def rotate_point(x, y, theta):
    # TODO: return the rotated (x', y') using the 2D rotation formula
    pass

def main():
    x, y = rotate_point(1.0, 0.0, math.pi / 2)
    print(round(x, 3), round(y, 3))

main()
`,
  expected: "0.0 1.0",
  hint: "nx = x * math.cos(theta) - y * math.sin(theta)\nny = x * math.sin(theta) + y * math.cos(theta)\nreturn nx, ny",
  options: ""
},
{
  id: "sum-array",
  tag: "Logic",
  level: "basic",
  title: "Sum of Array Elements",
  theory: `
    <ul>
      <li>A running total is the simplest reduction over a collection: start an accumulator at <code>0</code> and add each element to it in a single pass (or just use the built-in <code>sum()</code>).</li>
      <li>This is the "hello world" of aggregating sensor/telemetry data · e.g. summing a batch of encoder ticks or samples before averaging them.</li>
      <li>A plain <code>for v in values:</code> loop is idiomatic here; reach for a comprehension only once the per-element logic is itself an expression.</li>
    </ul>`,
  example: `def count_positive(values):
    count = 0
    for v in values:
        if v > 0:
            count += 1
    return count`,
  task: `Complete <code>sum_array</code> so it returns the sum of all elements in <code>values</code>.`,
  starter: `def sum_array(values):
    # TODO: return the sum of all elements in values
    return 0

def main():
    data = [4, 8, 15, 16, 23, 42]
    print(f"Sum: {sum_array(data)}")

main()
`,
  expected: "Sum: 108",
  hint: "total = 0\nfor v in values:\n    total += v\nreturn total",
  options: ""
},
{
  id: "find-max",
  tag: "Logic",
  level: "basic",
  title: "Find Maximum in Array",
  theory: `
    <ul>
      <li>Track a running "best so far" value: initialize it to the first element, then replace it whenever a larger element is found (or just use the built-in <code>max()</code>).</li>
      <li>This single linear pass is the basis for a lot of sensor-processing code: finding the peak reading, the closest obstacle, or the most recent timestamp.</li>
      <li>Don't initialize the running max to <code>0</code> · if every value is negative, that's wrong. Initialize from the data itself.</li>
    </ul>`,
  example: `def find_min(values):
    best = values[0]
    for v in values:
        if v < best:
            best = v
    return best`,
  task: `Complete <code>find_max</code> so it returns the largest element in <code>values</code> (assume it's non-empty).`,
  starter: `def find_max(values):
    # TODO: return the largest element in values (values is non-empty)
    return 0

def main():
    data = [3, 9, 2, 7, 5]
    print(f"Max: {find_max(data)}")

main()
`,
  expected: "Max: 9",
  hint: "best = values[0]\nfor v in values:\n    if v > best:\n        best = v\nreturn best",
  options: ""
},
{
  id: "reverse-string",
  tag: "Logic",
  level: "basic",
  title: "Reverse a String",
  theory: `
    <ul>
      <li>Extended slicing <code>s[::-1]</code> reverses any sequence (string, list, tuple) by stepping backward through it · one of the most-used Python idioms.</li>
      <li>Strings are immutable in Python, so this always produces a new string rather than reversing in place.</li>
      <li>The same <code>[start:stop:step]</code> slice syntax also does things like "every other element" (<code>s[::2]</code>) · worth knowing beyond just reversal.</li>
    </ul>`,
  example: `values = [1, 2, 3]
reversed_values = values[::-1]  # [3, 2, 1]`,
  task: `Complete <code>reverse_string</code> so it returns <code>s</code> reversed.`,
  starter: `def reverse_string(s):
    # TODO: return s reversed
    return s

def main():
    print(reverse_string("robotics"))

main()
`,
  expected: "scitobor",
  hint: "return s[::-1]",
  options: ""
},
{
  id: "palindrome",
  tag: "Logic",
  level: "basic",
  title: "Palindrome Check",
  theory: `
    <ul>
      <li>A string is a palindrome if it reads the same forwards and backwards · in Python, that's a direct comparison against its reverse (<code>s == s[::-1]</code>).</li>
      <li>This is simpler than the two-pointer version you'd write in a lower-level language, but the underlying idea (compare a sequence to its mirror) is the same.</li>
      <li>For very long strings a two-pointer early-exit loop avoids building a full reversed copy, but for interview-sized inputs the slice comparison is perfectly idiomatic.</li>
    </ul>`,
  example: `def starts_with(s, c):
    return bool(s) and s[0] == c`,
  task: `Complete <code>is_palindrome</code> so it returns <code>True</code> if <code>s</code> reads the same forwards and backwards.`,
  starter: `def is_palindrome(s):
    # TODO: return True if s reads the same forwards and backwards
    return False

def main():
    print(is_palindrome("level"))
    print(is_palindrome("robot"))

main()
`,
  expected: "True\nFalse",
  hint: "return s == s[::-1]",
  options: ""
},
{
  id: "factorial",
  tag: "Logic",
  level: "basic",
  title: "Factorial",
  theory: `
    <ul>
      <li><code>n!</code> is the product of every integer from <code>1</code> to <code>n</code> · accumulate a running product with a loop over <code>range(2, n + 1)</code>.</li>
      <li>Python integers are arbitrary-precision, so unlike C++ there's no overflow risk here even for large <code>n</code> · the number just keeps growing.</li>
      <li>This is a warm-up for the broader pattern of accumulating a product (vs. a sum) over a range.</li>
    </ul>`,
  example: `def power(base, exp):
    result = 1
    for _ in range(exp):
        result *= base
    return result`,
  task: `Complete <code>factorial</code> so it returns <code>n!</code> for <code>n &gt;= 0</code>.`,
  starter: `def factorial(n):
    # TODO: return n! (n is >= 0)
    return 0

def main():
    print(factorial(6))

main()
`,
  expected: "720",
  hint: "result = 1\nfor i in range(2, n + 1):\n    result *= i\nreturn result",
  options: ""
},
{
  id: "fibonacci",
  tag: "Logic",
  level: "basic",
  title: "Fibonacci Sequence",
  theory: `
    <ul>
      <li>Each Fibonacci number is the sum of the previous two, starting from <code>0, 1</code> · track just the last two values with tuple assignment (<code>a, b = b, a + b</code>) instead of storing the whole sequence.</li>
      <li>The iterative version runs in O(n) time and O(1) extra space; the naive recursive version is exponential unless memoized (see the "Memoized Fibonacci" exercise for that trade-off).</li>
      <li>Python's simultaneous tuple assignment computes the right-hand side fully before rebinding, so <code>a, b = b, a + b</code> doesn't need a temporary variable.</li>
    </ul>`,
  example: `def sum_of_squares(n):
    return sum(i * i for i in range(1, n + 1))`,
  task: `Complete <code>print_fibonacci</code> so it prints the first <code>n</code> Fibonacci numbers (starting <code>0, 1</code>), space-separated, on one line.`,
  starter: `def print_fibonacci(n):
    # TODO: print the first n Fibonacci numbers (starting 0, 1), space-separated, on one line
    pass

def main():
    print_fibonacci(8)

main()
`,
  expected: "0 1 1 2 3 5 8 13",
  hint: 'a, b = 0, 1\nvalues = []\nfor _ in range(n):\n    values.append(a)\n    a, b = b, a + b\nprint(" ".join(str(v) for v in values))',
  options: ""
},
{
  id: "prime-check",
  tag: "Logic",
  level: "basic",
  title: "Prime Number Check",
  theory: `
    <ul>
      <li>A number is prime if it's only divisible by <code>1</code> and itself, and is at least <code>2</code>.</li>
      <li>You only need to test divisors up to <code>&radic;n</code> (i.e. while <code>i*i &lt;= n</code>) · if <code>n</code> had a factor larger than its square root, it would have a matching factor smaller than it too.</li>
      <li>This square-root bound is a common trick for keeping factor/divisor searches from being needlessly O(n).</li>
    </ul>`,
  example: `def is_even(n):
    return n % 2 == 0`,
  task: `Complete <code>is_prime</code> so it returns <code>True</code> if <code>n</code> is a prime number (<code>n &gt;= 2</code>).`,
  starter: `def is_prime(n):
    # TODO: return True if n is a prime number (n >= 2), False otherwise
    return False

def main():
    print(is_prime(17))
    print(is_prime(18))

main()
`,
  expected: "True\nFalse",
  hint: "if n < 2:\n    return False\ni = 2\nwhile i * i <= n:\n    if n % i == 0:\n        return False\n    i += 1\nreturn True",
  options: ""
},
{
  id: "count-vowels",
  tag: "Logic",
  level: "basic",
  title: "Count Vowels in a String",
  theory: `
    <ul>
      <li>Scan the string once, and for each character check case-insensitively whether it's one of <code>a, e, i, o, u</code> · <code>s.lower()</code> normalizes case up front so the check only needs to happen one way.</li>
      <li>A generator expression inside <code>sum(...)</code> (<code>sum(1 for c in s.lower() if c in "aeiou")</code>) counts matches without building an intermediate list.</li>
      <li>This is the same "scan and count matches" shape as counting vowels, counting whitespace, or counting any character class · the loop structure barely changes.</li>
    </ul>`,
  example: `def count_digits(s):
    return sum(1 for c in s if c.isdigit())`,
  task: `Complete <code>count_vowels</code> so it returns the number of vowels (<code>a, e, i, o, u</code>, case-insensitive) in <code>s</code>.`,
  starter: `def count_vowels(s):
    # TODO: return the number of vowels (a, e, i, o, u, case-insensitive) in s
    return 0

def main():
    print(count_vowels("Robotics Engineer"))

main()
`,
  expected: "7",
  hint: 'return sum(1 for c in s.lower() if c in "aeiou")',
  options: ""
},
{
  id: "bubble-sort",
  tag: "Logic",
  level: "basic",
  title: "Bubble Sort",
  theory: `
    <ul>
      <li>Bubble sort repeatedly walks the list, swapping adjacent out-of-order pairs, so the largest unsorted element "bubbles" to its final position each pass.</li>
      <li>It's O(n&sup2;) and rarely used in production (prefer <code>sorted()</code> / <code>list.sort()</code>, which use Timsort), but it's a standard warm-up for reasoning about nested loops and swaps.</li>
      <li>Python's tuple-swap syntax (<code>values[j], values[j+1] = values[j+1], values[j]</code>) swaps two list elements without a manual temp variable.</li>
    </ul>`,
  example: `def print_sorted(values):
    print(sorted(values))`,
  task: `Complete <code>bubble_sort</code> so it sorts <code>values</code> in ascending order in place (any algorithm is fine).`,
  starter: `def bubble_sort(values):
    # TODO: sort values in ascending order in place (any algorithm is fine)
    pass

def main():
    data = [5, 2, 9, 1, 5, 6]
    bubble_sort(data)
    print(data)

main()
`,
  expected: "[1, 2, 5, 5, 6, 9]",
  hint: "n = len(values)\nfor i in range(n):\n    for j in range(n - i - 1):\n        if values[j] > values[j + 1]:\n            values[j], values[j + 1] = values[j + 1], values[j]",
  options: ""
},
{
  id: "gcd",
  tag: "Logic",
  level: "basic",
  title: "Greatest Common Divisor",
  theory: `
    <ul>
      <li>The Euclidean algorithm: <code>gcd(a, b) == gcd(b, a % b)</code>, until <code>b</code> reaches <code>0</code> · at that point <code>a</code> is the answer.</li>
      <li>This converges extremely fast (logarithmic in the smaller number) compared to checking every possible common divisor. Python's standard library also has <code>math.gcd</code> for production use.</li>
      <li>GCD shows up whenever you need to reduce a ratio to lowest terms · e.g. simplifying a gear ratio or a frame-rate divisor.</li>
    </ul>`,
  example: `def lcm(a, b):
    return a // gcd(a, b) * b`,
  task: `Complete <code>gcd</code> so it returns the greatest common divisor of <code>a</code> and <code>b</code> using the Euclidean algorithm.`,
  starter: `def gcd(a, b):
    # TODO: return the greatest common divisor of a and b using the Euclidean algorithm
    return 0

def main():
    print(gcd(48, 18))

main()
`,
  expected: "6",
  hint: "while b != 0:\n    a, b = b, a % b\nreturn a",
  options: ""
},
{
  id: "binary-search",
  tag: "Data Structures",
  level: "intermediate",
  title: "Binary Search",
  theory: `
    <ul>
      <li>On a sorted list, binary search halves the remaining search space each step by comparing the target to the middle element · O(log n) instead of O(n) for a linear scan.</li>
      <li>Compute the midpoint as <code>(lo + hi) // 2</code> and narrow <code>lo</code>/<code>hi</code> based on the comparison, rather than scanning linearly.</li>
      <li>Python's <code>bisect</code> module provides this for production use (<code>bisect_left</code>/<code>bisect_right</code>) · worth implementing by hand once, then reaching for the standard library afterward.</li>
    </ul>`,
  example: `import bisect
def contains(sorted_values, target):
    i = bisect.bisect_left(sorted_values, target)
    return i < len(sorted_values) and sorted_values[i] == target`,
  task: `Complete <code>binary_search</code> so it returns the index of <code>target</code> in <code>sorted_values</code>, or <code>-1</code> if not found.`,
  starter: `def binary_search(sorted_values, target):
    # TODO: return the index of target in sorted_values, or -1 if not found
    return -1

def main():
    data = [1, 3, 5, 7, 9, 11, 13]
    print(binary_search(data, 9))
    print(binary_search(data, 4))

main()
`,
  expected: "4\n-1",
  hint: "lo, hi = 0, len(sorted_values) - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if sorted_values[mid] == target:\n        return mid\n    if sorted_values[mid] < target:\n        lo = mid + 1\n    else:\n        hi = mid - 1\nreturn -1",
  options: ""
},
{
  id: "balanced-parens",
  tag: "Data Structures",
  level: "intermediate",
  title: "Balanced Parentheses",
  theory: `
    <ul>
      <li>A stack (a plain Python <code>list</code> used with <code>append</code>/<code>pop</code>) is the natural tool for matching nested delimiters: push every opening bracket, and on a closing bracket, pop and check it matches the most recent unmatched opener.</li>
      <li>If you ever try to pop an empty stack, or the popped bracket doesn't match, the string is unbalanced immediately.</li>
      <li>At the end, the stack must be empty · leftover unmatched openers (e.g. <code>"(("</code>) also make the string unbalanced.</li>
    </ul>`,
  example: `stack = []
stack.append(1)
stack.append(2)
top = stack[-1]  # 2
stack.pop()`,
  task: `Complete <code>is_balanced</code> so it returns <code>True</code> if all brackets <code>( ) [ ] { }</code> in <code>s</code> are balanced and correctly nested.`,
  starter: `def is_balanced(s):
    # TODO: return True if all brackets ( ) [ ] { } in s are balanced and correctly nested
    return False

def main():
    print(is_balanced("({[]})"))
    print(is_balanced("({]})"))

main()
`,
  expected: "True\nFalse",
  hint: 'pairs = {")": "(", "]": "[", "}": "{"}\nstack = []\nfor c in s:\n    if c in "([{":\n        stack.append(c)\n    elif c in ")]}":\n        if not stack or stack.pop() != pairs[c]:\n            return False\nreturn not stack',
  options: ""
},
{
  id: "linked-list",
  tag: "Data Structures",
  level: "intermediate",
  title: "Linked List Insert & Traverse",
  theory: `
    <ul>
      <li>A singly linked list node holds a value plus a reference to the next node; inserting at the front is O(1) · just point the new node at the current head, then make it the head.</li>
      <li>Traversal follows <code>.next</code> references until reaching <code>None</code>, which marks the end of the list.</li>
      <li>Linked lists trade random access (no <code>list[i]</code>-style indexing) for cheap insertion/removal at known positions · useful for things like a free-list of reusable buffers.</li>
    </ul>`,
  example: `class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next

head = Node(1)`,
  task: `Complete <code>push_front</code> so it returns a new <code>Node</code> with this value, pointing at the current <code>head</code>, as the new head of the list.`,
  starter: `class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next

def push_front(head, value):
    # TODO: return a new Node with this value, pointing at head, as the new head of the list
    return head

def main():
    head = None
    head = push_front(head, 3)
    head = push_front(head, 2)
    head = push_front(head, 1)
    values = []
    cur = head
    while cur is not None:
        values.append(cur.value)
        cur = cur.next
    print(values)

main()
`,
  expected: "[1, 2, 3]",
  hint: "return Node(value, head)",
  options: ""
},
{
  id: "ring-buffer",
  tag: "Data Structures",
  level: "intermediate",
  title: "Ring Buffer (Circular Buffer)",
  theory: `
    <ul>
      <li>A ring buffer stores the last <code>N</code> samples in a fixed-size list, wrapping the write position back to <code>0</code> once it reaches the end · no reallocation, no shifting elements.</li>
      <li>Once full, each new <code>push</code> overwrites the oldest entry, which is exactly the behavior you want for a rolling window of the last few IMU or encoder samples.</li>
      <li><code>self.head</code> tracks the next write slot; <code>self.count</code> tracks how many valid entries exist (capped at capacity) so you can distinguish "not full yet" from "full and wrapping".</li>
    </ul>`,
  example: `class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value = (self.value + 1) % 100`,
  task: `Complete <code>RingBuffer.push</code> so it stores <code>value</code> at the next slot (overwriting the oldest if full), updating <code>self.head</code> and <code>self.count</code>.`,
  starter: `class RingBuffer:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = [None] * capacity
        self.head = 0
        self.count = 0

    def push(self, value):
        # TODO: store value at the next slot (overwriting the oldest if full), update self.head/self.count
        pass

    def contents(self):
        start = 0 if self.count < self.capacity else self.head
        return [self.data[(start + i) % self.capacity] for i in range(self.count)]

def main():
    buf = RingBuffer(3)
    for v in [1, 2, 3, 4]:
        buf.push(v)
    print(buf.contents())

main()
`,
  expected: "[2, 3, 4]",
  hint: "self.data[self.head] = value\nself.head = (self.head + 1) % self.capacity\nif self.count < self.capacity:\n    self.count += 1",
  options: ""
},
{
  id: "word-frequency",
  tag: "Data Structures",
  level: "intermediate",
  title: "Word Frequency Count",
  theory: `
    <ul>
      <li>A plain <code>dict</code> works as a frequency counter: <code>freq.get(word, 0) + 1</code> reads the current count (defaulting to <code>0</code> if the word hasn't been seen) and increments it in one expression.</li>
      <li><code>sorted(freq)</code> iterates a dict's keys in sorted order without mutating the dict itself · handy whenever you want deterministic, readable output.</li>
      <li><code>collections.Counter</code> does this same job with less code in production (<code>Counter(text.split())</code>), but hand-rolling it once cements how the dict-as-counter pattern works.</li>
    </ul>`,
  example: `text = "1 2 3"
for token in text.split():
    print(token)`,
  task: `Complete <code>word_frequency</code> so it splits <code>text</code> on whitespace and counts occurrences of each word into <code>freq</code>.`,
  starter: `def word_frequency(text):
    freq = {}
    # TODO: split text on whitespace and count occurrences of each word into freq
    return freq

def main():
    freq = word_frequency("lidar imu lidar gps imu lidar")
    for word in sorted(freq):
        print(f"{word}:{freq[word]}")

main()
`,
  expected: "gps:1\nimu:2\nlidar:3",
  hint: "for word in text.split():\n    freq[word] = freq.get(word, 0) + 1\nreturn freq",
  options: ""
},
{
  id: "matrix-transpose",
  tag: "Data Structures",
  level: "intermediate",
  title: "Matrix Transpose",
  theory: `
    <ul>
      <li>Transposing a matrix swaps rows and columns: element <code>(i, j)</code> in the input becomes element <code>(j, i)</code> in the output, so an <code>R x C</code> matrix becomes <code>C x R</code>.</li>
      <li>A nested list comprehension builds the whole result in one expression: <code>[[matrix[i][j] for i in range(rows)] for j in range(cols)]</code> · the outer comprehension picks the new row (old column index <code>j</code>), the inner one picks the new column (old row index <code>i</code>).</li>
      <li>Transpose is a building block for a lot of linear algebra (e.g. <code>A&#7488;A</code> in least-squares) even before you need a full matrix library like numpy.</li>
    </ul>`,
  example: `def num_rows(matrix):
    return len(matrix)

def num_cols(matrix):
    return len(matrix[0])`,
  task: `Complete <code>transpose</code> so it returns the transpose of <code>matrix</code> (rows become columns); assume <code>matrix</code> is rectangular and non-empty.`,
  starter: `def transpose(matrix):
    # TODO: return the transpose of matrix (rows become columns); assume matrix is rectangular and non-empty
    return []

def main():
    m = [[1, 2, 3], [4, 5, 6]]
    for row in transpose(m):
        print(row)

main()
`,
  expected: "[1, 4]\n[2, 5]\n[3, 6]",
  hint: "rows, cols = len(matrix), len(matrix[0])\nreturn [[matrix[i][j] for i in range(rows)] for j in range(cols)]",
  options: ""
},
{
  id: "merge-sorted",
  tag: "Data Structures",
  level: "intermediate",
  title: "Merge Two Sorted Arrays",
  theory: `
    <ul>
      <li>Given two already-sorted sequences, you can merge them into one sorted sequence in a single linear pass by always taking the smaller of the two current fronts.</li>
      <li>This is the core "merge" step of merge sort, and it's also exactly how you'd combine two sorted logs/timestamps from different sensors into one sorted timeline.</li>
      <li>After one list runs out, the remaining elements of the other are already sorted · slice-append them wholesale (<code>result.extend(a[i:])</code>) instead of comparing element-by-element.</li>
    </ul>`,
  example: `a = [1, 3]
b = [2, 4]
merged = sorted(a + b)  # works, but doesn't reuse the fact both inputs are already sorted`,
  task: `Complete <code>merge_sorted</code> so it returns a single sorted list containing all elements of <code>a</code> and <code>b</code> (both already sorted ascending).`,
  starter: `def merge_sorted(a, b):
    # TODO: return a single sorted list containing all elements of a and b (both already sorted ascending)
    return []

def main():
    a = [1, 4, 7]
    b = [2, 3, 8, 9]
    print(merge_sorted(a, b))

main()
`,
  expected: "[1, 2, 3, 4, 7, 8, 9]",
  hint: "result = []\ni = j = 0\nwhile i < len(a) and j < len(b):\n    if a[i] <= b[j]:\n        result.append(a[i]); i += 1\n    else:\n        result.append(b[j]); j += 1\nresult.extend(a[i:])\nresult.extend(b[j:])\nreturn result",
  options: ""
},
{
  id: "memo-fib",
  tag: "Algorithms",
  level: "intermediate",
  title: "Memoized Fibonacci",
  theory: `
    <ul>
      <li>Naive recursive Fibonacci recomputes the same sub-results exponentially many times; caching each computed value (memoization) turns it into an O(n) algorithm.</li>
      <li>A module-level <code>dict</code> works as a cache here: check if <code>n</code> is already in <code>memo</code> before recursing, and store the result before returning. (<code>functools.lru_cache</code> gives you this automatically in production code.)</li>
      <li>This is the entry point into dynamic programming: "recursion + a cache of previously solved subproblems" is the pattern behind most DP solutions.</li>
    </ul>`,
  example: `square_cache = {}
def cached_square(n):
    if n in square_cache:
        return square_cache[n]
    return square_cache.setdefault(n, n * n)`,
  task: `Complete <code>fib</code> so it returns the <code>n</code>th Fibonacci number (<code>fib(0)=0, fib(1)=1</code>), using <code>memo</code> to cache results.`,
  starter: `memo = {}

def fib(n):
    # TODO: return the nth Fibonacci number (fib(0)=0, fib(1)=1), using memo to cache results
    return 0

def main():
    print(fib(30))

main()
`,
  expected: "832040",
  hint: "if n <= 1:\n    return n\nif n in memo:\n    return memo[n]\nresult = fib(n - 1) + fib(n - 2)\nmemo[n] = result\nreturn result",
  options: ""
},
{
  id: "command-parser",
  tag: "Logic",
  level: "intermediate",
  title: "Command Parser to Robot Position",
  theory: `
    <ul>
      <li>Parsing a stream of movement commands (<code>"R4 U2 L1 D3"</code>) into a final position is a common shape for both game logic and simple robot dead-reckoning from a command queue.</li>
      <li><code>text.split()</code> tokenizes on whitespace with no arguments needed, then each token splits into a direction character (<code>token[0]</code>) and a numeric distance (<code>int(token[1:])</code>).</li>
      <li>This is the same "parse token, dispatch on a small fixed set of cases" shape as the traffic-light and enum state-machine exercises.</li>
    </ul>`,
  example: `distance = int("42")
kind = "R4"[0]`,
  task: `Complete <code>run_commands</code> so it parses tokens like <code>"U2" "D1" "L3" "R4"</code> (Up/Down/Left/Right + distance) and updates <code>x, y</code> accordingly (Up: <code>y += n</code>, Down: <code>y -= n</code>, Left: <code>x -= n</code>, Right: <code>x += n</code>).`,
  starter: `def run_commands(commands):
    x, y = 0, 0
    # TODO: parse space-separated tokens like "U2" "D1" "L3" "R4" (Up/Down/Left/Right + distance)
    # and update x, y accordingly (Up: y += n, Down: y -= n, Left: x -= n, Right: x += n)
    return x, y

def main():
    x, y = run_commands("R4 U2 L1 D3")
    print(f"x={x} y={y}")

main()
`,
  expected: "x=3 y=-1",
  hint: 'for token in commands.split():\n    d = token[0]\n    n = int(token[1:])\n    if d == "U":\n        y += n\n    elif d == "D":\n        y -= n\n    elif d == "L":\n        x -= n\n    elif d == "R":\n        x += n',
  options: ""
},
{
  id: "traffic-light",
  tag: "State Machines",
  level: "intermediate",
  title: "Traffic-Light State Cycle",
  theory: `
    <ul>
      <li>A table-driven state machine keeps the valid states in one ordered list and computes the "next" state with modulo arithmetic, instead of a long chain of <code>if</code>/<code>elif</code> comparisons.</li>
      <li><code>list.index(current)</code> finds the current state's position, then <code>(idx + 1) % len(order)</code> advances and wraps · this generalizes to any fixed cyclic sequence of states.</li>
      <li>This is a lighter-weight alternative to the <code>Enum</code>-based state machine elsewhere in this set when the states are naturally a simple cycle rather than a branching graph.</li>
    </ul>`,
  example: `def next_index(current, count):
    return (current + 1) % count`,
  task: `Complete <code>next_light</code> so it returns the light that comes after <code>current</code> in <code>order</code>, cycling back to the start after the last one.`,
  starter: `def next_light(current):
    order = ["RED", "GREEN", "YELLOW"]
    # TODO: return the light that comes after current in order, cycling back to the start after the last one
    return current

def main():
    print(next_light("RED"))
    print(next_light("YELLOW"))

main()
`,
  expected: "GREEN\nRED",
  hint: "idx = order.index(current)\nreturn order[(idx + 1) % len(order)]",
  options: ""
},
{
  id: "vector-dot-cross",
  tag: "Robotics Math",
  level: "advanced",
  title: "Vector Dot & Cross Product",
  theory: `
    <ul>
      <li>The dot product <code>a&middot;b = ax*bx + ay*by + az*bz</code> is a scalar measuring alignment · zero when the vectors are perpendicular.</li>
      <li>The cross product <code>a &times; b</code> returns a new vector perpendicular to both inputs, with magnitude proportional to the sine of the angle between them · used constantly for computing surface normals, torque, and angular velocity direction.</li>
      <li>Both operations show up throughout robotics math: dot products in projections/controllers, cross products in kinematics and orientation math. (numpy's <code>np.dot</code>/<code>np.cross</code> do this in production; here we're implementing the formulas directly since numpy isn't available in this sandbox.)</li>
    </ul>`,
  example: `import math
def magnitude(v):
    return math.sqrt(v[0]**2 + v[1]**2 + v[2]**2)`,
  task: `Complete <code>dot</code> to return the dot product of <code>a</code> and <code>b</code>, and <code>cross</code> to return their cross product, where each is a 3-tuple <code>(x, y, z)</code>.`,
  starter: `def dot(a, b):
    # TODO: return the dot product a·b (a[0]*b[0] + a[1]*b[1] + a[2]*b[2])
    return 0.0

def cross(a, b):
    # TODO: return the cross product a x b as a tuple (x, y, z)
    return (0, 0, 0)

def main():
    a = (1, 0, 0)
    b = (0, 1, 0)
    print("dot:", dot(a, b))
    print("cross:", cross(a, b))

main()
`,
  expected: "dot: 0\ncross: (0, 0, 1)",
  hint: "dot: return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]\ncross: return (a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0])",
  options: ""
},
{
  id: "matrix-inverse",
  tag: "Robotics Math",
  level: "advanced",
  title: "2x2 Matrix Inverse",
  theory: `
    <ul>
      <li>For a 2x2 matrix <code>[[a,b],[c,d]]</code>, the determinant is <code>ad - bc</code>, and the inverse (when the determinant is non-zero) is <code>(1/det) * [[d,-b],[-c,a]]</code>.</li>
      <li>Small closed-form matrix inversions like this show up as building blocks inside larger estimation algorithms (e.g. computing a 2D covariance update in a simplified Kalman filter) without needing a full linear-algebra library.</li>
      <li>A near-zero determinant means the matrix is close to singular (not invertible) · production code would guard against dividing by a tiny/zero determinant.</li>
    </ul>`,
  example: `def determinant(m):
    return m["a"] * m["d"] - m["b"] * m["c"]`,
  task: `Complete <code>inverse_2x2</code> so it returns the inverse matrix, i.e. <code>(1/det) * [[d, -b], [-c, a]]</code>, as a dict with the same keys.`,
  starter: `def inverse_2x2(m):
    # m is a dict {"a":.., "b":.., "c":.., "d":..} representing [[a, b], [c, d]]
    det = m["a"] * m["d"] - m["b"] * m["c"]
    # TODO: return the inverse as a dict with the same keys: (1/det) * [[d, -b], [-c, a]]
    return {"a": 0, "b": 0, "c": 0, "d": 0}

def main():
    m = {"a": 4, "b": 7, "c": 2, "d": 6}
    inv = inverse_2x2(m)
    print(round(inv["a"], 2), round(inv["b"], 2), round(inv["c"], 2), round(inv["d"], 2))

main()
`,
  expected: "0.6 -0.7 -0.2 0.4",
  hint: 'return {"a": m["d"]/det, "b": -m["b"]/det, "c": -m["c"]/det, "d": m["a"]/det}',
  options: ""
},
{
  id: "iir-lowpass",
  tag: "Sensor Fusion",
  level: "advanced",
  title: "Single-Pole IIR Low-Pass Filter",
  theory: `
    <ul>
      <li>A single-pole IIR (infinite impulse response) low-pass filter blends the new sample with the previous output: <code>y = alpha*value + (1-alpha)*prev_output</code>.</li>
      <li><code>alpha</code> near <code>1</code> trusts the new sample almost entirely (light smoothing, fast response); <code>alpha</code> near <code>0</code> trusts the history almost entirely (heavy smoothing, slow response) · the exact same trade-off as the Exponential Moving Average filter phrased in control-systems terms.</li>
      <li>It only needs the previous output, not a window of past samples, which makes it O(1) memory · ideal for a tight embedded control loop.</li>
    </ul>`,
  example: `def clamp01(x):
    return max(0.0, min(1.0, x))`,
  task: `Complete <code>low_pass_step</code> so it returns <code>alpha * value + (1 - alpha) * prev_output</code>.`,
  starter: `def low_pass_step(prev_output, value, alpha):
    # TODO: return alpha * value + (1 - alpha) * prev_output
    return 0.0

def main():
    y = 0.0
    for s in [10.0, 10.0, 10.0]:
        y = low_pass_step(y, s, 0.5)
    print(round(y, 3))

main()
`,
  expected: "8.75",
  hint: "return alpha * value + (1 - alpha) * prev_output",
  options: ""
},
{
  id: "homogeneous-transform",
  tag: "Kinematics",
  level: "advanced",
  title: "Homogeneous 2D Transform",
  theory: `
    <ul>
      <li>Combining a rotation and a translation into one step · rotate the point by <code>theta</code>, then add the translation <code>(dx, dy)</code> · is exactly what a homogeneous transform matrix does in one matrix-vector multiply.</li>
      <li>Doing rotation before translation matters: rotating around the origin first, then shifting, is different from shifting first and rotating around the new (wrong) origin.</li>
      <li>Chained transforms like this (sensor frame &rarr; robot frame &rarr; world frame) are how a multi-link robot or a sensor mounted off-center gets its readings expressed in a common frame.</li>
    </ul>`,
  example: `def translate(x, y, dx, dy):
    return (x + dx, y + dy)`,
  task: `Complete <code>transform_point</code> so it rotates <code>(x, y)</code> by <code>theta</code>, then translates by <code>(dx, dy)</code>, and returns the result.`,
  starter: `import math

def transform_point(x, y, theta, dx, dy):
    # TODO: rotate (x, y) by theta, then translate by (dx, dy); return (new_x, new_y)
    return (x, y)

def main():
    x, y = transform_point(1.0, 0.0, math.pi / 2, 2.0, 3.0)
    print(round(x, 3), round(y, 3))

main()
`,
  expected: "2.0 4.0",
  hint: "nx = x * math.cos(theta) - y * math.sin(theta)\nny = x * math.sin(theta) + y * math.cos(theta)\nreturn (nx + dx, ny + dy)",
  options: ""
},
{
  id: "dijkstra-lite",
  tag: "Planning",
  level: "advanced",
  title: "Dijkstra's Algorithm (Weighted Shortest Path)",
  theory: `
    <ul>
      <li>Dijkstra's algorithm finds the shortest path in a weighted graph by always expanding the closest not-yet-finalized node next, using a min-priority-queue (<code>heapq</code>) keyed on current best distance.</li>
      <li>Unlike the unweighted BFS-style grid planning elsewhere in this set, edge weights here aren't all equal, so a plain FIFO queue would give the wrong answer · the heap is what makes "closest first" work.</li>
      <li>Once a node is popped with its finalized shortest distance, later, worse entries for that same node still sitting in the heap are simply skipped (the <code>if d &gt; dist[u]: continue</code> check).</li>
    </ul>`,
  example: `import heapq
min_heap = []
heapq.heappush(min_heap, 5)
heapq.heappush(min_heap, 1)
smallest = heapq.heappop(min_heap)  # 1`,
  task: `Complete <code>shortest_path</code> so it runs Dijkstra's algorithm from <code>src</code>, popping the closest unvisited node and relaxing its edges, and returns the shortest distance to <code>dst</code>.`,
  starter: `import heapq

def shortest_path(graph, src, dst):
    # graph is a dict: node -> list of (neighbor, weight) tuples
    dist = {node: float("inf") for node in graph}
    dist[src] = 0
    pq = [(0, src)]
    # TODO: run Dijkstra's algorithm, popping the closest unvisited node and relaxing its edges
    return dist[dst]

def main():
    graph = {
        0: [(1, 4), (2, 1)],
        1: [(3, 1)],
        2: [(1, 1), (3, 5)],
        3: [],
    }
    print(shortest_path(graph, 0, 3))

main()
`,
  expected: "3",
  hint: "while pq:\n    d, u = heapq.heappop(pq)\n    if d > dist[u]:\n        continue\n    for v, w in graph[u]:\n        if dist[u] + w < dist[v]:\n            dist[v] = dist[u] + w\n            heapq.heappush(pq, (dist[v], v))",
  options: ""
},
{
  id: "priority-scheduler",
  tag: "Concurrency",
  level: "advanced",
  title: "Priority Queue Task Scheduler",
  theory: `
    <ul>
      <li><code>heapq</code> is a min-heap: <code>heappop</code> always returns the smallest tuple, and tuples compare element-by-element, so <code>(priority, name)</code> naturally pops the lowest-numbered priority first.</li>
      <li>This is the standard shape for a real-time task scheduler: an emergency-stop handler (priority 1) must always run before routine telemetry logging (priority 3), regardless of insertion order.</li>
      <li>If two tasks had the same priority, the tuple comparison would fall through to comparing the names next · worth knowing so you're not surprised by a <code>TypeError</code> if the second element isn't orderable.</li>
    </ul>`,
  example: `import heapq
by_length = []
heapq.heappush(by_length, (len("hi"), "hi"))
heapq.heappush(by_length, (len("hey"), "hey"))`,
  task: `Complete <code>main</code> so it pushes <code>("read_sensors")</code> with priority <code>2</code> onto the heap alongside the other tasks.`,
  starter: `import heapq

def main():
    tasks = []
    heapq.heappush(tasks, (3, "log_telemetry"))
    heapq.heappush(tasks, (1, "emergency_stop"))
    # TODO: push ("read_sensors") with priority 2 onto the heap
    while tasks:
        priority, name = heapq.heappop(tasks)
        print(name)

main()
`,
  expected: "emergency_stop\nread_sensors\nlog_telemetry",
  hint: 'heapq.heappush(tasks, (2, "read_sensors"))',
  options: ""
}
  ]
};
