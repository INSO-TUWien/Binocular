package com.inso_world.binocular.model

import kotlin.uuid.Uuid

interface DomainId {
    val value: Uuid
}

/**
 * Base type for domain entities within Binocular that expose two notions of identity:
 *
 * 1. **`iid` (internal/technical id):** A stable, immutable identifier for this
 *    instance (e.g., aggregate-local id or value uniquely derived
 *    at creation time). Used here to derive `hashCode()`.
 * 2. **`uniqueKey` (business key):** A domain/natural key that should be unique
 *    within the relevant boundary (e.g., within a repository or project).
 *    Used by collection helpers (e.g., `NonRemovingMutableSet`) to enforce
 *    de-duplication based on business semantics.
 *
 * ### Equality & hashing
 * - `equals` returns `true` **only if**:
 *   1. same reference, or
 *   2. exact same runtime class **and** both `iid` **and** `uniqueKey` are equal.
 * - `hashCode` is derived **only** from `iid`.
 *
 * This satisfies the contract: if two objects are equal, they have the same `iid`
 * and therefore the same `hashCode`. Non-equal objects may share the same hash
 * (e.g., equal `iid` but different `uniqueKey`), which is allowed and at worst
 * increases collisions.
 *
 * ### Contracts & invariants
 * - `iid` MUST be effectively immutable for the lifetime of the object; do not
 *   mutate it after construction (would corrupt hash-based collections).
 * - `uniqueKey` MUST be stable and **domain-unique** within its scope; if it is
 *   composite, model it as a value type with proper `equals/hashCode`.
 * - If a subclass overrides `equals`, it MUST ensure that equal objects produce
 *   the same `hashCode`. In practice, that means either:
 *   - base `equals` on the same `iid`, or
 *   - also override `hashCode` consistently (not recommended to diverge here).
 *
 * ### Usage guidance
 * - Prefer **reference equality** for entity identity checks at runtime unless
 *   your domain explicitly requires value equality.
 * - For de-duplicating by business semantics (e.g., commits by `sha`,
 *   branches by `repo+name`), use `uniqueKey` and key-aware collections like
 *   `NonRemovingMutableSet`.
 * - Sub-classed `data class`es **must** override `equals/hashCode` to avoid kotlin's auto-generated
 *   `equals/hashCode`. Simply use:
 *   ```kotlin
 *   override fun equals(other: Any?) = super.equals(other)
 *   override fun hashCode(): Int = super.hashCode()
 *   ```
 *
 * ### Example
 * ```kotlin
 * // required for kotlin UUID:
 * // https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-experimental-uuid-api/
 * Commit(
 *   [...]
 * ) : AbstractDomainObject<Commit.Id, String>(
 *      Commit.Id(Uuid.random())
 * ) {
 *     @JvmInline
 *     value class Id(val value: Uuid)
 *     [...]
 * }
 * ```
 */
abstract class AbstractDomainObject<Iid, Key>(
    /**
     * Technical/aggregate identifier (stable, immutable).
     * Typical sources: aggregate-generated id or deterministic value id.
     */
    open val iid: Iid,
) {
    /**
     * Business/natural key that uniquely identifies this object **in domain terms**.
     *
     * - Scope of uniqueness must be defined by the domain (e.g., “unique within a repository”).
     * - Should be stable and immutable for reliable collection semantics.
     * - Often a value type (e.g., data class or tuple) capturing the natural key.
     */
    abstract val uniqueKey: Key

    /**
     * Hash code derived solely from [iid].
     *
     * Rationale: keeps hash buckets stable regardless of other field changes and
     * aligns with common entity identity semantics. If a subclass overrides `equals`,
     * it must ensure that equal objects share the same [hashCode].
     */
    override fun hashCode(): Int = iid.hashCode()

    /**
     * Equality requires the same runtime class and both `iid` **and** `uniqueKey` to match.
     * Note: if the persistence layer uses proxies, consider relaxing the class check.
     */
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as AbstractDomainObject<*, *>

        if (iid != other.iid) return false
        if (uniqueKey != other.uniqueKey) return false

        return true
    }
}
