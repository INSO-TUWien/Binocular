package com.inso_world.binocular.model

import com.inso_world.binocular.model.vcs.Remote
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import kotlin.uuid.Uuid

/**
 * Repository — domain entity representing a local Git repository scoped to a [Project].
 *
 * ### Identity & equality
 * - Technical identity: immutable [iid] of type [Id] (generated at construction).
 * - Business key: [uniqueKey] == [Key]([project].iid, [localPath].trim()).
 * - Equality is identity-based (same [iid]); `hashCode()` derives from [iid].
 *
 * ### Construction & validation
 * - Requires a non-blank [localPath] (`@field:NotBlank` + runtime `require`).
 * - On construction, the repository **links itself** to the owning [project] via `project.repo = this`.
 *
 * ### Relationships & collections
 * - [commits], [branches], [user], and [remotes] are add-only, repository-consistent, de-duplicated sets backed by
 *   `NonRemovingMutableSet`. See their KDoc for invariants and exceptions.
 *
 * ### Thread-safety
 * - Instances are mutable and not thread-safe. Collections use concurrent maps for element-level ops,
 *   but multi-step workflows are **not atomic**; coordinate externally.
 *
 * @property localPath Absolute or workspace-relative path to the repository; must be non-blank.
 *   Participates in [uniqueKey] as `localPath.trim()`.
 * @property project Owning [Project]; establishes the [Repository]↔[Project] association during `init`.
 */
data class Repository(
    @field:NotBlank
    @field:Size(max = 255)
    val localPath: String,
    val projectId: Project.Id,
    @Deprecated("Use projectId instead", ReplaceWith("Project(name = \"...\", iid = projectId)"))
    var project: Project? = null,
    override val iid: Repository.Id = Id(Uuid.random()),
) : AbstractDomainObject<Repository.Id, Repository.Key>(
    iid
) {
    @JvmInline
    value class Id(override val value: Uuid) : DomainId

    data class Key(val projectId: Project.Id, val localPath: String) // value object for lookups

    @Deprecated("old")
    val commits: MutableSet<Commit> = mutableSetOf()
    @Deprecated("old")
    val branches: MutableSet<Branch> = mutableSetOf()
    @Deprecated("old")
    val developers: MutableSet<Developer> = mutableSetOf()
    @Deprecated("old")
    val user: MutableSet<User> = mutableSetOf()
    @Deprecated("old")
    val remotes: MutableSet<Remote> = mutableSetOf()
    @Deprecated("Avoid using database specific id, use business key .iid", ReplaceWith("iid"))
    var id: String? = null

    init {
        require(localPath.trim().isNotBlank()) { "localPath cannot be blank." }
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(Repository::class.java)

        /** Java friendly factory. */
        @JvmStatic
        fun create(
            localPath: String,
            projectId: Project.Id,
        ): Repository = Repository(localPath = localPath, projectId = projectId)
    }

    override fun toString(): String = "Repository(id=$id, iid=$iid, localPath='$localPath', projectId=$projectId)"

    override val uniqueKey: Key
        get() = Key(projectId, localPath.trim())

    // Entities compare by immutable identity only
    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode(): Int = super.hashCode()
}
