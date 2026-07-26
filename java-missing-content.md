# Java Notes — Gap Analysis (reference only, not published)

Sources compared: `JAVA.one` (OneNote flashcard dump, extracted via `strings`), `java-notes.html` (original notes, 11 sections + cheat sheet), `java-syllabus` (course curriculum outline).

This file is the working checklist for building the final notes in `java-notes-design-preview.html`'s style. Nothing here is user-facing.

---

## 1. Entirely new chapters needed

### JDBC (Java Database Connectivity) — full chapter, currently 0% covered
Rich material exists in `JAVA.one` that isn't in `java-notes.html` at all:
- JDBC API flow: `DriverManager` → `Connection` → `PreparedStatement`/`Statement` → `ResultSet`, with driver auto-selection based on the connection URL.
- Full request lifecycle: load driver → get connection → prepare statement → set params → execute → read ResultSet → close (in reverse order — ResultSet, then Statement, then Connection).
- **Transactions**: `autoCommit` defaults to `true` (every statement commits immediately) — must call `setAutoCommit(false)` for multi-step transactions; `commit()`/`rollback()`; **partial rollback via savepoints** (`rollback(savepoint)` undoes only part of a transaction).
- **Isolation levels**, explained via concrete symptoms (good "memory trick" style): dirty read (reading uncommitted data from another transaction), non-repeatable read (same row read twice returns different values), phantom read (same query returns a different number of rows).
- **Batch processing**: `addBatch()` per row + `executeBatch()` — one round-trip for many rows instead of N round-trips.
- **Connection pooling**, in real depth: opening a connection is expensive (network + auth); pool `release()` vs `close()` (release returns to pool, does NOT actually close); validation query (`SELECT 1`) before handing out a connection; min/max pool size; timeout when pool is exhausted; HikariCP called out by name as the default/fastest pool in Spring Boot; **connection leak** as a named failure mode.
- `ResultSetMetaData`, `JdbcRowSet`, `CachedRowSet` (disconnected rowset — fetch, close connection, process offline).
- Callout-worthy pitfall: DB connection objects should never be `Serializable` — they depend on live state that can't be reconstructed from bytes.

**Scope note:** keep this chapter to the JDBC API itself (core `java.sql`, part of the JDK). Deep SQL query mechanics (indexing, joins, isolation *from the database's side*, query optimization) belong in a SQL notes file — see `other-topic-content.md`. JPA/Hibernate also routed there — see below.

### Java I/O & NIO — full chapter, currently ~0% covered
Called out explicitly as its own module in `java-syllabus`; barely present in either existing source. Needs to be authored largely from scratch:
- Classic I/O: `InputStream`/`OutputStream` vs `Reader`/`Writer`, buffering (`BufferedReader` wrapping `FileReader` — already have one passing mention, expand into a real subsection).
- NIO: `Path`/`Paths`/`Files` API (modern replacement for `java.io.File`), try-with-resources for streams.
- NIO.2 specifics: channels & buffers (conceptual overview), `WatchService` (watching a directory for file-system events), converting between `File` and `Path`.
- "NIO in Action" real-world patterns + best practices (syllabus explicitly names these) — e.g., prefer `Files.newBufferedReader`, memory-mapped files for very large files, non-blocking I/O for high-throughput servers.

### Object Lifecycle: Cloning & Serialization — currently scattered, needs consolidation
`JAVA.one` treats this as a serious standalone topic; our notes only mention `clone()` in passing (Object class methods list) and don't cover serialization at all.
- **Shallow vs. deep copy**: `Object.clone()`, the classic pitfall (`private final Address address` — copying the outer object still shares the same inner mutable object unless you deep-copy it explicitly), `CloneNotSupportedException`.
- **Serialization**: `Serializable` marker interface, `transient` fields (excluded, become `null`/default after deserialization), `serialVersionUID` (prevents `InvalidClassException` across class versions — "always declare it explicitly" is a direct best-practice quote from the source), `Externalizable` (manual control) vs `Serializable` (automatic).
- Real-world uses worth keeping as "real-world example" callouts: HTTP sessions, Kafka message payloads, Redis cache storage.
- Pitfall: never serialize sensitive data (passwords/tokens) or live-resource fields (DB connections, file handles) — skip with `transient` or don't implement `Serializable` at all.
- Marker interfaces as a concept in general (`Serializable`, `Cloneable` — interfaces with *no methods* that just flip a runtime flag via `instanceof` checks) — currently not explained as a named concept anywhere.

---

## 2. Existing chapters — content to add or deepen

### JV·01 Fundamentals
- **Reflection** — currently not covered at all outside a passing "@Autowired uses reflection" mention. Add a real subsection: what it is (inspect/invoke classes, methods, fields at runtime, even private ones), where it's used (Spring DI, Hibernate, JUnit, ORMs), the risk (breaks encapsulation, can break Singleton — ties back to the Singleton chapter's "how Singleton gets broken" content).
- **Annotations** — no dedicated treatment; `@Override`, `@FunctionalInterface` are mentioned incidentally. Add a short subsection: built-in annotations, what a custom annotation looks like at a high level, retention/target concept (light touch, not a full deep-dive).
- Autoboxing/Integer cache section could gain one more worked "bug" example in the JAVA.one style (numbered Bug 1/2/3 format reads well pedagogically) — we already have the core content, just make sure all three classic bugs are present: NPE from unboxing null, GC pressure from boxing in a loop, wrong `==` above 127.

