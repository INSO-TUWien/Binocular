@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)
package com.inso_world.binocular.model

import java.time.LocalDateTime
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * Domain model for a Build, representing a CI/CD build.
 * This class is database-agnostic and contains no persistence-specific annotations.
 */
@OptIn(ExperimentalUuidApi::class)
data class Build(
    @Deprecated("Avoid using database specific id, use business key", ReplaceWith("iid"))
    var id: String? = null,
    var sha: String? = null,
    var ref: String? = null,
    var status: String? = null,
    var tag: String? = null,
    var user: String? = null,
    var userFullName: String? = null,
    var createdAt: LocalDateTime? = null,
    var updatedAt: LocalDateTime? = null,
    var startedAt: LocalDateTime? = null,
    var finishedAt: LocalDateTime? = null,
    var committedAt: LocalDateTime? = null,
    var duration: Int? = null,
    var jobs: List<Job> = emptyList(),
    var webUrl: String? = null,
    // Relationships
    var commitIds: List<Commit.Id> = emptyList(),
    @Deprecated("Use commitIds instead")
    var commits: List<Commit> = emptyList(),
    override val iid: Build.Id = Id(Uuid.random()),
) : AbstractDomainObject<Build.Id, Build.Key>(
    iid
) {
    @JvmInline
    value class Id(override val value: Uuid) : DomainId

    data class Key(val sha: String?, val ref: String?)

    override val uniqueKey: Key
        get() = Key(sha, ref)

    override fun equals(other: Any?) = super.equals(other)
    override fun hashCode() = super.hashCode()
}
