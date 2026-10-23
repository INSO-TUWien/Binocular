package com.inso_world.binocular.model

import java.time.LocalDateTime
import kotlin.uuid.Uuid

/**
 * Domain model for an Issue, representing an issue in a Git repository.
 * This class is database-agnostic and contains no persistence-specific annotations.
 */
data class Issue(

    @Deprecated("Avoid using database specific id, use business key", ReplaceWith("iid"))
    var id: String? = null,
    var platformIid: Int? = null, // issue number from e.g. GitHub
    val gid: String,
    var title: String? = null,
    var description: String? = null,
    var createdAt: LocalDateTime? = null,
    var closedAt: LocalDateTime? = null,
    var updatedAt: LocalDateTime? = null,
    var labels: List<String> = emptyList(),
    var state: String? = null,
    var webUrl: String? = null,
    var mentions: List<Mention> = emptyList(),
    // Relationships
    val project: Project.Id,
    @Deprecated("Use project instead")
    var project_old: Project? = null,
    var authorId: Account.Id? = null,
    var accountIds: Set<Account.Id> = emptySet(),
    var commitIds: Set<Commit.Id> = emptySet(),
    var milestoneIds: Set<Milestone.Id> = emptySet(),
    var noteIds: Set<Note.Id> = emptySet(),
    var developerIds: Set<Developer.Id> = emptySet(),
    override val iid: Issue.Id = Id(Uuid.random()),
) : AbstractDomainObject<Issue.Id, Issue.Key>(
    iid
)  {
    @JvmInline
    value class Id(override val value: Uuid) : DomainId

    @Deprecated("Use developerIds instead")
    val userIds: Set<User.Id>
        get() = developerIds.map { User.Id(it.value) }.toSet()

    data class Key(val projectId: Project.Id, val gid: String) // value object for lookups

    override fun toString(): String {
        return "Issue(no=$gid, title=$title, accountIds=$accountIds)"
    }

    override val uniqueKey: Key
        get() = Issue.Key(project, gid)
}
