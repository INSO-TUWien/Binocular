package com.inso_world.binocular.model

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.util.Objects
import kotlin.uuid.Uuid

/**
 * Domain model for an Account, representing a user account from a platform like GitHub or GitLab.
 * This class is database-agnostic and contains no persistence-specific annotations.
 */
data class Account(

    @field:NotBlank
    val gid: String,
    @field:NotNull
    val platform: Platform,
    @field:NotBlank
    val login: String,
    @field:NotNull
    val projectIds: MutableSet<Project.Id> = mutableSetOf(),
    override val iid: Account.Id = Id(Uuid.random()),

) : AbstractDomainObject<Account.Id, Account.Key>(
    iid
) {
    var name: String? = null
    var avatarUrl: String? = null
    var url: String? = null

    val mergeRequestIds: MutableSet<MergeRequest.Id> = mutableSetOf()

    val noteIds: MutableSet<Note.Id> = mutableSetOf()

    @Deprecated("Avoid using database specific id, use business key", ReplaceWith("iid"))
    var id: String? = null

    @JvmInline
    value class Id(override val value: Uuid) : DomainId

    data class Key(val platform: Platform, val gid: String) // value object for lookups

    val issueIds: MutableSet<Issue.Id> = mutableSetOf()

//    private val _issues: MutableSet<Issue> = mutableSetOf()
//    val issues: MutableSet<Issue> =
//        object: MutableSet<Issue> by _issues {
//            override fun add(element: Issue): Boolean {
//                val added = _issues.add(element)
//                if (added) {
//                    element.accounts.add(this@Account)
//                }
//                return added
//            }
//        }

    override val uniqueKey: Key
        get() = Key(platform, gid.trim())

    override fun hashCode(): Int = super.hashCode()
    override fun equals(other: Any?) = super.equals(other)

    fun format(): String {
        return "Account(id=$gid, login=$login, name=$name)"
    }
}
