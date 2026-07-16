window.TOPIC_BANKS = window.TOPIC_BANKS || {};
TOPIC_BANKS.cpp = {
  label: "C++",
  compiler: "gcc-head",
  topics: [
{
  id: "pointers-refs",
  tag: "Foundations",
  level: "basic",
  title: "Pointers & References",
  theory: `
    <ul>
      <li>A <strong>pointer</strong> stores an address and can be null, reseated, or used for arrays/dynamic memory; a <strong>reference</strong> is an alias for an existing object, cannot be null, and cannot be rebound after initialization.</li>
      <li>Prefer references for "in/out" parameters that must always refer to a valid object; use pointers when the argument is genuinely optional (nullable) or when you need to transfer/reseat ownership.</li>
      <li>In robotics code, sensor and actuator structs are often large (point clouds, IMU frames). Passing by <code>const&amp;</code> avoids copying them on every control-loop tick.</li>
    </ul>`,
  example: `void swapByPointer(int* a, int* b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

void swapByReference(int& a, int& b) {
    int tmp = a;
    a = b;
    b = tmp;
}`,
  task: `Complete <code>increment</code> so it adds <code>5</code> to <code>x</code> through the reference.`,
  starter: `#include <iostream>
using namespace std;

void increment(int& x) {
    // TODO: add 5 to x
}

int main() {
    int value = 10;
    increment(value);
    cout << "Value: " << value << endl;
}`,
  expected: "Value: 15",
  hint: "Inside the function, x is an alias for 'value' · just write x = x + 5; or x += 5;",
  options: "warning,gnu++17"
},
{
  id: "raii",
  tag: "Memory",
  level: "intermediate",
  title: "Stack vs Heap, and RAII",
  theory: `
    <ul>
      <li>Stack objects are destroyed automatically, in reverse order of construction, when they go out of scope. Heap objects live until you explicitly <code>delete</code> them (or a smart pointer does it for you).</li>
      <li><strong>RAII</strong> (Resource Acquisition Is Initialization) ties a resource's lifetime to an object's lifetime: acquire it in the constructor, release it in the destructor. This is how <code>std::lock_guard</code>, <code>std::unique_ptr</code>, and file handles avoid leaks even when exceptions are thrown.</li>
      <li>In robotics this matters for things like GPIO handles, serial ports, and mutex locks in a control loop · you want them released deterministically, not "eventually" via a garbage collector.</li>
    </ul>`,
  example: `class GpioPin {
public:
    GpioPin(int pin) : pin_(pin) { /* configure pin */ }
    ~GpioPin() { /* release pin, no matter how we exit scope */ }
private:
    int pin_;
};`,
  task: `Implement the destructor of <code>Resource</code> so it prints <code>"Released "</code> followed by the resource's name and a newline (same style as the constructor).`,
  starter: `#include <iostream>
using namespace std;

class Resource {
public:
    Resource(string n) : name(n) { cout << "Acquired " << name << endl; }
    ~Resource() {
        // TODO: print "Released " << name << endl
    }
private:
    string name;
};

int main() {
    {
        Resource a("A");
        Resource b("B");
    }
    cout << "Done" << endl;
}`,
  expected: "Acquired A\nAcquired B\nReleased B\nReleased A\nDone",
  hint: "cout << \"Released \" << name << endl; · note b is destroyed before a (reverse order).",
  options: "warning,gnu++17"
},
{
  id: "smart-ptrs",
  tag: "Memory",
  level: "intermediate",
  title: "Smart Pointers",
  theory: `
    <ul>
      <li><code>std::unique_ptr&lt;T&gt;</code> has exclusive ownership · cheap, non-copyable, movable. Default choice for owning a heap object.</li>
      <li><code>std::shared_ptr&lt;T&gt;</code> uses reference counting for shared ownership · has overhead (atomic increments), use only when lifetime is genuinely shared.</li>
      <li><code>std::weak_ptr&lt;T&gt;</code> observes a <code>shared_ptr</code> without extending its lifetime · used to break ownership cycles (e.g. a child node holding a non-owning back-reference to its parent).</li>
      <li>Interviewers care about this because raw <code>new</code>/<code>delete</code> in long-running robot processes is a common source of leaks and use-after-free bugs.</li>
    </ul>`,
  example: `#include <memory>

struct Node {
    int value;
    std::unique_ptr<Node> next;
};

auto head = std::make_unique<Node>(Node{1, nullptr});`,
  task: `Complete <code>makeValue</code> so it returns a <code>unique_ptr&lt;int&gt;</code> owning a new int with value <code>v</code>.`,
  starter: `#include <iostream>
#include <memory>
using namespace std;

unique_ptr<int> makeValue(int v) {
    // TODO: return a unique_ptr<int> that owns a new int equal to v
}

int main() {
    auto p = makeValue(42);
    cout << "Owned value: " << *p << endl;
}`,
  expected: "Owned value: 42",
  hint: "return make_unique<int>(v);",
  options: "warning,gnu++17"
},
{
  id: "polymorphism",
  tag: "OOP",
  level: "intermediate",
  title: "Virtual Functions & Polymorphism",
  theory: `
    <ul>
      <li>A <code>virtual</code> function lets a base-class pointer/reference call the derived class's override · the classic way to model interchangeable sensor/actuator drivers behind one interface.</li>
      <li>Always give a polymorphic base class a <code>virtual</code> destructor, or deleting through a base pointer is undefined behavior (the derived destructor won't run).</li>
      <li>Pure virtual functions (<code>= 0</code>) make a class abstract · think <code>class Sensor { virtual double read() = 0; }</code> implemented by <code>Lidar</code>, <code>Imu</code>, <code>Encoder</code>.</li>
    </ul>`,
  example: `class Sensor {
public:
    virtual double read() const = 0;
    virtual ~Sensor() = default;
};

class Encoder : public Sensor {
public:
    double read() const override { return ticks_ * 0.01; }
private:
    int ticks_ = 0;
};`,
  task: `Make <code>Lidar</code> override <code>read()</code> to return <code>3.5</code>.`,
  starter: `#include <iostream>
using namespace std;

class Sensor {
public:
    virtual double read() const { return 0.0; }
    virtual ~Sensor() {}
};

class Lidar : public Sensor {
public:
    // TODO: override read() to return 3.5
};

int main() {
    Sensor* s = new Lidar();
    cout << "Reading: " << s->read() << endl;
    delete s;
}`,
  expected: "Reading: 3.5",
  hint: "double read() const override { return 3.5; }",
  options: "warning,gnu++17"
},
{
  id: "templates",
  tag: "Generics",
  level: "intermediate",
  title: "Templates",
  theory: `
    <ul>
      <li>Templates generate code at compile time for any type that supports the operations used in the body · no runtime cost, unlike virtual dispatch.</li>
      <li>Common in robotics math/utility code that needs to work over <code>float</code>, <code>double</code>, and fixed-point types without duplicating logic.</li>
      <li>Interviewers often ask you to write a small generic algorithm (clamp, min/max, a generic ring buffer) to check you understand template syntax and type deduction.</li>
    </ul>`,
  example: `template <typename T>
T maxOf(T a, T b) {
    return (a > b) ? a : b;
}

// usage: maxOf(3, 7); maxOf(2.5, 1.1);`,
  task: `Complete the generic <code>clampValue</code> so it clamps <code>value</code> to the <code>[low, high]</code> range.`,
  starter: `#include <iostream>
using namespace std;

template <typename T>
T clampValue(T value, T low, T high) {
    // TODO: return value clamped so low <= result <= high
}

int main() {
    cout << "Clamped: " << clampValue(15, 0, 10) << endl;
}`,
  expected: "Clamped: 10",
  hint: "if (value < low) return low; if (value > high) return high; return value;",
  options: "warning,gnu++17"
},
{
  id: "stl-algo",
  tag: "STL",
  level: "basic",
  title: "STL Containers & Algorithms",
  theory: `
    <ul>
      <li><code>std::vector</code> is the default sequence container · contiguous storage, cache-friendly, amortized O(1) push_back.</li>
      <li><code>&lt;algorithm&gt;</code> gives you battle-tested implementations (<code>sort</code>, <code>find</code>, <code>transform</code>, <code>accumulate</code>) instead of hand-written loops · fewer off-by-one bugs, and interviewers expect you to reach for them.</li>
      <li>Sorting sensor readings, nearest-neighbor candidate lists, or waypoints by distance are typical robotics use cases for <code>std::sort</code> with a custom comparator.</li>
    </ul>`,
  example: `#include <vector>
#include <algorithm>

std::vector<double> readings = {2.1, 0.4, 5.6};
std::sort(readings.begin(), readings.end());
double total = std::accumulate(readings.begin(), readings.end(), 0.0);`,
  task: `Sort <code>distances</code> in ascending order using <code>std::sort</code>.`,
  starter: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> distances = {40, 10, 30, 20};

    // TODO: sort 'distances' in ascending order

    for (int d : distances) cout << d << " ";
    cout << endl;
}`,
  expected: "10 20 30 40",
  hint: "sort(distances.begin(), distances.end());",
  options: "warning,gnu++17"
},
{
  id: "operator-overload",
  tag: "OOP",
  level: "intermediate",
  title: "Operator Overloading",
  theory: `
    <ul>
      <li>Overloading operators lets math-heavy types (vectors, quaternions, transforms) read naturally: <code>c = a + b</code> instead of <code>c = addVectors(a, b)</code>.</li>
      <li>Mark operators that don't modify <code>*this</code> as <code>const</code>, and prefer free functions or member functions consistently for symmetry (e.g. <code>Vector3D operator+(const Vector3D&amp;) const</code>).</li>
      <li>This is essentially every robotics codebase's math library (Eigen-style types) · expect at least one operator-overloading question.</li>
    </ul>`,
  example: `struct Vector3D {
    double x, y, z;
    Vector3D operator*(double s) const {
        return Vector3D{x * s, y * s, z * s};
    }
};`,
  task: `Implement <code>operator+</code> so it returns the component-wise sum of two vectors.`,
  starter: `#include <iostream>
using namespace std;

struct Vector3D {
    double x, y, z;
    Vector3D operator+(const Vector3D& other) const {
        // TODO: return a Vector3D that is the component-wise sum of this and other
    }
};

int main() {
    Vector3D a{1, 2, 3};
    Vector3D b{4, 5, 6};
    Vector3D c = a + b;
    cout << "Sum: " << c.x << " " << c.y << " " << c.z << endl;
}`,
  expected: "Sum: 5 6 9",
  hint: "return Vector3D{x + other.x, y + other.y, z + other.z};",
  options: "warning,gnu++17"
},
{
  id: "lambdas",
  tag: "Modern C++",
  level: "intermediate",
  title: "Lambdas & std::function",
  theory: `
    <ul>
      <li>A lambda <code>[capture](params) { body }</code> is an inline, anonymous callable · captures by value <code>[x]</code> or by reference <code>[&amp;x]</code>.</li>
      <li><code>std::function&lt;Signature&gt;</code> type-erases any callable (function pointer, lambda, functor) matching that signature · used heavily for callback registration, e.g. subscribing a handler to a sensor topic.</li>
      <li>Watch capture-by-reference lifetime: a lambda that captures a local by reference and outlives that scope is a dangling reference · a favorite interview gotcha.</li>
    </ul>`,
  example: `#include <functional>

void onMessage(std::function<void(int)> handler) {
    handler(42);
}

int lastValue = 0;
onMessage([&lastValue](int v) { lastValue = v; });`,
  task: `Fill in the lambda body so it adds <code>n</code> to the captured <code>total</code>.`,
  starter: `#include <iostream>
#include <functional>
using namespace std;

void runCallback(function<void(int)> cb) {
    cb(7);
}

int main() {
    int total = 0;
    function<void(int)> addToTotal = [&total](int n) {
        // TODO: add n to total
    };

    runCallback(addToTotal);
    cout << "Total: " << total << endl;
}`,
  expected: "Total: 7",
  hint: "total += n;",
  options: "warning,gnu++17"
},
{
  id: "move-semantics",
  tag: "Modern C++",
  level: "advanced",
  title: "Move Semantics",
  theory: `
    <ul>
      <li><code>std::move(x)</code> doesn't move anything by itself · it casts <code>x</code> to an rvalue reference, making it eligible to be moved-from by a move constructor/assignment operator.</li>
      <li>A move constructor should steal the source object's resources (pointers, buffers) and leave the source in a valid-but-unspecified (usually empty) state, rather than deep-copying.</li>
      <li>Matters in robotics for large buffers · point clouds, images, trajectories · where moving instead of copying between stages of a pipeline avoids expensive allocations on every frame.</li>
    </ul>`,
  example: `class Buffer {
public:
    Buffer(Buffer&& other) noexcept
        : data(std::move(other.data)) {}
    std::vector<int> data;
};`,
  task: `Implement the move constructor so <code>this-&gt;data</code> takes ownership of <code>other.data</code>.`,
  starter: `#include <iostream>
#include <vector>
using namespace std;

class Buffer {
public:
    Buffer(size_t n) : data(n, 0) { cout << "Constructed size " << data.size() << endl; }
    Buffer(Buffer&& other) noexcept {
        // TODO: move 'other.data' into this->data
    }
    vector<int> data;
};

int main() {
    Buffer a(5);
    Buffer b(std::move(a));
    cout << "b size: " << b.data.size() << ", a size: " << a.data.size() << endl;
}`,
  expected: "Constructed size 5\nb size: 5, a size: 0",
  hint: "data = std::move(other.data);",
  options: "warning,gnu++17"
},
{
  id: "threads",
  tag: "Concurrency",
  level: "advanced",
  title: "Threads & Mutexes",
  theory: `
    <ul>
      <li>A control loop, sensor driver, and logger often run on separate threads in a robot · <code>std::thread</code> starts one, <code>join()</code> waits for it to finish.</li>
      <li>Any data touched by more than one thread without synchronization is a data race (undefined behavior), even if it "seems to work" in testing · that's exactly why locking matters.</li>
      <li><code>std::mutex</code> plus <code>std::lock_guard</code> (RAII again) is the standard way to protect shared state: the lock is released automatically even if an exception is thrown.</li>
    </ul>`,
  example: `#include <mutex>
#include <thread>

std::mutex mtx;
int shared = 0;

void worker() {
    std::lock_guard<std::mutex> lock(mtx);
    shared++;
}`,
  task: `Protect the increment in <code>incrementMany</code> with <code>mtx</code> using a <code>lock_guard</code>, so 2000 increments across two threads land correctly. (Without the lock this is a data race and the final count can come out wrong or, by chance, still look right · that unpredictability is exactly the bug locking prevents.)`,
  starter: `#include <iostream>
#include <thread>
#include <mutex>
using namespace std;

int counter = 0;
mutex mtx;

void incrementMany() {
    for (int i = 0; i < 1000; i++) {
        // TODO: lock mtx (e.g. lock_guard<mutex>) before modifying counter
        counter++;
    }
}

int main() {
    thread t1(incrementMany);
    thread t2(incrementMany);
    t1.join();
    t2.join();
    cout << "Counter: " << counter << endl;
}`,
  expected: "Counter: 2000",
  hint: "lock_guard<mutex> lock(mtx); as the first line inside the for-loop body.",
  options: "warning,gnu++17,pthread"
},
{
  id: "bit-manip",
  tag: "Embedded",
  level: "basic",
  title: "Bit Manipulation",
  theory: `
    <ul>
      <li>Status/flag registers, GPIO masks, and packed sensor protocols are usually manipulated with bitwise operators: <code>|=</code> to set, <code>&amp;= ~</code> to clear, <code>&amp;</code> to test.</li>
      <li><code>1 &lt;&lt; n</code> creates a mask with only bit <code>n</code> set · the standard way to name individual flags readably.</li>
      <li>This shows up in embedded/robotics interviews when discussing how a microcontroller reports multiple boolean states in a single register/byte.</li>
    </ul>`,
  example: `const unsigned READY   = 1 << 0;
const unsigned ERROR    = 1 << 1;

unsigned status = 0;
status |= READY;           // set
status &= ~ERROR;          // clear
bool isReady = status & READY; // test`,
  task: `Set the <code>SENSOR_OK</code> and <code>MOTOR_OK</code> bits in <code>flags</code> using <code>|=</code>, leaving <code>BATTERY_LOW</code> unset.`,
  starter: `#include <iostream>
using namespace std;

int main() {
    unsigned int flags = 0;
    const unsigned int SENSOR_OK   = 1 << 0;
    const unsigned int MOTOR_OK    = 1 << 1;
    const unsigned int BATTERY_LOW = 1 << 2;

    // TODO: set SENSOR_OK and MOTOR_OK in flags (leave BATTERY_LOW unset)

    cout << "Flags: " << flags << endl;
    cout << "Battery low? " << ((flags & BATTERY_LOW) ? "yes" : "no") << endl;
}`,
  expected: "Flags: 3\nBattery low? no",
  hint: "flags |= SENSOR_OK; flags |= MOTOR_OK;",
  options: "warning,gnu++17"
},
{
  id: "pid",
  tag: "Control",
  level: "advanced",
  title: "PID Controller",
  theory: `
    <ul>
      <li><strong>P</strong>roportional term reacts to the current error; <strong>I</strong>ntegral accumulates past error to eliminate steady-state offset; <strong>D</strong>erivative reacts to the rate of change of error to damp overshoot.</li>
      <li>Almost every actuator loop in robotics (joint position, wheel velocity, drone altitude) is a PID loop underneath, sometimes with feedforward added on top.</li>
      <li>Interview gotchas: integral windup when the actuator saturates (needs clamping), and derivative noise amplification when the error signal is jittery (often needs filtering).</li>
    </ul>`,
  example: `class PID {
public:
    double compute(double setpoint, double measured, double dt) {
        double error = setpoint - measured;
        integral_ += error * dt;
        double derivative = (error - prevError_) / dt;
        prevError_ = error;
        return kp_ * error + ki_ * integral_ + kd_ * derivative;
    }
private:
    double kp_, ki_, kd_, integral_ = 0, prevError_ = 0;
};`,
  task: `Implement <code>compute()</code>: update the integral term, compute the derivative from the change in error, then return the combined PID output.`,
  starter: `#include <iostream>
#include <iomanip>
using namespace std;

class PID {
public:
    PID(double kp, double ki, double kd) : kp_(kp), ki_(ki), kd_(kd), integral_(0), prevError_(0) {}
    double compute(double error, double dt) {
        // TODO: integral_ += error * dt
        // TODO: double derivative = (error - prevError_) / dt
        // TODO: prevError_ = error
        // TODO: return kp_*error + ki_*integral_ + kd_*derivative
    }
private:
    double kp_, ki_, kd_, integral_, prevError_;
};

int main() {
    PID pid(1.0, 0.5, 0.1);
    double out = pid.compute(2.0, 1.0);
    cout << fixed << setprecision(2) << "Output: " << out << endl;
}`,
  expected: "Output: 3.20",
  hint: "integral_ += error*dt; double derivative = (error - prevError_)/dt; prevError_ = error; return kp_*error + ki_*integral_ + kd_*derivative;",
  options: "warning,gnu++17"
},
{
  id: "complementary-filter",
  tag: "Sensor Fusion",
  level: "advanced",
  title: "Complementary Filter",
  theory: `
    <ul>
      <li>Gyroscopes are low-noise but drift over time (integration accumulates error); accelerometers give an absolute angle reference but are noisy in the short term (vibration, motion).</li>
      <li>A complementary filter blends the two: trust the gyro's short-term rate integration, but pull the estimate back toward the accelerometer's angle over time · <code>angle = alpha*(angle + gyroRate*dt) + (1-alpha)*accelAngle</code>.</li>
      <li>It's a cheap, single-line alternative to a Kalman filter when you don't need an optimal noise model · very common on small embedded IMU boards.</li>
    </ul>`,
  example: `double alpha = 0.98; // trust gyro more, correct slowly from accel
double angle = 0;
angle = alpha*(angle + gyroRate*dt) + (1-alpha)*accelAngle;`,
  task: `Implement <code>complementaryFilter</code> using the blend formula above.`,
  starter: `#include <iostream>
#include <iomanip>
using namespace std;

double complementaryFilter(double angle, double gyroRate, double accelAngle, double dt, double alpha) {
    // TODO: return alpha*(angle + gyroRate*dt) + (1-alpha)*accelAngle
}

int main() {
    double angle = complementaryFilter(0.0, 5.0, 4.0, 0.1, 0.98);
    cout << fixed << setprecision(2) << "Angle: " << angle << endl;
}`,
  expected: "Angle: 0.57",
  hint: "return alpha * (angle + gyroRate * dt) + (1 - alpha) * accelAngle;",
  options: "warning,gnu++17"
},
{
  id: "kalman-1d",
  tag: "State Estimation",
  level: "advanced",
  title: "1D Kalman Filter",
  theory: `
    <ul>
      <li>A Kalman filter alternates <strong>predict</strong> (propagate state and grow uncertainty <code>P</code> by process noise <code>Q</code>) and <strong>update</strong> (pull the estimate toward a new measurement, weighted by the Kalman gain).</li>
      <li>The Kalman gain <code>K = P / (P + R)</code> balances how much to trust the prediction (<code>P</code>) versus the measurement noise (<code>R</code>) · high measurement noise means small <code>K</code>, so the measurement barely moves the estimate.</li>
      <li>This is the scalar version of the same math behind EKF/UKF-based sensor fusion (IMU + GPS + wheel odometry) used for full robot state estimation.</li>
    </ul>`,
  example: `// predict
P = P + Q;
// update
double K = P / (P + R);
x = x + K * (z - x);
P = (1 - K) * P;`,
  task: `Implement one predict + update cycle: grow <code>P</code> by <code>Q</code>, compute the Kalman gain <code>K</code>, then correct <code>x</code> and shrink <code>P</code> using the measurement <code>z</code>.`,
  starter: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double x = 0, P = 1, Q = 0.1, R = 0.5, z = 5;

    // TODO: predict: P = P + Q
    // TODO: double K = P / (P + R)
    // TODO: x = x + K * (z - x)
    // TODO: P = (1 - K) * P

    cout << fixed << setprecision(2) << "x: " << x << ", P: " << P << endl;
}`,
  expected: "x: 3.44, P: 0.34",
  hint: "P = P + Q; double K = P/(P+R); x = x + K*(z-x); P = (1-K)*P;",
  options: "warning,gnu++17"
},
{
  id: "diff-drive",
  tag: "Kinematics",
  level: "intermediate",
  title: "Differential-Drive Kinematics",
  theory: `
    <ul>
      <li>The unicycle/differential-drive motion model predicts the next pose from a linear velocity <code>v</code> and angular velocity <code>omega</code>: <code>x += v*cos(theta)*dt</code>, <code>y += v*sin(theta)*dt</code>, <code>theta += omega*dt</code>.</li>
      <li>This is the "motion model" plugged into an EKF/particle filter for localization, and it's also what a motion controller integrates forward to predict where a velocity command will take the robot.</li>
      <li>Real differential-drive robots derive <code>v</code> and <code>omega</code> from left/right wheel speeds and the wheel track width · worth knowing that relationship too, even though this exercise takes <code>v</code>/<code>omega</code> as given.</li>
    </ul>`,
  example: `double nx = x + v * std::cos(theta) * dt;
double ny = y + v * std::sin(theta) * dt;
double ntheta = theta + omega * dt;`,
  task: `Compute the next pose <code>(nx, ny, ntheta)</code> one integration step forward using the motion model above.`,
  starter: `#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;

int main() {
    double x = 0, y = 0, theta = 0;
    double v = 2.0, omega = 0.5, dt = 1.0;

    // TODO: double nx = x + v*cos(theta)*dt
    // TODO: double ny = y + v*sin(theta)*dt
    // TODO: double ntheta = theta + omega*dt

    cout << fixed << setprecision(2) << "x: " << nx << " y: " << ny << " theta: " << ntheta << endl;
}`,
  expected: "x: 2.00 y: 0.00 theta: 0.50",
  hint: "double nx = x + v*cos(theta)*dt; double ny = y + v*sin(theta)*dt; double ntheta = theta + omega*dt;",
  options: "warning,gnu++17"
},
{
  id: "frame-transform",
  tag: "Perception",
  level: "intermediate",
  title: "2D Frame Transforms",
  theory: `
    <ul>
      <li>Sensor detections usually arrive in the sensor's own frame and need to be rotated (and translated) into the robot or world frame before fusion or planning can use them.</li>
      <li>A 2D rotation by <code>theta</code> is <code>x' = x*cos(theta) - y*sin(theta)</code>, <code>y' = x*sin(theta) + y*cos(theta)</code> · the 2D special case of a rotation matrix.</li>
      <li>In 3D this generalizes to rotation matrices/quaternions and homogeneous transforms (rotation + translation in one 4x4 matrix) · the same idea, just more entries.</li>
    </ul>`,
  example: `double nx = x * std::cos(theta) - y * std::sin(theta);
double ny = x * std::sin(theta) + y * std::cos(theta);`,
  task: `Rotate the point <code>(x, y)</code> by <code>theta</code> radians using the 2D rotation formula above.`,
  starter: `#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;

int main() {
    double x = 3, y = 4, theta = M_PI / 2;

    // TODO: double nx = x*cos(theta) - y*sin(theta)
    // TODO: double ny = x*sin(theta) + y*cos(theta)

    cout << fixed << setprecision(2) << "x: " << nx << " y: " << ny << endl;
}`,
  expected: "x: -4.00 y: 3.00",
  hint: "double nx = x*cos(theta) - y*sin(theta); double ny = x*sin(theta) + y*cos(theta);",
  options: "warning,gnu++17"
},
{
  id: "nearest-neighbor",
  tag: "Perception",
  level: "intermediate",
  title: "Nearest-Neighbor Data Association",
  theory: `
    <ul>
      <li>Before you can fuse a new sensor detection into an existing track/landmark, you need to decide which one it belongs to · <strong>data association</strong>.</li>
      <li>The simplest approach, nearest-neighbor association, just picks whichever known landmark is closest to the new detection (squared distance avoids a needless <code>sqrt</code>).</li>
      <li>It's a reasonable baseline but breaks down with clutter or crossing tracks, which is why more robust approaches (gated nearest-neighbor, JCBB, probabilistic data association) exist on top of this same idea.</li>
    </ul>`,
  example: `struct Point { double x, y; };

double squaredDist(Point a, Point b) {
    return (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y);
}`,
  task: `Implement the loop body in <code>findNearest</code>: compute the squared distance to each landmark and keep track of the closest one's index.`,
  starter: `#include <iostream>
#include <vector>
#include <limits>
using namespace std;

struct Point { double x, y; };

double squaredDist(Point a, Point b) {
    return (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y);
}

int findNearest(const vector<Point>& landmarks, Point query) {
    int bestIdx = -1;
    double bestDist = numeric_limits<double>::max();
    for (int i = 0; i < (int)landmarks.size(); i++) {
        // TODO: compute d = squaredDist(landmarks[i], query)
        // TODO: if d < bestDist, set bestDist = d and bestIdx = i
    }
    return bestIdx;
}

int main() {
    vector<Point> landmarks = {{0,0},{5,5},{2,1},{10,10}};
    int idx = findNearest(landmarks, {2,2});
    cout << "Nearest index: " << idx << endl;
}`,
  expected: "Nearest index: 2",
  hint: "double d = squaredDist(landmarks[i], query); if (d < bestDist) { bestDist = d; bestIdx = i; }",
  options: "warning,gnu++17"
},
{
  id: "grid-planning",
  tag: "Planning",
  level: "advanced",
  title: "Grid-Based Path Planning (BFS)",
  theory: `
    <ul>
      <li>An occupancy grid turns the environment into free/occupied cells; on an unweighted grid, Breadth-First Search finds the shortest path in number of steps, exploring cell-by-cell outward like ripples.</li>
      <li>A* improves on plain BFS by adding a heuristic (typically Manhattan or Euclidean distance to the goal) that biases the search toward the goal instead of expanding equally in every direction · same idea, fewer cells explored.</li>
      <li>This grid-search family (BFS, Dijkstra, A*) is the discrete counterpart to sampling-based planners like RRT/RRT*, which are used instead when the space is continuous/high-dimensional (e.g. arm configuration space).</li>
    </ul>`,
  example: `queue<pair<Cell,int>> q; // (cell, distance)
q.push({start, 0});
visited[start] = true;

while (!q.empty()) {
    auto [cell, dist] = q.front(); q.pop();
    if (cell == goal) return dist;
    for (auto& neighbor : neighborsOf(cell)) {
        if (isFree(neighbor) && !visited[neighbor]) {
            visited[neighbor] = true;
            q.push({neighbor, dist + 1});
        }
    }
}`,
  task: `Fill in the neighbor-expansion step: if the neighbor cell <code>(nr, nc)</code> is inside the grid, free (<code>grid[nr][nc]==0</code>), and not yet visited, mark it visited and push it onto the queue with <code>dist+1</code>.`,
  starter: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int bfsShortestPath(vector<vector<int>>& grid, pair<int,int> start, pair<int,int> goal) {
    int rows = grid.size(), cols = grid[0].size();
    vector<vector<bool>> visited(rows, vector<bool>(cols, false));
    queue<pair<pair<int,int>, int>> q;
    q.push({start, 0});
    visited[start.first][start.second] = true;
    int dr[] = {-1, 1, 0, 0};
    int dc[] = {0, 0, -1, 1};

    while (!q.empty()) {
        auto pr = q.front(); q.pop();
        auto pos = pr.first;
        int dist = pr.second;
        if (pos == goal) return dist;

        for (int i = 0; i < 4; i++) {
            int nr = pos.first + dr[i];
            int nc = pos.second + dc[i];
            // TODO: if (nr,nc) is inside the grid, grid[nr][nc]==0, and not visited,
            // mark visited[nr][nc] = true and push {{nr,nc}, dist+1} onto q
        }
    }
    return -1;
}

int main() {
    vector<vector<int>> grid = {
        {0,0,1,0,0},
        {0,1,1,0,0},
        {0,0,0,0,1},
        {1,1,0,1,0},
        {0,0,0,0,0}
    };
    int steps = bfsShortestPath(grid, {0,0}, {4,4});
    cout << "Steps: " << steps << endl;
}`,
  expected: "Steps: 8",
  hint: "if (nr>=0 && nr<rows && nc>=0 && nc<cols && grid[nr][nc]==0 && !visited[nr][nc]) { visited[nr][nc] = true; q.push({{nr,nc}, dist+1}); }",
  options: "warning,gnu++17"
},
{
  id: "rule-of-three",
  tag: "Memory",
  level: "advanced",
  title: "Rule of Three (Copy Constructor)",
  theory: `
    <ul>
      <li>If a class manually manages a resource (here, a raw <code>int*</code> array) and needs a custom destructor, it almost always also needs a custom copy constructor and copy assignment operator · the "Rule of Three".</li>
      <li>Without a custom copy constructor, the compiler-generated one does a shallow copy: both objects' pointers point at the <em>same</em> heap block, so one destructor frees memory the other object still thinks it owns (a double-free / use-after-free).</li>
      <li>This is exactly the bug pattern behind a "sensor buffer" class that owns a raw array of readings and gets copied around · modern code would use <code>std::vector</code>/<code>unique_ptr</code> instead, but interviewers ask this to check you understand ownership.</li>
    </ul>`,
  example: `class Buffer {
public:
    Buffer(const Buffer& other)
        : size_(other.size_), data_(new int[other.size_]) {
        for (int i = 0; i < size_; i++) data_[i] = other.data_[i];
    }
    ~Buffer() { delete[] data_; }
private:
    int size_;
    int* data_;
};`,
  task: `Complete the copy constructor of <code>SensorBuffer</code> so it deep-copies each element from <code>other.data_</code> into the newly allocated <code>data_</code> (the array itself is already allocated for you in the initializer list).`,
  starter: `#include <iostream>
using namespace std;

class SensorBuffer {
public:
    SensorBuffer(int n) : size_(n), data_(new int[n]) {
        for (int i = 0; i < n; i++) data_[i] = i;
    }
    SensorBuffer(const SensorBuffer& other) : size_(other.size_), data_(new int[other.size_]) {
        // TODO: copy each element from other.data_ into data_
    }
    ~SensorBuffer() { delete[] data_; }

    void set(int idx, int v) { data_[idx] = v; }
    int get(int idx) const { return data_[idx]; }

private:
    int size_;
    int* data_;
};

int main() {
    SensorBuffer a(3);
    SensorBuffer b(a);
    b.set(0, 99);
    cout << "a[0]: " << a.get(0) << ", b[0]: " << b.get(0) << endl;
}`,
  expected: "a[0]: 0, b[0]: 99",
  hint: "for (int i = 0; i < size_; i++) data_[i] = other.data_[i];",
  options: "warning,gnu++17"
},
{
  id: "const-correctness",
  tag: "Foundations",
  level: "basic",
  title: "Const Correctness",
  theory: `
    <ul>
      <li>A member function marked <code>const</code> promises not to modify the object's observable state · that promise is checked by the compiler, not just documentation.</li>
      <li>A <code>const T&</code> parameter can only call <code>const</code>-qualified member functions on it; calling a non-const method through a const reference is a compile error, not a warning.</li>
      <li>Robotics APIs pass sensor/state objects by <code>const&amp;</code> constantly (to avoid copies in hot loops), so getters that only read state need to be marked <code>const</code> or the code simply won't compile.</li>
    </ul>`,
  example: `class Imu {
public:
    double heading() const { return heading_; } // read-only: must be const
    void setHeading(double h) { heading_ = h; }  // mutates: not const
private:
    double heading_;
};`,
  task: `<code>printSpeed</code> takes its argument by <code>const Robot&amp;</code>, but calling <code>getSpeed()</code> through it fails to compile because <code>getSpeed</code> isn't marked as a read-only method. Fix the declaration of <code>getSpeed</code> so it compiles.`,
  starter: `#include <iostream>
using namespace std;

class Robot {
public:
    Robot(double s) : speed_(s) {}
    double getSpeed() { return speed_; } // TODO: this only reads state · add the qualifier it's missing
private:
    double speed_;
};

void printSpeed(const Robot& r) {
    cout << "Speed: " << r.getSpeed() << endl;
}

int main() {
    Robot r(3.5);
    printSpeed(r);
}`,
  expected: "Speed: 3.5",
  hint: "double getSpeed() const { return speed_; }",
  options: "warning,gnu++17"
},
{
  id: "enum-class-fsm",
  tag: "State Machines",
  level: "intermediate",
  title: "Enum Class State Machines",
  theory: `
    <ul>
      <li><code>enum class</code> (a "scoped enum") requires the enum name as a prefix (<code>RobotState::Moving</code>, not bare <code>Moving</code>) and doesn't implicitly convert to <code>int</code> · this avoids accidental mixing of unrelated enums that plain <code>enum</code> allows.</li>
      <li>Robot supervisors are almost always modeled as a small finite state machine (<code>Idle</code>, <code>Moving</code>, <code>EStopped</code>, ...) with a pure function computing the next state from the current state and inputs · easy to unit test in isolation from hardware.</li>
      <li>A latched fault state (once <code>EStopped</code>, stay <code>EStopped</code> regardless of new commands until an explicit reset) is a common safety-interview detail: the state machine must not silently clear a safety stop just because a new "go" command arrived.</li>
    </ul>`,
  example: `enum class DoorState { Closed, Open, Jammed };

DoorState next(DoorState s, bool jamSensor) {
    if (jamSensor) return DoorState::Jammed;
    if (s == DoorState::Jammed) return DoorState::Jammed; // latched
    return DoorState::Open;
}`,
  task: `Implement <code>nextState</code>: an active e-stop always wins, an e-stop is latched (once <code>EStopped</code>, stays <code>EStopped</code>), otherwise a go command moves to <code>Moving</code> and no command means <code>Idle</code>.`,
  starter: `#include <iostream>
using namespace std;

enum class RobotState { Idle, Moving, EStopped };

string toString(RobotState s) {
    switch (s) {
        case RobotState::Idle: return "Idle";
        case RobotState::Moving: return "Moving";
        case RobotState::EStopped: return "EStopped";
    }
    return "Unknown";
}

RobotState nextState(RobotState current, bool estop, bool goCommand) {
    // TODO: if estop is true, return RobotState::EStopped
    // TODO: else if current is already EStopped, return RobotState::EStopped (latched)
    // TODO: else if goCommand is true, return RobotState::Moving
    // TODO: otherwise return RobotState::Idle
}

int main() {
    RobotState s = RobotState::Idle;
    s = nextState(s, false, true);
    cout << toString(s) << endl;
    s = nextState(s, true, true);
    cout << toString(s) << endl;
    s = nextState(s, false, true);
    cout << toString(s) << endl;
}`,
  expected: "Moving\nEStopped\nEStopped",
  hint: "if (estop) return RobotState::EStopped; if (current == RobotState::EStopped) return RobotState::EStopped; if (goCommand) return RobotState::Moving; return RobotState::Idle;",
  options: "warning,gnu++17"
},
{
  id: "function-pointers",
  tag: "Embedded",
  level: "intermediate",
  title: "Function Pointers & Callback Dispatch",
  theory: `
    <ul>
      <li>A function pointer variable can hold the address of any function matching its signature, and calling through it (<code>h(value)</code>) invokes whichever function it currently points to · the classic C-style callback mechanism.</li>
      <li>Interrupt service routine tables, driver "vtables" written in plain C, and message dispatch tables in embedded firmware are usually arrays/maps of function pointers rather than <code>std::function</code>, because they need to stay allocation-free and ABI-stable.</li>
      <li><code>std::function</code> (seen elsewhere in this set) is the more flexible C++ answer when you need to capture state; raw function pointers are what you reach for when you specifically need a plain, stateless, C-compatible callback.</li>
    </ul>`,
  example: `void onTick(int ms) { /* ... */ }

typedef void (*TickHandler)(int);

void registerHandler(TickHandler h) {
    h(10);
}`,
  task: `Implement <code>dispatch</code> so it invokes the handler <code>h</code> with <code>value</code>.`,
  starter: `#include <iostream>
using namespace std;

void onOverTemp(int value) { cout << "ALERT overtemp: " << value << endl; }
void onLowBattery(int value) { cout << "ALERT low battery: " << value << endl; }

typedef void (*Handler)(int);

void dispatch(Handler h, int value) {
    // TODO: call h with value
}

int main() {
    Handler h = onOverTemp;
    dispatch(h, 95);
    h = onLowBattery;
    dispatch(h, 12);
}`,
  expected: "ALERT overtemp: 95\nALERT low battery: 12",
  hint: "h(value);",
  options: "warning,gnu++17"
},
{
  id: "condition-variable",
  tag: "Concurrency",
  level: "advanced",
  title: "Condition Variables (Producer/Consumer)",
  theory: `
    <ul>
      <li>A <code>condition_variable</code> lets a thread sleep until another thread signals it, instead of busy-polling a flag · the consumer here blocks in <code>cv.wait</code> until the producer has something for it.</li>
      <li><code>cv.wait(lock, predicate)</code> automatically re-checks <code>predicate</code> after waking, which protects against <strong>spurious wakeups</strong> (the OS is allowed to wake a waiting thread with no corresponding <code>notify</code>) · always wait on a predicate, never a bare <code>cv.wait(lock)</code>.</li>
      <li>This is the standard pattern for a sensor-driver thread pushing readings into a queue while a separate processing thread consumes them, without the processing thread spinning and burning CPU while idle.</li>
    </ul>`,
  example: `mutex mtx;
condition_variable cv;
queue<int> q;

// consumer:
unique_lock<mutex> lock(mtx);
cv.wait(lock, [] { return !q.empty(); });
int v = q.front(); q.pop();`,
  task: `Complete the predicate passed to <code>cv.wait</code> so the consumer wakes when there is data to process or the producer has signaled it is <code>done</code>.`,
  starter: `#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <queue>
using namespace std;

mutex mtx;
condition_variable cv;
queue<int> readings;
bool done = false;

void producer() {
    for (int i = 1; i <= 3; i++) {
        {
            lock_guard<mutex> lock(mtx);
            readings.push(i * 10);
        }
        cv.notify_one();
    }
    {
        lock_guard<mutex> lock(mtx);
        done = true;
    }
    cv.notify_one();
}

void consumer() {
    while (true) {
        unique_lock<mutex> lock(mtx);
        cv.wait(lock, [] {
            // TODO: return true when readings is not empty, or done is true
        });
        while (!readings.empty()) {
            cout << "Consumed: " << readings.front() << endl;
            readings.pop();
        }
        if (done) break;
    }
}

int main() {
    thread p(producer);
    thread c(consumer);
    p.join();
    c.join();
    cout << "All done" << endl;
}`,
  expected: "Consumed: 10\nConsumed: 20\nConsumed: 30\nAll done",
  hint: "return !readings.empty() || done;",
  options: "warning,gnu++17,pthread"
},
{
  id: "atomics",
  tag: "Concurrency",
  level: "advanced",
  title: "std::atomic (Lock-Free Counters)",
  theory: `
    <ul>
      <li><code>std::atomic&lt;int&gt;</code> makes simple read-modify-write operations like increment safe across threads without a <code>mutex</code> · the hardware guarantees the operation is indivisible.</li>
      <li><code>fetch_add</code> is cheaper than a <code>lock_guard</code> + <code>counter++</code> for a single counter, because it avoids the mutex's lock/unlock overhead · but atomics only help for single, independent operations, not for keeping multiple related variables consistent (that still needs a lock).</li>
      <li>Packet/message counters, dropped-frame counters, and simple health-check tallies updated from multiple driver threads are typical robotics uses for a plain atomic counter.</li>
    </ul>`,
  example: `#include <atomic>

std::atomic<int> counter{0};

void worker() {
    counter.fetch_add(1, std::memory_order_relaxed);
}`,
  task: `Use <code>packetCount</code>'s atomic increment inside <code>receiveMany</code> so 200,000 increments across two threads land correctly with no lock.`,
  starter: `#include <iostream>
#include <thread>
#include <atomic>
using namespace std;

atomic<int> packetCount{0};

void receiveMany() {
    for (int i = 0; i < 100000; i++) {
        // TODO: atomically add 1 to packetCount (e.g. fetch_add)
    }
}

int main() {
    thread t1(receiveMany);
    thread t2(receiveMany);
    t1.join();
    t2.join();
    cout << "Packets: " << packetCount.load() << endl;
}`,
  expected: "Packets: 200000",
  hint: "packetCount.fetch_add(1, memory_order_relaxed);",
  options: "warning,gnu++17,pthread"
},
{
  id: "optional",
  tag: "Modern C++",
  level: "intermediate",
  title: "std::optional for Fallible Reads",
  theory: `
    <ul>
      <li><code>std::optional&lt;T&gt;</code> represents "a <code>T</code>, or nothing" without resorting to sentinel values (like <code>-1</code>) or an out-parameter plus a bool · the type itself documents that the read can fail.</li>
      <li><code>has_value()</code>/<code>value()</code> check and extract the value; <code>value_or(fallback)</code> gives you a default in one expression instead of an if/else.</li>
      <li>A sensor read that can legitimately fail (timeout, no line of sight, checksum error) is a textbook case · returning <code>optional&lt;double&gt;</code> instead of a magic number forces every caller to handle the "no reading" case explicitly.</li>
    </ul>`,
  example: `#include <optional>

std::optional<int> parseId(const std::string& s) {
    if (s.empty()) return std::nullopt;
    return std::stoi(s);
}

int id = parseId(raw).value_or(-1);`,
  task: `Implement <code>readDistance</code> so it returns <code>nullopt</code> when the sensor is not ok, and the reading otherwise.`,
  starter: `#include <iostream>
#include <optional>
using namespace std;

optional<double> readDistance(bool sensorOk, double value) {
    // TODO: if sensorOk is false, return nullopt
    // TODO: otherwise return value
}

int main() {
    auto a = readDistance(true, 4.2);
    auto b = readDistance(false, 0.0);

    if (a.has_value()) cout << "Reading: " << a.value() << endl;
    else cout << "Reading: no data" << endl;

    cout << "Fallback: " << b.value_or(-1.0) << endl;
}`,
  expected: "Reading: 4.2\nFallback: -1",
  hint: "if (!sensorOk) return nullopt; return value;",
  options: "warning,gnu++17"
},
{
  id: "array-bindings",
  tag: "Modern C++",
  level: "basic",
  title: "std::array & Structured Bindings",
  theory: `
    <ul>
      <li><code>std::array&lt;T, N&gt;</code> is a fixed-size, stack-allocated container with the same interface as <code>std::vector</code> but no heap allocation · the right choice for a compile-time-known-size buffer in real-time code where you want to avoid allocator calls.</li>
      <li>Structured bindings (<code>auto [x, y] = pair;</code>) unpack a struct/pair/tuple into named locals in one line, instead of writing <code>p.first</code>/<code>p.second</code> or <code>p.x</code>/<code>p.y</code> repeatedly.</li>
      <li>Iterating a fixed waypoint list and unpacking each <code>{x, y}</code> pose with a structured binding is a common, very readable pattern in path-length/trajectory-checking code.</li>
    </ul>`,
  example: `struct Point { double x, y; };
std::array<Point, 2> pts = {{ {0,0}, {3,4} }};

auto [x, y] = pts[1];   // x == 3, y == 4`,
  task: `Fill in <code>pathLength</code>: use structured bindings to unpack consecutive waypoints, then accumulate the Euclidean distance between them.`,
  starter: `#include <iostream>
#include <array>
#include <cmath>
using namespace std;

struct Pose { double x, y; };

array<Pose, 3> waypoints = {{ {0,0}, {3,4}, {6,8} }};

double pathLength() {
    double total = 0;
    for (size_t i = 1; i < waypoints.size(); i++) {
        // TODO: auto [px, py] = waypoints[i - 1];
        // TODO: auto [x, y] = waypoints[i];
        // TODO: total += sqrt((x - px)*(x - px) + (y - py)*(y - py));
    }
    return total;
}

int main() {
    cout << "Length: " << pathLength() << endl;
}`,
  expected: "Length: 10",
  hint: "auto [px, py] = waypoints[i - 1]; auto [x, y] = waypoints[i]; total += sqrt((x-px)*(x-px) + (y-py)*(y-py));",
  options: "warning,gnu++17"
},
{
  id: "ema-filter",
  tag: "Sensor Fusion",
  level: "intermediate",
  title: "Exponential Moving Average Filter",
  theory: `
    <ul>
      <li>An exponential moving average (EMA) smooths a noisy signal with a single line: <code>filtered = alpha*sample + (1-alpha)*filtered</code>, weighting the new sample against the running estimate.</li>
      <li>A higher <code>alpha</code> tracks the raw signal more closely (less smoothing, more noise); a lower <code>alpha</code> smooths harder but lags behind real changes · it's the same trust trade-off as the complementary and Kalman filters elsewhere in this set, just simpler.</li>
      <li>It needs only one stored value (the previous output) and one multiply-add per sample, which is why it shows up constantly in embedded code for smoothing battery voltage, current draw, or a jittery distance sensor.</li>
    </ul>`,
  example: `double ema(double prevFiltered, double sample, double alpha) {
    return alpha * sample + (1 - alpha) * prevFiltered;
}`,
  task: `Implement <code>emaStep</code> using the EMA formula above.`,
  starter: `#include <iostream>
#include <iomanip>
#include <vector>
using namespace std;

double emaStep(double prev, double sample, double alpha) {
    // TODO: return alpha*sample + (1-alpha)*prev
}

int main() {
    vector<double> samples = {10.0, 20.0, 10.0, 20.0};
    double alpha = 0.5;
    double filtered = samples[0];
    for (size_t i = 1; i < samples.size(); i++) {
        filtered = emaStep(filtered, samples[i], alpha);
    }
    cout << fixed << setprecision(2) << "Filtered: " << filtered << endl;
}`,
  expected: "Filtered: 16.25",
  hint: "return alpha * sample + (1 - alpha) * prev;",
  options: "warning,gnu++17"
},
{
  id: "wheel-odometry",
  tag: "Kinematics",
  level: "intermediate",
  title: "Wheel Encoder Odometry",
  theory: `
    <ul>
      <li>Wheel encoders report ticks; converting to distance needs the wheel's circumference divided by ticks-per-revolution: <code>metersPerTick = (2*pi*radius) / ticksPerRev</code>.</li>
      <li>For a differential-drive base, forward distance is the <em>average</em> of the two wheels' distances, and heading change is the <em>difference</em> divided by the track width (distance between the wheels) · the discrete version of the <code>v</code>/<code>omega</code> model used in the differential-drive kinematics exercise elsewhere in this set.</li>
      <li>This dead-reckoning estimate drifts over time (wheel slip, uneven ticks) which is exactly why it's normally fused with IMU/GPS via a Kalman filter rather than trusted alone for long-term localization.</li>
    </ul>`,
  example: `double metersPerTick = (2 * M_PI * wheelRadius) / ticksPerRev;
double leftDist  = leftTicks  * metersPerTick;
double rightDist = rightTicks * metersPerTick;

double distance = (leftDist + rightDist) / 2.0;
double heading  = (rightDist - leftDist) / trackWidth;`,
  task: `Compute <code>leftDist</code>, <code>rightDist</code>, <code>distance</code>, and <code>heading</code> using the formulas above.`,
  starter: `#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;

int main() {
    int leftTicks = 400, rightTicks = 440;
    double ticksPerRev = 800.0;
    double wheelRadius = 0.05;   // meters
    double trackWidth = 0.3;     // meters

    double metersPerTick = (2 * M_PI * wheelRadius) / ticksPerRev;

    // TODO: double leftDist = leftTicks * metersPerTick;
    // TODO: double rightDist = rightTicks * metersPerTick;
    // TODO: double distance = (leftDist + rightDist) / 2.0;
    // TODO: double heading = (rightDist - leftDist) / trackWidth;

    cout << fixed << setprecision(3) << "Distance: " << distance << " Heading: " << heading << endl;
}`,
  expected: "Distance: 0.165 Heading: 0.052",
  hint: "double leftDist = leftTicks * metersPerTick; double rightDist = rightTicks * metersPerTick; double distance = (leftDist + rightDist) / 2.0; double heading = (rightDist - leftDist) / trackWidth;",
  options: "warning,gnu++17"
},
{
  id: "quaternion-normalize",
  tag: "Kinematics",
  level: "advanced",
  title: "Quaternion Normalization",
  theory: `
    <ul>
      <li>A unit quaternion <code>(w, x, y, z)</code> represents a 3D rotation; floating-point drift from repeated multiplication (e.g. integrating IMU gyro rates every tick) slowly pushes its norm away from 1, so orientation estimators periodically re-normalize.</li>
      <li>Normalizing is the same idea as normalizing a 3D vector, just with a fourth component: divide every component by the quaternion's magnitude <code>sqrt(w^2+x^2+y^2+z^2)</code>.</li>
      <li>A non-unit quaternion still "looks like" a rotation but subtly corrupts downstream math (rotating vectors, composing rotations), which is why orientation filters (EKF-based attitude estimation, complementary filters extended to 3D) re-normalize after every update step.</li>
    </ul>`,
  example: `struct Quat { double w, x, y, z; };

double norm = std::sqrt(q.w*q.w + q.x*q.x + q.y*q.y + q.z*q.z);
Quat unit{ q.w/norm, q.x/norm, q.y/norm, q.z/norm };`,
  task: `Implement <code>normalize</code>: compute the quaternion's magnitude, then return each component divided by it.`,
  starter: `#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;

struct Quaternion { double w, x, y, z; };

Quaternion normalize(Quaternion q) {
    // TODO: double n = sqrt(q.w*q.w + q.x*q.x + q.y*q.y + q.z*q.z);
    // TODO: return { q.w / n, q.x / n, q.y / n, q.z / n };
}

int main() {
    Quaternion q{2, 0, 2, 0};
    Quaternion nq = normalize(q);
    cout << fixed << setprecision(3)
         << "w: " << nq.w << " x: " << nq.x << " y: " << nq.y << " z: " << nq.z << endl;
}`,
  expected: "w: 0.707 x: 0.000 y: 0.707 z: 0.000",
  hint: "double n = sqrt(q.w*q.w + q.x*q.x + q.y*q.y + q.z*q.z); return { q.w/n, q.x/n, q.y/n, q.z/n };",
  options: "warning,gnu++17"
},
{
  id: "sum-array",
  tag: "Logic",
  level: "basic",
  title: "Sum of Array Elements",
  theory: `
    <ul>
      <li>A running total is the simplest reduction over a collection: start an accumulator at <code>0</code> and add each element to it in a single pass.</li>
      <li>This is the "hello world" of aggregating sensor/telemetry data · e.g. summing a batch of encoder ticks or samples before averaging them.</li>
      <li>Prefer a range-based <code>for</code> loop (<code>for (int v : values)</code>) over manual indexing when you don't need the index itself.</li>
    </ul>`,
  example: `int countPositive(const vector<int>& values) {
    int count = 0;
    for (int v : values) if (v > 0) count++;
    return count;
}`,
  task: `Complete <code>sumArray</code> so it returns the sum of all elements in <code>values</code>.`,
  starter: `#include <iostream>
#include <vector>
using namespace std;

int sumArray(const vector<int>& values) {
    // TODO: return the sum of all elements in values
    return 0;
}

int main() {
    vector<int> data = {4, 8, 15, 16, 23, 42};
    cout << "Sum: " << sumArray(data) << endl;
}`,
  expected: "Sum: 108",
  hint: "int total = 0; for (int v : values) total += v; return total;",
  options: "warning,gnu++17"
},
{
  id: "find-max",
  tag: "Logic",
  level: "basic",
  title: "Find Maximum in Array",
  theory: `
    <ul>
      <li>Track a running "best so far" value: initialize it to the first element, then replace it whenever a larger element is found.</li>
      <li>This single linear pass is the basis for a lot of sensor-processing code: finding the peak reading, the closest obstacle, or the most recent timestamp.</li>
      <li>Don't initialize the running max to <code>0</code> · if every value is negative, that's wrong. Initialize from the data itself.</li>
    </ul>`,
  example: `int findMin(const vector<int>& values) {
    int best = values[0];
    for (int v : values) if (v < best) best = v;
    return best;
}`,
  task: `Complete <code>findMax</code> so it returns the largest element in <code>values</code> (assume it's non-empty).`,
  starter: `#include <iostream>
#include <vector>
using namespace std;

int findMax(const vector<int>& values) {
    // TODO: return the largest element in values (values is non-empty)
    return 0;
}

int main() {
    vector<int> data = {3, 9, 2, 7, 5};
    cout << "Max: " << findMax(data) << endl;
}`,
  expected: "Max: 9",
  hint: "int best = values[0]; for (int v : values) if (v > best) best = v; return best;",
  options: "warning,gnu++17"
},
{
  id: "reverse-string",
  tag: "Logic",
  level: "basic",
  title: "Reverse a String",
  theory: `
    <ul>
      <li><code>std::reverse</code> (from <code>&lt;algorithm&gt;</code>) reverses any range in place given a pair of iterators · no need to hand-write the swap loop.</li>
      <li>Strings in C++ are mutable sequences, so <code>reverse(s.begin(), s.end())</code> works directly on a <code>std::string</code>.</li>
      <li>Knowing the standard algorithm names (<code>reverse</code>, <code>sort</code>, <code>find</code>, ...) instead of reimplementing them is exactly what "idiomatic C++" means in an interview.</li>
    </ul>`,
  example: `#include <algorithm>
vector<int> v = {1, 2, 3};
reverse(v.begin(), v.end()); // v is now {3, 2, 1}`,
  task: `Complete <code>reverseString</code> so it returns <code>s</code> reversed.`,
  starter: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

string reverseString(const string& s) {
    // TODO: return s reversed
    return s;
}

int main() {
    cout << reverseString("robotics") << endl;
}`,
  expected: "scitobor",
  hint: "string r = s; reverse(r.begin(), r.end()); return r;",
  options: "warning,gnu++17"
},
{
  id: "palindrome",
  tag: "Logic",
  level: "basic",
  title: "Palindrome Check",
  theory: `
    <ul>
      <li>A string is a palindrome if it reads the same forwards and backwards · check with two pointers moving inward from both ends.</li>
      <li>Stop as soon as a mismatch is found (early return) rather than always scanning the whole string.</li>
      <li>This two-pointer pattern (one from the front, one from the back, walking toward the middle) shows up again in problems like reversing in place or checking symmetric arrays.</li>
    </ul>`,
  example: `bool startsWith(const string& s, char c) {
    return !s.empty() && s.front() == c;
}`,
  task: `Complete <code>isPalindrome</code> so it returns <code>true</code> if <code>s</code> reads the same forwards and backwards.`,
  starter: `#include <iostream>
#include <string>
using namespace std;

bool isPalindrome(const string& s) {
    // TODO: return true if s reads the same forwards and backwards
    return false;
}

int main() {
    cout << boolalpha;
    cout << isPalindrome("level") << endl;
    cout << isPalindrome("robot") << endl;
}`,
  expected: "true\nfalse",
  hint: "int i = 0, j = (int)s.size() - 1; while (i < j) { if (s[i] != s[j]) return false; i++; j--; } return true;",
  options: "warning,gnu++17"
},
{
  id: "factorial",
  tag: "Logic",
  level: "basic",
  title: "Factorial",
  theory: `
    <ul>
      <li><code>n!</code> is the product of every integer from <code>1</code> to <code>n</code> · an iterative loop avoids the call-stack overhead (and overflow risk from deep recursion) of the recursive definition.</li>
      <li>Use a wide integer type (<code>long long</code>) since factorials grow extremely fast and overflow a 32-bit <code>int</code> past <code>12!</code>.</li>
      <li>This is a warm-up for the broader pattern of accumulating a product (vs. a sum) over a range.</li>
    </ul>`,
  example: `long long power(long long base, int exp) {
    long long result = 1;
    for (int i = 0; i < exp; i++) result *= base;
    return result;
}`,
  task: `Complete <code>factorial</code> so it returns <code>n!</code> for <code>n &gt;= 0</code>.`,
  starter: `#include <iostream>
using namespace std;

long long factorial(int n) {
    // TODO: return n! (n is >= 0)
    return 0;
}

int main() {
    cout << factorial(6) << endl;
}`,
  expected: "720",
  hint: "long long result = 1; for (int i = 2; i <= n; i++) result *= i; return result;",
  options: "warning,gnu++17"
},
{
  id: "fibonacci",
  tag: "Logic",
  level: "basic",
  title: "Fibonacci Sequence",
  theory: `
    <ul>
      <li>Each Fibonacci number is the sum of the previous two, starting from <code>0, 1</code> · track just the last two values instead of storing the whole sequence.</li>
      <li>The iterative version runs in O(n) time and O(1) extra space; the naive recursive version is exponential unless memoized (see the "Memoized Fibonacci" exercise for that trade-off).</li>
      <li>A running pair-swap (<code>a, b = b, a + b</code> in spirit) is a common pattern for any "next value depends on the last two" sequence.</li>
    </ul>`,
  example: `long long sumOfSquares(int n) {
    long long total = 0;
    for (int i = 1; i <= n; i++) total += (long long)i * i;
    return total;
}`,
  task: `Complete <code>printFibonacci</code> so it prints the first <code>n</code> Fibonacci numbers (starting <code>0, 1</code>), space-separated, on one line.`,
  starter: `#include <iostream>
using namespace std;

void printFibonacci(int n) {
    // TODO: print the first n Fibonacci numbers (starting 0, 1), space-separated, then a newline
}

int main() {
    printFibonacci(8);
}`,
  expected: "0 1 1 2 3 5 8 13",
  hint: "long long a = 0, b = 1; for (int i = 0; i < n; i++) { cout << a; if (i != n-1) cout << \" \"; long long next = a + b; a = b; b = next; } cout << endl;",
  options: "warning,gnu++17"
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
  example: `bool isEven(int n) {
    return n % 2 == 0;
}`,
  task: `Complete <code>isPrime</code> so it returns <code>true</code> if <code>n</code> is a prime number (<code>n &gt;= 2</code>).`,
  starter: `#include <iostream>
using namespace std;

bool isPrime(int n) {
    // TODO: return true if n is a prime number (n >= 2), false otherwise
    return false;
}

int main() {
    cout << boolalpha;
    cout << isPrime(17) << endl;
    cout << isPrime(18) << endl;
}`,
  expected: "true\nfalse",
  hint: "if (n < 2) return false; for (int i = 2; i * i <= n; i++) if (n % i == 0) return false; return true;",
  options: "warning,gnu++17"
},
{
  id: "count-vowels",
  tag: "Logic",
  level: "basic",
  title: "Count Vowels in a String",
  theory: `
    <ul>
      <li>Scan the string once, and for each character check case-insensitively whether it's one of <code>a, e, i, o, u</code> using <code>tolower</code>.</li>
      <li>This is the same "scan and count matches" shape as counting vowels, counting whitespace, or counting any character class · the loop structure barely changes.</li>
      <li><code>tolower</code> takes an <code>int</code> and expects the character cast appropriately for negative <code>char</code> values on some platforms, but for plain ASCII input this detail rarely bites.</li>
    </ul>`,
  example: `int countDigits(const string& s) {
    int count = 0;
    for (char c : s) if (isdigit(c)) count++;
    return count;
}`,
  task: `Complete <code>countVowels</code> so it returns the number of vowels (<code>a, e, i, o, u</code>, case-insensitive) in <code>s</code>.`,
  starter: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int countVowels(const string& s) {
    // TODO: return the number of vowels (a, e, i, o, u, case-insensitive) in s
    return 0;
}

int main() {
    cout << countVowels("Robotics Engineer") << endl;
}`,
  expected: "7",
  hint: "int count = 0; for (char c : s) { char lc = tolower(c); if (lc=='a'||lc=='e'||lc=='i'||lc=='o'||lc=='u') count++; } return count;",
  options: "warning,gnu++17"
},
{
  id: "bubble-sort",
  tag: "Logic",
  level: "basic",
  title: "Bubble Sort",
  theory: `
    <ul>
      <li>Bubble sort repeatedly walks the array, swapping adjacent out-of-order pairs, so the largest unsorted element "bubbles" to its final position each pass.</li>
      <li>It's O(n&sup2;) and rarely used in production (prefer <code>std::sort</code>), but it's a standard warm-up for reasoning about nested loops and swaps.</li>
      <li><code>swap(a, b)</code> from <code>&lt;utility&gt;</code> (pulled in transitively by most headers) exchanges two values without a manual temp variable.</li>
    </ul>`,
  example: `void printSorted(vector<int> v) {
    sort(v.begin(), v.end());
    for (int x : v) cout << x << " ";
}`,
  task: `Complete <code>bubbleSort</code> so it sorts <code>values</code> in ascending order (any algorithm is fine).`,
  starter: `#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& values) {
    // TODO: sort values in ascending order using any algorithm you like
}

int main() {
    vector<int> data = {5, 2, 9, 1, 5, 6};
    bubbleSort(data);
    for (int v : data) cout << v << " ";
    cout << endl;
}`,
  expected: "1 2 5 5 6 9",
  hint: "int n = values.size(); for (int i = 0; i < n; i++) for (int j = 0; j < n-i-1; j++) if (values[j] > values[j+1]) swap(values[j], values[j+1]);",
  options: "warning,gnu++17"
},
{
  id: "gcd",
  tag: "Logic",
  level: "basic",
  title: "Greatest Common Divisor",
  theory: `
    <ul>
      <li>The Euclidean algorithm: <code>gcd(a, b) == gcd(b, a % b)</code>, until <code>b</code> reaches <code>0</code> · at that point <code>a</code> is the answer.</li>
      <li>This converges extremely fast (logarithmic in the smaller number) compared to checking every possible common divisor.</li>
      <li>GCD shows up whenever you need to reduce a ratio to lowest terms · e.g. simplifying a gear ratio or a frame-rate divisor.</li>
    </ul>`,
  example: `int lcm(int a, int b) {
    return a / gcd(a, b) * b;
}`,
  task: `Complete <code>gcd</code> so it returns the greatest common divisor of <code>a</code> and <code>b</code> using the Euclidean algorithm.`,
  starter: `#include <iostream>
using namespace std;

int gcd(int a, int b) {
    // TODO: return the greatest common divisor of a and b using the Euclidean algorithm
    return 0;
}

int main() {
    cout << gcd(48, 18) << endl;
}`,
  expected: "6",
  hint: "while (b != 0) { int t = b; b = a % b; a = t; } return a;",
  options: "warning,gnu++17"
},
{
  id: "binary-search",
  tag: "Data Structures",
  level: "intermediate",
  title: "Binary Search",
  theory: `
    <ul>
      <li>On a sorted array, binary search halves the remaining search space each step by comparing the target to the middle element · O(log n) instead of O(n) for a linear scan.</li>
      <li>Compute the midpoint as <code>lo + (hi - lo) / 2</code> rather than <code>(lo + hi) / 2</code> to avoid integer overflow on very large ranges.</li>
      <li>This is the underlying idea behind <code>std::lower_bound</code>/<code>std::binary_search</code> · worth knowing to implement by hand once, then reach for the standard algorithm afterward.</li>
    </ul>`,
  example: `bool contains(const vector<int>& sortedValues, int target) {
    return binary_search(sortedValues.begin(), sortedValues.end(), target);
}`,
  task: `Complete <code>binarySearch</code> so it returns the index of <code>target</code> in <code>sortedValues</code>, or <code>-1</code> if not found.`,
  starter: `#include <iostream>
#include <vector>
using namespace std;

int binarySearch(const vector<int>& sortedValues, int target) {
    // TODO: return the index of target in sortedValues, or -1 if not found (values are sorted ascending)
    return -1;
}

int main() {
    vector<int> data = {1, 3, 5, 7, 9, 11, 13};
    cout << binarySearch(data, 9) << endl;
    cout << binarySearch(data, 4) << endl;
}`,
  expected: "4\n-1",
  hint: "int lo=0, hi=sortedValues.size()-1; while (lo<=hi) { int mid=lo+(hi-lo)/2; if (sortedValues[mid]==target) return mid; if (sortedValues[mid]<target) lo=mid+1; else hi=mid-1; } return -1;",
  options: "warning,gnu++17"
},
{
  id: "balanced-parens",
  tag: "Data Structures",
  level: "intermediate",
  title: "Balanced Parentheses",
  theory: `
    <ul>
      <li>A stack is the natural tool for matching nested delimiters: push every opening bracket, and on a closing bracket, pop and check it matches the most recent unmatched opener.</li>
      <li>If you ever try to pop an empty stack, or the popped bracket doesn't match, the string is unbalanced immediately.</li>
      <li>At the end, the stack must be empty · leftover unmatched openers (e.g. <code>"(("</code>) also make the string unbalanced.</li>
    </ul>`,
  example: `#include <stack>
stack<int> s;
s.push(1);
s.push(2);
int top = s.top(); // 2
s.pop();`,
  task: `Complete <code>isBalanced</code> so it returns <code>true</code> if all brackets <code>( ) [ ] { }</code> in <code>s</code> are balanced and correctly nested.`,
  starter: `#include <iostream>
#include <string>
#include <stack>
using namespace std;

bool isBalanced(const string& s) {
    // TODO: return true if all brackets ( ) [ ] { } in s are balanced and correctly nested
    return false;
}

int main() {
    cout << boolalpha;
    cout << isBalanced("({[]})") << endl;
    cout << isBalanced("({]})") << endl;
}`,
  expected: "true\nfalse",
  hint: "stack<char> st; for (char c : s) { if (c=='('||c=='['||c=='{') st.push(c); else if (c==')'||c==']'||c=='}') { if (st.empty()) return false; char top=st.top(); st.pop(); if ((c==')'&&top!='(')||(c==']'&&top!='[')||(c=='}'&&top!='{')) return false; } } return st.empty();",
  options: "warning,gnu++17"
},
{
  id: "linked-list",
  tag: "Data Structures",
  level: "intermediate",
  title: "Linked List Insert & Traverse",
  theory: `
    <ul>
      <li>A singly linked list node holds a value plus a pointer to the next node; inserting at the front is O(1) · just point the new node at the current head, then make it the head.</li>
      <li>Traversal follows <code>next</code> pointers until reaching <code>nullptr</code>, which marks the end of the list.</li>
      <li>Linked lists trade random access (no <code>operator[]</code>) for cheap insertion/removal at known positions · useful for things like a free-list of reusable buffers.</li>
    </ul>`,
  example: `struct Node {
    int value;
    Node* next;
};

Node* head = new Node{1, nullptr};`,
  task: `Complete <code>pushFront</code> so it creates a new <code>Node</code> with this value, pointing at the current <code>head</code>, and makes it the new head.`,
  starter: `#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* next;
};

void pushFront(Node*& head, int value) {
    // TODO: create a new Node with this value, pointing to the current head, and make it the new head
}

int main() {
    Node* head = nullptr;
    pushFront(head, 3);
    pushFront(head, 2);
    pushFront(head, 1);
    for (Node* cur = head; cur != nullptr; cur = cur->next) {
        cout << cur->value << " ";
    }
    cout << endl;
}`,
  expected: "1 2 3",
  hint: "Node* n = new Node{value, head}; head = n;",
  options: "warning,gnu++17"
},
{
  id: "ring-buffer",
  tag: "Data Structures",
  level: "intermediate",
  title: "Ring Buffer (Circular Buffer)",
  theory: `
    <ul>
      <li>A ring buffer stores the last <code>N</code> samples in a fixed-size array, wrapping the write position back to <code>0</code> once it reaches the end · no reallocation, no shifting elements.</li>
      <li>Once full, each new <code>push</code> overwrites the oldest entry, which is exactly the behavior you want for a rolling window of the last few IMU or encoder samples.</li>
      <li><code>head_</code> tracks the next write slot; <code>count_</code> tracks how many valid entries exist (capped at capacity) so you can distinguish "not full yet" from "full and wrapping".</li>
    </ul>`,
  example: `class Counter {
public:
    void increment() { value_ = (value_ + 1) % 100; }
private:
    int value_ = 0;
};`,
  task: `Complete <code>RingBuffer::push</code> so it stores <code>value</code> at the next slot (overwriting the oldest if full), updating <code>head_</code> and <code>count_</code>.`,
  starter: `#include <iostream>
#include <vector>
using namespace std;

class RingBuffer {
public:
    RingBuffer(int capacity) : data_(capacity), capacity_(capacity), count_(0), head_(0) {}

    void push(int value) {
        // TODO: store value at the next slot (overwriting the oldest if full), update head_/count_
    }

    vector<int> contents() const {
        vector<int> result;
        int start = (count_ < capacity_) ? 0 : head_;
        for (int i = 0; i < count_; i++) {
            result.push_back(data_[(start + i) % capacity_]);
        }
        return result;
    }

private:
    vector<int> data_;
    int capacity_;
    int count_;
    int head_;
};

int main() {
    RingBuffer buf(3);
    buf.push(1);
    buf.push(2);
    buf.push(3);
    buf.push(4);
    for (int v : buf.contents()) cout << v << " ";
    cout << endl;
}`,
  expected: "2 3 4",
  hint: "data_[head_] = value; head_ = (head_ + 1) % capacity_; if (count_ < capacity_) count_++;",
  options: "warning,gnu++17"
},
{
  id: "word-frequency",
  tag: "Data Structures",
  level: "intermediate",
  title: "Word Frequency Count",
  theory: `
    <ul>
      <li><code>std::map&lt;string,int&gt;</code> keeps keys sorted, so iterating it produces results in alphabetical order for free · handy whenever you want deterministic, readable output.</li>
      <li><code>freq[word]++</code> relies on <code>map</code>'s default-construction behavior: accessing a missing key inserts it with a value-initialized value (<code>0</code> for <code>int</code>), so the increment "just works" the first time too.</li>
      <li><code>istringstream</code> plus <code>&gt;&gt;</code> is the standard way to tokenize a string on whitespace without manually hunting for space characters.</li>
    </ul>`,
  example: `#include <sstream>
istringstream iss("1 2 3");
int x;
while (iss >> x) cout << x << " ";`,
  task: `Complete <code>wordFrequency</code> so it splits <code>text</code> on whitespace and counts occurrences of each word into <code>freq</code>.`,
  starter: `#include <iostream>
#include <string>
#include <sstream>
#include <map>
using namespace std;

map<string,int> wordFrequency(const string& text) {
    map<string,int> freq;
    // TODO: split text on whitespace and count occurrences of each word into freq
    return freq;
}

int main() {
    auto freq = wordFrequency("lidar imu lidar gps imu lidar");
    for (auto& [word, count] : freq) {
        cout << word << ":" << count << " ";
    }
    cout << endl;
}`,
  expected: "gps:1 imu:2 lidar:3",
  hint: "istringstream iss(text); string word; while (iss >> word) freq[word]++;",
  options: "warning,gnu++17"
},
{
  id: "matrix-transpose",
  tag: "Data Structures",
  level: "intermediate",
  title: "Matrix Transpose",
  theory: `
    <ul>
      <li>Transposing a matrix swaps rows and columns: element <code>(i, j)</code> in the input becomes element <code>(j, i)</code> in the output, so an <code>R x C</code> matrix becomes <code>C x R</code>.</li>
      <li>Allocate the result with the swapped dimensions up front (<code>vector&lt;vector&lt;int&gt;&gt; result(cols, vector&lt;int&gt;(rows))</code>) rather than growing it row by row.</li>
      <li>Transpose is a building block for a lot of linear algebra (e.g. <code>A&sup1;A</code> in least-squares) even before you need a full matrix library.</li>
    </ul>`,
  example: `int rows(const vector<vector<int>>& m) { return (int)m.size(); }
int cols(const vector<vector<int>>& m) { return (int)m[0].size(); }`,
  task: `Complete <code>transpose</code> so it returns the transpose of <code>m</code> (rows become columns); assume <code>m</code> is rectangular and non-empty.`,
  starter: `#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> transpose(const vector<vector<int>>& m) {
    // TODO: return the transpose of m (rows become columns); assume m is rectangular and non-empty
    return {};
}

int main() {
    vector<vector<int>> m = {{1,2,3},{4,5,6}};
    auto t = transpose(m);
    for (auto& row : t) {
        for (int v : row) cout << v << " ";
        cout << endl;
    }
}`,
  expected: "1 4 \n2 5 \n3 6",
  hint: "int rows=m.size(), cols=m[0].size(); vector<vector<int>> result(cols, vector<int>(rows)); for (int i=0;i<rows;i++) for (int j=0;j<cols;j++) result[j][i]=m[i][j]; return result;",
  options: "warning,gnu++17"
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
      <li>After one list runs out, the remaining elements of the other are already sorted · just append them wholesale instead of comparing element-by-element.</li>
    </ul>`,
  example: `#include <algorithm>
vector<int> a = {1, 3}, b = {2, 4};
vector<int> merged;
merge(a.begin(), a.end(), b.begin(), b.end(), back_inserter(merged));`,
  task: `Complete <code>mergeSorted</code> so it returns a single sorted vector containing all elements of <code>a</code> and <code>b</code> (both already sorted ascending).`,
  starter: `#include <iostream>
#include <vector>
using namespace std;

vector<int> mergeSorted(const vector<int>& a, const vector<int>& b) {
    // TODO: return a single sorted vector containing all elements of a and b (both are already sorted ascending)
    return {};
}

int main() {
    vector<int> a = {1, 4, 7};
    vector<int> b = {2, 3, 8, 9};
    for (int v : mergeSorted(a, b)) cout << v << " ";
    cout << endl;
}`,
  expected: "1 2 3 4 7 8 9",
  hint: "vector<int> result; size_t i=0,j=0; while (i<a.size() && j<b.size()) { if (a[i]<=b[j]) result.push_back(a[i++]); else result.push_back(b[j++]); } while (i<a.size()) result.push_back(a[i++]); while (j<b.size()) result.push_back(b[j++]); return result;",
  options: "warning,gnu++17"
},
{
  id: "memo-fib",
  tag: "Algorithms",
  level: "intermediate",
  title: "Memoized Fibonacci",
  theory: `
    <ul>
      <li>Naive recursive Fibonacci recomputes the same sub-results exponentially many times; caching each computed value (memoization) turns it into an O(n) algorithm.</li>
      <li><code>unordered_map&lt;int,long long&gt;</code> is a natural cache here: check if <code>n</code> is already in the map before recursing, and store the result before returning.</li>
      <li>This is the entry point into dynamic programming: "recursion + a cache of previously solved subproblems" is the pattern behind most DP solutions.</li>
    </ul>`,
  example: `unordered_map<int,int> squareCache;
int cachedSquare(int n) {
    if (squareCache.count(n)) return squareCache[n];
    return squareCache[n] = n * n;
}`,
  task: `Complete <code>fib</code> so it returns the <code>n</code>th Fibonacci number (<code>fib(0)=0, fib(1)=1</code>), using <code>memo</code> to cache results.`,
  starter: `#include <iostream>
#include <unordered_map>
using namespace std;

unordered_map<int,long long> memo;

long long fib(int n) {
    // TODO: return the nth Fibonacci number (fib(0)=0, fib(1)=1), using memo to cache results
    return 0;
}

int main() {
    cout << fib(30) << endl;
}`,
  expected: "832040",
  hint: "if (n <= 1) return n; if (memo.count(n)) return memo[n]; long long result = fib(n-1) + fib(n-2); memo[n] = result; return result;",
  options: "warning,gnu++17"
},
{
  id: "command-parser",
  tag: "Logic",
  level: "intermediate",
  title: "Command Parser to Robot Position",
  theory: `
    <ul>
      <li>Parsing a stream of movement commands (<code>"R4 U2 L1 D3"</code>) into a final position is a common shape for both game logic and simple robot dead-reckoning from a command queue.</li>
      <li>Tokenize on whitespace with <code>istringstream</code>, then split each token into a direction character and a numeric distance (<code>stoi</code> on the substring after the first character).</li>
      <li>This is the same "parse token, dispatch on a small fixed set of cases" shape as the traffic-light and enum state-machine exercises.</li>
    </ul>`,
  example: `int distance = stoi(string("42").substr(0));
char kind = string("R4")[0];`,
  task: `Complete <code>runCommands</code> so it parses tokens like <code>"U2" "D1" "L3" "R4"</code> (Up/Down/Left/Right + distance) and updates <code>x, y</code> accordingly (Up: <code>y += n</code>, Down: <code>y -= n</code>, Left: <code>x -= n</code>, Right: <code>x += n</code>).`,
  starter: `#include <iostream>
#include <string>
#include <sstream>
using namespace std;

pair<int,int> runCommands(const string& commands) {
    int x = 0, y = 0;
    // TODO: parse space-separated tokens like "U2" "D1" "L3" "R4" (Up/Down/Left/Right + distance)
    // and update x,y accordingly (Up: y+=n, Down: y-=n, Left: x-=n, Right: x+=n)
    return {x, y};
}

int main() {
    auto [x, y] = runCommands("R4 U2 L1 D3");
    cout << "x=" << x << " y=" << y << endl;
}`,
  expected: "x=3 y=-1",
  hint: "istringstream iss(commands); string token; while (iss >> token) { char dir=token[0]; int n=stoi(token.substr(1)); if (dir=='U') y+=n; else if (dir=='D') y-=n; else if (dir=='L') x-=n; else if (dir=='R') x+=n; }",
  options: "warning,gnu++17"
},
{
  id: "traffic-light",
  tag: "State Machines",
  level: "intermediate",
  title: "Traffic-Light State Cycle",
  theory: `
    <ul>
      <li>A table-driven state machine keeps the valid states in one ordered list and computes the "next" state with modulo arithmetic, instead of a long chain of <code>if</code>/<code>else if</code> comparisons.</li>
      <li>Find the current state's index, then advance it by one and wrap with <code>% order.size()</code> · this generalizes to any fixed cyclic sequence of states.</li>
      <li>This is a lighter-weight alternative to the <code>enum class</code> state machine elsewhere in this set when the states are naturally a simple cycle rather than a branching graph.</li>
    </ul>`,
  example: `int nextIndex(int current, int count) {
    return (current + 1) % count;
}`,
  task: `Complete <code>nextLight</code> so it returns the light that comes after <code>current</code> in <code>order</code>, cycling back to the start after the last one.`,
  starter: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

string nextLight(const string& current) {
    vector<string> order = {"RED", "GREEN", "YELLOW"};
    // TODO: return the light that comes after current in order, cycling back to the start after the last one
    return current;
}

int main() {
    cout << nextLight("RED") << endl;
    cout << nextLight("YELLOW") << endl;
}`,
  expected: "GREEN\nRED",
  hint: "for (size_t i = 0; i < order.size(); i++) if (order[i] == current) return order[(i + 1) % order.size()]; return current;",
  options: "warning,gnu++17"
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
      <li>Both operations show up throughout robotics math: dot products in projections/controllers, cross products in kinematics and orientation math.</li>
    </ul>`,
  example: `struct Vec3 { double x, y, z; };
double magnitude(const Vec3& v) {
    return sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
}`,
  task: `Complete <code>dot</code> to return the dot product of <code>a</code> and <code>b</code>, and <code>cross</code> to return their cross product.`,
  starter: `#include <iostream>
using namespace std;

struct Vec3 { double x, y, z; };

double dot(const Vec3& a, const Vec3& b) {
    // TODO: return the dot product a·b (a.x*b.x + a.y*b.y + a.z*b.z)
    return 0.0;
}

Vec3 cross(const Vec3& a, const Vec3& b) {
    // TODO: return the cross product a x b
    return {0, 0, 0};
}

int main() {
    Vec3 a{1, 0, 0};
    Vec3 b{0, 1, 0};
    cout << "dot: " << dot(a, b) << endl;
    Vec3 c = cross(a, b);
    cout << "cross: " << c.x << " " << c.y << " " << c.z << endl;
}`,
  expected: "dot: 0\ncross: 0 0 1",
  hint: "dot: return a.x*b.x + a.y*b.y + a.z*b.z;  cross: return { a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x };",
  options: "warning,gnu++17"
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
  example: `struct Mat2 { double a, b, c, d; };
double determinant(const Mat2& m) {
    return m.a * m.d - m.b * m.c;
}`,
  task: `Complete <code>inverse2x2</code> so it returns the inverse matrix, i.e. <code>(1/det) * [[d, -b], [-c, a]]</code>.`,
  starter: `#include <iostream>
#include <iomanip>
using namespace std;

struct Mat2 { double a, b, c, d; }; // [[a, b], [c, d]]

Mat2 inverse2x2(const Mat2& m) {
    double det = m.a * m.d - m.b * m.c;
    // TODO: return the inverse matrix, i.e. (1/det) * [[d, -b], [-c, a]]
    return {0, 0, 0, 0};
}

int main() {
    Mat2 m{4, 7, 2, 6};
    Mat2 inv = inverse2x2(m);
    cout << fixed << setprecision(2);
    cout << inv.a << " " << inv.b << " " << inv.c << " " << inv.d << endl;
}`,
  expected: "0.60 -0.70 -0.20 0.40",
  hint: "return { m.d/det, -m.b/det, -m.c/det, m.a/det };",
  options: "warning,gnu++17"
},
{
  id: "iir-lowpass",
  tag: "Sensor Fusion",
  level: "advanced",
  title: "Single-Pole IIR Low-Pass Filter",
  theory: `
    <ul>
      <li>A single-pole IIR (infinite impulse response) low-pass filter blends the new sample with the previous output: <code>y = alpha*input + (1-alpha)*prevOutput</code>.</li>
      <li><code>alpha</code> near <code>1</code> trusts the new sample almost entirely (light smoothing, fast response); <code>alpha</code> near <code>0</code> trusts the history almost entirely (heavy smoothing, slow response) · the exact same trade-off as the Exponential Moving Average filter elsewhere in this set, phrased in control-systems terms.</li>
      <li>It only needs the previous output, not a window of past samples, which makes it O(1) memory · ideal for a tight embedded control loop.</li>
    </ul>`,
  example: `double clamp01(double x) {
    if (x < 0.0) return 0.0;
    if (x > 1.0) return 1.0;
    return x;
}`,
  task: `Complete <code>lowPassStep</code> so it returns <code>alpha * input + (1 - alpha) * prevOutput</code>.`,
  starter: `#include <iostream>
#include <iomanip>
using namespace std;

double lowPassStep(double prevOutput, double input, double alpha) {
    // TODO: return alpha * input + (1 - alpha) * prevOutput
    return 0.0;
}

int main() {
    double y = 0.0;
    double samples[] = {10.0, 10.0, 10.0};
    for (double s : samples) {
        y = lowPassStep(y, s, 0.5);
    }
    cout << fixed << setprecision(3) << y << endl;
}`,
  expected: "8.750",
  hint: "return alpha * input + (1 - alpha) * prevOutput;",
  options: "warning,gnu++17"
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
  example: `struct Point { double x, y; };
Point translate(const Point& p, double dx, double dy) {
    return { p.x + dx, p.y + dy };
}`,
  task: `Complete <code>transformPoint</code> so it rotates <code>p</code> by <code>theta</code>, then translates by <code>(dx, dy)</code>, and returns the result.`,
  starter: `#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

struct Point { double x, y; };

Point transformPoint(const Point& p, double theta, double dx, double dy) {
    // TODO: rotate p by theta, then translate by (dx, dy), and return the result
    return p;
}

int main() {
    Point p{1.0, 0.0};
    Point result = transformPoint(p, M_PI / 2, 2.0, 3.0);
    cout << fixed << setprecision(3) << result.x << " " << result.y << endl;
}`,
  expected: "2.000 4.000",
  hint: "double rx = p.x*cos(theta) - p.y*sin(theta); double ry = p.x*sin(theta) + p.y*cos(theta); return {rx + dx, ry + dy};",
  options: "warning,gnu++17"
},
{
  id: "dijkstra-lite",
  tag: "Planning",
  level: "advanced",
  title: "Dijkstra's Algorithm (Weighted Shortest Path)",
  theory: `
    <ul>
      <li>Dijkstra's algorithm finds the shortest path in a weighted graph by always expanding the closest not-yet-finalized node next, using a min-priority-queue keyed on current best distance.</li>
      <li>Unlike the unweighted BFS grid-planning exercise elsewhere in this set, edge weights here aren't all equal, so a plain FIFO queue would give the wrong answer · the priority queue is what makes "closest first" work.</li>
      <li>Once a node is popped with its finalized shortest distance, later, worse entries for that same node still sitting in the queue are simply skipped (the <code>if (d &gt; dist[u]) continue;</code> check).</li>
    </ul>`,
  example: `#include <queue>
priority_queue<int, vector<int>, greater<int>> minHeap;
minHeap.push(5);
minHeap.push(1);
int smallest = minHeap.top(); // 1`,
  task: `Complete <code>shortestPath</code> so it runs Dijkstra's algorithm from <code>src</code>, popping the closest unvisited node and relaxing its edges, and returns the shortest distance to <code>dst</code>.`,
  starter: `#include <iostream>
#include <vector>
#include <queue>
#include <limits>
using namespace std;

const int INF = numeric_limits<int>::max();

int shortestPath(const vector<vector<pair<int,int>>>& graph, int src, int dst) {
    // graph[u] is a list of (neighbor, weight) pairs. Return the shortest distance from src to dst.
    vector<int> dist(graph.size(), INF);
    dist[src] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, src});
    // TODO: run Dijkstra's algorithm, popping the closest unvisited node and relaxing its edges
    return dist[dst];
}

int main() {
    vector<vector<pair<int,int>>> graph(4);
    graph[0] = {{1, 4}, {2, 1}};
    graph[2] = {{1, 1}, {3, 5}};
    graph[1] = {{3, 1}};
    graph[3] = {};

    cout << shortestPath(graph, 0, 3) << endl;
}`,
  expected: "3",
  hint: "while (!pq.empty()) { auto [d, u] = pq.top(); pq.pop(); if (d > dist[u]) continue; for (auto& [v, w] : graph[u]) if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.push({dist[v], v}); } }",
  options: "warning,gnu++17"
},
{
  id: "priority-scheduler",
  tag: "Concurrency",
  level: "advanced",
  title: "Priority Queue Task Scheduler",
  theory: `
    <ul>
      <li><code>std::priority_queue</code> is a max-heap by default: <code>top()</code> returns the element the comparator considers "greatest". To run the <em>lowest</em>-numbered priority first, the comparator must treat a higher priority number as "greater" (so it sinks, not floats).</li>
      <li>This is the standard shape for a real-time task scheduler: an emergency-stop handler (priority 1) must always run before routine telemetry logging (priority 3), regardless of insertion order.</li>
      <li>Getting the comparator direction backwards is a classic bug · it silently reverses the entire ordering rather than crashing, so it's worth tracing through a small example by hand.</li>
    </ul>`,
  example: `struct ByLength {
    bool operator()(const string& a, const string& b) const {
        return a.size() < b.size(); // longest string floats to top
    }
};`,
  task: `Complete <code>CompareTask::operator()</code> so tasks with a <strong>lower</strong> <code>priority</code> number come out of the queue first.`,
  starter: `#include <iostream>
#include <queue>
#include <vector>
#include <string>
using namespace std;

struct Task {
    int priority; // lower runs first
    string name;
};

struct CompareTask {
    bool operator()(const Task& a, const Task& b) const {
        // TODO: return true if a should run AFTER b (so lower-priority-number tasks come out first)
        return false;
    }
};

int main() {
    priority_queue<Task, vector<Task>, CompareTask> tasks;
    tasks.push({3, "log_telemetry"});
    tasks.push({1, "emergency_stop"});
    tasks.push({2, "read_sensors"});

    while (!tasks.empty()) {
        cout << tasks.top().name << " ";
        tasks.pop();
    }
    cout << endl;
}`,
  expected: "emergency_stop read_sensors log_telemetry",
  hint: "return a.priority > b.priority;",
  options: "warning,gnu++17"
}
  ]
};