### JV·02 OOP
- Real-world example upgrade: the `PaymentService`/`PaymentGateway` example we already use is good — JAVA.one has an equivalent (`PaymentService` → UPI/CreditCard/PayPal) confirming it's a strong choice, no change needed, just confirms we picked well.
- Add explicit **marker interface** callout tying to Cloning/Serialization chapter (see above) — `Cloneable` as a second example beyond `Serializable`.

### JV·03 Strings & Wrappers
- **Security framing** for string immutability is under-emphasized — JAVA.one leads with "strings hold file paths, DB passwords, class names, URLs; mutable strings = attack surface" as a primary reason, not an afterthought. Worth a dedicated callout.
- HashCode-caching staleness risk: "if String were mutable, a cached hashCode could go stale — HashMap lookups would silently fail" — good, concrete "why does immutability matter" explanation to add alongside the existing hashCode-cache mention.

### JV·04 Collections
- **LinkedHashMap as an LRU cache** — currently we mention LinkedHashMap has insertion/access order, but the *actual LRU recipe* (`new LinkedHashMap<>(cap, 0.75f, true)` + override `removeEldestEntry()`) is a very common interview ask and isn't in our code samples yet. Add a code block.
- **EnumMap** and **WeakHashMap** — not currently covered. EnumMap: array-backed, fastest map when keys are a single enum type, no hashing needed. WeakHashMap: keys held via weak references, entry disappears once the key is otherwise unreachable.
- **Stack vs. ArrayDeque** — we don't currently call out that `Stack extends Vector` (inherits synchronized-everything baggage) and that `ArrayDeque` is the modern replacement for both stack and queue use cases. Worth a callout.
- `PriorityQueue` internals (min-heap, `peek()` O(1), `poll()`/`add()` O(log n)) — not currently spelled out.

### JV·06 Exceptions
- `finally` edge cases could be slightly more exhaustive: we cover "return in finally swallows the pending value" already — also add "an exception thrown *inside* finally replaces whatever the try/catch was doing" as its own explicit callout (related but distinct from the return case), plus the `System.exit()` skips-finally case (we may already have this in Fundamentals' `finalize` table — cross-check and make sure it isn't only there).

