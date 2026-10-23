package com.inso_world.binocular.model

import com.inso_world.binocular.model.validation.Hexadecimal
import com.inso_world.binocular.model.validation.isHex
import jakarta.validation.Valid
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.LocalDateTime
import kotlin.uuid.Uuid

/**
 * Commit — a Git snapshot that belongs to a [Repository].
 *
 * ## Identity & Equality
 * - Technical identity: immutable [iid] of type [Id] (generated at construction).
 * - Business key: [uniqueKey] == [sha].
 * - Equality follows [AbstractDomainObject]: same runtime class **and** equal [iid] and [uniqueKey];
 *   `hashCode()` derives from [iid].
 *
 * ## Construction & Validation
 * - [sha] must be exactly 40 hexadecimal characters (`[0-9a-fA-F]`).
 * - [authorSignature] is **required** and contains the author [Developer] and timestamp.
 * - [committerSignature] is **optional**; if not provided, defaults to [authorSignature].
 * - Both signatures' timestamps must be past-or-present.
 * - Both signatures' developers must belong to the same repository as this commit.
 * - On initialization the instance registers itself in `repository.commits`,
 *   `author.authoredCommits`, and `committer.committedCommits`.
 *
 * ## Git Semantics
 * - **Author**: The person who originally wrote the code (captured in [authorSignature]).
 * - **Committer**: The person who committed the code (captured in [committerSignature]).
 * - These can differ when patches are applied, commits are cherry-picked, or rebased.
 * - When the same person authors and commits, [committerSignature] can be omitted (defaults to author).
 *
 * ## Relationships
 * - [author]: Derived from [authorSignature.developer][Signature.developer].
 * - [committer]: Derived from [committerSignature.developer][Signature.developer].
 * - [parents], [children]: Add-only, repository-consistent, bidirectionally maintained.
 *
 * ## Thread-safety
 * - The entity is mutable and not thread-safe. Collection fields use concurrent maps internally,
 *   but multi-step workflows are **not** atomic; coordinate externally.
 *
 * @property sha 40-character hex SHA-1 identifying the commit; forms the business key.
 * @property authorSignature The signature of the commit's author (required).
 * @property committerSignature The signature of the committer (optional, defaults to author).
 * @property message Optional commit message summary/body.
 * @property repository Owning repository; the commit registers itself to `repository.commits` in `init`.
 * @see Signature
 * @see Developer
 */
data class Commit(
    @field:Size(min = 40, max = 40)
    @field:Hexadecimal
    val sha: String,
    @field:NotNull
    @field:Valid
    val authorSignature: Signature,
    @field:Valid
    @field:NotNull
    val committerSignature: Signature = authorSignature,
    val message: String? = null,
    @field:NotNull
    val repositoryId: Repository.Id,
    @Deprecated("Use repositoryId instead")
    var repository: Repository? = null,
    @Deprecated("Use parentShas instead")
    val parents: MutableSet<Commit> = mutableSetOf(),
    override val iid: Commit.Id = Id(Uuid.random()),
) : AbstractDomainObject<Commit.Id, Commit.Key>(
    iid
) {
    @JvmInline
    value class Id(override val value: Uuid) : DomainId

    data class Key(val sha: String)

    @Deprecated("Avoid using database specific id, use business key", ReplaceWith("iid"))
    var id: String? = null

    var webUrl: String? = null

    @Deprecated("do not use")
    var branch: String? = null
    var stats: Stats? = null
    val buildIds: List<Build.Id> = emptyList()
    val fileIds: List<File.Id> = emptyList()
    val moduleIds: List<Module.Id> = emptyList()
    val issueIds: List<Issue.Id> = emptyList()

    /**
     * The author timestamp.
     * Derived from [authorSignature.timestamp][Signature.timestamp].
     */
    val authorDateTime: LocalDateTime
        get() = authorSignature.timestamp

    /**
     * The commit timestamp.
     * Derived from [committerSignature.timestamp][Signature.timestamp],
     * defaults to [authorSignature.timestamp] if [committerSignature] was not explicitly set.
     */
    val commitDateTime: LocalDateTime
        get() = committerSignature.timestamp

    init {
        require(sha.length == 40) { "SHA must be 40 hex chars, got ${sha.length}" }
        require(sha.all { it.isHex() }) { "SHA-1 must be hex [0-9a-fA-F]" }
    }

    /**
     * Direct parent commit SHAs of this [Commit].
     *
     * ### Semantics
     * - **Non-removable set:** Backed by [NonRemovingMutableSet] — removals are disallowed.
     */
    val parentShas: MutableSet<String> = mutableSetOf()

    /**
     * Direct child commit SHAs of this [Commit].
     *
     * ### Semantics
     * - **Non-removable set:** Backed by [NonRemovingMutableSet] — removals are disallowed.
     */
    val childShas: MutableSet<String> = mutableSetOf()

    override val uniqueKey: Key
        get() = Key(sha)

    // Entities compare by immutable identity only
    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()

    override fun toString(): String =
        "Commit(id=$id, sha='$sha', authorDateTime=$authorDateTime, commitDateTime=$commitDateTime, message=$message, webUrl=$webUrl, stats=$stats, repositoryId=$repositoryId, childShas=$childShas, parentShas=$parentShas)"
}
