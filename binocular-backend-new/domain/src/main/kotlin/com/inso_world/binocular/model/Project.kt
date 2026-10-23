package com.inso_world.binocular.model

import jakarta.validation.constraints.NotBlank
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import kotlin.uuid.Uuid

/**
 * Project — a named, top-level domain entity that may be associated with a [Repository].
 *
 * ### Identity & equality
 * - Technical identity: immutable [iid] of type [Id] (generated at construction).
 * - Business key: [uniqueKey] == validated [name].
 * - Equality is **identity-based** (same [iid]); `hashCode()` derives from [iid]. This intentionally
 *   overrides the default value-based semantics of a Kotlin `data class`.
 *
 * ### Construction & validation
 * - Requires a non-blank [name] (`@field:NotBlank` + runtime `require`).
 * - The constructor does **not** auto-wire repository relations; associate a repository via [repo] if needed.
 *
 * ### Relationships & mutability
 * - [repo] is optional and **set-once** (cannot be reassigned to a different repository; cannot be set to `null`).
 *
 * ### Thread-safety
 * - Instances are mutable and not thread-safe. Coordinate external synchronization for multi-step updates.
 *
 * @property name Human-readable project name; must be non-blank and forms the [uniqueKey].
 */
data class Project(
    @field:NotBlank
    val name: String,
    override val iid: Project.Id = Id(Uuid.random()),
) : AbstractDomainObject<Project.Id, Project.Key>(
    iid
) {
    @JvmInline
    value class Id(override val value: Uuid) : DomainId

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(Repository::class.java)
    }

    data class Key(val name: String) // value object for lookups

    val accountIds: MutableSet<Account.Id> = mutableSetOf()

    val issueIds: MutableSet<Issue.Id> = mutableSetOf()

    val mergeRequestIds: MutableSet<MergeRequest.Id> = mutableSetOf()

    val milestoneIds: MutableSet<Milestone.Id> = mutableSetOf()

    var description: String? = null

    @Deprecated("Relationship moved to Repository.projectId")
    var repo: Repository? = null

    // some database dependent id
    @Deprecated("Avoid using database specific id, use business key .iid", ReplaceWith("iid"))
    var id: String? = null

    init {
        require(name.isNotBlank())
    }

    override fun toString(): String = "Project(id=$id, iid=$iid, name='$name', description=$description)"

    fun toStringDebug(): String = "Project(name='$name', accountCount=${accountIds.size}, issueCount=${issueIds.size})"

    override val uniqueKey: Project.Key
        get() = Project.Key(this.name)

    // Entities compare by immutable identity only
    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()
}