### JV·07 Concurrency
- **Why `volatile` specifically matters for double-checked locking** — we state DCL needs `volatile` but JAVA.one has the sharper explanation: without it, instruction reordering can let another thread observe a non-null reference to a *partially constructed* object. Upgrade the existing callout with this reasoning.
- **Java Memory Model & happens-before** — called out as its own line item in `java-syllabus`. We reference "establishes a happens-before relationship" once in passing (for `synchronized`); this deserves to be a proper named subsection: happens-before ordering rules for `volatile` writes/reads, `synchronized` entry/exit, and `Thread.start()`/thread completion.
- **Deadlock detection** (as distinct from prevention, which we cover well) — syllabus explicitly separates these. Add: thread dumps, `jstack`, how a deadlock actually shows up in a dump.
- Connection-pool-flavored concurrency callout (pool exhaustion/timeout) pairs naturally with the new JDBC chapter — cross-link rather than duplicate.

### JV·08 Java 8+ Features
- `Optional` — we already state "return-type only," JAVA.one reinforces this identically; no gap, just confirms current framing is right.
- Custom `Collector` implementation — rare but worth one line: "implement `Collector` directly only when the built-ins in `Collectors` don't fit; almost always they do."
- **Java 9→25 feature table** needs extending past 21 — see "Open research items" below; don't guess at 23/25 specifics without verifying them first.

### JV·09 Streams
- `ForkJoinPool` is used internally by parallel streams, and is specifically good for CPU-intensive *recursive* tasks — we mention parallel streams use the common ForkJoinPool but not this framing; worth one added sentence.

### JV·10 JVM/GC
- Name-drop **Mark & Sweep** explicitly as the base algorithm name (we describe the mechanism but don't always name it directly next to G1/CMS/Parallel).
- Confirm CMS is flagged "deprecated since Java 9" (we may already have this — verify during build).

### JV·11 Design Patterns
- Per-pattern pitfalls found in JAVA.one that we don't currently have:
  - **Facade**: can become a "god class" if it absorbs too much responsibility — keep it as a coordinator, not a dumping ground.
  - **Observer**: too many observers makes debugging hard (can't trace who reacts to what) — keep observer lists small/focused.
  - **Adapter**: use it specifically for code you *can't modify* (legacy/third-party); if you can modify the code, just fix the design instead of adapting around it.
  - **Proxy** has a **Remote Proxy** variant worth naming (represents an object living in a different JVM/server) alongside the protection/virtual proxy framing we already have.
- Extra real-world examples to fold into the existing table: Lombok `@Builder` and Spring's request/response objects as Builder pattern instances (we already cite `StringBuilder`, this adds two more).

---

## 3. Format/pedagogy requirements (from `java-syllabus`)

- Syllabus explicitly has a 50-question **"Guess the output"** quiz module. Our quizzes should include a healthy share of "here's a code snippet — what does it print / what happens" questions, not just conceptual multiple-choice. Apply this across chapters, especially Fundamentals, OOP, Strings, Concurrency.
- Syllabus module 10 ("Hands-On Java Practice Programs," 140+ downloadable code files + GitHub references) isn't portable content — we don't have access to their specific files. Interpret the *spirit* of it instead: make sure every chapter has at least one substantial, runnable-looking code example, and consider a light "try it yourself" prompt where it fits naturally.

---

## 4. Open research items — verify before writing, don't guess

- **Java 25 LTS features**: syllabus names this explicitly as a module. Confirm actual shipped features before writing the version table entry — don't fabricate specifics.
- **Java 9–23 "essential features"** beyond what's already in our table (JPMS, `List.of()`, `var`, records, sealed classes, pattern matching, virtual threads) — spot-check for anything notable in 22/23 worth a one-line mention.

---

## 5. Net new chapter count

Current (java-notes.html / java-learning-platform.html): 11 chapters + cheat sheet.
Planned for the complete rebuild: the existing 11, **plus** JDBC, **plus** Java I/O & NIO, **plus** an Object Lifecycle (Cloning & Serialization) chapter/section — landing around **13–14 chapters** + cheat sheet, depending on whether Object Lifecycle becomes its own chapter or a folded-in section of Fundamentals.
