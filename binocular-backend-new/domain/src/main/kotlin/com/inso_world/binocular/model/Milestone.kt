package com.inso_world.binocular.model

import kotlin.uuid.Uuid

/**
 * Domain model for a Milestone, representing a milestone in a Git repository.
 * This class is database-agnostic and contains no persistence-specific annotations.
 */
data class Milestone(
    var id: String? = null,
    var platformIid: Int? = null,
    var title: String? = null,
    var description: String? = null,
    var createdAt: String? = null,
    var updatedAt: String? = null,
    var startDate: String? = null,
    var dueDate: String? = null,
    var state: String? = null,
    var expired: Boolean? = null,
    var webUrl: String? = null,
    // Relationships
    val project: Project.Id,
    val issueIds: MutableSet<Issue.Id> = mutableSetOf(),
    val mergeRequestIds: MutableSet<MergeRequest.Id> = mutableSetOf(),
    override val iid: Milestone.Id = Id(Uuid.random()),
) : AbstractDomainObject<Milestone.Id, Milestone.Key>(
    iid
) {
    @JvmInline
    value class Id(override val value: Uuid) : DomainId

    data class Key(val projectId: Project.Id, val platformIid: Int?) // value object for lookups

    override val uniqueKey: Key
        get() = Key(project, platformIid)
}
