package com.inso_world.binocular.model

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import kotlin.uuid.Uuid

/**
 * Domain entity representing a Git developer scoped to a [Repository].
 *
 * ## Identity & Equality
 * - Inherits entity identity from [Stakeholder] → [AbstractDomainObject].
 * - Technical id: [iid] of type [Id], generated at construction.
 * - Business key: [uniqueKey] = [Key]([repository].iid, [gitSignature]).
 * - Although this is a `data class`, `equals`/`hashCode` delegate to
 *   [AbstractDomainObject] (no value-based equality on properties).
 *
 * ## Construction
 * - Validates that [name] is non-blank.
 * - Validates that [email] is non-blank (required, unlike the old User model).
 * - Registers itself with `repository.developers` during `init` (idempotent, add-only collection).
 *
 * ## Relationships
 * - [committedCommits] and [authoredCommits] are add-only, bidirectionally maintained sets.
 * - [files] and [issues] are add-only collections keyed by domain/business keys.
 *
 * ## Migration from User
 * This class replaces the former `User` class with key differences:
 * - `email` is now **required** (was optional).
 * - Extends [Stakeholder] for better type hierarchy.
 * - Repository collection renamed from `user` to `developers`.
 *
 * ## Threading
 * - Instances are mutable and not thread-safe; coordinate external synchronization for multi-step updates.
 *
 * @property name Display name as used in Git signatures; must be non-blank.
 * @property email Email address as used in Git signatures; must be non-blank.
 * @property repository Owning repository; participates in the [uniqueKey] and scopes this developer.
 * @see Stakeholder
 * @see committedCommits
 * @see authoredCommits
 */
data class Developer(
    @field:NotBlank
    override val name: String,
    @field:NotBlank
    override val email: String,
    @field:NotNull
    val repositoryId: Repository.Id,
    @Deprecated("Use repositoryId instead")
    var repository: Repository? = null,
    override val iid: Developer.Id = Id(Uuid.random()),
) : Stakeholder<Developer.Id, Developer.Key>(
        iid,
    ) {
    /**
     * Business key for developer lookups within a repository.
     * Combines repository identity with git signature for uniqueness.
     */
    data class Key(
        val repositoryId: Repository.Id,
        val gitSignature: String
    )

    /**
     * Technical identifier for the developer entity.
     */
    @JvmInline
    value class Id(
        override val value: Uuid
    ) : DomainId

    @Deprecated("old")
    val authoredCommits: MutableSet<Commit> = mutableSetOf()
    @Deprecated("old")
    val committedCommits: MutableSet<Commit> = mutableSetOf()
    @Deprecated("old")
    val files: MutableSet<File> = mutableSetOf()
    @Deprecated("old")
    val issues: MutableSet<Issue> = mutableSetOf()
    @Deprecated("Avoid using database specific id, use business key", ReplaceWith("iid"))
    var id: String? = null

    /**
     * Issue IDs associated with this developer.
     */
    val issueIds: MutableSet<Issue.Id> = mutableSetOf()

    /**
     * File IDs associated with this developer.
     */
    val fileIds: MutableSet<File.Id> = mutableSetOf()

    init {
        require(name.trim().isNotBlank()) { "name cannot be blank." }
        require(email.trim().isNotBlank()) { "email cannot be blank." }
    }

    /**
     * Commits committed by this [Developer].
     *
     * # Semantics
     * - **Add-only collection:** removals are not supported.
     */
    val committedCommitShas: MutableSet<String> = mutableSetOf()

    /**
     * Commits authored by this [Developer].
     *
     * # Semantics
     * - **Add-only collection:** removals are not supported.
     */
    val authoredCommitShas: MutableSet<String> = mutableSetOf()

    /**
     * Git signature format combining name and email.
     * Format: "Name <email@example.com>"
     */
    val gitSignature: String
        get() = "${name.trim()} <${email.trim()}>"

    override val uniqueKey: Key
        get() = Key(repositoryId, gitSignature)

    // Entities compare by immutable identity only
    override fun equals(other: Any?) = super.equals(other)

    override fun hashCode(): Int = super.hashCode()

    override fun toString(): String =
        "Developer(id=$id, iid=$iid, name=$name, email=$email, gitSignature=$gitSignature, repositoryId=$repositoryId)"
}

fun Developer.toLegacyUser(): User {
    val user =
        User(
            name = this@toLegacyUser.name,
            repositoryId = this@toLegacyUser.repositoryId
        ).apply {
            this.id = this@toLegacyUser.id
            this.email = this@toLegacyUser.email
        }

    return user
}
