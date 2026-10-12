@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)
package com.inso_world.binocular.model

import com.inso_world.binocular.model.vcs.ReferenceCategory
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * Branch — a named pointer within a Git [Repository].
 *
 * ### Identity & equality
 * - Technical identity: immutable [iid] of type [Id] (assigned at construction).
 * - Business key: [uniqueKey] == [Key]([repository].iid, [name]).
 * - Equality delegates to [AbstractDomainObject] (identity-based); `hashCode()` derives from [iid].
 *
 * ### Construction & validation
 * - Requires a non-blank [name] (`@field:NotBlank` + runtime `require`).
 * - On initialization the instance registers itself in `repository.branches`
 *   (idempotent, add-only set).
 *
 * ### Relationships & collections
 * - [commits]: complete history of all commits reachable from the [head] element on this [branch].
 * - [files]: add-only collection keyed by business keys of [File]; exposed as `Set` for read-only use.
 *
 * ### Thread-safety
 * - The entity is mutable and not thread-safe. Collection fields use concurrent maps internally,
 *   but multi-step workflows are **not** atomic; coordinate externally.
 *
 * @property name Branch name used for domain identity (shortened ref).
 * @property fullName Fully-qualified Git reference name (e.g., `refs/heads/main`).
 * @property category Category/type of the reference as reported by gix.
 * @property active Whether this branch is currently the active/checked-out branch.
 * @property tracksFileRenames Whether file rename tracking is enabled when analyzing history.
 * @property latestCommit Optional last known commit SHA associated with this branch.
 * @property head Last known commit SHA associated with this branch.
 * @property repository Owning repository; this branch registers itself to `repository.branches` in `init`.
 */
@OptIn(ExperimentalUuidApi::class)
class Branch(
    @field:NotBlank val name: String,
    @field:NotBlank val fullName: String,
    override val category: ReferenceCategory,
    @field:NotNull
    override val repositoryId: Repository.Id,
    @Deprecated("Use repositoryId instead")
    var repository: Repository? = null,
    var headSha: String,
    @Deprecated("Use headSha instead")
    var head: Commit? = null,
    @Deprecated("Use repositoryId instead")
    var developer: Developer? = null,
    val developerId: Developer.Id? = null,
    override val iid: Reference.Id = Reference.Id(Uuid.random()),
) : Reference<Branch.Key>(category, repositoryId, iid), Cloneable {
    @JvmInline
    value class Id(override val value: Uuid) : DomainId

    data class Key(val repositoryId: Repository.Id, val name: String)
    
    @Deprecated("Use headSha and commit traversal via repository/service instead")
    val commits: Set<Commit>
        get() = head?.let { h ->
            val result = mutableSetOf<Commit>()
            val queue = mutableListOf(h)
            while (queue.isNotEmpty()) {
                val c = queue.removeAt(0)
                if (result.add(c)) {
                    c.parents.forEach { queue.add(it) }
                }
            }
            result
        } ?: emptySet()

    @Deprecated("old")
    val files: MutableSet<File> = mutableSetOf()
    @Deprecated("Avoid using database specific id, use business key", ReplaceWith("iid"))
    var id: String? = null

    @Deprecated("old")
    var active: Boolean = false

    @Deprecated("old")
    var tracksFileRenames: Boolean = false

    @Deprecated("", ReplaceWith("headSha"))
    val latestCommit: String
        get() = headSha

    @Deprecated("legacy, use name property instead", replaceWith = ReplaceWith("name"))
    val branch: String = name

    val fileIds: MutableSet<File.Id> = mutableSetOf()

    init {
        require(name.isNotBlank()) { "name must not be blank" }
        require(fullName.isNotBlank()) { "fullName must not be blank" }
        require(headSha.isNotBlank()) { "headSha must not be blank" }
    }

    override val uniqueKey: Key
        get() = Key(repositoryId, this.name)

    // Entities compare by immutable identity only
    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()

    override fun toString(): String =
        "Branch(id=$id, iid=$iid, name='$name', fullName='$fullName', category=$category, active=$active, tracksFileRenames=$tracksFileRenames, latestCommit=$latestCommit, headSha=$headSha, repositoryId=$repositoryId)"
}
