package com.inso_world.binocular.model

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import kotlin.uuid.Uuid

/**
 * Domain entity representing a Git user scoped to a [Repository].
 *
 * @deprecated Use [Developer] instead. This class is maintained for backwards compatibility only.
 * The new [Developer] class provides better semantics with required email and proper [Signature] integration.
 *
 * ## Migration Guide
 * - Replace `User` with `Developer`
 * - `email` is now required in `Developer` (was optional in `User`)
 * - Use [Signature] for commit author/committer timestamps
 * - Use `repository.developers` instead of `repository.user`
 *
 * ## Identity & equality
 * - Inherits entity identity from [AbstractDomainObject].
 *   - Technical id: [iid] of type [Id], generated at construction.
 *   - Business key: [uniqueKey] = [User.Key]([repository].iid, [name].trim()).
 * - Although this is a `data class`, `equals`/`hashCode` delegate to
 *   [AbstractDomainObject] (no value-based equality on properties).
 *
 * @property name Display name as used in Git signatures; must be non-blank.
 * @property repository Owning repository; participates in the [uniqueKey] and scopes this user.
 * @see Developer
 * @see Signature
 */
@Deprecated("Use Developer instead", ReplaceWith("Developer"))
data class User(
    @field:NotBlank val name: String,
    @field:NotNull val repositoryId: Repository.Id,
    @Deprecated("Use repositoryId instead")
    var repository: Repository? = null,
    override val iid: User.Id = Id(Uuid.random()),
) : AbstractDomainObject<User.Id, User.Key>(
    iid,
) {
    data class Key(val repositoryId: Repository.Id, val gitSignature: String) // value object for lookups

    @JvmInline
    value class Id(override val value: Uuid) : DomainId

    @Deprecated("old")
    val committedCommits: MutableSet<Commit> = mutableSetOf()
    @Deprecated("old")
    val authoredCommits: MutableSet<Commit> = mutableSetOf()
    @Deprecated("old")
    val issues: MutableSet<Issue> = mutableSetOf()
    @Deprecated("old")
    val files: MutableSet<File> = mutableSetOf()
    @Deprecated("Avoid using database specific id, use business key", ReplaceWith("iid"))
    var id: String? = null

    var email: String? = null
        set(value) {
            require(value?.trim()?.isNotBlank() == true) { "Email must not be empty" }
            field = value
        }

    // Relationships
    val issueIds: MutableSet<Issue.Id> = mutableSetOf()

    val fileIds: MutableSet<File.Id> = mutableSetOf()

    init {
        require(name.trim().isNotBlank()) { "name cannot be blank." }
    }

    /**
     * Commits committed by this [User].
     */
    val committedCommitShas: MutableSet<String> = mutableSetOf()

    /**
     * Commits authored by this [User].
     */
    @Deprecated("Use Developer.authoredCommits instead")
    val authoredCommitShas: MutableSet<String> = mutableSetOf()

    val gitSignature: String
        get() = "${name.trim()} <${email?.trim()}>"

    override val uniqueKey: Key
        get() = Key(repositoryId, gitSignature)

    // Entities compare by immutable identity only
    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()

    override fun toString(): String =
        "User(id=$id, iid=$iid, name=$name, gitSignature=$gitSignature, repositoryId=$repositoryId)"
}
