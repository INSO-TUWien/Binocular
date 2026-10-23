package com.inso_world.binocular.model

import kotlin.uuid.Uuid

/**
 * Domain model for a Note, representing a comment or note in a Git repository.
 * This class is database-agnostic and contains no persistence-specific annotations.
 */
data class Note(
    var id: String? = null,
    var body: String,
    var createdAt: String,
    var updatedAt: String,
    var system: Boolean = true,
    var resolvable: Boolean = false,
    var confidential: Boolean = false,
    var internal: Boolean = false,
    var imported: Boolean = false,
    var importedFrom: String,
    // Relationships
    val issueIds: MutableSet<Issue.Id> = mutableSetOf(),
    val mergeRequestIds: MutableSet<MergeRequest.Id> = mutableSetOf(),
    override val iid: Note.Id = Id(Uuid.random()),
) : AbstractDomainObject<Note.Id, Note.Key>(
    iid
) {
    @JvmInline
    value class Id(override val value: Uuid) : DomainId

    val accountIds: MutableSet<Account.Id> = mutableSetOf()

    data class Key(val body: String, val createdAt: String) // value object for lookups

    override val uniqueKey: Key
        get() = Key(body ?: "", createdAt ?: "")
}
