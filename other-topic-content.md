# Content routed away from Java notes (reference only, not published)

Found while comparing `java-syllabus` against the Java notes. These topics don't belong in a Java-the-language resource — listed here so they aren't lost, to be used when building/updating their own notes files later.

---

## → Belongs in a future SQL notes file
`java-syllabus` module 07, "SQL Fundamentals and Advanced Queries," in full — none of this is Java-specific:
- SQL query execution flow (how a database actually processes a query)
- Database indexing, visualized
- SQL JOINs, explained
- Transactions and ACID properties
- Transaction isolation levels (the database-side theory — note: the *symptoms* of each isolation level, as they show up through JDBC, are covered in the new JDBC chapter in `java-missing-content.md`; the SQL-side mechanics belong here instead)
- Window functions, deep dive
- Subqueries and CTEs
- Query optimization techniques
- Aggregations & `GROUP BY`
- Database normalization
- Constraints and data integrity
- Stored procedures and functions
- An associated quiz (11 questions in the source)

No `sql-notes.html` exists yet in the folder — this becomes the seed content whenever that file gets created.

## → Belongs in Spring Boot notes (or a future ORM/persistence-specific file)
`java-syllabus` module 08, "JDBC, JPA and Hibernate" — JDBC itself is core Java (`java.sql`) and is being added to the Java notes in full (see `java-missing-content.md`). **JPA and Hibernate are frameworks, not core Java**, and belong with `springboot-notes.html` instead (JPA is almost always used via Spring Data JPA in practice, and Hibernate is typically configured inside a Spring Boot app in this syllabus's own framing):
- JPA (Java Persistence API) — entity lifecycle, annotations, repositories
- Hibernate — under the hood, session/entity manager, N+1 problem, lazy vs. eager loading
- "JPA and Hibernate in Action" — real-world patterns
- "JPA and Hibernate Best Practices"

## → Not portable as written content
`java-syllabus` module 10, "Hands-On Java Practice Programs" — this is a downloadable-code-files + GitHub-links resource specific to the original course platform. We don't have access to the actual 140+ files or the specific repo links, so there's nothing concrete to port. Handled instead by making sure the Java notes themselves have strong runnable code examples throughout (see the "format/pedagogy requirements" section of `java-missing-content.md`).
